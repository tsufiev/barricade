    barricade.mutable_object = barricade.arraylike.extend({
        _el_symbol: '?',
        _sift: function (json, parameters) {
            return Object.keys(json).map(function (key) {
                return this._key_class_create(
                                   this._el_symbol, this._element_class,
                                   json[key], {id: key});
            }, this);
        },
        get_ids: function () {
            return this.to_array().map(function (value) {
                return value.get_id();
            });
        },
        get_by_id: function (id) {
            var pos = this.to_array().map(function (value) {
                    return value.get_id();
                }).indexOf(id);
            return this.get(pos);
        },
        contains: function (element) {
            return this.to_array().some(function (value) {
                return element === value;
            });
        },
        toJSON: function (ignore_unused) {
            return this.to_array().reduce(function (json_out, element) {
                if (json_out.hasOwnProperty(element.get_id())) {
                    log_error("ID encountered multiple times: " +
                                  element.get_id());
                } else {
                    json_out[element.get_id()] = 
                        element.toJSON(ignore_unused);
                }
                return json_out;
            }, {});
        },
        push: function (new_json, new_parameters) {
            if (barricade.get_type(new_parameters) !== Object ||
                    !new_parameters.hasOwnProperty('id')) {
                log_error('ID should be passed in ' + 
                          'with parameters object');
            } else {
                barricade.array.push.call(this, new_json, new_parameters);
            }
        },
    });
