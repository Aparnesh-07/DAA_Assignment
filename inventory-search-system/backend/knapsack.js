/**
 * 0/1 Knapsack Problem Solver with Mandatory and Excluded Cargo Constraints
 * 
 * Algorithm: Bottom-up 2D Dynamic Programming over remaining capacity
 * Time Complexity:  O(n_optional * RemainingCapacity)
 * Space Complexity: O(n_optional * RemainingCapacity)
 */

function solveKnapsack(items = [], capacity = 15, constraints = {}) {
  const startTime = performance.now();
  const W = Math.max(0, Math.floor(Number(capacity) || 0));
  const rawItems = Array.isArray(items) ? items : [];

  // Partition candidate items into Mandatory (M), Optional (O), and Excluded (E)
  const mandatoryItems = [];
  const optionalItems = [];
  const excludedItems = [];

  for (const item of rawItems) {
    const id = item.id;
    // Determine state from constraints map or item property; default is 'optional'
    const state = (constraints[id] || item.requirement || item.constraint || 'optional').toLowerCase();
    const normalizedItem = {
      ...item,
      id: Number(item.id),
      weight: Math.max(1, Math.floor(Number(item.weight) || 1)),
      price: Math.max(0, Number(item.price) || 0)
    };

    if (state === 'mandatory') {
      mandatoryItems.push(normalizedItem);
    } else if (state === 'excluded') {
      excludedItems.push(normalizedItem);
    } else {
      optionalItems.push(normalizedItem);
    }
  }

  const mandatoryWeight = mandatoryItems.reduce((sum, it) => sum + it.weight, 0);
  const mandatoryValue = mandatoryItems.reduce((sum, it) => sum + it.price, 0);

  // Infeasibility check: mandatory items exceed total truck capacity
  if (mandatoryWeight > W) {
    const timeTakenMs = Number((performance.now() - startTime).toFixed(4));
    const decisions = {};

    mandatoryItems.forEach(it => {
      decisions[it.id] = {
        status: 'infeasible_mandatory',
        badge: 'Infeasible',
        reason: `Mandatory item cannot be accommodated; total mandatory weight (${mandatoryWeight} kg) exceeds capacity (${W} kg).`
      };
    });

    optionalItems.forEach(it => {
      decisions[it.id] = {
        status: 'not_evaluated',
        badge: 'Not Evaluated',
        reason: 'Optimization aborted due to infeasible mandatory cargo constraints.'
      };
    });

    excludedItems.forEach(it => {
      decisions[it.id] = {
        status: 'excluded_user',
        badge: 'Excluded',
        reason: 'Excluded by user directive.'
      };
    });

    return {
      capacity: W,
      isFeasible: false,
      infeasibilityReason: `Mandatory cargo weight (${mandatoryWeight} kg) exceeds total truck capacity (${W} kg). Reduce mandatory constraints or increase capacity.`,
      mandatoryWeight,
      mandatoryValue,
      mandatoryItems,
      remainingCapacity: W - mandatoryWeight,
      optionalWeight: 0,
      optionalValue: 0,
      selectedOptionalItems: [],
      totalWeight: mandatoryWeight,
      maxValue: 0,
      selectedItems: [],
      selectedIds: [],
      excludedItems,
      optionalItems,
      dpTable: [[0]],
      dpRowItems: [],
      timeTakenMs,
      itemCount: rawItems.length,
      decisions
    };
  }

  // Feasible problem: optimize Optional items over remaining capacity
  const remainingCapacity = W - mandatoryWeight;
  const nOpt = optionalItems.length;

  // dp[i][w] stores maximum value achievable with first i optional items and capacity w
  const dp = Array.from({ length: nOpt + 1 }, () => new Array(remainingCapacity + 1).fill(0));

  if (nOpt > 0 && remainingCapacity > 0) {
    for (let i = 1; i <= nOpt; i++) {
      const it = optionalItems[i - 1];
      const wt = it.weight;
      const val = it.price;

      for (let w = 0; w <= remainingCapacity; w++) {
        if (wt <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }
  }

  // Backtracking over DP table to find selected optional items
  const selectedOptionalItems = [];
  const selectedOptionalIds = new Set();
  let currentW = remainingCapacity;

  if (nOpt > 0 && remainingCapacity > 0) {
    for (let i = nOpt; i > 0; i--) {
      if (dp[i][currentW] !== dp[i - 1][currentW]) {
        const item = optionalItems[i - 1];
        selectedOptionalItems.push(item);
        selectedOptionalIds.add(item.id);
        currentW -= item.weight;
      }
    }
    selectedOptionalItems.reverse();
  }

  const selectedOptionalWeight = selectedOptionalItems.reduce((sum, it) => sum + it.weight, 0);
  const selectedOptionalValue = selectedOptionalItems.reduce((sum, it) => sum + it.price, 0);

  // Combine Mandatory items and Selected Optional items
  const finalCargo = [...mandatoryItems, ...selectedOptionalItems];
  const finalWeight = mandatoryWeight + selectedOptionalWeight;
  const finalValue = mandatoryValue + selectedOptionalValue;
  const selectedIds = finalCargo.map(it => it.id);

  // Build decision reasons for each candidate
  const decisions = {};

  mandatoryItems.forEach(it => {
    decisions[it.id] = {
      status: 'included_mandatory',
      badge: 'Mandatory',
      reason: 'Included automatically based on mandatory delivery requirement.'
    };
  });

  optionalItems.forEach(it => {
    if (selectedOptionalIds.has(it.id)) {
      decisions[it.id] = {
        status: 'included_optimal',
        badge: 'Optimized',
        reason: 'Selected by 0/1 Knapsack optimizer to maximize cargo value.'
      };
    } else if (it.weight > remainingCapacity) {
      decisions[it.id] = {
        status: 'not_selected_capacity',
        badge: 'Oversized',
        reason: `Item weight (${it.weight} kg) exceeds remaining capacity (${remainingCapacity} kg).`
      };
    } else {
      decisions[it.id] = {
        status: 'not_selected_tradeoff',
        badge: 'Unselected',
        reason: 'Not selected: an alternative combination provided higher commercial value for the available capacity.'
      };
    }
  });

  excludedItems.forEach(it => {
    decisions[it.id] = {
      status: 'excluded_user',
      badge: 'Excluded',
      reason: 'Excluded by user directive.'
    };
  });

  const timeTakenMs = Number((performance.now() - startTime).toFixed(4));

  return {
    capacity: W,
    isFeasible: true,
    infeasibilityReason: null,
    mandatoryWeight,
    mandatoryValue,
    mandatoryItems,
    remainingCapacity,
    optionalWeight: selectedOptionalWeight,
    optionalValue: selectedOptionalValue,
    selectedOptionalItems,
    totalWeight: finalWeight,
    maxValue: finalValue,
    selectedItems: finalCargo,
    selectedIds,
    excludedItems,
    optionalItems,
    dpTable: dp,
    dpRowItems: optionalItems,
    timeTakenMs,
    itemCount: rawItems.length,
    decisions
  };
}

module.exports = { solveKnapsack };
