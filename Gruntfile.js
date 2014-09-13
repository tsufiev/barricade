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

module.exports = function (grunt) {
    var apache_license = [
            '// Copyright 2014 Drago Rosson',
            '//',
            '// Licensed under the Apache License, Version 2.0 (the "License");',
            '// you may not use this file except in compliance with the License.',
            '// You may obtain a copy of the License at',
            '//',
            '//     http://www.apache.org/licenses/LICENSE-2.0',
            '//',
            '// Unless required by applicable law or agreed to in writing, software',
            '// distributed under the License is distributed on an "AS IS" BASIS,',
            '// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
            '// See the License for the specific language governing permissions and',
            '// limitations under the License.',
            '',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            barricade: {
                src: [
                    'src/intro.js',
                    'src/util/blueprint.js',
                    'src/mixin/identifiable.js',
                    'src/mixin/omittable.js',
                    'src/mixin/deferrable.js',
                    'src/mixin/validatable.js',
                    'src/mixin/enumerated.js',
                    'src/mixin/observable.js',
                    'src/util/deferred.js',
                    'src/base.js',
                    'src/container.js',
                    'src/arraylike.js',
                    'src/array.js',
                    'src/immutable_object.js',
                    'src/mutable_object.js',
                    'src/primitive.js',
                    'src/core.js',
                    'src/outro.js'
                ],
                dest: 'barricade.js',
                options: {
                    banner: apache_license,
                    // Removes leading line comments and blank lines. Needed
                    // because stripBanners eats first tab on first code line...
                    process: function removeBanner(src) {
                        // matches lines '' or '//...', and the newline after
                        // them one or more times until it cannot match
                        return src.replace(/((^$|^\/\/.*)\n)*/m, '');
                    }
                }
            }
        },
        jshint: {
            files: ['test/**/*.js', 'barricade.js'],
            options: {
                globals: {
                    'console': false,
                    'window': false,

                    // Jasmine
                    'describe': false,
                    'xdescribe': false,
                    'it': false,
                    'xit': false,
                    'expect': false,
                    'beforeEach': false,
                    'afterEach': false,

                    'GLOBAL_COPY': true,
                    'SAVE_GLOBAL_STATE': false,
                    'ENSURE_GLOBAL_OBJECT_UNPOLLUTED': false,

                    // Barricade
                    'Barricade': true,
                },
                curly: true,
                debug: true,
                eqeqeq: true,
                immed: true,
                indent: true,
                latedef: 'nofunc',
                noempty: true,
                nonbsp: true,
                undef: true,
                unused: false,
                maxlen: 80,
                validthis: true,
                laxbreak: true,
            }
        },
        jasmine: {
            src: [
                'test/global_state_check.js',
                'barricade.js',
            ],
            options: {
                specs: [
                    'test/core_spec.js',
                    'test/primitive_spec.js',
                    'test/array_spec.js',
                    'test/immutable_object_spec.js',
                    'test/mutable_object_spec.js',
                    'test/mixin/observable_spec.js',
                    'test/tag/required_spec.js',
                    'test/tag/constraints_spec.js',
                    'test/tag/enum_spec.js',
                    'test/tag/ref_spec.js',
                ],
                keepRunner: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', [
        'concat:barricade',
        'jshint',
        'jasmine'
    ]);

    grunt.registerTask('unit', ['jasmine']);
};
