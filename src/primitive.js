    barricade.primitive = barricade.base.extend({
        _sift: function (json, parameters) {
            return json;
        },
        get: function () {
            return this._data;
        },
        set: function (newVal) {
            var schema = this._schema;

            function typeMatches(newVal) {
                return barricade.getType(newVal) === schema['@type'];
            }

            if (typeMatches(newVal) && this._validate(newVal)) {
                this._data = newVal;
                this.emit('validation', 'succeeded');
                this.emit('change');
            } else if (this.hasError()) {
                this.emit('validation', 'failed');
            } else {
                logError("Setter - new value did not match " +
                          "schema (newVal, schema)");
                logVal(newVal, schema);
            }
        },
        isEmpty: function () {
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
