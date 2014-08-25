// Barricade.js API
// Author: Drago Rosson
Barricade = (function () {
    "use strict";

    var barricade = {};

    var blueprint = {
            create: function (f) {
                var g = function () {
                        if (this.hasOwnProperty('_parents')) {
                            this._parents.push(g);
                        } else {
                            Object.defineProperty(this, '_parents', {
                                value: [g]
                            });
                        }

                        f.apply(this, arguments);
                    };

                return g;
            }
    };

    barricade.identifiable = blueprint.create(function (id) {
        this.get_id = function () {
            return id;
        };

        this.set_id = function (new_id) {
            id = new_id;
            this.emit('change', 'id');
        };
    });

    barricade.omittable = blueprint.create(function (is_used) {
        this.is_used = function () {
            // If required, it has to be used.
            return this.is_required() || is_used;
        };

        this.set_is_used = function (new_used_value) {
            is_used = !!new_used_value;
        };

        this.on('change', function () {
            is_used = !this.is_empty();
        });
    });

    barricade.deferrable = blueprint.create(function (schema) {
        var self = this,
            deferred;

        function resolver(needed_value) {
            var ref = schema['@ref'].resolver(self, needed_value);
            if (ref === undefined) {
                log_error('Could not resolve "' + 
                          JSON.stringify(self.toJSON()) + '"');
            }
            return ref;
        }

        function has_dependency() {
            return schema.hasOwnProperty('@ref');
        }

        this.has_dependency = has_dependency;

        if (has_dependency()) {
            this.get_deferred = function () {
                return deferred;
            };

            deferred = barricade.deferred.create(schema['@ref'].needs,
                                                 resolver);
        }
    });

    var event_emitter = blueprint.create(function () {
        var events = {};

        function has_event(event_name) {
            return events.hasOwnProperty(event_name);
        }

        // Adds listener for event
        this.on = function (event_name, callback) {
            if (!has_event(event_name)) {
                events[event_name] = [];
            }

            events[event_name].push(callback);
        };

        // Removes listener for event
        this.off = function (event_name, callback) {
            var index;

            if (has_event(event_name)) {
                index = events[event_name].indexOf(callback);

                if (index > -1) {
                    events[event_name].splice(index, 1);
                }
            }
        };

        this.emit = function (event_name) {
            var args = arguments; // Must come from correct scope
            if (events.hasOwnProperty(event_name)) {
                events[event_name].forEach(function (callback) {
                    // Call with emitter as context and pass all but event_name
                    callback.apply(this, Array.prototype.slice.call(args, 1));
                }, this);
            }
        };
    });

    barricade.deferred = {
        create: function (class_getter, on_resolve) {
            var self = Object.create(this),
                callbacks = [],
                is_resolved = false;

            self.get_class = function () {
                return class_getter();
            };

            self.resolve = function (obj) {
                var ref;

                if (is_resolved) {
                    throw new Error('Deferred already resolved');
                }

                ref = on_resolve(obj);
                is_resolved = true;

                if (ref === undefined) {
                    log_error('Could not resolve reference');
                } else {
                    callbacks.forEach(function (callback) {
                        callback(ref);
                    });
                }

                return ref;
            };

            self.is_resolved = function () {
                return is_resolved;
            };

            self.add_callback = function (callback) {
                callbacks.push(callback);
            };
            
            return self;
        }
    };

    barricade.base = (function () {
        var base = {};

        function for_in_keys(obj) {
            var key,
                keys = [];

            for (key in obj) {
                keys.push(key);
            }

            return keys;
        }

        function is_plain_object(obj) {
            return barricade.get_type(obj) === Object &&
                Object.getPrototypeOf(Object.getPrototypeOf(obj)) === null;
        }

        function extend(extension) {
            function add_property(object, prop) {
                return Object.defineProperty(object, prop, {
                    enumerable: true,
                    writable: true,
                    configurable: true,
                    value: extension[prop]
                });
            }

            // add properties to extended object
            return Object.keys(extension).reduce(add_property,
                                                 Object.create(this));
        }

        function deep_clone(object) {
            if (is_plain_object(object)) {
                return for_in_keys(object).reduce(function (clone, key) {
                    clone[key] = deep_clone(object[key]);
                    return clone;
                }, {});
            }
            return object;
        }

        function merge(target, source) {
            for_in_keys(source).forEach(function (key) {
                if (target.hasOwnProperty(key) &&
                        is_plain_object(target[key]) &&
                        is_plain_object(source[key])) {
                    merge(target[key], source[key]);
                } else {
                    target[key] = deep_clone(source[key]);
                }
            });
        }

        Object.defineProperty(base, 'extend', {
            enumerable: false,
            writable: false,
            value: function (extension, schema) {
                if (schema) {
                    extension._schema = '_schema' in this ?
                                            deep_clone(this._schema) : {};
                    merge(extension._schema, schema);
                }
                
                return extend.call(this, extension);
            }
        });

        Object.defineProperty(base, 'instanceof', {
            enumerable: false,
            value: function (proto) {
                var _instanceof = this.instanceof,
                    subject = this;

                function has_mixin(obj, mixin) {
                    return obj.hasOwnProperty('_parents') &&
                        obj._parents.some(function (_parent) {
                            return _instanceof.call(_parent, mixin);
                        });
                }

                do {
                    if (subject === proto ||
                            has_mixin(subject, proto)) {
                        return true;
                    }
                    subject = Object.getPrototypeOf(subject);
                } while (subject);

                return false;
            }
        });
        
        return base.extend({
            create: function (json, parameters) {
                var self = this.extend({}),
                    schema = self._schema,
                    type = schema['@type'];

                if (!parameters) {
                    parameters = {};
                }

                if (schema.hasOwnProperty('@input_massager')) {
                    json = schema['@input_massager'](json);
                }

                if (barricade.get_type(json) !== type) {
                    if (json) {
                        log_error("Type mismatch (json, schema)");
                        log_val(json, schema);
                    } else {
                        parameters.is_used = false;
                    }

                    // Replace bad type (does not change original)
                    json = type();
                }

                self._data = self._sift(json, parameters);
                self._parameters = parameters;

                if (schema.hasOwnProperty('@toJSON')) {
                    self.toJSON = schema['@toJSON'];
                }

                event_emitter.call(self);
                barricade.omittable.call(self, parameters.is_used !== false);
                barricade.deferrable.call(self, schema);

                if (parameters.hasOwnProperty('id')) {
                    barricade.identifiable.call(self, parameters.id);
                }

                return self;
            },
            _sift: function () {
                throw new Error("sift() must be overridden in subclass");
            },
            _safe_instanceof: function (instance, class_) {
                return typeof instance === 'object' &&
                    ('instanceof' in instance) &&
                    instance.instanceof(class_);
            },
            get_primitive_type: function () {
                return this._schema['@type'];
            },
            is_required: function () {
                return this._schema['@required'] !== false;
            },
            is_empty: function () {
                throw new Error('Subclass should override is_empty()');
            }
        });
    }());

    barricade.container = barricade.base.extend({
        create: function (json, parameters) {
            var self = barricade.base.create.call(this, json, parameters),
                all_deferred = [];

            function attach_listeners(key) {
                self._attach_listeners(key);
            }

            function get_on_resolve(key) {
                return function (resolved_value) {
                    self.set(key, resolved_value);
                
                    if (resolved_value.has_dependency()) {
                        all_deferred.push(resolved_value.get_deferred());
                    }

                    if ('get_all_deferred' in resolved_value) {
                        all_deferred = all_deferred.concat(
                            resolved_value.get_all_deferred());
                    }
                };
            }

            function attach_deferred_callback(key, value) {
                if (value.has_dependency()) {
                    value.get_deferred().add_callback(get_on_resolve(key));
                }
            }

            function deferred_class_matches(deferred) {
                return self.instanceof(deferred.get_class());
            }

            function add_deferred_to_list(obj) {
                if (obj.has_dependency()) {
                    all_deferred.push(obj.get_deferred());
                }

                if ('get_all_deferred' in obj) {
                    all_deferred = all_deferred.concat(
                                       obj.get_all_deferred());
                }
            }

            function resolve_deferreds() {
                var cur_deferred,
                    unresolved_deferreds = [];

                // New deferreds can be added to all_deferred as others are
                // resolved. Iterating this way is safe regardless of how 
                // new elements are added.
                while (all_deferred.length > 0) {
                    cur_deferred = all_deferred.shift();

                    if (!cur_deferred.is_resolved()) {
                        if (deferred_class_matches(cur_deferred)) {
                            cur_deferred.add_callback(add_deferred_to_list);
                            cur_deferred.resolve(self);
                        } else {
                            unresolved_deferreds.push(cur_deferred);
                        }
                    }
                }

                all_deferred = unresolved_deferreds;
            }

            self.on('_added_element', attach_listeners);
            self.each(attach_listeners);

            self.each(function (key, value) {
                attach_deferred_callback(key, value);
            });

            if (self.has_dependency()) {
                all_deferred.push(self.get_deferred());
            }

            self.each(function (key, value) {
                add_deferred_to_list(value);
            });

            resolve_deferreds.call(self);

            self.get_all_deferred = function () {
                return all_deferred;
            };

            return self;
        },
        _attach_listeners: function (key) {
            var self = this,
                element = this.get(key);

            function on_child_change(child) {
                self.emit('child_change', child);
            }

            function on_direct_child_change() {
                on_child_change(this); // 'this' is set to callee, not typo
            }

            function on_replace(new_value) {
                self.set(key, new_value);
            }

            element.on('child_change', on_child_change);
            element.on('change', on_direct_child_change);
            element.on('replace', on_replace);

            element.on('remove_from', function (container) {
                if (container === self) {
                    element.off('child_change', on_child_change);
                    element.off('change', on_direct_child_change);
                    element.off('replace', on_replace);
                }
            });
        },
        set: function (key, value) {
            this.get(key).emit('remove_from', this);
            this._do_set(key, value);
            this._attach_listeners(key);
        },
        _get_key_class: function (key) {
            return this._schema[key].hasOwnProperty('@class')
                ? this._schema[key]['@class']
                : barricade.poly(this._schema[key]);
        },
        _key_class_create: function (key, key_class, json, parameters) {
            return this._schema[key].hasOwnProperty('@factory')
                ? this._schema[key]['@factory'](json, parameters)
                : key_class.create(json, parameters);
        },
        _is_correct_type: function (instance, class_) {
            var self = this;

            function is_ref_to() {
                if (typeof class_._schema['@ref'].to === 'function') {
                    return self._safe_instanceof(instance,
                                                 class_._schema['@ref'].to());
                } else if (typeof class_._schema['@ref'].to === 'object') {
                    return self._safe_instanceof(instance,
                                                 class_._schema['@ref'].to);
                }
                throw new Error('Ref.to was ' + class_._schema['@ref'].to);
            }

            return this._safe_instanceof(instance, class_) ||
                (class_._schema.hasOwnProperty('@ref') && is_ref_to());
        }
    });

    barricade.arraylike = barricade.container.extend({
        create: function (json, parameters) {
            if (!this.hasOwnProperty('_element_class')) {
                Object.defineProperty(this, '_element_class', {
                    enumerable: false,
                    writable: true,
                    value: this._get_key_class(this._el_symbol)
                });
            }

            return barricade.container.create.call(this, json, parameters);
        },
        _el_symbol: '*',
        _sift: function (json, parameters) {
            return json.map(function (el) {
                return this._key_class_create(this._el_symbol,
                                              this._element_class, el);
            }, this);
        }, 
        get: function (index) {
            return this._data[index];
        },
        each: function (function_in, comparator_in) {
            var arr = this._data.slice();

            if (comparator_in) {
                arr.sort(comparator_in);
            }

            arr.forEach(function (value, index) {
                function_in(index, value);
            });
        },
        to_array: function () {
            return this._data.slice(); // Shallow copy to prevent mutation
        },
        _do_set: function (index, new_val, new_parameters) {
            var old_val = this._data[index];

            if (this._is_correct_type(new_val, this._element_class)) {
                this._data[index] = new_val;
            } else {
                this._data[index] = this._key_class_create(
                                  this._el_symbol, this._element_class,
                                  new_val, new_parameters);
            }

            this.emit('change', 'set', index, this._data[index], old_val);
        },
        length: function () {
            return this._data.length;
        },
        is_empty: function () {
            return this._data.length === 0;
        },
        toJSON: function (ignore_unused) {
            return this._data.map(function (el) {
                return el.toJSON(ignore_unused);
            });
        },
        push: function (new_value, new_parameters) {
            if (this._is_correct_type(new_value, this._element_class)) {
                this._data.push(new_value);
            } else {
                this._data.push(this._key_class_create(
                              this._el_symbol, this._element_class,
                              new_value, new_parameters));
            }

            this.emit('_added_element', this._data.length - 1);
            this.emit('change', 'add', this._data.length - 1);
        },
        remove: function (index) {
            this._data[index].emit('remove_from', this);
            this._data.splice(index, 1);
            this.emit('change', 'remove', index);
        }
    });

    barricade.array = barricade.arraylike.extend({});

    barricade.immutable_object = barricade.container.extend({
        create: function (json, parameters) {
            var self = this;
            if (!this.hasOwnProperty('_key_classes')) {
                Object.defineProperty(this, '_key_classes', {
                    enumerable: false,
                    writable: true,
                    value: this.get_keys().reduce(function (classes, key) {
                            classes[key] = self._get_key_class(key);
                            return classes;
                        }, {})
                });
            }

            return barricade.container.create.call(this, json, parameters);
        },
        _sift: function (json, parameters) {
            var self = this;
            return this.get_keys().reduce(function (obj_out, key) {
                obj_out[key] = self._key_class_create(
                                   key, self._key_classes[key], json[key]);
                return obj_out;
            }, {});
        },
        get: function (key) {
            return this._data[key];
        },
        _do_set: function (key, new_value, new_parameters) {
            var old_val = this._data[key];

            if (this._schema.hasOwnProperty(key)) {
                if (this._is_correct_type(new_value,
                                          this._key_classes[key])) {
                    this._data[key] = new_value;
                } else {
                    this._data[key] = this._key_class_create(
                                          key, this._key_classes[key],
                                          new_value, new_parameters);
                }

                this.emit('change', 'set', key, this._data[key], old_val);
            } else {
                console.error('object does not have key (key, schema)');
                console.log(key, this._schema);
            }
        },
        each: function (function_in, comparator_in) {
            var self = this,
                keys = this.get_keys();

            if (comparator_in) {
                keys.sort(comparator_in);
            }

            keys.forEach(function (key) {
                function_in(key, self._data[key]);
            });
        },
        is_empty: function () {
            return Object.keys(this._data).length === 0;
        },
        toJSON: function (ignore_unused) {
            var data = this._data;
            return this.get_keys().reduce(function (json_out, key) {
                if (ignore_unused !== true || data[key].is_used()) {
                    json_out[key] = data[key].toJSON(ignore_unused);
                }
                return json_out;
            }, {});
        },
        get_keys: function () {
            return Object.keys(this._schema).filter(function (key) {
                return key.charAt(0) !== '@';
            });
        }
    });

    barricade.mutable_object = barricade.arraylike.extend({
        _el_symbol: '?',
        _sift: function (json, parameters) {
            return Object.keys(json).map(function (key) {
                return this._key_class_create(
                                   this._el_symbol, this._element_class,
                                   json[key], {id: key});
            }, this);
        },
        get_ids: function () {
            return this.to_array().map(function (value) {
                return value.get_id();
            });
        },
        get_by_id: function (id) {
            var pos = this.to_array().map(function (value) {
                    return value.get_id();
                }).indexOf(id);
            return this.get(pos);
        },
        contains: function (element) {
            return this.to_array().some(function (value) {
                return element === value;
            });
        },
        toJSON: function (ignore_unused) {
            return this.to_array().reduce(function (json_out, element) {
                if (json_out.hasOwnProperty(element.get_id())) {
                    log_error("ID encountered multiple times: " +
                                  element.get_id());
                } else {
                    json_out[element.get_id()] = 
                        element.toJSON(ignore_unused);
                }
                return json_out;
            }, {});
        },
        push: function (new_json, new_parameters) {
            if (barricade.get_type(new_parameters) !== Object ||
                    !new_parameters.hasOwnProperty('id')) {
                log_error('ID should be passed in ' + 
                          'with parameters object');
            } else {
                barricade.array.push.call(this, new_json, new_parameters);
            }
        },
    });

    barricade.primitive = barricade.base.extend({
        _sift: function (json, parameters) {
            return json;
        },
        get: function () {
            return this._data;
        },
        set: function (new_val) {
            var schema = this._schema;

            function type_matches(new_val) {
                return barricade.get_type(new_val) === schema['@type'];
            }

            if (type_matches(new_val)) {
                this._data = new_val;
                this.emit('change');
            } else {
                log_error("Setter - new value did not match " +
                          "schema (new_val, schema)");
                log_val(new_val, schema);
            }
        },
        is_empty: function () {
            if (this._schema['@type'] === Array) {
                return this._data.length === 0;
            } else if (this._schema['@type'] === Object) {
                return Object.keys(this._data).length === 0;
            } else {
                return this._data === this._schema['@type']();
            }
        },
        toJSON: function () {
            return this._data;
        }
    });

    barricade.get_type = (function () {
        var to_string = Object.prototype.toString,
            types = {
                'boolean': Boolean,
                'number': Number,
                'string': String,
                '[object Array]': Array,
                '[object Date]': Date,
                '[object Function]': Function,
                '[object RegExp]': RegExp
            };

        return function (val) {
            return types[typeof val] || 
                   types[to_string.call(val)] ||
                   (val ? Object : null);
        };
    }());

    function log_msg(msg) {
        console.log("Barricade: " + msg);
    }

    function log_warning(msg) {
        console.warn("Barricade: " + msg);
    }

    function log_error(msg) {
        console.error("Barricade: " + msg);
    }

    function log_val(val1, val2) {
        if (val2) {
            console.log(val1, val2);
        } else {
            console.log(val1);
        }
    }

    function BarricadeMain(schema) {
        function schema_is_mutable() {
            return schema.hasOwnProperty('?');
        }

        function schema_is_immutable() {
            return Object.keys(schema).some(function (key) {
                return key.charAt(0) !== '@' && key !== '?';
            });
        }

        if (schema['@type'] === Object && schema_is_immutable()) {
            return barricade.immutable_object.extend({_schema: schema});
        } else if (schema['@type'] === Object && schema_is_mutable()) {
            return barricade.mutable_object.extend({_schema: schema});
        } else if (schema['@type'] === Array && schema.hasOwnProperty('*')) {
            return barricade.array.extend({_schema: schema});
        } else {
            return barricade.primitive.extend({_schema: schema});
        }
    }

    barricade.poly = BarricadeMain;

    BarricadeMain.get_type = barricade.get_type; // Very helpful function

    BarricadeMain.base = barricade.base;
    BarricadeMain.container = barricade.container;
    BarricadeMain.array = barricade.array;
    BarricadeMain.object = barricade.object;
    BarricadeMain.immutable_object = barricade.immutable_object;
    BarricadeMain.mutable_object = barricade.mutable_object;
    BarricadeMain.primitive = barricade.primitive;
    BarricadeMain.factory = barricade.factory;
    BarricadeMain.blueprint = blueprint;
    BarricadeMain.event_emitter = event_emitter;
    BarricadeMain.deferrable = barricade.deferrable;
    BarricadeMain.omittable = barricade.omittable;
    BarricadeMain.identifiable = barricade.identifiable;

    return BarricadeMain;

}());
