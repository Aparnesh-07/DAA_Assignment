const { AVLTree } = require('./avlTree');

/**
 * Generates an isolated benchmark dataset of size N
 * populated identically into AVLTree, Map, and Array.
 * Does NOT modify the active inventory manager.
 */
function createIsolatedDataset(size = 1000) {
  const avlTree = new AVLTree();
  const map = new Map();
  const array = [];

  const categories = ['Audio', 'Camera', 'Lens', 'Accessories', 'Lighting', 'Storage', 'Power', 'Display'];
  const brands = ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Rode', 'DJI', 'SanDisk', 'Godox', 'Panasonic', 'Manfrotto'];
  const models = ['Pro', 'Max', 'Ultra', 'Prime', 'Air', 'Plus', 'Standard', 'Studio'];

  // Generate unique IDs
  const baseId = 1000;
  const ids = [];
  for (let i = 1; i <= size; i++) {
    ids.push(baseId + i);
  }

  // Shuffle IDs to simulate realistic non-sequential insertion into AVL Tree
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  for (let i = 0; i < size; i++) {
    const id = ids[i];
    const item = {
      id,
      name: `${brands[i % brands.length]} ${models[(i * 3) % models.length]} ${categories[i % categories.length]}`,
      category: categories[i % categories.length],
      quantity: (i % 50) + 1,
      price: ((i * 137) % 85000) + 1500,
      weight: (i % 8) + 1
    };

    avlTree.insert(item);
    map.set(id, { ...item });
    array.push({ ...item });
  }

  return { avlTree, map, array, ids };
}

/**
 * Executes a rigorous empirical benchmark comparing AVL Tree, Hash Map, and Linear Search.
 */
