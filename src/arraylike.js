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
    * @extends Barricade.Container
    */
    Arraylike = Container.extend({
        /**
        * Creates an Arraylike.
        * @memberof Barricade.Arraylike
        * @returns {Barricade.Arraylike} New Arraylike instance.
        */
        create: function (json, parameters) {
            if (!this.hasOwnProperty('_elementClass')) {
                Object.defineProperty(this, '_elementClass', {
                    enumerable: false,
                    writable: true,
                    value: this._getKeyClass(this._elSymbol)
                });
            }
            return Container.create.call(this, json, parameters);
        },

        /**
        * @memberof Barricade.Arraylike
        * @private
        */
        _doSet: function (index, newVal, newParameters) {
            var oldVal = this._data[index];

            this._data[index] = this._isCorrectType(newVal, this._elementClass)
                ? this._data[index] = newVal
                : this._keyClassCreate(this._elSymbol, this._elementClass,
                                       newVal, newParameters);

            this.emit('change', 'set', index, this._data[index], oldVal);
        },

        /**
        * @memberof Barricade.Arraylike
        * @private
        */
        _elSymbol: '*',

        /**
        * @memberof Barricade.Arraylike
        * @private
        */
        _sift: function (json, parameters) {
            return json.map(function (el) {
                return this._keyClassCreate(
                    this._elSymbol, this._elementClass, el, parameters);
            }, this);
        }, 

        /**
        * @memberof Barricade.Arraylike
        * @private
        */
        _getJSON: function (options) {
            return this._data.map(function (el) {
                return el.toJSON(options);
            });
        },

        /**
        * @callback Barricade.Arraylike.eachCB
        * @param {Number} index
        * @param {Element} value
                 Instance of the Arraylike's Element class at index
        */

        /**
        * @memberof Barricade.Arraylike
        * @instance
        * @param {Barricade.Arraylike.eachCB} functionIn
                 A function to be called for each element in the array
        * @param {Function} comparatorIn
                 Comparator in the form that JavaScript's Array.sort() expects
        * @returns {self}
        */
        each: function (functionIn, comparatorIn) {
            var arr = this._data.slice();

            if (comparatorIn) {
                arr.sort(comparatorIn);
            }

            arr.forEach(function (value, index) {
                functionIn(index, value);
            });

            return this;
        },

        /**
        * @memberof Barricade.Arraylike
        * @instance
        * @param {Integer} index
        * @returns {Element}
        */
        get: function (index) {
            return this._data[index];
        },

        /**
        * Returns true if no elements are present, false otherwise.
        * @memberof Barricade.Arraylike
        * @instance
        * @returns {Boolean}
        */
        isEmpty: function () {
            return !this._data.length;
        },

        /**
        * Returns number of elements in Arraylike
        * @memberof Barricade.Arraylike
        * @instance
        * @returns {Number}
        */
        length: function () {
            return this._data.length;
        },

        /**
        * Appends an element to the end of the Arraylike.
        * @memberof Barricade.Arraylike
        * @instance
        * @param {JSON|Element} newValue
                 JSON in the form that the element schema expects, or an
                 instance of the Arraylike's element class.
        * @param {Object} [newParameters]
                 If JSON was passed in for newValue, a parameters object can be
                 passed in.
        * @returns {self}
        */
        push: function (newValue, newParameters) {
            this._data.push(
                this._isCorrectType(newValue, this._elementClass)
                    ? newValue
                    : this._keyClassCreate(this._elSymbol, this._elementClass,
                                           newValue, newParameters));

            return this.emit('_addedElement', this._data.length - 1)
                       .emit('change', 'add', this._data.length - 1);
        },

        /**
        * Removes element at specified index.
        * @memberof Barricade.Arraylike
        * @instance
        * @param {Integer} index
        * @returns {self}
        */
        remove: function (index) {
            this._data[index].emit('removeFrom', this);
            this._data.splice(index, 1);
            return this.emit('change', 'remove', index);
        },

        /**
        * Returns an array containing the Arraylike's elements
        * @memberof Barricade.Arraylike
        * @instance
        * @returns {Array}
        */
        toArray: function () {
            return this._data.slice(); // Shallow copy to prevent mutation
        }
    });
