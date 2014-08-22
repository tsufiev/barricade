    var event_emitter = blueprint.create(function () {
        var events = {};

        function has_event(event_name) {
            return events.hasOwnProperty(event_name);
        }

        // Adds listener for event
        this.on = function (event_name, callback) {
            if (!has_event(event_name)) {
                events[event_name] = [];
            }

            events[event_name].push(callback);
        };

        // Removes listener for event
        this.off = function (event_name, callback) {
            var index;

            if (has_event(event_name)) {
                index = events[event_name].indexOf(callback);

                if (index > -1) {
                    events[event_name].splice(index, 1);
                }
            }
        };

        this.emit = function (event_name) {
            var args = arguments; // Must come from correct scope
            if (events.hasOwnProperty(event_name)) {
                events[event_name].forEach(function (callback) {
                    // Call with emitter as context and pass all but event_name
                    callback.apply(this, Array.prototype.slice.call(args, 1));
                }, this);
            }
        };
    });
