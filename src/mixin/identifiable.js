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
    * Attaches an identifier to an object. Used as an alternative to key/value
      pairs in JSON objects when the key is user-defined. This way the key (ID)
      stays with the value.
    * @mixin
    * @memberof Barricade
    */
    Identifiable = Blueprint.create(function (id) {
        /**
        * Returns the ID
        * @method getID
        * @memberof Barricade.Identifiable
        * @instance
        * @returns {String}
        */
        this.getID = function () {
            return id;
        };

        /**
        * Sets the ID.
        * @method setID
        * @memberof Barricade.Identifiable
        * @instance
        * @param {String} newID
        * @returns {self}
        */
        this.setID = function (newID) {
            id = newID;
            return this.emit('change', 'id');
        };
    });
