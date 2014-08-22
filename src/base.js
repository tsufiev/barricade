    barricade.base = (function () {
        var base = {};

        function extend(extension) {
            function add_property(object, prop) {
                var is_public = prop.charAt(0) !== '_';

                Object.defineProperty(object, prop, {
                    enumerable: is_public,
                    writable: true,
                    configurable: true,
                    value: extension[prop]
                });
                return object;
            }

            // add properties to extended object
            return Object.keys(extension).reduce(add_property,
                                                 Object.create(this));
        }

        function deep_clone(object) {
            if (barricade.get_type(object) === Object) {
                return Object.keys(object).reduce(function (clone, key) {
                    clone[key] = deep_clone(object[key]);
                    return clone;
                }, {});
            } else {
                return object;
            }
        }

        // Merges source's own enumerable properties into target. Does not 
        // account for prototype chain.
        function merge(target, source) {
            Object.keys(source).forEach(function (key) {
                if (target.hasOwnProperty(key) &&
                        barricade.get_type(target[key]) === Object &&
                        barricade.get_type(source[key]) === Object) {
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
                    alt_self,
                    schema = self._schema,
                    type = schema['@type'];

                if (schema.hasOwnProperty('@alternate_create')) {
                    alt_self = schema['@alternate_create'](json, parameters);

                    if (alt_self) {
                        return alt_self;
                    }
                }

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

                self._accepts = schema.hasOwnProperty('@accepts') ?
                                    [].concat(schema['@accepts']) : [];

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
            accepts: function (type) {
                return this._accepts.indexOf(type) > -1;
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
