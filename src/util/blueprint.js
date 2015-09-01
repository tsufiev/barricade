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
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            function super_(methodName) {
                var methods = this._methods[methodName];
                if (methods) {
                    for (var i = methods.length - 1; i > 0; i--) {
                        if (methods[i][0] === g) {
                            break;
                        }
                    }
                    if (i > 0) {
                        // there are preceding methods in a method chain
                        return methods[i - 1][1];
                    } else if (methods[0].length == 1) { // first method comes from a base class
                        return methods[0];
                    } else if (hasOwnProperty.call(this, '_nativeSuper')) {
                        return this._nativeSuper(methodName);
                    } else {
                        throw Error('No suitable candidates for super("' + methodName + '") found!')
                    }
                }
            }

            function addMethod(methodName, method) {
                if (!hasOwnProperty.call(this, '_methods')) {
                    Object.defineProperty(this, '_methods', {value: {}});
                }
                this._methods[methodName] = this._methods[methodName] || [];
                this._methods[methodName].push([g, method]);
                return method;
            }

            function g() {
                var possibleNameCollision = this.addMethod;
                this.addMethod = addMethod;
                var result = f.apply(this, arguments) || this;
                if (possibleNameCollision) {
                    this.addMethod = possibleNameCollision;
                } else {
                    delete this.addMethod;
                }
                if (!hasOwnProperty.call(result, '_parents')) {
                    Object.defineProperty(result, '_parents', {value: []});
                }
                result._parents.push(g);
                if (hasOwnProperty.call(this, 'super') &&
                    !hasOwnProperty.call(this, '_nativeSuper')) {
                    this._nativeSuper = this.super;
                }
                result.super = super_;
                return result;
            }
            return g;
        }
    };
