    barricade.immutable_object = barricade.container.extend({
        create: function (json, parameters) {
            var self = this;
            if (!this.hasOwnProperty('_key_classes')) {
                Object.defineProperty(this, '_key_classes', {
                    enumerable: false,
                    writable: true,
                    value: this.get_keys().reduce(function (classes, key) {
                            classes[key] = self._get_key_class(key);
                            return classes;
                        }, {})
                });
            }

            return barricade.container.create.call(this, json, parameters);
        },
        _sift: function (json, parameters) {
            var self = this;
            return this.get_keys().reduce(function (obj_out, key) {
                obj_out[key] = self._key_class_create(
                                   key, self._key_classes[key], json[key]);
                return obj_out;
            }, {});
        },
        get: function (key) {
            return this._data[key];
        },
        _do_set: function (key, new_value, new_parameters) {
            var old_val = this._data[key];

            if (this._schema.hasOwnProperty(key)) {
                if (this._is_correct_type(new_value,
                                          this._key_classes[key])) {
                    this._data[key] = new_value;
                } else {
                    this._data[key] = this._key_class_create(
                                          key, this._key_classes[key],
                                          new_value, new_parameters);
                }

                this.emit('change', 'set', key, this._data[key], old_val);
            } else {
                console.error('object does not have key (key, schema)');
                console.log(key, this._schema);
            }
        },
        each: function (function_in, comparator_in) {
            var self = this,
                keys = this.get_keys();

            if (comparator_in) {
                keys.sort(comparator_in);
            }

            keys.forEach(function (key) {
                function_in(key, self._data[key]);
            });
        },
        is_empty: function () {
            return Object.keys(this._data).length === 0;
        },
        toJSON: function (ignore_unused) {
            var data = this._data;
            return this.get_keys().reduce(function (json_out, key) {
                if (ignore_unused !== true || data[key].is_used()) {
                    json_out[key] = data[key].toJSON(ignore_unused);
                }
                return json_out;
            }, {});
        },
        get_keys: function () {
            return Object.keys(this._schema).filter(function (key) {
                return key.charAt(0) !== '@';
            });
        }
    });
