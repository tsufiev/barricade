# Barricade.js

Barricade.js aims to solve the problem of using JSON data across a web app. All of the logic required to ensure JSON’s integrity is rolled into Barricade instead of sprinkled into all of the UI code. This way, UI components can be confident in the data that they are working with, which makes their code more concise and faster to develop.

Barricade does this by creating data model objects out of JSON using a predefined schema. A simple example:

```javascript
var StringClass = Barricade({'@type': String}); // pass schema in
var instance = StringClass.create('foo');

instance.get(); // 'foo'
instance.set('bar');
instance.set(10); // not allowed, only accepts strings
instance.get(); // 'bar'
```

Barricade removes the disadvantages of working with JSON and introduces some very important advantages:

## Encapsulation
  
JSON values can be set to any type or deleted entirely, which either causes errors when UI components expect these values to exist or be of a certain type, or forces the UI components to constantly check for correctness. Barricade instead wraps around the JSON and provides accessor methods to ensure type-safe data manipulation. Additionally, Barricade objects are observable, so changes made to their data trigger events that can be subscribed to by UI components.

## Normalization

Whenever properties that are defined in the schema are missing in the JSON, Barricade will fill them in with default values. This way, UIs will always have valid values where they expect them, making their design much simpler.

## Metadata

Anything extra attached to JSON must be handled carefully (such as when converting back to the original YAML format). By wrapping the JSON with Barricade, metadata and convenience methods that UI components can use can be defined.

## Validation

The schema allows defining validators that run whenever a new value is attempted to be set on data. Messages about failed validation are available so that the UI can display it.

## References

JSON does not support cyclic or multiple references. Barricade allows placeholder values (such as a string identifier) to be resolved into the values they refer to.
