    barricade.get_type = (function () {
        var to_string = Object.prototype.toString,
            types = {
                'boolean': Boolean,
                'number': Number,
                'string': String,
                '[object Array]': Array,
                '[object Date]': Date,
                '[object Function]': Function,
                '[object RegExp]': RegExp
            };

        return function (val) {
            return types[typeof val] || 
                   types[to_string.call(val)] ||
                   (val ? Object : null);
        };
    }());

    function log_msg(msg) {
        console.log("Barricade: " + msg);
    }

    function log_warning(msg) {
        console.warn("Barricade: " + msg);
    }

    function log_error(msg) {
        console.error("Barricade: " + msg);
    }

    function log_val(val1, val2) {
        if (val2) {
            console.log(val1, val2);
        } else {
            console.log(val1);
        }
    }

    function BarricadeMain(schema) {
        function schema_is_mutable() {
            return schema.hasOwnProperty('?');
        }

        function schema_is_immutable() {
            return Object.keys(schema).some(function (key) {
                return key.charAt(0) !== '@' && key !== '?';
            });
        }

        if (schema['@type'] === Object && schema_is_immutable()) {
            return barricade.immutable_object.extend({_schema: schema});
        } else if (schema['@type'] === Object && schema_is_mutable()) {
            return barricade.mutable_object.extend({_schema: schema});
        } else if (schema['@type'] === Array && schema.hasOwnProperty('*')) {
            return barricade.array.extend({_schema: schema});
        } else {
            return barricade.primitive.extend({_schema: schema});
        }
    }

    barricade.poly = BarricadeMain;

    BarricadeMain.get_type = barricade.get_type; // Very helpful function

    BarricadeMain.base = barricade.base;
    BarricadeMain.container = barricade.container;
    BarricadeMain.array = barricade.array;
    BarricadeMain.object = barricade.object;
    BarricadeMain.immutable_object = barricade.immutable_object;
    BarricadeMain.mutable_object = barricade.mutable_object;
    BarricadeMain.primitive = barricade.primitive;
    BarricadeMain.factory = barricade.factory;
    BarricadeMain.blueprint = blueprint;
    BarricadeMain.event_emitter = event_emitter;
    BarricadeMain.deferrable = barricade.deferrable;
    BarricadeMain.omittable = barricade.omittable;
    BarricadeMain.identifiable = barricade.identifiable;

    return BarricadeMain;
