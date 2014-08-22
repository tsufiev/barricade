describe('Barricade', function () {
    var global_copy;

    function save_global_state() {
        global_copy = {};
        for (var key in window) {
            global_copy[key] = window[key];
        }
    }

    function ensure_global_object_unpolluted() {
        it('does not pollute the global namespace', function () {
            for (var key in window) {
                if (!global_copy.hasOwnProperty(key)) {
                    // print pretty message
                    expect('window[' + key + ']').toBeUndefined();
                } else if (global_copy[key] !== window[key]) {
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
            save_global_state();

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

        ensure_global_object_unpolluted();

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
                save_global_state();

                types = [
                    {
                        'value': true,
                        'value2': false,
                        'constructor': this.namespace.BooleanClass,
                        'primitive_type': Boolean
                    }, {
                        'value': 1001,
                        'value2': -256,
                        'constructor': this.namespace.NumberClass,
                        'primitive_type': Number
                    }, {
                        'value': "some string 1",
                        'value2': "another string 2",
                        'constructor': this.namespace.StringClass,
                        'primitive_type': String
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
                        'primitive_type': Object
                    }, {
                        'value': [0, "a", 1, "b"],
                        'value2': [5, 4, 3, 2, 1],
                        'constructor': this.namespace.ArrayClass,
                        'primitive_type': Array
                    }
                ];

                types.forEach(function (type) {
                    type.instance = type.constructor.create(type.value);
                });
            });

            ensure_global_object_unpolluted();

            it('should create instances of class', function () {
                types.forEach(function (type) {
                    // should be instance of own class
                    expect(type.instance.instanceof(type.constructor))
                        .toBe(true);
                    
                    // should not be instance of other classes
                    types.forEach(function (other_type) {
                        if (type !== other_type) {
                            expect(type.instance
                                       .instanceof(other_type.constructor))
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

            it('get_primitive_type() should return type', function () {
                types.forEach(function (type) {
                    expect(type.instance.get_primitive_type())
                        .toBe(type.primitive_type);
                });
            });

            it('should have is_empty() return false', function () {
                types.forEach(function (type) {
                    expect(type.instance.is_empty()).toBe(false);
                });
            });

            xit('should not have any other members', function () {
                types.forEach(function (type) {
                    var key;

                    delete type.instance.get;
                    delete type.instance.set;
                    delete type.instance.toJSON;
                    delete type.instance.get_primitive_type;

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
                save_global_state();

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

            ensure_global_object_unpolluted();

            it('should create instances with default values', function () {
                types.forEach(function (type) {
                    expect(type.instance.get()).toEqual(type.value);
                });
            });

            it('should have is_empty() return true', function () {
                types.forEach(function (type) {
                    expect(type.instance.is_empty()).toBe(true);
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
                save_global_state();

                this.namespace = {};

                this.namespace.FixedKeyClass = Barricade({
                    '@type': Object,

                    'string_key': {
                        '@type': String
                    },
                    'boolean_key': {
                        '@type': Boolean
                    },
                    'number_key': {
                        '@type': Number
                    }
                });

                this.instance = this.namespace.FixedKeyClass.create({
                    'string_key': "foo",
                    'boolean_key': true,
                    'number_key': 43987
                });
            });

            ensure_global_object_unpolluted();

            it('should have correct values on its keys', function () {
                expect(this.instance.get('string_key').get()).toBe("foo");
                expect(this.instance.get('boolean_key').get()).toBe(true);
                expect(this.instance.get('number_key').get()).toBe(43987);
            });

            it('.get_keys() should return array of keys', function () {
                var keys = this.instance.get_keys();

                expect(keys instanceof Array).toBe(true);
                expect(keys.length).toBe(3);
                expect(keys).toContain('string_key');
                expect(keys).toContain('boolean_key');
                expect(keys).toContain('number_key');
            });

            it('.each() should be called on each member', function () {
                var keys = [],
                    values = [];

                this.instance.each(function (key, value) {
                    keys.push(key);
                    values.push(value.get());
                });

                expect(keys.length).toBe(3);
                expect(keys).toContain('string_key');
                expect(keys).toContain('boolean_key');
                expect(keys).toContain('number_key');
                
                expect(values.length).toBe(3);
                expect(values).toContain("foo");
                expect(values).toContain(true);
                expect(values).toContain(43987);
            });

            it('.each() parameter 2 can be a comparator', function () {
                function try_each(obj,
                                  comparator,
                                  expected_keys,
                                  expected_values) {
                    var keys = [],
                        values = [];

                    obj.each(
                        function (key, value) {
                            keys.push(key);
                            values.push(value.get());
                        }, 
                        comparator
                    );

                    expect(keys).toEqual(expected_keys);
                    expect(values).toEqual(expected_values);
                }

                // sort alphabetically
                try_each(
                    this.instance,
                    function (key1, key2) {
                        return key1.localeCompare(key2);
                    },
                    ['boolean_key', 'number_key', 'string_key'],
                    [true, 43987, "foo"]
                );

                // sort reversed alphabetically
                try_each(
                    this.instance,
                    function (key1, key2) {
                        return key2.localeCompare(key1);
                    },
                    ['string_key', 'number_key', 'boolean_key'],
                    ["foo", 43987, true]
                );
            });

            it('.toJSON() should return JSON blob', function () {
                expect(this.instance.toJSON()).toEqual({
                    string_key: "foo",
                    boolean_key: true,
                    number_key: 43987
                });
            });

            it('.get_primitive_type() should return Object', function () {
                expect(this.instance.get_primitive_type()).toBe(Object);
            });

            xit('should not have any other members', function () {
                var key;

                delete this.instance.get;
                delete this.instance.get_keys;
                delete this.instance.each;
                delete this.instance.toJSON;
                delete this.instance.get_primitive_type;

                for (key in this.instance) {
                    // should never be reached, but is sure to error out
                    expect(key).toBeUndefined();
                }
            });
        });

        describe('Instances from formats with wildcard keys', function () {
            beforeEach(function () {
                save_global_state();

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

            ensure_global_object_unpolluted();

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

            it('element.get_id() should return its id', function () {
                expect(this.instance.get(0).get_id()).toBe('foo');
                expect(this.instance.get(1).get_id()).toBe('bar');
                expect(this.instance.get(2).get_id()).toBe('baz');
            });

            it('element.set_id() should change its id', function () {
                this.instance.get(0).set_id('foofoo');
                this.instance.get(1).set_id('barbar');
                this.instance.get(2).set_id('bazbaz');

                expect(this.instance.get(0).get_id()).toBe('foofoo');
                expect(this.instance.get(1).get_id()).toBe('barbar');
                expect(this.instance.get(2).get_id()).toBe('bazbaz');
            });

            it('.get_ids() should return array with ids', function () {
                expect(this.instance.get_ids()).toEqual(['foo', 'bar', 'baz']);
            });

            it('.push() should add element with JSON and ID', function () {
                this.instance.push('new value', {id: 'new id'});

                expect(this.instance.get(3).get_id()).toBe('new id');
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

                expect(this.instance2.get(0).get_id()).toBe('foo2');
                expect(this.instance2.get(2).get()).toBe('uvwx');
            });
        });
    });

    describe('Array format', function () {
        function try_each(array,
                          comparator,
                          expected_indexes,
                          expected_values) {
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

            expect(indexes).toEqual(expected_indexes);
            expect(values).toEqual(expected_values);
        }

        beforeEach(function () {
            save_global_state();

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

        ensure_global_object_unpolluted();

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
            this.element_instance = this.namespace.ArrayElement.create('x');
            this.instance4.push(this.element_instance);
            this.instance4.push(this.element_instance);

            expect(this.instance4.length()).toBe(2);
            expect(this.instance4.get(0)).toBe(this.element_instance);
            expect(this.instance4.get(1)).toBe(this.element_instance);
            expect(this.instance4.get(0).get()).toBe('x');
            expect(this.instance4.get(1).get()).toBe('x');
        });

        it('.each() should be called on each element', function () {
            try_each(this.instance1, null, [0, 1, 2], ['a', 'b', 'c']);

            try_each(this.instance2,
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

            try_each(this.instance3, null, [], []);
        });

        it('.each() parameter 2 can be a comparator', function () {
            function alpha_compare(val1, val2) {
                return val1.get().localeCompare(val2.get());
            }

            function alpha_compare_rev(val1, val2) {
                return val2.get().localeCompare(val1.get());
            }

            try_each(this.instance1,
                     alpha_compare,
                     [0, 1, 2],
                     ['a', 'b', 'c']);

            try_each(this.instance1,
                     alpha_compare_rev,
                     [0, 1, 2],
                     ['c', 'b', 'a']);

            try_each(this.instance2,
                     alpha_compare,
                     [0, 1, 2, 3, 4, 5],
                     [
                         'string element 1',
                         'string element 2',
                         'string element 3',
                         'string element 4',
                         'string element 5',
                         'string element 6',
                     ]);

            try_each(this.instance2,
                     alpha_compare_rev,
                     [0, 1, 2, 3, 4, 5],
                     [
                         'string element 6',
                         'string element 5',
                         'string element 4',
                         'string element 3',
                         'string element 2',
                         'string element 1',
                     ]);

            try_each(this.instance3, alpha_compare, [], []);
            try_each(this.instance3, alpha_compare_rev, [], []);
        });

        it('.to_array() should return native array copy', function () {
            var that = this;

            expect(this.instance1.to_array().reduce(function (prev, cur) {
                return prev + cur.get();
            }, '')).toBe('abc');

            expect(this.instance2.to_array()
                                 .reduce(function (prev, cur, index) {
                return prev + index;
            }, 0)).toBe(15);

            // test lack of initial value (should set prev to element 0)
            this.instance1.to_array().reduce(function (prev, cur, index) {
                if (index === 0) {
                    expect(prev).toBe(that.instance1.get(0));
                }
                return 0;
            });

            expect(this.instance1.length()).toBe(3);
            this.instance1.to_array().push('d');
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

                'string_key_explicit': {
                    '@type': String,
                    '@required': true
                },
                'string_key_implicit': {
                    '@type': String
                },
                'boolean_key': {
                    '@type': Boolean,
                    '@required': false
                },
                'number_key': {
                    '@type': Number,
                    '@required': false
                }
            });

            this.instance = this.namespace.FixedKeyClass.create({
                'string_key_explicit': "foo",
                'string_key_implicit': "bar",
                'boolean_key': true
            });
        });

        it('should set .is_required() correctly', function () {
            var inst = this.instance;
            expect(inst.get('string_key_explicit').is_required()).toBe(true);
            expect(inst.get('string_key_implicit').is_required()).toBe(true);
            expect(inst.get('boolean_key').is_required()).toBe(false);
            expect(inst.get('number_key').is_required()).toBe(false);
        });

        it('should set .is_used() correctly', function () {
            var inst = this.instance;
            expect(inst.get('string_key_explicit').is_used()).toBe(true);
            expect(inst.get('string_key_implicit').is_used()).toBe(true);
            expect(inst.get('boolean_key').is_used()).toBe(true);
            expect(inst.get('number_key').is_used()).toBe(false);
        });
    });

    describe('Event emitter', function () {
        function get_callback(name, storage_obj) {
            storage_obj[name] = 0;

            return function () {
                storage_obj[name]++;
            };
        }

        it('.off should remove listeners', function () {
            var namespace = {},
                calls = {},
                instance,
                change = get_callback('change', calls);

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
                this.instance.on('change', get_callback('change', this.calls));

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
                this.instance.on('child_change',
                                 get_callback('child_change', this.calls));

                this.instance.push('g');
                this.instance.get(this.instance.length() - 1).set('h');

                expect(this.calls.child_change).toBe(1);
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

            it('set_id() emits "change" with "id" as parameter', function () {
                var child = this.instance.get(0),
                    calls = 0;

                child.on('change', function (type) {
                    if (type === 'id') {
                        calls++;
                    }
                });

                child.set_id('def');
                child.set_id('ghi');

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
                var child_change = get_callback('child_change', this.calls);

                // Attach listeners
                this.instance.on('child_change', child_change);
                this.instance.get('a').on('child_change', child_change);
                this.instance.get('a').get('aa').on('child_change',
                                                    child_change);

                // Trigger listeners by changing value
                this.instance.get('a').get('aa').get('aaa').set('abc');

                expect(this.calls.child_change).toBe(3);
            });
        });
    });

    describe('Reference Resolving', function () {
        beforeEach(function () {
            var self = this;
            this.namespace = {};
            this.num_calls = 0;

            this.namespace.IsReferredTo = Barricade({'@type': Number});

            this.namespace.NeedsReference = Barricade({
                '@type': String,
                '@ref': {
                    to: this.namespace.IsReferredTo,
                    needs: function () {
                        return self.namespace.Parent;
                    },
                    resolver: function (json, parent_obj) {
                        self.num_calls++;
                        return parent_obj.get('b');
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
                                    return grandparent.get('referred_to');
                                }
                            }
                        }
                    }
                }
            });

            this.namespace.Grandparent = Barricade({
                '@type': Object,

                'referred_to': {'@class': this.namespace.IsReferredTo},
                'ref_child': {
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

            expect(this.num_calls).toBe(1);
            expect(instance.get('a')).toBe(instance.get('b'));
        });

        it('should resolve nested references correctly', function () {
            var instance = this.namespace.Grandparent.create({
                    'referred_to': 9,
                    'ref_child': {
                        'a': {
                            'b': {
                                'c': 3
                            }
                        }
                    }
                });

            expect(instance.get('ref_child').get('a').get('b').get('c').get())
                .toBe(instance.get('referred_to').get());
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
