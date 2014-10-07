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

    var Enumerated = Blueprint.create(function(enum_) {
        var self = this;

        function getEnum() {
            return (typeof enum_ === 'function') ? enum_.call(self) : enum_;
        }

        this.getEnumLabels = function () {
            var curEnum = getEnum();
            if (getType(curEnum[0]) === Object) {
                return curEnum.map(function (value) { return value.label; });
            } else {
                return curEnum;
            }
        };

        this.getEnumValues = function () {
            var curEnum = getEnum();
            if (getType(curEnum[0]) === Object) {
                return curEnum.map(function (value) { return value.value; });
            } else {
                return curEnum;
            }
        };

        this.addConstraint(function (value) {
            return (self.getEnumValues().indexOf(value) > -1) ||
                'Value can only be one of ' + self.getEnumLabels().join(', ');
        });
    });
