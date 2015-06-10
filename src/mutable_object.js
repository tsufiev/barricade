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
    * @extends Barricade.Arraylike
    */
    MutableObject = Arraylike.extend({
        /**
        * @memberof Barricade.MutableObject
        * @private
        */
        _elSymbol: '?',

        /**
        * @memberof Barricade.MutableObject
        * @private
        */
        _getJSON: function (options) {
            return this.toArray().reduce(function (jsonOut, element) {
                if (jsonOut.hasOwnProperty(element.getID())) {
                    logError("ID found multiple times: " + element.getID());
                } else {
                    jsonOut[element.getID()] = element.toJSON(options);
                }
                return jsonOut;
            }, {});
        },

        /**
        * @memberof Barricade.MutableObject
        * @private
        */
        _sift: function (json, parameters) {
            return Object.keys(json).map(function (key) {
                var params = Object.create(parameters);
                params.id = key;
                return this._keyClassCreate(
                  this._elSymbol, this._elementClass, json[key], params);
            }, this);
        },

        /**
        * Returns true if MutableObject contains `element`, false otherwise.
        * @memberof Barricade.MutableObject
        * @instance
        * @param element Element to check for.
        * @returns {Boolean}
        */
        contains: function (element) {
            return this.toArray().some(function (value) {
                return element === value;
            });
        },

        /**
        * Retrieves element with specified ID.
        * @memberof Barricade.MutableObject
        * @instance
        * @param {String} id
        * @returns {Element}
        */
        getByID: function (id) {
            return this.get(this.getPosByID(id));
        },

        /**
        * Returns an array of the IDs of the elements of the MutableObject.
        * @memberof Barricade.MutableObject
        * @instance
        * @returns {Array}
        */
        getIDs: function () {
            return this.toArray().map(function (value) {
                return value.getID();
            });
        },

        /**
        * Returns index of the element with the specified ID.
        * @memberof Barricade.MutableObject
        * @instance
        * @param {String} id
        * @returns {Integer}
        */
        getPosByID: function (id) {
            return this.getIDs().indexOf(id);
        },

        /**
        * Adds a new element to the MutableObject.
        * @memberof Barricade.MutableObject
        * @instance
        * @param {JSON|Element} newJson
                 JSON in the form that the element schema expects, or an
                 instance of the MutableObject's element class.
        * @param {Object} [newParameters]
                 If JSON was passed in for newJson, a parameters object with at
                 least an `id` property is required.
        * @returns {self}
        */
        push: function (newJson, newParameters) {
            if (!this._safeInstanceof(newJson, this._elementClass) &&
                    (getType(newParameters) !== Object ||
                    !newParameters.hasOwnProperty('id'))) {
                logError('ID should be passed in with parameters object');
            } else {
                return Arraylike.push.call(this, newJson, newParameters);
            }
        }
    });
