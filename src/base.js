// Copyright 2014 Drago Rosson
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

    var Base = (function () {
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
            return getType(obj) === Object &&
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

                if (getType(json) !== type) {
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

                Observable.call(self);
                Omittable.call(self, parameters.isUsed !== false);
                Deferrable.call(self, schema);
                Validatable.call(self, schema);

                if (schema.hasOwnProperty('@enum')) {
                    Enumerated.call(self, schema['@enum']);
                }

                if (parameters.hasOwnProperty('id')) {
                    Identifiable.call(self, parameters.id);
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
