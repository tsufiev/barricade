    barricade.container = barricade.base.extend({
        create: function (json, parameters) {
            var self = barricade.base.create.call(this, json, parameters),
                allDeferred = [];

            function attachListeners(key) {
                self._attachListeners(key);
            }

            function getOnResolve(key) {
                return function (resolvedValue) {
                    self.set(key, resolvedValue);
                
                    if (resolvedValue.hasDependency()) {
                        allDeferred.push(resolvedValue.getDeferred());
                    }

                    if ('getAllDeferred' in resolvedValue) {
                        allDeferred = allDeferred.concat(
                            resolvedValue.getAllDeferred());
                    }
                };
            }

            function attachDeferredCallback(key, value) {
                if (value.hasDependency()) {
                    value.getDeferred().addCallback(getOnResolve(key));
                }
            }

            function deferredClassMatches(deferred) {
                return self.instanceof(deferred.getClass());
            }

            function addDeferredToList(obj) {
                if (obj.hasDependency()) {
                    allDeferred.push(obj.getDeferred());
                }

                if ('getAllDeferred' in obj) {
                    allDeferred = allDeferred.concat(
                                       obj.getAllDeferred());
                }
            }

            function resolveDeferreds() {
                var curDeferred,
                    unresolvedDeferreds = [];

                // New deferreds can be added to allDeferred as others are
                // resolved. Iterating this way is safe regardless of how 
                // new elements are added.
                while (allDeferred.length > 0) {
                    curDeferred = allDeferred.shift();

                    if (!curDeferred.isResolved()) {
                        if (deferredClassMatches(curDeferred)) {
                            curDeferred.addCallback(addDeferredToList);
                            curDeferred.resolve(self);
                        } else {
                            unresolvedDeferreds.push(curDeferred);
                        }
                    }
                }

                allDeferred = unresolvedDeferreds;
            }

            self.on('_addedElement', attachListeners);
            self.each(attachListeners);

            self.each(function (key, value) {
                attachDeferredCallback(key, value);
            });

            if (self.hasDependency()) {
                allDeferred.push(self.getDeferred());
            }

            self.each(function (key, value) {
                addDeferredToList(value);
            });

            resolveDeferreds.call(self);

            self.getAllDeferred = function () {
                return allDeferred;
            };

            return self;
        },
        _attachListeners: function (key) {
            var self = this,
                element = this.get(key);

            function onChildChange(child) {
                self.emit('childChange', child);
            }

            function onDirectChildChange() {
                onChildChange(this); // 'this' is set to callee, not typo
            }

            function onReplace(newValue) {
                self.set(key, newValue);
            }

            element.on('childChange', onChildChange);
            element.on('change', onDirectChildChange);
            element.on('replace', onReplace);

            element.on('removeFrom', function (container) {
                if (container === self) {
                    element.off('childChange', onChildChange);
                    element.off('change', onDirectChildChange);
                    element.off('replace', onReplace);
                }
            });
        },
        set: function (key, value) {
            this.get(key).emit('removeFrom', this);
            this._doSet(key, value);
            this._attachListeners(key);
        },
        _getKeyClass: function (key) {
            return this._schema[key].hasOwnProperty('@class')
                ? this._schema[key]['@class']
                : barricade.poly(this._schema[key]);
        },
        _keyClassCreate: function (key, keyClass, json, parameters) {
            return this._schema[key].hasOwnProperty('@factory')
                ? this._schema[key]['@factory'](json, parameters)
                : keyClass.create(json, parameters);
        },
        _isCorrectType: function (instance, class_) {
            var self = this;

            function isRefTo() {
                if (typeof class_._schema['@ref'].to === 'function') {
                    return self._safeInstanceof(instance,
                                                 class_._schema['@ref'].to());
                } else if (typeof class_._schema['@ref'].to === 'object') {
                    return self._safeInstanceof(instance,
                                                 class_._schema['@ref'].to);
                }
                throw new Error('Ref.to was ' + class_._schema['@ref'].to);
            }

            return this._safeInstanceof(instance, class_) ||
                (class_._schema.hasOwnProperty('@ref') && isRefTo());
        }
    });
