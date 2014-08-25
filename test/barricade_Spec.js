describe('Barricade', function () {
    var globalCopy;

    function saveGlobalState() {
        globalCopy = {};
        for (var key in window) {
            globalCopy[key] = window[key];
        }
    }

    function ensureGlobalObjectUnpolluted() {
        it('does not pollute the global namespace', function () {
            for (var key in window) {
                if (!globalCopy.hasOwnProperty(key)) {
                    // print pretty message
                    expect('window[' + key + ']').toBeUndefined();
                } else if (globalCopy[key] !== window[key]) {
                    // print pretty message
                    expect('window[' + key + ']').toBe('unchanged');
                }
            }
        });
    }

    it('exists as a function', function () {
        expect(typeof Barricade).toBe('function');
    });

    ///
    /// Primitive Types
    ///
    describe('Format with primitive types', function () {
        beforeEach(function () {
            saveGlobalState();

            this.namespace = {
                    existingMember: 1234,
                    existingMember2: "foo"
                };

            this.namespace.BooleanClass = Barricade({
                '@type': Boolean
            });

            this.namespace.NumberClass = Barricade({
                '@type': Number
            });

            this.namespace.StringClass = Barricade({
                '@type': String
            });

            this.namespace.ObjectClass = Barricade({
                '@type': Object
            });
            
            this.namespace.ArrayClass = Barricade({
                '@type': Array
            });
        });

        ensureGlobalObjectUnpolluted();

        it('should create classes on namespace', function () {
            expect(this.namespace.BooleanClass).toBeDefined();
            expect(this.namespace.NumberClass).toBeDefined();
            expect(this.namespace.StringClass).toBeDefined();
            expect(this.namespace.ObjectClass).toBeDefined();
            expect(this.namespace.ArrayClass).toBeDefined();

            expect(typeof this.namespace.BooleanClass).toBe('object');
            expect(typeof this.namespace.NumberClass).toBe('object');
            expect(typeof this.namespace.StringClass).toBe('object');
            expect(typeof this.namespace.ObjectClass).toBe('object');
            expect(typeof this.namespace.ArrayClass).toBe('object');
        });

        it('should not affect existing members in namespace', function () {
            expect(this.namespace.existingMember).toBe(1234);
            expect(this.namespace.existingMember2).toBe("foo");
        });

        it('should not create any extra members on namespace', function () {
            var key;

            delete this.namespace.existingMember;
            delete this.namespace.existingMember2;
            delete this.namespace.BooleanClass;
            delete this.namespace.NumberClass;
            delete this.namespace.StringClass;
            delete this.namespace.ObjectClass;
            delete this.namespace.ArrayClass;

            for (key in this.namespace) {
                // should never be reached, but is sure to error out
                expect(key).toBeUndefined();
            }
        });

        describe('Instantiating normally', function () {
            var types;

            beforeEach(function () {
                saveGlobalState();

                types = [
                    {
                        'value': true,
                        'value2': false,
                        'constructor': this.namespace.BooleanClass,
                        'primitiveType': Boolean
                    }, {
                        'value': 1001,
                        'value2': -256,
                        'constructor': this.namespace.NumberClass,
                        'primitiveType': Number
                    }, {
                        'value': "some string 1",
                        'value2': "another string 2",
                        'constructor': this.namespace.StringClass,
                        'primitiveType': String
                    }, {
                        'value': {
                            foo: "bar",
                            baz: "quux",
                        },
                        'value2': {
                            lorem: "ipsum",
                            dolor: "sit amet",
                        },
                        'constructor': this.namespace.ObjectClass,
                        'primitiveType': Object
                    }, {
                        'value': [0, "a", 1, "b"],
                        'value2': [5, 4, 3, 2, 1],
                        'constructor': this.namespace.ArrayClass,
                        'primitiveType': Array
                    }
                ];

                types.forEach(function (type) {
                    type.instance = type.constructor.create(type.value);
                });
            });

            ensureGlobalObjectUnpolluted();

            it('should create instances of class', function () {
                types.forEach(function (type) {
                    // should be instance of own class
                    expect(type.instance.instanceof(type.constructor))
                        .toBe(true);
                    
                    // should not be instance of other classes
                    types.forEach(function (otherType) {
                        if (type !== otherType) {
                            expect(type.instance
                                       .instanceof(otherType.constructor))
                                .toBe(false);
                        }
                    });
                });
            });

            it('.get() should retrieve value', function () {
                types.forEach(function (type) {
                    // toBe does not work with objects (which includes arrays)
                    //if (typeof type.value === 'object') {
                    expect(type.instance.get()).toBe(type.value);
                });
            });

            it('.set() should set value', function () {
                types.forEach(function (type) {
                    type.instance.set(type.value2);
                    expect(type.instance.get()).toBe(type.value2);

                    type.instance.set(type.value);
                    expect(type.instance.get()).toBe(type.value);
                });
            });

            it('.toJSON() should return JSON blob', function () {
                types.forEach(function (type) {
                    expect(type.instance.toJSON()).toBe(type.value);
                });
            });

            it('getPrimitiveType() should return type', function () {
                types.forEach(function (type) {
                    expect(type.instance.getPrimitiveType())
                        .toBe(type.primitiveType);
                });
            });

            it('should have isEmpty() return false', function () {
                types.forEach(function (type) {
                    expect(type.instance.isEmpty()).toBe(false);
                });
            });

            xit('should not have any other members', function () {
                types.forEach(function (type) {
                    var key;

                    delete type.instance.get;
                    delete type.instance.set;
                    delete type.instance.toJSON;
                    delete type.instance.getPrimitiveType;

                    for (key in type.instance) {
                        // should never be reached, but is sure to error out
                        expect(key).toBeUndefined();
                    }
                });
            });
        });

        describe('Instantiating with 0 arguments', function () {
            var types;

            beforeEach(function() {
                saveGlobalState();

                types = [
                    {
                        constructor: this.namespace.BooleanClass,
                        value: false
                    }, {
                        constructor: this.namespace.NumberClass,
                        value: 0
                    }, {
                        constructor: this.namespace.StringClass,
                        value: ""
                    }, {
                        constructor: this.namespace.ArrayClass,
                        value: []
                    }, {
                        constructor: this.namespace.ObjectClass,
                        value: {}
                    }
                ];

                types.forEach(function (type) {
                    type.instance = type.constructor.create();
                });
            });

            ensureGlobalObjectUnpolluted();

            it('should create instances with default values', function () {
                types.forEach(function (type) {
                    expect(type.instance.get()).toEqual(type.value);
                });
            });

            it('should have isEmpty() return true', function () {
                types.forEach(function (type) {
                    expect(type.instance.isEmpty()).toBe(true);
                });
            });
        });
    });

    ///
    /// Objects
    ///
    describe('Object formats', function () {
        describe('Instances from formats with fixed keys', function () {
            beforeEach(function () {
                saveGlobalState();

                this.namespace = {};

                this.namespace.FixedKeyClass = Barricade({
                    '@type': Object,

                    'stringKey': {
                        '@type': String
                    },
                    'booleanKey': {
                        '@type': Boolean
                    },
                    'numberKey': {
                        '@type': Number
                    }
                });

                this.instance = this.namespace.FixedKeyClass.create({
                    'stringKey': "foo",
                    'booleanKey': true,
                    'numberKey': 43987
                });
            });

            ensureGlobalObjectUnpolluted();

            it('should have correct values on its keys', function () {
                expect(this.instance.get('stringKey').get()).toBe("foo");
                expect(this.instance.get('booleanKey').get()).toBe(true);
                expect(this.instance.get('numberKey').get()).toBe(43987);
            });

            it('.getKeys() should return array of keys', function () {
                var keys = this.instance.getKeys();

                expect(keys instanceof Array).toBe(true);
                expect(keys.length).toBe(3);
                expect(keys).toContain('stringKey');
                expect(keys).toContain('booleanKey');
                expect(keys).toContain('numberKey');
            });

            it('.each() should be called on each member', function () {
                var keys = [],
                    values = [];

                this.instance.each(function (key, value) {
                    keys.push(key);
                    values.push(value.get());
                });

                expect(keys.length).toBe(3);
                expect(keys).toContain('stringKey');
                expect(keys).toContain('booleanKey');
                expect(keys).toContain('numberKey');
                
                expect(values.length).toBe(3);
                expect(values).toContain("foo");
                expect(values).toContain(true);
                expect(values).toContain(43987);
            });

            it('.each() parameter 2 can be a comparator', function () {
                function tryEach(obj,
                                  comparator,
                                  expectedKeys,
                                  expectedValues) {
                    var keys = [],
                        values = [];

                    obj.each(
                        function (key, value) {
                            keys.push(key);
                            values.push(value.get());
                        }, 
                        comparator
                    );

                    expect(keys).toEqual(expectedKeys);
                    expect(values).toEqual(expectedValues);
                }

                // sort alphabetically
                tryEach(
                    this.instance,
                    function (key1, key2) {
                        return key1.localeCompare(key2);
                    },
                    ['booleanKey', 'numberKey', 'stringKey'],
                    [true, 43987, "foo"]
                );

                // sort reversed alphabetically
                tryEach(
                    this.instance,
                    function (key1, key2) {
                        return key2.localeCompare(key1);
                    },
                    ['stringKey', 'numberKey', 'booleanKey'],
                    ["foo", 43987, true]
                );
            });

            it('.toJSON() should return JSON blob', function () {
                expect(this.instance.toJSON()).toEqual({
                    stringKey: "foo",
                    booleanKey: true,
                    numberKey: 43987
                });
            });

            it('.getPrimitiveType() should return Object', function () {
                expect(this.instance.getPrimitiveType()).toBe(Object);
            });

            xit('should not have any other members', function () {
                var key;

                delete this.instance.get;
                delete this.instance.getKeys;
                delete this.instance.each;
                delete this.instance.toJSON;
                delete this.instance.getPrimitiveType;

                for (key in this.instance) {
                    // should never be reached, but is sure to error out
                    expect(key).toBeUndefined();
                }
            });
        });

        describe('Instances from formats with wildcard keys', function () {
            beforeEach(function () {
                saveGlobalState();

                this.namespace = {};

                this.namespace.WildClass = Barricade({
                    '@type': Object,

                    '?': {
                        '@type': String
                    }
                });

                this.instance = this.namespace.WildClass.create({
                    foo: "abcd",
                    bar: "efgh",
                    baz: "ijkl"
                });
            });

            ensureGlobalObjectUnpolluted();

            it('should provide array-like interface', function () {
                var values = [];

                expect(this.instance.length()).toBe(3);
                expect(this.instance.get(0).get()).toBe("abcd");
                expect(this.instance.get(1).get()).toBe("efgh");
                expect(this.instance.get(2).get()).toBe("ijkl");

                this.instance.each(function (i, value) {
                    values.push(value.get());
                });

                expect(values).toEqual(["abcd", "efgh", "ijkl"]);
            });

            it('element.getID() should return its id', function () {
                expect(this.instance.get(0).getID()).toBe('foo');
                expect(this.instance.get(1).getID()).toBe('bar');
                expect(this.instance.get(2).getID()).toBe('baz');
            });

            it('element.setID() should change its id', function () {
                this.instance.get(0).setID('foofoo');
                this.instance.get(1).setID('barbar');
                this.instance.get(2).setID('bazbaz');

                expect(this.instance.get(0).getID()).toBe('foofoo');
                expect(this.instance.get(1).getID()).toBe('barbar');
                expect(this.instance.get(2).getID()).toBe('bazbaz');
            });

            it('.getIDs() should return array with ids', function () {
                expect(this.instance.getIDs()).toEqual(['foo', 'bar', 'baz']);
            });

            it('.push() should add element with JSON and ID', function () {
                this.instance.push('new value', {id: 'new id'});

                expect(this.instance.get(3).getID()).toBe('new id');
                expect(this.instance.get(3).get()).toBe('new value');
            });

            it('.toJSON() should return JSON blob', function () {
                expect(this.instance.toJSON()).toEqual({
                    foo: "abcd",
                    bar: "efgh",
                    baz: "ijkl"
                });
            });

            it('nested class should accept id in parameters', function () {
                this.namespace.NestedClass = Barricade({
                    '@type': String
                });

                this.namespace.WildClass2 = Barricade({
                    '@type': Object,
                    '?': {'@class': this.namespace.NestedClass}
                });

                this.instance2 = this.namespace.WildClass2.create({
                    foo2: "mnop",
                    bar2: "qrst",
                    baz2: "uvwx"
                });

                expect(this.instance2.get(0).getID()).toBe('foo2');
                expect(this.instance2.get(2).get()).toBe('uvwx');
            });
        });
    });

    describe('Array format', function () {
        function tryEach(array,
                          comparator,
                          expectedIndexes,
                          expectedValues) {
            var indexes = [],
                values = [];

            if (comparator) {
                array.each(
                    function (index, value) {
                        indexes.push(index);
                        values.push(value.get());
                    }, 
                    comparator
                );
            } else {
                array.each(function (index, value) {
                    indexes.push(index);
                    values.push(value.get());
                });
            }

            expect(indexes).toEqual(expectedIndexes);
            expect(values).toEqual(expectedValues);
        }

        beforeEach(function () {
            saveGlobalState();

            this.namespace = {};

            this.namespace.ArrayClass = Barricade({
                '@type': Array,

                '*': {
                    '@type': String
                }
            });

            this.instance1 = this.namespace.ArrayClass.create(['a', 'b', 'c']);

            this.instance2 = this.namespace.ArrayClass.create([
                'string element 1',
                'string element 2',
                'string element 3',
                'string element 4',
                'string element 5',
                'string element 6'
            ]);

            this.instance3 = this.namespace.ArrayClass.create();
        });

        ensureGlobalObjectUnpolluted();

        it('.length() should return number of elements', function () {
            expect(this.instance1.length()).toBe(3);
            expect(this.instance2.length()).toBe(6);
            expect(this.instance3.length()).toBe(0);
        });

        it('.get(index) should return element at index', function () {
            var i,
                length;

            expect(this.instance1.get(0).get()).toBe('a');

            for (i = 0, length = this.instance2.length(); i < length; i++) {
                expect(this.instance2.get(i).get())
                    .toBe('string element ' + (i + 1));
            }

            expect(this.instance1.get(3)).toBeUndefined();
            expect(this.instance2.get(6)).toBeUndefined();
            expect(this.instance3.get(0)).toBeUndefined();
        });

        it('.push() should insert element at the end', function () {
            this.instance1.push('d');
            this.instance2.push('string element 7');
            this.instance3.push('qwertyuiop');

            expect(this.instance1.length()).toBe(4);
            expect(this.instance1.get(3).get()).toBe('d');

            expect(this.instance2.length()).toBe(7);
            expect(this.instance2.get(6).get()).toBe('string element 7');

            expect(this.instance3.length()).toBe(1);
            expect(this.instance3.get(0).get()).toBe('qwertyuiop');
        });

        it('.push() should accept instances of element\'s class', function () {
            this.namespace.ArrayElement = Barricade({
                '@type': String
            });

            this.namespace.ArrayWithElementClass = Barricade({
                '@type': Array,
                '*': {'@class': this.namespace.ArrayElement}
            });

            this.instance4 = this.namespace.ArrayWithElementClass.create();
            this.elementInstance = this.namespace.ArrayElement.create('x');
            this.instance4.push(this.elementInstance);
            this.instance4.push(this.elementInstance);

            expect(this.instance4.length()).toBe(2);
            expect(this.instance4.get(0)).toBe(this.elementInstance);
            expect(this.instance4.get(1)).toBe(this.elementInstance);
            expect(this.instance4.get(0).get()).toBe('x');
            expect(this.instance4.get(1).get()).toBe('x');
        });

        it('.each() should be called on each element', function () {
            tryEach(this.instance1, null, [0, 1, 2], ['a', 'b', 'c']);

            tryEach(this.instance2,
                     null,
                     [0, 1, 2, 3, 4, 5],
                     [
                         'string element 1',
                         'string element 2',
                         'string element 3',
                         'string element 4',
                         'string element 5',
                         'string element 6',
                     ]);

            tryEach(this.instance3, null, [], []);
        });

        it('.each() parameter 2 can be a comparator', function () {
            function alphaCompare(val1, val2) {
                return val1.get().localeCompare(val2.get());
            }

            function alphaCompareRev(val1, val2) {
                return val2.get().localeCompare(val1.get());
            }

            tryEach(this.instance1,
                     alphaCompare,
                     [0, 1, 2],
                     ['a', 'b', 'c']);

            tryEach(this.instance1,
                     alphaCompareRev,
                     [0, 1, 2],
                     ['c', 'b', 'a']);

            tryEach(this.instance2,
                     alphaCompare,
                     [0, 1, 2, 3, 4, 5],
                     [
                         'string element 1',
                         'string element 2',
                         'string element 3',
                         'string element 4',
                         'string element 5',
                         'string element 6',
                     ]);

            tryEach(this.instance2,
                     alphaCompareRev,
                     [0, 1, 2, 3, 4, 5],
                     [
                         'string element 6',
                         'string element 5',
                         'string element 4',
                         'string element 3',
                         'string element 2',
                         'string element 1',
                     ]);

            tryEach(this.instance3, alphaCompare, [], []);
            tryEach(this.instance3, alphaCompareRev, [], []);
        });

        it('.toArray() should return native array copy', function () {
            var that = this;

            expect(this.instance1.toArray().reduce(function (prev, cur) {
                return prev + cur.get();
            }, '')).toBe('abc');

            expect(this.instance2.toArray()
                                 .reduce(function (prev, cur, index) {
                return prev + index;
            }, 0)).toBe(15);

            // test lack of initial value (should set prev to element 0)
            this.instance1.toArray().reduce(function (prev, cur, index) {
                if (index === 0) {
                    expect(prev).toBe(that.instance1.get(0));
                }
                return 0;
            });

            expect(this.instance1.length()).toBe(3);
            this.instance1.toArray().push('d');
            expect(this.instance1.length()).toBe(3);
        });

        it('.toJSON() should return JSON blob', function () {
            expect(this.instance1.toJSON()).toEqual(['a', 'b', 'c']);
            expect(this.instance2.toJSON()).toEqual([
                'string element 1',
                'string element 2',
                'string element 3',
                'string element 4',
                'string element 5',
                'string element 6',
            ]);
            expect(this.instance3.toJSON()).toEqual([]);
        });
    });

    describe('@required tag', function () {
        beforeEach(function () {
            this.namespace = {};

            this.namespace.FixedKeyClass = Barricade({
                '@type': Object,

                'stringKeyExplicit': {
                    '@type': String,
                    '@required': true
                },
                'stringKeyImplicit': {
                    '@type': String
                },
                'booleanKey': {
                    '@type': Boolean,
                    '@required': false
                },
                'numberKey': {
                    '@type': Number,
                    '@required': false
                }
            });

            this.instance = this.namespace.FixedKeyClass.create({
                'stringKeyExplicit': "foo",
                'stringKeyImplicit': "bar",
                'booleanKey': true
            });
        });

        it('should set .isRequired() correctly', function () {
            var inst = this.instance;
            expect(inst.get('stringKeyExplicit').isRequired()).toBe(true);
            expect(inst.get('stringKeyImplicit').isRequired()).toBe(true);
            expect(inst.get('booleanKey').isRequired()).toBe(false);
            expect(inst.get('numberKey').isRequired()).toBe(false);
        });

        it('should set .isUsed() correctly', function () {
            var inst = this.instance;
            expect(inst.get('stringKeyExplicit').isUsed()).toBe(true);
            expect(inst.get('stringKeyImplicit').isUsed()).toBe(true);
            expect(inst.get('booleanKey').isUsed()).toBe(true);
            expect(inst.get('numberKey').isUsed()).toBe(false);
        });
    });

    describe('Event emitter', function () {
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

            namespace.SimpleString = Barricade({
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

                this.namespace.ArrayClass = Barricade({
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

                this.namespace.MutableObjectClass = Barricade({
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

                this.namespace.NestedObject = Barricade({
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

    describe('Reference Resolving', function () {
        beforeEach(function () {
            var self = this;
            this.namespace = {};
            this.numCalls = 0;

            this.namespace.IsReferredTo = Barricade({'@type': Number});

            this.namespace.NeedsReference = Barricade({
                '@type': String,
                '@ref': {
                    to: this.namespace.IsReferredTo,
                    needs: function () {
                        return self.namespace.Parent;
                    },
                    resolver: function (json, parentObj) {
                        self.numCalls++;
                        return parentObj.get('b');
                    }
                }
            });

            this.namespace.Parent = Barricade({
                '@type': Object,
                'a': {'@class': this.namespace.NeedsReference},
                'b': {'@class': this.namespace.IsReferredTo}
            });
            
            this.namespace.Parent2 = Barricade({
                '@type': Object,
                'a': {
                    '@type': Object,
                    'b': {
                        '@type': Object,
                        'c': {
                            '@type': Number,
                            '@ref': {
                                to: this.namespace.IsReferredTo,
                                needs: function () {
                                    return self.namespace.Grandparent;
                                },
                                resolver: function (json, grandparent) {
                                    return grandparent.get('referredTo');
                                }
                            }
                        }
                    }
                }
            });

            this.namespace.Grandparent = Barricade({
                '@type': Object,

                'referredTo': {'@class': this.namespace.IsReferredTo},
                'refChild': {
                    '@type': Object,
                    '@ref': {
                        to: this.namespace.Parent2,
                        needs: function () {
                            return self.namespace.Grandparent;
                        },
                        resolver: function (json) {
                            return self.namespace.Parent2.create(json);
                        }
                    }
                }
            });
        });

        it('should resolve references correctly', function () {
            var instance = this.namespace.Parent.create({'a': "abc", 'b': 5});

            expect(this.numCalls).toBe(1);
            expect(instance.get('a')).toBe(instance.get('b'));
        });

        it('should resolve nested references correctly', function () {
            var instance = this.namespace.Grandparent.create({
                    'referredTo': 9,
                    'refChild': {
                        'a': {
                            'b': {
                                'c': 3
                            }
                        }
                    }
                });

            expect(instance.get('refChild').get('a').get('b').get('c').get())
                .toBe(instance.get('referredTo').get());
        });
    });

    describe('Factories', function () {
        beforeEach(function () {
            this.namespace = {};

            Barricade.factory(this.namespace, {
                '@factory': 'SpecificNumber',

                '@create': function (json, parameters) {
                    if (json === 1) {
                        return 'One';
                    } else if (json === 2) {
                        return 'Two';
                    } else if (json === 3) {
                        return 'Three';
                    }
                },

                '@classes': {
                    'One': {'@type': Number},
                    'Two': {'@type': Number},
                    'Three': {'@type': Number},
                }
            });
        });
    });
});
