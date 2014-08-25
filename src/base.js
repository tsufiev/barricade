    barricade.base = (function () {
        var base = {};

        function forInKeys(obj) {
            var key,
                keys = [];

            for (key in obj) {
                keys.push(key);
            }

            return keys;
        }

        function isPlainObject(obj) {
            return barricade.getType(obj) === Object &&
                Object.getPrototypeOf(Object.getPrototypeOf(obj)) === null;
        }

        function extend(extension) {
            function addProperty(object, prop) {
                return Object.defineProperty(object, prop, {
                    enumerable: true,
                    writable: true,
                    configurable: true,
                    value: extension[prop]
                });
            }

            // add properties to extended object
            return Object.keys(extension).reduce(addProperty,
                                                 Object.create(this));
        }

        function deepClone(object) {
            if (isPlainObject(object)) {
                return forInKeys(object).reduce(function (clone, key) {
                    clone[key] = deepClone(object[key]);
                    return clone;
                }, {});
            }
            return object;
        }

        function merge(target, source) {
            forInKeys(source).forEach(function (key) {
                if (target.hasOwnProperty(key) &&
                        isPlainObject(target[key]) &&
                        isPlainObject(source[key])) {
                    merge(target[key], source[key]);
                } else {
                    target[key] = deepClone(source[key]);
                }
            });
        }

        Object.defineProperty(base, 'extend', {
            enumerable: false,
            writable: false,
            value: function (extension, schema) {
                if (schema) {
                    extension._schema = '_schema' in this ?
                                            deepClone(this._schema) : {};
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

                function hasMixin(obj, mixin) {
                    return obj.hasOwnProperty('_parents') &&
                        obj._parents.some(function (_parent) {
                            return _instanceof.call(_parent, mixin);
                        });
                }

                do {
                    if (subject === proto ||
                            hasMixin(subject, proto)) {
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

                if (schema.hasOwnProperty('@inputMassager')) {
                    json = schema['@inputMassager'](json);
                }

                if (barricade.getType(json) !== type) {
                    if (json) {
                        logError("Type mismatch (json, schema)");
                        logVal(json, schema);
                    } else {
                        parameters.isUsed = false;
                    }

                    // Replace bad type (does not change original)
                    json = type();
                }

                self._data = self._sift(json, parameters);
                self._parameters = parameters;

                if (schema.hasOwnProperty('@toJSON')) {
                    self.toJSON = schema['@toJSON'];
                }

                eventEmitter.call(self);
                barricade.omittable.call(self, parameters.isUsed !== false);
                barricade.deferrable.call(self, schema);

                if (parameters.hasOwnProperty('id')) {
                    barricade.identifiable.call(self, parameters.id);
                }

                return self;
            },
            _sift: function () {
                throw new Error("sift() must be overridden in subclass");
            },
            _safeInstanceof: function (instance, class_) {
                return typeof instance === 'object' &&
                    ('instanceof' in instance) &&
                    instance.instanceof(class_);
            },
            getPrimitiveType: function () {
                return this._schema['@type'];
            },
            isRequired: function () {
                return this._schema['@required'] !== false;
            },
            isEmpty: function () {
                throw new Error('Subclass should override isEmpty()');
            }
        });
    }());
