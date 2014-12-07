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

    Deferred = {
        create: function (classGetter, onResolve) {
            var self = Object.create(this);
            self._isResolved = false;
            self._classGetter = classGetter;
            self._onResolve = onResolve;
            return self;
        },
        isResolved: function () {
            return this._isResolved;
        },
        needs: function (obj) {
            return obj.instanceof(this._classGetter());
        },
        resolve: function (obj) {
            var ref;

            if (this._isResolved) {
                throw new Error('Deferred already resolved');
            }

            ref = this._onResolve(obj);

            if (ref !== undefined) {
                this._isResolved = true;
                return ref;
            }
        }
    };
