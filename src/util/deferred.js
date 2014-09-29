// Copyright 2014 Drago Rosson
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

    var Deferred = {
        create: function (classGetter, onResolve) {
            var self = Object.create(this),
                callbacks = [],
                isResolved = false;

            self.getClass = function () {
                return classGetter();
            };

            self.resolve = function (obj) {
                var ref;

                if (isResolved) {
                    throw new Error('Deferred already resolved');
                }

                ref = onResolve(obj);

                if (ref === undefined) {
                    logError('Could not resolve reference');
                } else {
                    isResolved = true;
                    callbacks.forEach(function (callback) {
                        callback(ref);
                    });
                }

                return ref;
            };

            self.isResolved = function () {
                return isResolved;
            };

            self.addCallback = function (callback) {
                callbacks.push(callback);
            };

            self.needs = function (obj) {
                return obj.instanceof(this.getClass());
            };
            
            return self;
        }
    };
