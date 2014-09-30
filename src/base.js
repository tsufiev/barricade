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

    var Base = Extendable.call(InstanceofMixin.call({
        create: function (json, parameters) {
            var self = this.extend({}),
                schema = self._schema,
                type = schema['@type'],
                isUsed;

            self._parameters = parameters = parameters || {};

            if (schema.hasOwnProperty('@inputMassager')) {
                json = schema['@inputMassager'](json);
            }

            isUsed = self._setData(json);

            if (schema.hasOwnProperty('@toJSON')) {
                self.toJSON = schema['@toJSON'];
            }

            Observable.call(self);
            Omittable.call(self, isUsed);
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
        _setData: function(json) {
            var isUsed = true,
                type = this._schema['@type'];

            if (getType(json) !== type) {
                if (json) {
                    logError("Type mismatch (json, schema)");
                    logVal(json, this._schema);
                } else {
                    isUsed = false;
                }
                // Replace bad type (does not change original)
                json = this._getDefaultValue();
            }
            this._data = this._sift(json, this._parameters);

            return isUsed;
        },
        _getDefaultValue: function () {
            return this._schema.hasOwnProperty('@default')
                ? typeof this._schema['@default'] === 'function'
                    ? this._schema['@default']()
                    : this._schema['@default']
                : this._schema['@type']();
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
    }));
