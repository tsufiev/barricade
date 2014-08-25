    barricade.mutableObject = barricade.arraylike.extend({
        _elSymbol: '?',
        _sift: function (json, parameters) {
            return Object.keys(json).map(function (key) {
                return this._keyClassCreate(
                                   this._elSymbol, this._elementClass,
                                   json[key], {id: key});
            }, this);
        },
        getIDs: function () {
            return this.toArray().map(function (value) {
                return value.getID();
            });
        },
        getByID: function (id) {
            var pos = this.toArray().map(function (value) {
                    return value.getID();
                }).indexOf(id);
            return this.get(pos);
        },
        contains: function (element) {
            return this.toArray().some(function (value) {
                return element === value;
            });
        },
        toJSON: function (ignoreUnused) {
            return this.toArray().reduce(function (jsonOut, element) {
                if (jsonOut.hasOwnProperty(element.getID())) {
                    logError("ID encountered multiple times: " +
                                  element.getID());
                } else {
                    jsonOut[element.getID()] = 
                        element.toJSON(ignoreUnused);
                }
                return jsonOut;
            }, {});
        },
        push: function (newJson, newParameters) {
            if (barricade.getType(newParameters) !== Object ||
                    !newParameters.hasOwnProperty('id')) {
                logError('ID should be passed in ' + 
                          'with parameters object');
            } else {
                barricade.array.push.call(this, newJson, newParameters);
            }
        },
    });
