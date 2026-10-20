/**
 * AVL Tree Implementation for Inventory Search System
 * 
 * An AVL tree is a self-balancing Binary Search Tree (BST) where the difference
 * between heights of left and right subtrees (Balance Factor) cannot be more than 1
 * for any node: Balance Factor = height(left) - height(right) ∈ {-1, 0, 1}.
 * 
 * Time Complexities:
 * - Search:    O(log n) guaranteed
 * - Insertion: O(log n) guaranteed
 * - Deletion:  O(log n) guaranteed
 * Space Complexity: O(n)
 */

class AVLNode {
  constructor(item) {
    this.id = Number(item.id);
    this.name = item.name;
    this.category = item.category;
    this.quantity = Number(item.quantity);
    this.price = Number(item.price);
    this.weight = item.weight !== undefined && Number(item.weight) > 0 ? Number(item.weight) : 1;

    this.height = 1; // Leaf node starts with height 1
    this.left = null;
    this.right = null;
  }

  // Returns plain JavaScript item object
  toItem() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      quantity: this.quantity,
      price: this.price,
      weight: this.weight
    };
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  /**
   * Helper function to get the height of a node.
   * Returns 0 for null nodes.
   */
  getHeight(node) {
    if (!node) return 0;
    return node.height;
  }

  /**
   * Calculates the Balance Factor of a given node:
   * Balance Factor = height(left subtree) - height(right subtree)
   */
  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  /**
   * Right Rotation (Clockwise)
   * Used to balance a Left-Heavy subtree (LL Case)
   * 
   *        y                             x
   *       / \                          /   \
   *      x   T3   rotateRight(y)     T1     y
   *     / \       ------------->           / \
   *    T1  T2                             T2  T3
   */
  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights (order matters: children first, then parent)
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    // Return new root of subtree
    return x;
  }

  /**
   * Left Rotation (Counter-Clockwise)
   * Used to balance a Right-Heavy subtree (RR Case)
   * 
   *      x                                y
   *     / \                             /   \
   *    T1  y      rotateLeft(x)        x     T3
   *       / \     ------------>       / \
   *      T2  T3                      T1  T2
   */
  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights (order matters)
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    // Return new root of subtree
    return y;
  }

  /**
   * Public Insert method
   */
  insert(item) {
    this.root = this._insertNode(this.root, item);
  }

  /**
   * Recursive helper for AVL insertion with automatic rebalancing
   */
  _insertNode(node, item) {
    const id = Number(item.id);

    // 1. Standard BST insertion
    if (!node) {
      return new AVLNode(item);
    }

    if (id < node.id) {
      node.left = this._insertNode(node.left, item);
    } else if (id > node.id) {
      node.right = this._insertNode(node.right, item);
    } else {
      // Duplicate ID not allowed in standard BST / inventory
      throw new Error(`Product with ID ${id} already exists`);
    }

    // 2. Update height of current ancestor node
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    // 3. Get balance factor to check if node became unbalanced
    const balance = this.getBalanceFactor(node);

    // 4. Rebalance if needed (4 possible cases)

    // Left-Left (LL) Case: Right rotation
    if (balance > 1 && id < node.left.id) {
      return this.rotateRight(node);
    }

    // Right-Right (RR) Case: Left rotation
    if (balance < -1 && id > node.right.id) {
      return this.rotateLeft(node);
    }

    // Left-Right (LR) Case: Left rotation on child, then Right rotation on node
    if (balance > 1 && id > node.left.id) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right-Left (RL) Case: Right rotation on child, then Left rotation on node
    if (balance < -1 && id < node.right.id) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    // Node is balanced, return unchanged
    return node;
  }

  /**
   * Public Delete method
   */
  delete(id) {
    id = Number(id);
    let deleted = false;

    const deleteHelper = (node, targetId) => {
      // 1. Standard BST deletion
      if (!node) return null;

      if (targetId < node.id) {
        node.left = deleteHelper(node.left, targetId);
      } else if (targetId > node.id) {
        node.right = deleteHelper(node.right, targetId);
      } else {
        // Node found
        deleted = true;

        // Node with only one child or no child
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Node with two children: Get the inorder successor (smallest in the right subtree)
        const minNode = this._getMinValueNode(node.right);

        // Copy the inorder successor's data to this node
        node.id = minNode.id;
        node.name = minNode.name;
        node.category = minNode.category;
        node.quantity = minNode.quantity;
        node.price = minNode.price;
        node.weight = minNode.weight;

        // Delete the inorder successor
        node.right = deleteHelper(node.right, minNode.id);
      }

      if (!node) return null;

      // 2. Update height
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

      // 3. Balance factor check
      const balance = this.getBalanceFactor(node);

      // 4. Rebalance if needed

      // Left-Left (LL) Case
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        return this.rotateRight(node);
      }

      // Left-Right (LR) Case
      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      // Right-Right (RR) Case
      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        return this.rotateLeft(node);
      }

      // Right-Left (RL) Case
      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = deleteHelper(this.root, id);
    return deleted;
  }

  /**
   * Helper to find minimum value node (used in deletion)
   */
  _getMinValueNode(node) {
    let current = node;
    while (current.left !== null) {
      current = current.left;
    }
    return current;
  }

  /**
   * Pure pointer search (O(log n)) without diagnostic allocations (path/toItem).
   * Used for high-throughput lookups and benchmarking.
   */
  findNode(id) {
    id = Number(id);
    if (isNaN(id)) return null;
    let current = this.root;
    while (current !== null) {
      if (id === current.id) return current;
      if (id < current.id) current = current.left;
      else current = current.right;
    }
    return null;
  }

  /**
   * Efficient Range Search on AVL Tree
   * Finds all items with minId <= id <= maxId.
   * Prunes subtrees outside the interval, achieving O(log n + k) time complexity,
   * where k is the number of reported items.
   */
  rangeSearch(minId, maxId) {
    const min = (minId !== undefined && minId !== null && minId !== '' && !isNaN(minId)) ? Number(minId) : -Infinity;
    const max = (maxId !== undefined && maxId !== null && maxId !== '' && !isNaN(maxId)) ? Number(maxId) : Infinity;

    const results = [];
    let comparisons = 0;

    const traverse = (node) => {
      if (!node) return;

      comparisons++;
      // If current node's ID is greater than min, left subtree may contain matching keys
      if (node.id > min) {
        traverse(node.left);
      }

      // If current node's ID is within [min, max], collect item
      if (node.id >= min && node.id <= max) {
        results.push(node.toItem());
      }

      // If current node's ID is less than max, right subtree may contain matching keys
      if (node.id < max) {
        traverse(node.right);
      }
    };

    traverse(this.root);
    return {
      items: results,
      count: results.length,
      comparisons,
      minId: min === -Infinity ? null : min,
      maxId: max === Infinity ? null : max
    };
  }

  /**
   * Search method:
   * Searches by Product ID, tracks exact comparisons and traversal path.
   * Demonstrates O(log n) search complexity.
   */
  search(id) {
    id = Number(id);
    if (isNaN(id)) {
      return {
        found: false,
        item: null,
        comparisons: 0,
        path: [],
        nodeHeight: null,
        balanceFactor: null
      };
    }
    let current = this.root;
    let comparisons = 0;
    const path = [];

    while (current !== null) {
      comparisons++;
      path.push(current.id);

      if (id === current.id) {
        return {
          found: true,
          item: current.toItem(),
          comparisons,
          path,
          nodeHeight: current.height,
          balanceFactor: this.getBalanceFactor(current)
        };
      }

      if (id < current.id) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return {
      found: false,
      item: null,
      comparisons,
      path,
      nodeHeight: null,
      balanceFactor: null
    };
  }

  /**
   * Update an existing item's fields in the tree
   */
  update(id, updatedData) {
    id = Number(id);
    let current = this.root;

    while (current !== null) {
      if (id === current.id) {
        if (updatedData.name !== undefined) current.name = updatedData.name;
        if (updatedData.category !== undefined) current.category = updatedData.category;
        if (updatedData.quantity !== undefined) current.quantity = Number(updatedData.quantity);
        if (updatedData.price !== undefined) current.price = Number(updatedData.price);
        if (updatedData.weight !== undefined) current.weight = Number(updatedData.weight);
        return current.toItem();
      }

      if (id < current.id) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return null;
  }

  /**
   * In-Order Traversal (Left, Root, Right)
   * Produces sorted list of items by Product ID in O(n) time.
   */
  inOrderTraversal() {
    const items = [];
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      items.push(node.toItem());
      traverse(node.right);
    };
    traverse(this.root);
    return items;
  }

  /**
   * Converts AVL Tree into a structured hierarchical JSON object for visual rendering.
   * Supports an optional maxDepth for large datasets to keep visual DOM rendering responsive.
   */
  toHierarchy(node = this.root, currentDepth = 0, maxDepth = Infinity) {
    if (!node) return null;

    const reachDepthLimit = currentDepth >= maxDepth;

    return {
      id: node.id,
      name: node.name,
      category: node.category,
      quantity: node.quantity,
      price: node.price,
      weight: node.weight,
      height: node.height,
      balanceFactor: this.getBalanceFactor(node),
      hasSubtrees: Boolean(node.left || node.right),
      left: reachDepthLimit ? null : this.toHierarchy(node.left, currentDepth + 1, maxDepth),
      right: reachDepthLimit ? null : this.toHierarchy(node.right, currentDepth + 1, maxDepth)
    };
  }

  /**
   * Generates flat positioned node and link data for whole-dataset canvas/SVG rendering
   */
  getFlatTreeData() {
    const nodes = [];
    const links = [];
    let orderIndex = 0;

    const traverse = (node, depth, parentId = null, branch = '') => {
      if (!node) return null;

      traverse(node.left, depth + 1, node.id, 'L');
      const xIndex = orderIndex++;

      const nodeData = {
        id: node.id,
        name: node.name,
        category: node.category,
        quantity: node.quantity,
        price: node.price,
        weight: node.weight,
        height: node.height,
        balanceFactor: this.getBalanceFactor(node),
        depth,
        xIndex,
        leftId: node.left ? node.left.id : null,
        rightId: node.right ? node.right.id : null
      };
      nodes.push(nodeData);

      if (parentId !== null) {
        links.push({ fromId: parentId, toId: node.id, branch });
      }

      traverse(node.right, depth + 1, node.id, 'R');
      return nodeData;
    };

    traverse(this.root, 0, null, '');
    return { nodes, links, totalNodes: nodes.length, maxDepth: this.getHeight(this.root) };
  }
}

module.exports = {
  AVLNode,
  AVLTree
};
