    barricade.deferred = {
        create: function (classGetter, onResolve) {
            var self = Object.create(this),
                callbacks = [],
                isResolved = false;

            self.getClass = function () {
                return classGetter();
            };

            self.resolve = function (obj) {
                var ref;

                if (isResolved) {
                    throw new Error('Deferred already resolved');
                }

                ref = onResolve(obj);
                isResolved = true;

                if (ref === undefined) {
                    logError('Could not resolve reference');
                } else {
                    callbacks.forEach(function (callback) {
                        callback(ref);
                    });
                }

                return ref;
            };

            self.isResolved = function () {
                return isResolved;
            };

            self.addCallback = function (callback) {
                callbacks.push(callback);
            };
            
            return self;
        }
    };
