var floyd = require('./floyd');

var numberPath = [1, 2, 3, 4, 0];

var simplePath = [
    [1, 3],
    [2],
    [3],
    [1],
];

// Sample with plenty of cycles.
var complexPath = [
    {},
    {'in': [3], 'out': [2, 3]},
    {'in': [3]},
    {'in': [0], 'out': [3]},
    {'in': [1], 'out': [1]},
];

// Disconnected paths.
var disconnectedPath = [
    {'out': [1]},
    {},
    {'out': [3]},
    {'out': [2]},
];

var objectGraph = {
    object1: ['object2'],
    object2: ['object3'],
    object3: ['object1'],
};

function runCycleTest(path, normalizePath) {
    console.log("Looking for cycles in:");
    console.log(path);
    console.log("---");
    var cycles = floyd.detectCycles(path, { normalizePath: !!normalizePath });
    console.log("Found %d cycles:", cycles.length);
    console.log(cycles);
    console.log("\n");
}

runCycleTest(numberPath);
runCycleTest(simplePath);
runCycleTest(complexPath, true);
runCycleTest(disconnectedPath);
runCycleTest(objectGraph);
