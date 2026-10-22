import { AVLTree } from './avlTree.js';

/**
 * Client-Side In-Memory Inventory Manager
 * Synchronizes AVL Tree and Hash Map for offline operation
 */
class ClientInventoryManager {
  constructor() {
    this.avlTree = new AVLTree();
    this.inventoryMap = new Map();
    this.seedInitialData();
  }

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

    sampleItems.forEach(item => {
      this.avlTree.insert(item);
      this.inventoryMap.set(item.id, { ...item });
    });
  }

  getAll() {
    return this.avlTree.inOrderTraversal();
  }

  rangeSearch(minId, maxId) {
    return this.avlTree.rangeSearch(minId, maxId);
  }

  search(id) {
    const numId = Number(id);

    // 1. AVL Tree Search (counts comparisons along tree path)
    const avlStart = performance.now();
    const avlResult = this.avlTree.search(numId);
    const avlTimeMs = Number((performance.now() - avlStart).toFixed(4));

    // 2. Hash Map Direct Lookup
    const mapStart = performance.now();
    const mapFound = this.inventoryMap.has(numId);
    const mapItem = mapFound ? this.inventoryMap.get(numId) : null;
    const mapTimeMs = Number((performance.now() - mapStart).toFixed(4));

    return {
      id: numId,
      found: avlResult.found,
      item: avlResult.item,
      totalItemsInSystem: this.inventoryMap.size,
      avl: {
        comparisons: avlResult.comparisons,
        path: avlResult.path,
        nodeHeight: avlResult.nodeHeight,
        balanceFactor: avlResult.balanceFactor,
        timeComplexity: 'O(log n)',
        timeTakenMs: avlTimeMs
      },
      hashMap: {
        found: mapFound,
        item: mapItem,
        lookupOperations: 1,
        timeComplexity: 'O(1) average',
        timeTakenMs: mapTimeMs
      }
    };
  }

  insert(itemData) {
    const id = Number(itemData.id);
    const quantity = Number(itemData.quantity);
    const price = Number(itemData.price);

    if (isNaN(id) || id <= 0) throw new Error('Product ID must be a positive number');
    if (!itemData.name || !itemData.name.trim()) throw new Error('Product Name cannot be empty');
    if (isNaN(quantity) || quantity < 0) throw new Error('Quantity cannot be negative');
    if (isNaN(price) || price < 0) throw new Error('Price cannot be negative');
    if (this.inventoryMap.has(id)) throw new Error(`Product ID ${id} already exists`);

    const weight = itemData.weight !== undefined && Number(itemData.weight) > 0 ? Number(itemData.weight) : Math.max(1, (id % 5) + 1);

    const newItem = {
      id,
      name: itemData.name.trim(),
      category: (itemData.category || 'General').trim(),
      quantity,
      price,
      weight
    };

    const avlStart = performance.now();
    this.avlTree.insert(newItem);
    const avlTimeMs = Number((performance.now() - avlStart).toFixed(4));

    const mapStart = performance.now();
    this.inventoryMap.set(id, { ...newItem });
    const mapTimeMs = Number((performance.now() - mapStart).toFixed(4));

    return {
      ...newItem,
      timing: {
        avlTimeMs,
        mapTimeMs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4))
      }
    };
  }

  update(id, updateData) {
    const numId = Number(id);
    if (!this.inventoryMap.has(numId)) throw new Error(`Item with ID ${numId} not found`);

    const currentItem = this.inventoryMap.get(numId);
    const quantity = updateData.quantity !== undefined ? Number(updateData.quantity) : currentItem.quantity;
    const price = updateData.price !== undefined ? Number(updateData.price) : currentItem.price;
    const weight = updateData.weight !== undefined && Number(updateData.weight) > 0 ? Number(updateData.weight) : (currentItem.weight || 2);

    if (isNaN(quantity) || quantity < 0) throw new Error('Quantity cannot be negative');
    if (isNaN(price) || price < 0) throw new Error('Price cannot be negative');

    const updatedItem = {
      id: numId,
      name: updateData.name ? updateData.name.trim() : currentItem.name,
      category: updateData.category ? updateData.category.trim() : currentItem.category,
      quantity,
      price,
      weight
    };

    const avlStart = performance.now();
    this.avlTree.update(numId, updatedItem);
    const avlTimeMs = Number((performance.now() - avlStart).toFixed(4));

    const mapStart = performance.now();
    this.inventoryMap.set(numId, updatedItem);
    const mapTimeMs = Number((performance.now() - mapStart).toFixed(4));

    return {
      ...updatedItem,
      timing: {
        avlTimeMs,
        mapTimeMs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4))
      }
    };
  }

  delete(id) {
    const numId = Number(id);
    if (!this.inventoryMap.has(numId)) throw new Error(`Item with ID ${numId} not found`);

    const itemToDelete = this.inventoryMap.get(numId);

    const avlStart = performance.now();
    this.avlTree.delete(numId);
    const avlTimeMs = Number((performance.now() - avlStart).toFixed(4));

    const mapStart = performance.now();
    this.inventoryMap.delete(numId);
    const mapTimeMs = Number((performance.now() - mapStart).toFixed(4));

    return {
      ...itemToDelete,
      timing: {
        avlTimeMs,
        mapTimeMs,
        totalTimeMs: Number((avlTimeMs + mapTimeMs).toFixed(4))
      }
    };
  }

  loadLargeData(count = 200) {
    const startTime = performance.now();
    const categories = ['Camera', 'Lens', 'Accessories', 'Audio', 'Lighting', 'Storage', 'Stabilizers', 'Power', 'Display', 'Cables'];
    const brands = ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Rode', 'DJI', 'SanDisk', 'Godox', 'Panasonic', 'Manfrotto', 'GoPro', 'Shure', 'Sennheiser', 'Sigma', 'Tamron'];
    const models = ['Pro', 'Ultra', 'Max', 'Prime', 'Zoom', 'Air', 'Standard', 'Plus', 'Studio', 'Compact'];

    this.avlTree = new AVLTree();
    this.inventoryMap.clear();

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

  getVisualizationData() {
    const total = this.inventoryMap.size;
    const isLarge = total > 40;

    const treeData = this.avlTree.toHierarchy(this.avlTree.root, 0, isLarge ? 5 : Infinity);
    const flatTree = this.avlTree.getFlatTreeData();

    const mapEntries = Array.from(this.inventoryMap.entries()).slice(0, 50).map(([key, value]) => ({
      key,
      value: `${value.name} (Qty: ${value.quantity}, ₹${value.price})`,
      item: value
    }));

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

export const clientInventory = new ClientInventoryManager();
