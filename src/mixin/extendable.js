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

    var Extendable = Blueprint.create(function () {
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

        return Object.defineProperty(this, 'extend', {
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
    });
