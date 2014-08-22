module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            barricade: {
                src: [
                    'src/intro.js',
                    'src/event_emitter.js',
                    'src/deferred.js',
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
                dest: 'barricade.js'
            }
        },
        jshint: {
            files: ['test/*.js', 'barricade.js'],
            options: {
                globals: {
                    'console': false,
                    'window': false,

                    // Jasmine
                    'describe': false,
                    'it': false,
                    'xit': false,
                    'expect': false,
                    'beforeEach': false,
                    'afterEach': false,

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
            }
        },
        jasmine: {
            src: 'barricade.js',
            options: {
                specs: 'test/barricade_Spec.js',
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
