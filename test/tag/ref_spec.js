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

beforeEach(SAVE_GLOBAL_STATE);
afterEach(ENSURE_GLOBAL_OBJECT_UNPOLLUTED);

describe('@ref', function () {
    beforeEach(function () {
        var self = this;
        this.namespace = {};
        this.numCalls = 0;

        this.namespace.IsReferredTo = Barricade.create({'@type': Number});

        this.namespace.NeedsReference = Barricade.create({
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

        this.namespace.Parent = Barricade.create({
            '@type': Object,
            'a': {'@class': this.namespace.NeedsReference},
            'b': {'@class': this.namespace.IsReferredTo}
        });
        
        this.namespace.Parent2 = Barricade.create({
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

        this.namespace.Grandparent = Barricade.create({
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
