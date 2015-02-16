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
    * Defines a constraint on the possible values a Barricade object can take.
      Enums can be defined simply as an array of values or an array of objects
      of the form `{label: someLabel, value: someValue}`.
    * @mixin
    * @memberof Barricade
    */
    Enumerated = Blueprint.create(function(enum_) {
        var self = this;

        function getEnum() {
            return (typeof enum_ === 'function') ? enum_.call(self) : enum_;
        }

        /**
        * Returns an array of labels. If the enum has defined labels, those are
          returned. If the enum is simply a set of values, the values are
          returned as the labels.
        * @method getEnumLabels
        * @memberof Barricade.Enumerated
        * @instance
        * @returns {Array}
        */
        this.getEnumLabels = function () {
            var curEnum = getEnum();
            return getType(curEnum[0]) === Object
                ? curEnum.map(function (value) { return value.label; })
                : curEnum;
        };

        /**
        * Returns an array of only the enum's values.
        * @method getEnumValues
        * @memberof Barricade.Enumerated
        * @instance
        * @returns {Array}
        */
        this.getEnumValues = function () {
            var curEnum = getEnum();
            return getType(curEnum[0]) === Object
                ? curEnum.map(function (value) { return value.value; })
                : curEnum;
        };

        this.addConstraint(function (value) {
            return (self.getEnumValues().indexOf(value) > -1) ||
                'Value can only be one of ' + self.getEnumLabels().join(', ');
        });
    });
