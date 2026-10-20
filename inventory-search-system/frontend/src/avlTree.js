/**
 * AVL Tree Implementation for Browser Client
 * Self-balancing Binary Search Tree keyed by Product ID
 */

export class AVLNode {
  constructor(item) {
    this.id = Number(item.id);
    this.name = item.name;
    this.category = item.category;
    this.quantity = Number(item.quantity);
    this.price = Number(item.price);
    this.weight = item.weight !== undefined && Number(item.weight) > 0 ? Number(item.weight) : 1;

    this.height = 1;
    this.left = null;
    this.right = null;
  }

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

export class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    if (!node) return 0;
    return node.height;
  }

  getBalanceFactor(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    return x;
  }

  rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    return y;
  }

  insert(item) {
    this.root = this._insertNode(this.root, item);
  }

  _insertNode(node, item) {
    const id = Number(item.id);

    if (!node) {
      return new AVLNode(item);
    }

    if (id < node.id) {
      node.left = this._insertNode(node.left, item);
    } else if (id > node.id) {
      node.right = this._insertNode(node.right, item);
    } else {
      throw new Error(`Product with ID ${id} already exists`);
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    const balance = this.getBalanceFactor(node);

    // LL Case
    if (balance > 1 && id < node.left.id) {
      return this.rotateRight(node);
    }

    // RR Case
    if (balance < -1 && id > node.right.id) {
      return this.rotateLeft(node);
    }

    // LR Case
    if (balance > 1 && id > node.left.id) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // RL Case
    if (balance < -1 && id < node.right.id) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  delete(id) {
    id = Number(id);
    let deleted = false;

    const deleteHelper = (node, targetId) => {
      if (!node) return null;

      if (targetId < node.id) {
        node.left = deleteHelper(node.left, targetId);
      } else if (targetId > node.id) {
        node.right = deleteHelper(node.right, targetId);
      } else {
        deleted = true;

        if (!node.left) return node.right;
        if (!node.right) return node.left;

        const minNode = this._getMinValueNode(node.right);
        node.id = minNode.id;
        node.name = minNode.name;
        node.category = minNode.category;
        node.quantity = minNode.quantity;
        node.price = minNode.price;
        node.weight = minNode.weight;

        node.right = deleteHelper(node.right, minNode.id);
      }

      if (!node) return null;

      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
      const balance = this.getBalanceFactor(node);

      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
        return this.rotateRight(node);
      }

      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
        node.left = this.rotateLeft(node.left);
        return this.rotateRight(node);
      }

      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
        return this.rotateLeft(node);
      }

      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
        node.right = this.rotateRight(node.right);
        return this.rotateLeft(node);
      }

      return node;
    };

    this.root = deleteHelper(this.root, id);
    return deleted;
  }

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
      if (node.id > min) {
        traverse(node.left);
      }

      if (node.id >= min && node.id <= max) {
        results.push(node.toItem());
      }

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
