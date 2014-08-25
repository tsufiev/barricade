    var eventEmitter = blueprint.create(function () {
        var events = {};

        function hasEvent(eventName) {
            return events.hasOwnProperty(eventName);
        }

        // Adds listener for event
        this.on = function (eventName, callback) {
            if (!hasEvent(eventName)) {
                events[eventName] = [];
            }

            events[eventName].push(callback);
        };

        // Removes listener for event
        this.off = function (eventName, callback) {
            var index;

            if (hasEvent(eventName)) {
                index = events[eventName].indexOf(callback);

                if (index > -1) {
                    events[eventName].splice(index, 1);
                }
            }
        };

        this.emit = function (eventName) {
            var args = arguments; // Must come from correct scope
            if (events.hasOwnProperty(eventName)) {
                events[eventName].forEach(function (callback) {
                    // Call with emitter as context and pass all but eventName
                    callback.apply(this, Array.prototype.slice.call(args, 1));
                }, this);
            }
        };
    });
