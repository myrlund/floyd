Floyd.js
========

Floyd.js is an extremely simple, yet versatile cycle-detection library in JS. It (surprisingly) implements a version of [Floyd's algorithm](http://dl.acm.org/citation.cfm?doid=321420.321422).

Installation
------------

Not yet in NPM, so for now, grab it directly from Github by cloning or:

```bash
npm install myrlund/floyd
```

Usage
-----

Floyd.js is usually called through its `detectCycles` function.

### `detectCycles(path, [options])`

This function takes a path and an optional options object.

A _path_ is an array comprised of nodes. Each node exposes a set of outgoing edges, referencing the indices of other nodes in the path.

A _node_ can either be an array of indices directly, or be an object exposing them through a property.

### Examples

A simple number path:

```javascript
// (0) -> (1) -> (2) -> (3) -> (0)
var numberPath = [1, 2, 3, 0];

floyd.detectCycles(numberPath);
// => [ { firstIndex: 0, stepsFromStart: 0, length: 5 } ]
```

Each node being an array of out-edges:

```javascript
var arrayPath = [
    [1, 3],
    [2],
    [3],
    [1],
];

floyd.detectCycles(arrayPath);
// => [ { firstIndex: 3, stepsFromStart: 1, length: 3 } ]
```

Each node being an object with out-edges exposed in a property:

```javascript
var disconnectedPath = [
    {'out': [1]},
    {},
    {'out': [3]},
    {'out': [2]},
];

floyd.detectCycles(disconnectedPath);
// => [ { firstIndex: 2, stepsFromStart: 2, length: 2 } ]
```

Each node being an object comprised of both in-edges and out-edges, and non-default property names:

```javascript
var complexPath = [
    {},
    {'incoming': [3], 'outgoing': [2, 3]},
    {'incoming': [3]},
    {'incoming': [0], 'outgoing': [3]},
    {'incoming': [1], 'outgoing': [1]},
];

floyd.detectCycles(complexPath, {
    outNodePropertyName: 'outgoing',
    inNodePropertyName: 'incoming',
    normalizePath: true
});
// => [ { firstIndex: 3, stepsFromStart: 2, length: 1 } ]
```

Options
-------

The following default options apply:

```javascript
{
    outNodePropertyName: 'out',
    inNodePropertyName: 'in',
    normalizePath: false
}
```
