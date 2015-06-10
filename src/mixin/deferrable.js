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
    Deferrable = Blueprint.create(function () {
        var existingCreate = this.create;

        this.create = function() {
            var self = existingCreate.apply(this, arguments),
                schema = self._schema,
                needed,
                deferred = schema.hasOwnProperty('@ref')
                    ? Deferred.create(schema['@ref'].needs, getter, resolver)
                    : null;

            if (schema.hasOwnProperty('@ref') && !schema['@ref'].processor) {
                schema['@ref'].processor = function (o) { return o.val; };
            }

            function getter(neededVal) {
                return schema['@ref'].getter(
                    {standIn: self, needed: neededVal});
            }

            function resolver(retrievedValue) {
                self.emit('replace', schema['@ref'].processor({
                    val: retrievedValue,
                    standIn: self,
                    needed: needed
                }));
            }

            self.resolveWith = function (obj) {
                var allResolved = true;

                if (deferred && !deferred.isResolved()) {
                    if (deferred.needs(obj)) {
                        needed = obj;
                        deferred.resolve(obj);
                    } else {
                        allResolved = false;
                    }
                }

                if (this.instanceof(Container)) {
                    this.each(function (index, value) {
                        if (!value.resolveWith(obj)) {
                            allResolved = false;
                        }
                    });
                }

                return allResolved;
            };

            self.isPlaceholder = function () {
                return !!deferred;
            };

            return self;
        };

        this.isValidRef = function(instance) {
            var clsRef = this._schema['@ref'];
            if (!clsRef) {
                return false;
            }
            if (typeof clsRef.to === 'function') {
                return this._safeInstanceof(instance, clsRef.to());
            } else if (typeof clsRef.to === 'object') {
                return this._safeInstanceof(instance, clsRef.to);
            }
            throw new Error('Ref.to was ' + clsRef.to);
        };

        return this;
    });
