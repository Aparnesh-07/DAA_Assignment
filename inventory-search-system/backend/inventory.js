const { AVLTree } = require('./avlTree');

class InventoryManager {
  constructor() {
    this.avlTree = new AVLTree();
    this.inventoryMap = new Map();
    this.itemsArray = [];
    this.seedInitialData();
  }

  /**
   * Seed 10 realistic sample inventory items
   */
  seedInitialData() {
    const sampleItems = [
      { id: 104, name: 'Microphone', category: 'Audio', quantity: 12, price: 8500, weight: 1 },
      { id: 102, name: 'Canon Lens', category: 'Lens', quantity: 8, price: 45000, weight: 2 },
      { id: 101, name: 'Sony Camera', category: 'Camera', quantity: 5, price: 150000, weight: 2 },
      { id: 103, name: 'Tripod', category: 'Accessories', quantity: 15, price: 3500, weight: 3 },
      { id: 107, name: 'Gimbal', category: 'Stabilizers', quantity: 6, price: 28000, weight: 2 },
      { id: 105, name: 'LED Light', category: 'Lighting', quantity: 20, price: 4200, weight: 3 },
      { id: 106, name: 'Memory Card', category: 'Storage', quantity: 35, price: 2200, weight: 1 },
      { id: 108, name: 'Camera Battery', category: 'Power', quantity: 25, price: 3000, weight: 1 },
      { id: 109, name: 'Monitor', category: 'Display', quantity: 4, price: 32000, weight: 6 },
      { id: 110, name: 'Camera Bag', category: 'Accessories', quantity: 18, price: 4500, weight: 2 }
    ];

    this.avlTree = new AVLTree();
    this.inventoryMap.clear();
    this.itemsArray = [];

    sampleItems.forEach(item => {
      this.avlTree.insert(item);
      this.inventoryMap.set(item.id, { ...item });
      this.itemsArray.push({ ...item });
    });
  }

  /**
   * Get all items ordered by Product ID via AVL In-Order Traversal
   */
  getAll() {
    return this.avlTree.inOrderTraversal();
  }

  /**
   * Search items within a Product ID range using AVL Tree's O(log n + k) range search
   */
  rangeSearch(minId, maxId) {
    return this.avlTree.rangeSearch(minId, maxId);
  }

  search(id) {
    const numId = Number(id);

    let avlTimeNs = 0;
    let mapTimeNs = 0;
    let linTimeNs = 0;

    let avlResult;
    let mapFound = false;
    let mapItem = null;
    let linearIdx = -1;
    const totalCount = this.itemsArray.length;

    if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
      // 1. AVL Tree Search (tracks path, comparisons, and balance factor)
      const a0 = process.hrtime.bigint();
      avlResult = this.avlTree.search(numId);
      const a1 = process.hrtime.bigint();
      avlTimeNs = Number(a1 - a0);

      // 2. Hash Map Direct Lookup
      const m0 = process.hrtime.bigint();
      mapFound = this.inventoryMap.has(numId);
      mapItem = mapFound ? this.inventoryMap.get(numId) : null;
      const m1 = process.hrtime.bigint();
      mapTimeNs = Number(m1 - m0);

      // 3. Pure linear search on maintained array
      const l0 = process.hrtime.bigint();
      linearIdx = this.itemsArray.findIndex(i => i.id === numId);
      const l1 = process.hrtime.bigint();
      linTimeNs = Number(l1 - l0);
    } else {
      const a0 = performance.now();
      avlResult = this.avlTree.search(numId);
      avlTimeNs = (performance.now() - a0) * 1e6;

      const m0 = performance.now();
      mapFound = this.inventoryMap.has(numId);
      mapItem = mapFound ? this.inventoryMap.get(numId) : null;
      mapTimeNs = (performance.now() - m0) * 1e6;

      const l0 = performance.now();
      linearIdx = this.itemsArray.findIndex(i => i.id === numId);
      linTimeNs = (performance.now() - l0) * 1e6;
    }

