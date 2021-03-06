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
    * @mixin
    * @memberof Barricade
    */
    Observable = Blueprint.create(function () {
        var events = {};

        function hasEvent(eventName) {
            return events.hasOwnProperty(eventName);
        }

        /**
        * Executes all callbacks associated with an event in the order that they
          were added.
        * @method emit
        * @memberof Barricade.Observable
        * @instance
        * @param {String} eventName
        * @returns {self}
        */
        this.emit = function (eventName) {
            var args = arguments; // Must come from correct scope
            if (events.hasOwnProperty(eventName)) {
                events[eventName].slice().forEach(function (callback) {
                    // Call with emitter as context and pass all but eventName
                    callback.apply(this, Array.prototype.slice.call(args, 1));
                }, this);
            }
            return this;
        };

        /**
        * Removes a callback for a particular event.
        * @method off
        * @memberof Barricade.Observable
        * @instance
        * @param {String} eventName
        * @param {Function} callback
        * @returns {self}
        */
        this.off = function (eventName, callback) {
            var index;

            if (hasEvent(eventName)) {
                index = events[eventName].indexOf(callback);

                if (index > -1) {
                    events[eventName].splice(index, 1);
                }
            }
            return this;
        };

        /**
        * Specifies a callback to be executed when the Observable emits
          a particular event
        * @method on
        * @memberof Barricade.Observable
        * @instance
        * @param {String} eventName
        * @param {Function} callback
        * @returns {self}
        */
        this.on = function (eventName, callback) {
            if (!hasEvent(eventName)) {
                events[eventName] = [];
            }
            events[eventName].push(callback);
            return this;
        };
    });
