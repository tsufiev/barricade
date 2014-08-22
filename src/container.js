    barricade.container = barricade.base.extend({
        create: function (json, parameters) {
            var self = barricade.base.create.call(this, json, parameters),
                all_deferred = [];

            function attach_listeners(key) {
                self._attach_listeners(key);
            }

            function get_on_resolve(key) {
                return function (resolved_value) {
                    self.set(key, resolved_value);
                
                    if (resolved_value.has_dependency()) {
                        all_deferred.push(resolved_value.get_deferred());
                    }

                    if ('get_all_deferred' in resolved_value) {
                        all_deferred = all_deferred.concat(
                            resolved_value.get_all_deferred());
                    }
                };
            }

            function attach_deferred_callback(key, value) {
                if (value.has_dependency()) {
                    value.get_deferred().add_callback(get_on_resolve(key));
                }
            }

            function deferred_class_matches(deferred) {
                return self.instanceof(deferred.get_class());
            }

            function add_deferred_to_list(obj) {
                if (obj.has_dependency()) {
                    all_deferred.push(obj.get_deferred());
                }

                if ('get_all_deferred' in obj) {
                    all_deferred = all_deferred.concat(
                                       obj.get_all_deferred());
                }
            }

            function resolve_deferreds() {
                var cur_deferred,
                    unresolved_deferreds = [];

                // New deferreds can be added to all_deferred as others are
                // resolved. Iterating this way is safe regardless of how 
                // new elements are added.
                while (all_deferred.length > 0) {
                    cur_deferred = all_deferred.shift();

                    if (!cur_deferred.is_resolved()) {
                        if (deferred_class_matches(cur_deferred)) {
                            cur_deferred.add_callback(add_deferred_to_list);
                            cur_deferred.resolve(self);
                        } else {
                            unresolved_deferreds.push(cur_deferred);
                        }
                    }
                }

                all_deferred = unresolved_deferreds;
            }

            self.on('_added_element', attach_listeners);
            self.each(attach_listeners);

            self.each(function (key, value) {
                attach_deferred_callback(key, value);
            });

            if (self.has_dependency()) {
                all_deferred.push(self.get_deferred());
            }

            self.each(function (key, value) {
                add_deferred_to_list(value);
            });

            resolve_deferreds.call(self);

            self.get_all_deferred = function () {
                return all_deferred;
            };

            return self;
        },
        _attach_listeners: function (key) {
            var self = this,
                element = this.get(key);

            function on_child_change(child) {
                self.emit('child_change', child);
            }

            function on_direct_child_change() {
                on_child_change(this); // 'this' is set to callee, not typo
            }

            function on_replace(new_value) {
                self.set(key, new_value);
            }

            element.on('child_change', on_child_change);
            element.on('change', on_direct_child_change);
            element.on('replace', on_replace);

            element.on('remove_from', function (container) {
                if (container === self) {
                    element.off('child_change', on_child_change);
                    element.off('change', on_direct_child_change);
                    element.off('replace', on_replace);
                }
            });
        },
        set: function (key, value) {
            this.get(key).emit('remove_from', this);
            this._do_set(key, value);
            this._attach_listeners(key);
        },
        _get_key_class: function (key) {
            if (this._schema[key].hasOwnProperty('@class')) {
                return this._schema[key]['@class'];
            } else {
                return barricade.poly(this._schema[key]);
            }
        },
        _key_class_create: function (key, key_class, json, parameters) {
            if (this._schema[key].hasOwnProperty('@factory')) {
                return this._schema[key]['@factory'](json, parameters);
            } else {
                return key_class.create(json, parameters);
            }
        },
        _is_correct_type: function (instance, class_) {
            var self = this;

            function is_ref_to() {
               if (typeof class_._schema['@ref'].to === 'function') {
                   return self._safe_instanceof(instance,
                                                class_._schema['@ref'].to());
               } else if (typeof class_._schema['@ref'].to === 'object') {
                   return self._safe_instanceof(instance,
                                                class_._schema['@ref'].to);
               } else {
                   throw new Error('Ref.to was ' + class_._schema['@ref'].to);
               }
            }

            if (this._safe_instanceof(instance, class_)) {
                return true;
            } else if (class_._schema.hasOwnProperty('@ref') && is_ref_to()) {
                return true;
            } else if (class_._schema.hasOwnProperty('@accepts') &&
                       this._safe_instanceof(instance,
                                             class_._schema['@accepts'])) {
                return true;
            } else {
                return false;
            }
        }
    });
