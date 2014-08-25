    barricade.arraylike = barricade.container.extend({
        create: function (json, parameters) {
            if (!this.hasOwnProperty('_elementClass')) {
                Object.defineProperty(this, '_elementClass', {
                    enumerable: false,
                    writable: true,
                    value: this._getKeyClass(this._elSymbol)
                });
            }

            return barricade.container.create.call(this, json, parameters);
        },
        _elSymbol: '*',
        _sift: function (json, parameters) {
            return json.map(function (el) {
                return this._keyClassCreate(this._elSymbol,
                                              this._elementClass, el);
            }, this);
        }, 
        get: function (index) {
            return this._data[index];
        },
        each: function (functionIn, comparatorIn) {
            var arr = this._data.slice();

            if (comparatorIn) {
                arr.sort(comparatorIn);
            }

            arr.forEach(function (value, index) {
                functionIn(index, value);
            });
        },
        toArray: function () {
            return this._data.slice(); // Shallow copy to prevent mutation
        },
        _doSet: function (index, newVal, newParameters) {
            var oldVal = this._data[index];

            if (this._isCorrectType(newVal, this._elementClass)) {
                this._data[index] = newVal;
            } else {
                this._data[index] = this._keyClassCreate(
                                  this._elSymbol, this._elementClass,
                                  newVal, newParameters);
            }

            this.emit('change', 'set', index, this._data[index], oldVal);
        },
        length: function () {
            return this._data.length;
        },
        isEmpty: function () {
            return this._data.length === 0;
        },
        toJSON: function (ignoreUnused) {
            return this._data.map(function (el) {
                return el.toJSON(ignoreUnused);
            });
        },
        push: function (newValue, newParameters) {
            if (this._isCorrectType(newValue, this._elementClass)) {
                this._data.push(newValue);
            } else {
                this._data.push(this._keyClassCreate(
                              this._elSymbol, this._elementClass,
                              newValue, newParameters));
            }

            this.emit('_addedElement', this._data.length - 1);
            this.emit('change', 'add', this._data.length - 1);
        },
        remove: function (index) {
            this._data[index].emit('removeFrom', this);
            this._data.splice(index, 1);
            this.emit('change', 'remove', index);
        }
    });
