/**
 * @module floyd
 */

var _ = require('underscore');

var defaultOptions = {
    outEdgePropertyName: 'out',
    inEdgePropertyName: 'in',
    normalizePath: false,
};

var exports = {
    floyd: floyd,
    detectCycles: detectCycles,
    normalizePath: normalizePath,
    _defaultOptions: _.clone(defaultOptions),
    version: require('./package.json').version
};

/**
 * The Floyd algorithm.
 * @param {Path} path - A vector of nodes.
 * @param {Number} start - The starting node.
 * @param {Options} options
 * @returns {Cycle} An object describing a detected cycle.
 */
function floyd(path, start, _options) {
    var options = _.defaults(_options || {}, defaultOptions);

    if (options.normalizePath) {
        path = normalizePath(path, options);
    }

    var nextAll = nextFn(path, options.outEdgePropertyName, options.excludeIndices);

    var start = start === undefined ? 0 : start;

    // First step
    var tortoises = nextAll([start]);
    var hares = nextAll(nextAll([start]));

    // Ensure both pointers are inside cycle, by stepping
    // the hares twice as fast through it.
    while (_.intersection(tortoises, hares).length === 0) {
        // If the trailing pointer has no out nodes, we've
        // gotten through the entire graph.
        if (tortoises.length === 0) {
            return null;
        }

        tortoises = nextAll(tortoises);
        hares = nextAll(nextAll(hares));
    }

    // Knowing the leading pointer is somewhere in the cycle
    // we return the trailing pointer to start, and move both
    // pointers forward until they meet. Due to the initial
    // case of the leading pointer having twice the velocity
    // of the trailing one, they will meet again at the cycle's
    // starting point.
    var mu = start;
    var tortoises = [start];
    while (_.intersection(tortoises, hares).length === 0) {
        tortoises = nextAll(tortoises);
        hares = nextAll(hares);
        mu += 1;
    }

    // Walk along out edges from the pointer known to be
    // inside the cycle, counting the steps until the leading
    // pointer has gone all the way around.
    var lambda = 1;
    var tortoises = _.intersection(tortoises, hares);
    var hares = nextAll(tortoises);
    while (_.intersection(tortoises, hares).length === 0) {
        hares = nextAll(hares);
        lambda += 1;
    }

    return {
        firstIndex: tortoises[0],
        stepsFromStart: mu,
        length: lambda
    };
}

/**
 * Runs the floyd algorithm with each node in the array
 * as the starting point, to ensure all potentially
 * disconnected paths are checked.
 *
 * @param {Path} path - An array of nodes. Each node should have an 'out' property with an array.
 * @param {Options} options
 * @returns {Cycle[]} - A set of detected cycles.
 */
function detectCycles(path, options) {
    var startRange = _.range(path.length);

    // Collect each cycle's starting point indices for
    // optimization and cycle collection purposes.
    var cycleStartingPoints = [];

    var cycles = startRange.map(function (start) {
        // Exclude nodes that we know are a part of known cycles.
        var _options = _.defaults(options, {
            excludeIndices: cycleStartingPoints
        });
        var cycle = floyd(path, start, _options);

        if (cycle) {
            cycleStartingPoints.push(cycle.firstIndex);
        }
        return cycle;
    });

    return _.compact(cycles);
}

/**
 * Turn in-edges into out-edges.
 *
 * @param path {Path} - An un-normalized path, potentially containing in-edge properties.
 * @param options {Options}
 * @returns {Path} - A normalized path, with only out-edges.
 */
function normalizePath(path, _options) {
    var options = _.defaults(_options || {}, defaultOptions);

    var normalizedPath = _.clone(path);

    // Cycle through the nodes in the path to find
    // in-node references.
    path.forEach(function (node, nodeIndex) {
        var inNodes = node[options.inEdgePropertyName] || [];

        // Cycle through the nodes to discover out-nodes to add.
        inNodes.forEach(function (inNodeIndex) {
            var inNode = normalizedPath[inNodeIndex];

            // The new set of out nodes is the union between the
            // previous set and the currently processed node index.
            inNode.out = _.union(inNode[options.outEdgePropertyName], [nodeIndex]);
        });

        // Clean up the in nodes.
        delete normalizedPath[nodeIndex][options.inEdgePropertyName];
    });

    return normalizedPath;
}

/**
 * Returns a set of next nodes, gathered from
 * the out params of the given indices. If no
 * out param is supplied, we assume the node itself
 * is an array of out-node indices.
 *
 * @private
 * @param path {Array} - The path from which to return out-nodes.
 * @param outEdgePropertyName {String|null} -
 */
function nextFn(path, outEdgePropertyName, excludedIndices) {
    var outNodeIndicesForNodeIndex = function (index) {
        var node = path[index];
        if (_.isNumber(node)) {
            return [node];
        }
        if (_.isArray(node)) {
            return node;
        }
        return (node && node[outEdgePropertyName]) || [];
    }

    return function (indices) {
        return _.chain(indices.map(outNodeIndicesForNodeIndex))

            // Flatten the initially nested array.
            .flatten()

            // Include each next-node only once.
            .uniq()

            // Exclude indices we want to exclude.
            .difference(excludedIndices)

            // Unpack the chained value.
            .value();
    }
}

/**
 * @typedef Node
 * @type object
 * @property {array} out - Defines out-edges to these path indices.
 * @property {array} in - Defines in-edges from these path indices. Requires normalization.
 */

/**
 * @typedef Path
 * @type Node[]
 */

/**
 * @typedef Cycle
 * @type object
 * @property {number} firstIndex
 * @property {number} stepsFromStart
 * @property {number} length
 */

 /**
  * @typedef Options
  * @type object
  * @property {string} [outEdgePropertyName='out']
  * @property {string} [inEdgePropertyName='in']
  * @property {boolean} [normalizePath=false]
  */

module.exports = exports;
