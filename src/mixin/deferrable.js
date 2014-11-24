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

    Deferrable = Blueprint.create(function (schema) {
        var self = this,
            deferred;

        function resolver(neededValue) {
            var ref = schema['@ref'].resolver(self, neededValue);
            if (ref === undefined) {
                logError('Could not resolve "' + 
                          JSON.stringify(self.toJSON()) + '"');
            }
            return ref;
        }

        if (schema.hasOwnProperty('@ref')) {
            deferred = Deferred.create(schema['@ref'].needs, resolver);
        }

        this.resolveWith = function (obj) {
            var allResolved = true;

            if (deferred && !deferred.isResolved()) {
                if (deferred.needs(obj)) {
                    this.emit('replace', deferred.resolve(obj));
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
    });