function runSearchBenchmark(config = {}) {
  const datasetSize = Math.max(10, Math.min(20000, Number(config.datasetSize) || 1000));
  const repetitions = Math.max(10, Math.min(5000, Number(config.repetitions) || 500));
  const searchType = config.searchType === 'unsuccessful' ? 'unsuccessful' : 'successful';
  const targetPosition = config.targetPosition || 'random';
  const customId = config.customId !== undefined && config.customId !== '' ? Number(config.customId) : null;

  // 1. Create isolated benchmark structures (leaves active inventory untouched)
  const { avlTree, map, array } = createIsolatedDataset(datasetSize);

  // 2. Select target ID
  let targetId;

  if (searchType === 'unsuccessful') {
    // Guaranteed non-existent ID
    targetId = 99999999;
  } else {
    // Successful search
    if (customId !== null && map.has(customId)) {
      targetId = customId;
    } else if (targetPosition === 'first') {
      targetId = array[0].id;
    } else if (targetPosition === 'last') {
      targetId = array[array.length - 1].id;
    } else if (targetPosition === 'middle') {
      targetId = array[Math.floor(array.length / 2)].id;
    } else {
      // 'random'
      targetId = array[Math.floor(Math.random() * array.length)].id;
    }
  }

  // 3. Algorithmic work measurement (exact comparisons & operations)
  const avlWork = avlTree.search(targetId);
  const avlComparisons = avlWork.comparisons;
  const avlFound = avlWork.found;

  const linearIndexFound = array.findIndex(i => i.id === targetId);
  const linearComparisons = linearIndexFound !== -1 ? linearIndexFound + 1 : array.length;
  const linearFound = linearIndexFound !== -1;

  const mapFound = map.has(targetId);
  const mapLookupOperations = 1; // Direct key hash and bucket lookup

  // 4. JIT Warmup (25 iterations)
  for (let w = 0; w < 25; w++) {
    avlTree.findNode(targetId);
    map.get(targetId);
    array.findIndex(i => i.id === targetId);
  }

  // 5. Measure latency across repetitions
  const avlTimesNs = [];
  const mapTimesNs = [];
  const linearTimesNs = [];

  // Batch factor: for tiny operations, running 5 iterations per sample reduces timer quantization
  const batchSize = datasetSize <= 500 ? 5 : 1;

  for (let r = 0; r < repetitions; r++) {
    // AVL Tree Search timing
    const a0 = process.hrtime.bigint();
    for (let b = 0; b < batchSize; b++) {
      avlTree.findNode(targetId);
    }
    const a1 = process.hrtime.bigint();
    avlTimesNs.push(Number(a1 - a0) / batchSize);

    // Hash Map Lookup timing
    const m0 = process.hrtime.bigint();
    for (let b = 0; b < batchSize; b++) {
      map.get(targetId);
    }
    const m1 = process.hrtime.bigint();
    mapTimesNs.push(Number(m1 - m0) / batchSize);

    // Linear Array Search timing
    const l0 = process.hrtime.bigint();
    for (let b = 0; b < batchSize; b++) {
      array.findIndex(i => i.id === targetId);
    }
    const l1 = process.hrtime.bigint();
    linearTimesNs.push(Number(l1 - l0) / batchSize);
  }

  // Helper for computing statistics
  function computeStats(timesNs) {
    timesNs.sort((a, b) => a - b);
    const n = timesNs.length;
    const minNs = timesNs[0];
    const maxNs = timesNs[n - 1];
    const sumNs = timesNs.reduce((acc, t) => acc + t, 0);
    const meanNs = sumNs / n;
    const medianNs = n % 2 === 0 ? (timesNs[n / 2 - 1] + timesNs[n / 2]) / 2 : timesNs[Math.floor(n / 2)];

    return {
      medianUs: Number((medianNs / 1000).toFixed(3)),
      meanUs: Number((meanNs / 1000).toFixed(3)),
      minUs: Number((minNs / 1000).toFixed(3)),
      maxUs: Number((maxNs / 1000).toFixed(3)),
      medianNs: Number(medianNs.toFixed(1)),
      meanNs: Number(meanNs.toFixed(1)),
      minNs: Number(minNs.toFixed(1)),
      maxNs: Number(maxNs.toFixed(1)),
      medianMs: Number((medianNs / 1e6).toFixed(5)),
      meanMs: Number((meanNs / 1e6).toFixed(5))
    };
  }

  const avlStats = computeStats(avlTimesNs);
  const mapStats = computeStats(mapTimesNs);
  const linearStats = computeStats(linearTimesNs);

  // 6. Generate Factual Summary
  const statsList = [
    { name: 'Hash Map', medianUs: mapStats.medianUs },
    { name: 'AVL Tree', medianUs: avlStats.medianUs },
    { name: 'Linear Search', medianUs: linearStats.medianUs }
  ].sort((a, b) => a.medianUs - b.medianUs);

  const fastest = statsList[0];
  const slowest = statsList[2];
  const speedupVsLinear = (linearStats.medianUs / Math.max(0.001, mapStats.medianUs)).toFixed(1);

  const summary = {
    lowestLatencyStructure: fastest.name,
    lowestMedianUs: fastest.medianUs,
    highestLatencyStructure: slowest.name,
    speedupFactorVsLinear: Number(speedupVsLinear),
    avlComparisons,
    linearComparisons,
    comparisonsRatio: Number((linearComparisons / Math.max(1, avlComparisons)).toFixed(1)),
    matchesTheoreticalExpectation: mapStats.medianUs <= linearStats.medianUs && avlComparisons <= linearComparisons
  };

  return {
    environment: 'Backend (Node.js process.hrtime.bigint)',
    timestamp: new Date().toISOString(),
    config: {
      datasetSize,
      repetitions,
      searchType,
      targetPosition,
      targetId,
      targetFound: searchType === 'successful' && avlFound
    },
    results: {
      avl: {
        name: 'AVL Tree',
        complexity: 'O(log n)',
        workMetricName: 'Node Comparisons',
        workValue: avlComparisons,
        pathLength: avlWork.path.length,
        found: avlFound,
        ...avlStats
      },
      hashMap: {
        name: 'Hash Map',
        complexity: 'O(1) average',
        workMetricName: 'Direct Lookup Operations',
        workValue: mapLookupOperations,
        found: mapFound,
        ...mapStats
      },
      linearSearch: {
        name: 'Linear Search',
        complexity: 'O(n)',
        workMetricName: 'Array Element Comparisons',
        workValue: linearComparisons,
        found: linearFound,
        ...linearStats
      }
    },
    summary
  };
}

module.exports = {
  createIsolatedDataset,
  runSearchBenchmark
};
