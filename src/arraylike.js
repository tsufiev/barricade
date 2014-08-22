    barricade.arraylike = barricade.container.extend({
        create: function (json, parameters) {
            if (!this.hasOwnProperty('_element_class')) {
                Object.defineProperty(this, '_element_class', {
                    enumerable: false,
                    writable: true,
                    value: this._get_key_class(this._el_symbol)
                });
            }

            return barricade.container.create.call(this, json, parameters);
        },
        _el_symbol: '*',
        _sift: function (json, parameters) {
            return json.map(function (el) {
                return this._key_class_create(this._el_symbol,
                                              this._element_class, el);
            }, this);
        }, 
        get: function (index) {
            return this._data[index];
        },
        each: function (function_in, comparator_in) {
            var arr = this._data.slice();

            if (comparator_in) {
                arr.sort(comparator_in);
            }

            arr.forEach(function (value, index) {
                function_in(index, value);
            });
        },
        to_array: function () {
            return this._data.slice(); // Shallow copy to prevent mutation
        },
        _do_set: function (index, new_val, new_parameters) {
            var old_val = this._data[index];

            if (this._is_correct_type(new_val, this._element_class)) {
                this._data[index] = new_val;
            } else {
                this._data[index] = this._key_class_create(
                                  this._el_symbol, this._element_class,
                                  new_val, new_parameters);
            }

            this.emit('change', 'set', index, this._data[index], old_val);
        },
        length: function () {
            return this._data.length;
        },
        is_empty: function () {
            return this._data.length === 0;
        },
        toJSON: function (ignore_unused) {
            return this._data.map(function (el) {
                return el.toJSON(ignore_unused);
            });
        },
        push: function (new_value, new_parameters) {
            if (this._is_correct_type(new_value, this._element_class)) {
                this._data.push(new_value);
            } else {
                this._data.push(this._key_class_create(
                              this._el_symbol, this._element_class,
                              new_value, new_parameters));
            }

            this.emit('_added_element', this._data.length - 1);
            this.emit('change', 'add', this._data.length - 1);
        },
        remove: function (index) {
            this._data[index].emit('remove_from', this);
            this._data.splice(index, 1);
            this.emit('change', 'remove', index);
        }
    });
