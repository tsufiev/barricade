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

describe('@factory', function () {
    beforeEach(function () {
        this.namespace = {};

        this.namespace.SubClassBase = Barricade.create({'@type': String});
        this.namespace.SubClassFoo = this.namespace.SubClassBase.extend({});
        this.namespace.SubClassBar = this.namespace.SubClassBase.extend({});

        this.namespace.FixedKeyClass = Barricade.create({
            '@type': Object,

            'someKey': {
                '@class': this.namespace.SubClassBase,
                '@factory': function (json, parameters) {
                    return json === 'foo'
                        ? this.namespace.SubClassFoo.create(json, parameters)
                        : this.namespace.SubClassBar.create(json, parameters);
                }.bind(this)
            }
        });

        this.instanceFoo = this.namespace.FixedKeyClass.create({
            'someKey': 'foo'
        });

        this.instanceBar = this.namespace.FixedKeyClass.create({
            'someKey': 'bar'
        });
    });

    it('should call @factory on creates', function () {
        var ns = this.namespace;
        expect(this.instanceFoo.get('someKey').instanceof(ns.SubClassBase))
            .toBe(true);
        expect(this.instanceBar.get('someKey').instanceof(ns.SubClassBase))
            .toBe(true);
        expect(this.instanceFoo.get('someKey').instanceof(ns.SubClassFoo))
            .toBe(true);
        expect(this.instanceBar.get('someKey').instanceof(ns.SubClassBar))
            .toBe(true);
    });

    it('should call @factory on sets', function () {
        var ns = this.namespace;
        this.instanceFoo.set('someKey', 'bar');
        this.instanceBar.set('someKey', 'foo');
        expect(this.instanceFoo.get('someKey').instanceof(ns.SubClassBase))
            .toBe(true);
        expect(this.instanceBar.get('someKey').instanceof(ns.SubClassBase))
            .toBe(true);
        expect(this.instanceFoo.get('someKey').instanceof(ns.SubClassBar))
            .toBe(true);
        expect(this.instanceBar.get('someKey').instanceof(ns.SubClassFoo))
            .toBe(true);
    });
});
