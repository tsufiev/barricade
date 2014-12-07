// Copyright 2014 Rackspace
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

    ImmutableObject = Container.extend({
        create: function (json, parameters) {
            var self = this;
            if (!this.hasOwnProperty('_keyClasses')) {
                Object.defineProperty(this, '_keyClasses', {
                    enumerable: false,
                    writable: true,
                    value: this.getKeys().reduce(function (classes, key) {
                        classes[key] = self._getKeyClass(key);
                        return classes;
                    }, {})
                });
            }

            return Container.create.call(this, json, parameters);
        },
        _sift: function (json) {
            var self = this;
            return this.getKeys().reduce(function (objOut, key) {
                objOut[key] =
                    self._keyClassCreate(key, self._keyClasses[key], json[key]);
                return objOut;
            }, {});
        },
        get: function (key) {
            return this._data[key];
        },
        _doSet: function (key, newValue, newParameters) {
            var oldVal = this._data[key];

            if (this._schema.hasOwnProperty(key)) {
                if (this._isCorrectType(newValue, this._keyClasses[key])) {
                    this._data[key] = newValue;
                } else {
                    this._data[key] =
                        this._keyClassCreate(key, this._keyClasses[key],
                                             newValue, newParameters);
                }

                this.emit('change', 'set', key, this._data[key], oldVal);
            } else {
                logError('object does not have key: ', key,
                         ' schema: ', this._schema);
            }
        },
        each: function (functionIn, comparatorIn) {
            var self = this,
                keys = this.getKeys();

            if (comparatorIn) {
                keys.sort(comparatorIn);
            }

            keys.forEach(function (key) {
                functionIn(key, self._data[key]);
            });

            return this;
        },
        isEmpty: function () {
            return !Object.keys(this._data).length;
        },
        toJSON: function (ignoreUnused) {
            var data = this._data;
            return this.getKeys().reduce(function (jsonOut, key) {
                if (ignoreUnused !== true || data[key].isUsed()) {
                    jsonOut[key] = data[key].toJSON(ignoreUnused);
                }
                return jsonOut;
            }, {});
        },
        getKeys: function () {
            return Object.keys(this._schema).filter(function (key) {
                return key.charAt(0) !== '@';
            });
        }
    });
