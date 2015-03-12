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

describe('Extendable', function () {
    it('should allow schema to be extended', function () {
        var ObjectClass = Barricade.create({
            '@type': Object,
            'a': {'@type': String},
            'c': {'@type': Object}
        }),
        ExtendedClass = ObjectClass.extend({}, {
            'b': {'@type': Number},
            'c': {'cc': {'@type': Boolean}}
        }),
        instance = ExtendedClass.create({
            'a': 'foo',
            'b': 6,
            'c':{'cc': true}
        });

        expect(instance.getKeys().sort()).toEqual(['a', 'b', 'c']);
        expect(instance.get('a').get()).toEqual('foo');
        expect(instance.get('b').get()).toEqual(6);
    });
});
