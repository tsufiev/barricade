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

describe('Observable', function () {
    function getCallback(name, storageObj) {
        storageObj[name] = 0;

        return function () {
            storageObj[name]++;
        };
    }

    it('.off should remove listeners', function () {
        var namespace = {},
            calls = {},
            instance,
            change = getCallback('change', calls);

        namespace.SimpleString = Barricade.create({
            '@type': String
        });

        instance = namespace.SimpleString.create();

        instance.set('abc');
        instance.on('change', change);
        instance.set('def');
        instance.off('change', change);
        instance.set('ghi');

        expect(calls.change).toBe(1);
    });

    describe('Array events', function () {
        beforeEach(function () {
            this.namespace = {};
            this.calls = {};

            this.namespace.ArrayClass = Barricade.create({
                '@type': Array,
                '*': {'@type': String}
            });

            this.instance = this.namespace
                                .ArrayClass
                                .create(['a', 'b', 'c']);
        });

        it('using set()/push()/remove() should emit "change"', function () {
            this.instance.on('change', getCallback('change', this.calls));

            this.instance.set(0, 'd');
            expect(this.calls.change).toBe(1);
            this.instance.set(1, 'e');
            expect(this.calls.change).toBe(2);
            this.instance.push('f');
            expect(this.calls.change).toBe(3);
            this.instance.remove(0);
            expect(this.calls.change).toBe(4);
        });

        it('remove() removes element\'s container listeners', function () {
            var element = this.instance.get(0);

            this.instance.on('childChange',
                             getCallback('childChange', this.calls));

            expect(this.calls.childChange).toBe(0);
            element.set('aa');
            expect(this.calls.childChange).toBe(1);
            this.instance.remove(0);
            element.set('aa');
            expect(this.calls.childChange).toBe(1);
        });

        it('added elements should have listeners as well', function () {
            this.instance.on('childChange',
                             getCallback('childChange', this.calls));

            this.instance.push('g');
            this.instance.get(this.instance.length() - 1).set('h');

            expect(this.calls.childChange).toBe(1);
        });
    });

    describe('Change events', function () {
        beforeEach(function () {
            this.namespace = {};

            this.namespace.MutableObjectClass = Barricade.create({
                '@type': Object,
                '?': {'@type': String}
            });

            this.instance = this.namespace.MutableObjectClass.create({
                'abc': '123'
            });
        });

        it('setID() emits "change" with "id" as parameter', function () {
            var child = this.instance.get(0),
                calls = 0;

            child.on('change', function (type) {
                if (type === 'id') {
                    calls++;
                }
            });

            child.setID('def');
            child.setID('ghi');

            expect(calls).toBe(2);
        });
    });

    describe('Nested change and child change calls', function () {
        beforeEach(function () {
            this.namespace = {};
            this.calls = {};

            this.namespace.NestedObject = Barricade.create({
                '@type': Object,
                'a': {
                    '@type': Object,
                    'aa': {
                        '@type': Object,
                        'aaa': {
                            '@type': String
                        }
                    }
                }
            });

            this.instance = this.namespace.NestedObject.create();
        });

        it('should emit correct number of calls', function () {
            var childChange = getCallback('childChange', this.calls);

            // Attach listeners
            this.instance.on('childChange', childChange);
            this.instance.get('a').on('childChange', childChange);
            this.instance.get('a').get('aa').on('childChange',
                                                childChange);

            // Trigger listeners by changing value
            this.instance.get('a').get('aa').get('aaa').set('abc');

            expect(this.calls.childChange).toBe(3);
        });
    });
});
