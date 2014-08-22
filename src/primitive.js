    barricade.primitive = barricade.base.extend({
        _sift: function (json, parameters) {
            return json;
        },
        get: function () {
            return this._data;
        },
        set: function (new_val) {
            var schema = this._schema;

            function type_matches(new_val) {
                return barricade.get_type(new_val) === schema['@type'];
            }

            if (type_matches(new_val)) {
                this._data = new_val;
                this.emit('change');
            } else {
                log_error("Setter - new value did not match " +
                          "schema (new_val, schema)");
                log_val(new_val, schema);
            }
        },
        is_empty: function () {
            if (this._schema['@type'] === Array) {
                return this._data.length === 0;
            } else if (this._schema['@type'] === Object) {
                return Object.keys(this._data).length === 0;
            } else {
                return this._data === this._schema['@type']();
            }
        },
        toJSON: function () {
            return this._data;
        }
    });
