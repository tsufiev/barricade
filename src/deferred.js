    barricade.deferred = {
        create: function (class_getter, on_resolve) {
            var self = Object.create(this),
                callbacks = [],
                is_resolved = false;

            self.get_class = function () {
                return class_getter();
            };

            self.resolve = function (obj) {
                var ref;

                if (!is_resolved) {
                    ref = on_resolve(obj);

                    is_resolved = true;

                    if (ref === undefined) {
                        log_error('Could not resolve reference');
                    } else {
                        callbacks.forEach(function (callback) {
                            callback(ref);
                        });
                    }

                    return ref;
                } else {
                    throw new Error('Deferred already resolved');
                }
            };

            self.is_resolved = function () {
                return is_resolved;
            };

            self.add_callback = function (callback) {
                callbacks.push(callback);
            };
            
            return self;
        }
    };
