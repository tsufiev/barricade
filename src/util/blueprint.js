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
    * Blueprints are used to define mixins. They can be used to enable private
    * state. Blueprints are meant to be applied to new instances of a class to
    * provide instance methods or wrapped around a class itself to provide
    * static methods.
    *
    * Blueprints can be applied using
    * `SomeBlueprint.call(instance, arg1, arg2, ...)`
    *
    * Instances (and classes) can be checked to see if a
    * Blueprint has been applied to them using `instanceof()`<br>
    * ex: `someInstance.instanceof(SomeBlueprint)`
    * @class
    * @memberof Barricade
    */
    Blueprint = {
        /**
        * Creates a Blueprint.
        * @memberof Barricade.Blueprint
        * @param {function} f
                 A function that will be run when the Blueprint is applied. When
                 `.call(instance, arg1, arg2, ...)` is used, `instance` will be
                 set to `this` and the arguments will be passed to `f`.
        */
        create: function (f) {
            return function g() {
                if (!this.hasOwnProperty('_parents')) {
                    Object.defineProperty(this, '_parents', {value: []});
                }
                this._parents.push(g);
                return f.apply(this, arguments);
            };
        }
    };
