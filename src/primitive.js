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

    /**
    * @class
    * @memberof Barricade
    * @extends Barricade.Base
    */
    Primitive = Base.extend({
        /**
        * @memberof Barricade.Primitive
        * @private
        */
        _sift: function (json) {
            return json;
        },

        /**
        * @memberof Barricade.Primitive
        * @private
        */
        _getJSON: function () {
            return this._data;
        },

        /**
        * Retrieves the Primitive's value.
        * @memberof Barricade.Primitive
        * @instance
        * @returns {JSON}
        */
        get: function () {
            return this._data;
        },

        /**
        * Returns true if the Primitive's data is empty. This depends on the
          type; Arrays and Objects are considered empty if they have no
          elements, while Strings, Numbers, and Booleans are empty if they are
          equivalent to a newly-constructed instance.
        * @memberof Barricade.Primitive
        * @instance
        * @returns {Boolean}
        */
        isEmpty: function () {
            if (this._schema['@type'] === Array) {
                return !this._data.length;
            } else if (this._schema['@type'] === Object) {
                return !Object.keys(this._data).length;
            }
            return this._data === this._schema['@type']();
        },

        /**
        * @memberof Barricade.Primitive
        * @instance
        * @param newVal
        * @returns {self}
        */
        set: function (newVal) {
            var schema = this._schema;

            function typeMatches(newVal) {
                return getType(newVal) === schema['@type'];
            }

            if (typeMatches(newVal) && this._validate(newVal)) {
                this._data = newVal;
                return this.emit('validation', 'succeeded')
                           .emit('change');
            } else if (this.hasError()) {
                return this.emit('validation', 'failed');
            }

            logError("Setter - new value (", newVal, ")",
                     " did not match schema: ", schema);
            return this;
        }
    });
