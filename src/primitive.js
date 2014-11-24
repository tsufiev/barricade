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

    Primitive = Base.extend({
        _sift: function (json) {
            return json;
        },
        get: function () {
            return this._data;
        },
        set: function (newVal) {
            var schema = this._schema;

            function typeMatches(newVal) {
                return getType(newVal) === schema['@type'];
            }

            if (typeMatches(newVal) && this._validate(newVal)) {
                this._data = newVal;
                this.emit('validation', 'succeeded');
                this.emit('change');
            } else if (this.hasError()) {
                this.emit('validation', 'failed');
            } else {
                logError("Setter - new value did not match " +
                          "schema (newVal, schema)");
                logVal(newVal, schema);
            }
        },
        isEmpty: function () {
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
