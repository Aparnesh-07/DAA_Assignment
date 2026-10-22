/**
 * Standard 0/1 Knapsack Problem Solver using Dynamic Programming
 * 
 * Algorithm: Bottom-up 2D Dynamic Programming
 * Time Complexity:  O(n * W)
 * Space Complexity: O(n * W)
 * where n is the number of candidate items and W is the truck capacity.
 */

export function solveKnapsack(items = [], capacity = 15) {
  const startTime = performance.now();
  const W = Math.max(0, Math.floor(Number(capacity) || 0));
  const rawItems = Array.isArray(items) ? items : [];

  const candidateItems = rawItems.map(item => ({
    ...item,
    id: Number(item.id),
    weight: Math.max(1, Math.floor(Number(item.weight) || 1)),
    price: Math.max(0, Number(item.price) || 0)
  }));

  const n = candidateItems.length;

  // dp[i][w] stores maximum value achievable using a subset of the first i items with capacity w
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  if (n > 0 && W > 0) {
    for (let i = 1; i <= n; i++) {
      const it = candidateItems[i - 1];
      const wt = it.weight;
      const val = it.price;

      for (let w = 0; w <= W; w++) {
        if (wt <= w) {
          dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }
  }

  // Backtracking over DP table to find the optimal selected items (In or Out)
  const selectedItems = [];
  const selectedIds = new Set();
  let currentW = W;

  if (n > 0 && W > 0) {
    for (let i = n; i > 0; i--) {
      if (dp[i][currentW] !== dp[i - 1][currentW]) {
        const item = candidateItems[i - 1];
        selectedItems.push(item);
        selectedIds.add(item.id);
        currentW -= item.weight;
      }
    }
    selectedItems.reverse();
  }

  const totalWeight = selectedItems.reduce((sum, it) => sum + it.weight, 0);
  const maxValue = selectedItems.reduce((sum, it) => sum + it.price, 0);
  const timeTakenMs = Number((performance.now() - startTime).toFixed(4));

  return {
    capacity: W,
    totalWeight,
    maxValue,
    selectedItems,
    selectedIds: Array.from(selectedIds),
    candidateItems,
    dpTable: dp,
    dpRowItems: candidateItems,
    timeTakenMs,
    itemCount: n
  };
}
