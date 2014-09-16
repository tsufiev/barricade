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

    barricade.getType = (function () {
        var toString = Object.prototype.toString,
            types = {
                'boolean': Boolean,
                'number': Number,
                'string': String,
                '[object Array]': Array,
                '[object Date]': Date,
                '[object Function]': Function,
                '[object RegExp]': RegExp
            };

        return function (val) {
            return types[typeof val] || 
                   types[toString.call(val)] ||
                   (val ? Object : null);
        };
    }());

    function logMsg(msg) {
        console.log("Barricade: " + msg);
    }

    function logWarning(msg) {
        console.warn("Barricade: " + msg);
    }

    function logError(msg) {
        console.error("Barricade: " + msg);
    }

    function logVal(val1, val2) {
        if (val2) {
            console.log(val1, val2);
        } else {
            console.log(val1);
        }
    }

    function BarricadeMain(schema) {
        function schemaIsMutable() {
            return schema.hasOwnProperty('?');
        }

        function schemaIsImmutable() {
            return Object.keys(schema).some(function (key) {
                return key.charAt(0) !== '@' && key !== '?';
            });
        }

        if (schema['@type'] === Object && schemaIsImmutable()) {
            return barricade.immutableObject.extend({_schema: schema});
        } else if (schema['@type'] === Object && schemaIsMutable()) {
            return barricade.mutableObject.extend({_schema: schema});
        } else if (schema['@type'] === Array && schema.hasOwnProperty('*')) {
            return barricade.array.extend({_schema: schema});
        } else {
            return barricade.primitive.extend({_schema: schema});
        }
    }

    barricade.poly = BarricadeMain;

    BarricadeMain.getType = barricade.getType; // Very helpful function

    BarricadeMain.base = barricade.base;
    BarricadeMain.container = barricade.container;
    BarricadeMain.array = barricade.array;
    BarricadeMain.object = barricade.object;
    BarricadeMain.immutableObject = barricade.immutableObject;
    BarricadeMain.mutableObject = barricade.mutableObject;
    BarricadeMain.primitive = barricade.primitive;
    BarricadeMain.blueprint = blueprint;
    BarricadeMain.eventEmitter = eventEmitter;
    BarricadeMain.deferrable = barricade.deferrable;
    BarricadeMain.omittable = barricade.omittable;
    BarricadeMain.identifiable = barricade.identifiable;
    BarricadeMain.enumerated = barricade.enumerated;

    return BarricadeMain;
