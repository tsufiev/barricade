// Barricade.js API
// Author: Drago Rosson
Barricade = (function () {
    "use strict";

    var barricade = {};

    var blueprint = {
            create: function (f) {
                var g = function () {
                        if (this.hasOwnProperty('_parents')) {
                            this._parents.push(g);
                        } else {
                            Object.defineProperty(this, '_parents', {
                                value: [g]
                            });
                        }

                        f.apply(this, arguments);
                    };

                return g;
            }
    };

    barricade.identifiable = blueprint.create(function (id) {
        this.get_id = function () {
            return id;
        };

        this.set_id = function (new_id) {
            id = new_id;
            this.emit('change', 'id');
        };
    });

    barricade.omittable = blueprint.create(function (is_used) {
        this.is_used = function () {
            // If required, it has to be used.
            return this.is_required() || is_used;
        };

        this.set_is_used = function (new_used_value) {
            is_used = !!new_used_value;
        };

        this.on('change', function () {
            is_used = !this.is_empty();
        });
    });

    barricade.deferrable = blueprint.create(function (schema) {
        var that = this,
            deferred;

        function resolver(needed_value) {
            var ref = schema['@ref'].resolver(that, needed_value);
            if (ref === undefined) {
                log_error('Could not resolve "' + 
                          JSON.stringify(that.toJSON()) + '"');
            }
            return ref;
        }

        function has_dependency() {
            return schema.hasOwnProperty('@ref');
        }

        this.has_dependency = has_dependency;

        if (has_dependency()) {
            this.get_deferred = function () {
                return deferred;
            };

            deferred = barricade.deferred.create(schema['@ref'].needs,
                                                 resolver);
        }
    });
