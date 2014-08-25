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
