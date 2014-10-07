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

    var MutableObject = Arraylike.extend({
        _elSymbol: '?',
        _sift: function (json, parameters) {
            return Object.keys(json).map(function (key) {
                return this._keyClassCreate(
                                   this._elSymbol, this._elementClass,
                                   json[key], {id: key});
            }, this);
        },
        getIDs: function () {
            return this.toArray().map(function (value) {
                return value.getID();
            });
        },
        getPosByID: function (id) {
            return this.getIDs().indexOf(id);
        },
        getByID: function (id) {
            return this.get(this.getPosByID(id));
        },
        contains: function (element) {
            return this.toArray().some(function (value) {
                return element === value;
            });
        },
        toJSON: function (ignoreUnused) {
            return this.toArray().reduce(function (jsonOut, element) {
                if (jsonOut.hasOwnProperty(element.getID())) {
                    logError("ID encountered multiple times: " +
                                  element.getID());
                } else {
                    jsonOut[element.getID()] = 
                        element.toJSON(ignoreUnused);
                }
                return jsonOut;
            }, {});
        },
        push: function (newJson, newParameters) {
            if (!this._safeInstanceof(newJson, this._elementClass) &&
                    (getType(newParameters) !== Object ||
                    !newParameters.hasOwnProperty('id'))) {
                logError('ID should be passed in ' + 
                          'with parameters object');
            } else {
                Array_.push.call(this, newJson, newParameters);
            }
        },
    });
