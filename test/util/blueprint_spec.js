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

beforeEach(SAVE_GLOBAL_STATE);
afterEach(ENSURE_GLOBAL_OBJECT_UNPOLLUTED);

describe('Blueprint', function () {
    it('should add used blueprints to _parents array', function () {
        var bp = Barricade.Blueprint.create(function () { return this; }),
            instance = bp.call({});

        expect(instance._parents).toEqual([bp]);
    });

    it('should return original object if f returns nothing', function () {
        var bp = Barricade.Blueprint.create(function () {}),
            instance = {};

        expect(bp.call(instance)).toBe(instance);
    });

    it('should return original object if f returns this', function () {
        var bp = Barricade.Blueprint.create(function () { return this; }),
            instance = {};

        expect(bp.call(instance)).toBe(instance);
    });

    it('should return new object if f returns new object', function () {
        var supposedResult,
            bp = Barricade.Blueprint.create(function () {
                supposedResult = Object.create(this);
                return supposedResult;
            }),
            instance = {},
            result = bp.call(instance);

        expect(result).not.toBe(instance);
        expect(result).toBe(supposedResult);
        expect(result._parents).toEqual([bp]);
    });

    it('should not modify original if f returns new object', function () {
        var bp = Barricade.Blueprint.create(function () {
                return Object.create(this);
            }),
            instance = {};

        bp.call(instance);

        expect(instance._parents).toBe(undefined);
    });

    it('should not have a problem with Object.create(null)', function () {
        var bp = Barricade.Blueprint.create(function () { return this; }),
            instance = bp.call(Object.create(null));

        expect(instance._parents).toEqual([bp]);
    });
});