    const linearComparisons = linearIdx !== -1 ? linearIdx + 1 : totalCount;

    const avlTimeUs = Number((avlTimeNs / 1000).toFixed(2));
    const avlTimeMs = Number((avlTimeNs / 1e6).toFixed(4));

    const mapTimeUs = Number((mapTimeNs / 1000).toFixed(2));
    const mapTimeMs = Number((mapTimeNs / 1e6).toFixed(4));

    const linTimeUs = Number((linTimeNs / 1000).toFixed(2));
    const linTimeMs = Number((linTimeNs / 1e6).toFixed(4));

    return {
      id: numId,
      found: avlResult.found,
      item: avlResult.item,
      totalItemsInSystem: totalCount,
      avl: {
        comparisons: avlResult.comparisons,
        path: avlResult.path,
        nodeHeight: avlResult.nodeHeight,
        balanceFactor: avlResult.balanceFactor,
        timeComplexity: 'O(log n)',
        timeTakenMs: avlTimeMs,
        timeTakenUs: avlTimeUs,
        timeTakenNs: avlTimeNs
      },
      linearSearch: {
        comparisons: linearComparisons,
        timeComplexity: 'O(n)',
        timeTakenMs: linTimeMs,
        timeTakenUs: linTimeUs,
        timeTakenNs: linTimeNs
      },
      hashMap: {
        found: mapFound,
        item: mapItem,
        lookupOperations: 1,
        timeComplexity: 'O(1) average',
        timeTakenMs: mapTimeMs,
        timeTakenUs: mapTimeUs,
        timeTakenNs: mapTimeNs
      }
    };
  }

  /**
   * Insert a new inventory item with real execution timers
   */
  insert(itemData) {
    const id = Number(itemData.id);
    const quantity = Number(itemData.quantity);
    const price = Number(itemData.price);

    // Validation
    if (isNaN(id) || id <= 0) {
      throw new Error('Product ID must be a positive number');
    }
    if (!itemData.name || itemData.name.trim() === '') {
      throw new Error('Product Name cannot be empty');
    }
    if (isNaN(quantity) || quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (isNaN(price) || price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (this.inventoryMap.has(id)) {
      throw new Error(`Product ID ${id} already exists`);
    }

    const weight = itemData.weight !== undefined && Number(itemData.weight) > 0 ? Number(itemData.weight) : Math.max(1, (id % 5) + 1);

    const newItem = {
      id,
      name: itemData.name.trim(),
      category: (itemData.category || 'General').trim(),
      quantity,
      price,
      weight
    };

    let avlTimeNs = 0;
    let mapTimeNs = 0;

    if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
      const a0 = process.hrtime.bigint();
      this.avlTree.insert(newItem);
      const a1 = process.hrtime.bigint();
      avlTimeNs = Number(a1 - a0);

      const m0 = process.hrtime.bigint();
      this.inventoryMap.set(id, { ...newItem });
      const m1 = process.hrtime.bigint();
      mapTimeNs = Number(m1 - m0);
    } else {
      const a0 = performance.now();
      this.avlTree.insert(newItem);
      avlTimeNs = (performance.now() - a0) * 1e6;

      const m0 = performance.now();
      this.inventoryMap.set(id, { ...newItem });
      mapTimeNs = (performance.now() - m0) * 1e6;
    }

    this.itemsArray.push({ ...newItem });

    const avlTimeUs = Number((avlTimeNs / 1000).toFixed(2));
    const mapTimeUs = Number((mapTimeNs / 1000).toFixed(2));
    const avlTimeMs = Number((avlTimeNs / 1e6).toFixed(4));
    const mapTimeMs = Number((mapTimeNs / 1e6).toFixed(4));

    return {
      ...newItem,
      timing: {
        avlTimeMs,
        mapTimeMs,
        avlTimeUs,
        mapTimeUs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4)),
        totalTimeUs: Number((avlTimeUs + mapTimeUs).toFixed(2))
      }
    };
  }

  /**
   * Update an existing inventory item with execution timers
   */
  update(id, updateData) {
    const numId = Number(id);

    if (!this.inventoryMap.has(numId)) {
      throw new Error(`Item with ID ${numId} not found`);
    }

    const currentItem = this.inventoryMap.get(numId);
    const quantity = updateData.quantity !== undefined ? Number(updateData.quantity) : currentItem.quantity;
    const price = updateData.price !== undefined ? Number(updateData.price) : currentItem.price;

    if (isNaN(quantity) || quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    if (isNaN(price) || price < 0) {
      throw new Error('Price cannot be negative');
    }

    const weight = updateData.weight !== undefined && Number(updateData.weight) > 0 ? Number(updateData.weight) : (currentItem.weight || 2);

    const updatedItem = {
      id: numId,
      name: updateData.name ? updateData.name.trim() : currentItem.name,
      category: updateData.category ? updateData.category.trim() : currentItem.category,
      quantity,
      price,
      weight
    };

    let avlTimeNs = 0;
    let mapTimeNs = 0;

    if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
      const a0 = process.hrtime.bigint();
      this.avlTree.update(numId, updatedItem);
      const a1 = process.hrtime.bigint();
      avlTimeNs = Number(a1 - a0);

      const m0 = process.hrtime.bigint();
      this.inventoryMap.set(numId, updatedItem);
      const m1 = process.hrtime.bigint();
      mapTimeNs = Number(m1 - m0);
    } else {
      const a0 = performance.now();
      this.avlTree.update(numId, updatedItem);
      avlTimeNs = (performance.now() - a0) * 1e6;

      const m0 = performance.now();
      this.inventoryMap.set(numId, updatedItem);
      mapTimeNs = (performance.now() - m0) * 1e6;
    }

    const idx = this.itemsArray.findIndex(i => i.id === numId);
    if (idx !== -1) {
      this.itemsArray[idx] = { ...updatedItem };
    }

    const avlTimeUs = Number((avlTimeNs / 1000).toFixed(2));
    const mapTimeUs = Number((mapTimeNs / 1000).toFixed(2));
    const avlTimeMs = Number((avlTimeNs / 1e6).toFixed(4));
    const mapTimeMs = Number((mapTimeNs / 1e6).toFixed(4));

    return {
      ...updatedItem,
      timing: {
        avlTimeMs,
        mapTimeMs,
        avlTimeUs,
        mapTimeUs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4)),
        totalTimeUs: Number((avlTimeUs + mapTimeUs).toFixed(2))
      }
    };
  }

  /**
   * Delete an item by ID with execution timers
   */
  delete(id) {
    const numId = Number(id);

    if (!this.inventoryMap.has(numId)) {
      throw new Error(`Item with ID ${numId} not found`);
    }

    const itemToDelete = this.inventoryMap.get(numId);

    let avlTimeNs = 0;
    let mapTimeNs = 0;

    if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
      const a0 = process.hrtime.bigint();
      this.avlTree.delete(numId);
      const a1 = process.hrtime.bigint();
      avlTimeNs = Number(a1 - a0);

      const m0 = process.hrtime.bigint();
      this.inventoryMap.delete(numId);
      const m1 = process.hrtime.bigint();
      mapTimeNs = Number(m1 - m0);
    } else {
      const a0 = performance.now();
      this.avlTree.delete(numId);
      avlTimeNs = (performance.now() - a0) * 1e6;

      const m0 = performance.now();
      this.inventoryMap.delete(numId);
      mapTimeNs = (performance.now() - m0) * 1e6;
    }

    const idx = this.itemsArray.findIndex(i => i.id === numId);
    if (idx !== -1) {
      this.itemsArray.splice(idx, 1);
    }

    const avlTimeUs = Number((avlTimeNs / 1000).toFixed(2));
    const mapTimeUs = Number((mapTimeNs / 1000).toFixed(2));
    const avlTimeMs = Number((avlTimeNs / 1e6).toFixed(4));
    const mapTimeMs = Number((mapTimeNs / 1e6).toFixed(4));

    return {
      ...itemToDelete,
      timing: {
        avlTimeMs,
        mapTimeMs,
        avlTimeUs,
        mapTimeUs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4)),
        totalTimeUs: Number((avlTimeUs + mapTimeUs).toFixed(2))
      }
    };
  }

  /**
   * Loads a large dataset (e.g. 200 or 1,500 items) to demonstrate scalable O(log n) vs O(1) performance
   */
  loadLargeData(count = 200) {
    const startTime = performance.now();
    const categories = ['Camera', 'Lens', 'Accessories', 'Audio', 'Lighting', 'Storage', 'Stabilizers', 'Power', 'Display', 'Cables'];
    const brands = ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Rode', 'DJI', 'SanDisk', 'Godox', 'Panasonic', 'Manfrotto', 'GoPro', 'Shure', 'Sennheiser', 'Sigma', 'Tamron'];
    const models = ['Pro', 'Ultra', 'Max', 'Prime', 'Zoom', 'Air', 'Standard', 'Plus', 'Studio', 'Compact'];

    this.avlTree = new AVLTree();
    this.inventoryMap.clear();
    this.itemsArray = [];

    const ids = [];
    for (let i = 1; i <= count; i++) {
      ids.push(1000 + i);
    }

    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    ids.forEach((id, index) => {
      const category = categories[index % categories.length];
      const brand = brands[index % brands.length];
      const model = models[(index * 3) % models.length];
      const item = {
        id,
        name: `${brand} ${model} ${category}`,
        category,
        quantity: ((index * 7) % 80) + 1,
        price: ((index * 137) % 95000) + 1200,
        weight: ((index * 3) % 7) + 1
      };

      this.avlTree.insert(item);
      this.inventoryMap.set(id, { ...item });
      this.itemsArray.push({ ...item });
    });

    const timeTakenMs = Number((performance.now() - startTime).toFixed(2));
    return {
      count: this.inventoryMap.size,
      treeHeight: this.avlTree.getHeight(this.avlTree.root),
      timeTakenMs,
      minId: 1001,
      maxId: 1000 + count
    };
  }

  /**
   * Returns data formatted for visualization, supporting both structural hierarchy and full dataset canvas data
   */
  getVisualizationData() {
    const total = this.inventoryMap.size;
    const isLarge = total > 40;

    // Structural hierarchy (top levels for detailed SVG card layout)
    const treeData = this.avlTree.toHierarchy(this.avlTree.root, 0, isLarge ? 5 : Infinity);

    // Complete flat tree representation with all 2,500+ nodes and branches for full-dataset canvas preview
    const flatTree = this.avlTree.getFlatTreeData();

    // Sample entries for compact view
    const mapEntries = Array.from(this.inventoryMap.entries()).slice(0, 50).map(([key, value]) => ({
      key,
      value: `${value.name} (Qty: ${value.quantity}, ₹${value.price})`,
      item: value
    }));

    // All entries for whole-dataset preview
    const allMapEntries = Array.from(this.inventoryMap.entries()).map(([key, value]) => ({
      key,
      value: `${value.name} (Qty: ${value.quantity}, ₹${value.price})`,
      item: value
    }));

    return {
      tree: treeData,
      flatTree,
      hashMap: mapEntries,
      allHashMap: allMapEntries,
      totalItems: total,
      treeHeight: this.avlTree.getHeight(this.avlTree.root),
      isLargeDataset: isLarge,
      maxDisplayDepth: isLarge ? 5 : null
    };
  }
}

// Singleton instance for the application lifecycle
const inventoryInstance = new InventoryManager();

module.exports = inventoryInstance;
