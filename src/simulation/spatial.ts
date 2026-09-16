/**
 * ANT BRAIN — 2D Spatial Hash Grid
 * Efficient O(1) broad-phase spatial proximity queries for large populations.
 */

export interface SpatialItem<T> {
  id: string;
  x: number;
  y: number;
  radius: number;
  data: T;
}

export class SpatialHashGrid<T> {
  private cellSize: number;
  private grid: Map<string, SpatialItem<T>[]>;
  private itemMap: Map<string, { item: SpatialItem<T>; cellKey: string }>;

  constructor(cellSize = 4.0) {
    this.cellSize = cellSize;
    this.grid = new Map();
    this.itemMap = new Map();
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  public insert(item: SpatialItem<T>): void {
    const key = this.getKey(item.x, item.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(item);
    this.itemMap.set(item.id, { item, cellKey: key });
  }

  public update(id: string, newX: number, newY: number): void {
    const entry = this.itemMap.get(id);
    if (!entry) return;

    const oldKey = entry.cellKey;
    const newKey = this.getKey(newX, newY);

    entry.item.x = newX;
    entry.item.y = newY;

    if (oldKey !== newKey) {
      // Remove from old cell
      const oldCell = this.grid.get(oldKey);
      if (oldCell) {
        const idx = oldCell.findIndex((it) => it.id === id);
        if (idx !== -1) oldCell.splice(idx, 1);
        if (oldCell.length === 0) this.grid.delete(oldKey);
      }

      // Add to new cell
      let newCell = this.grid.get(newKey);
      if (!newCell) {
        newCell = [];
        this.grid.set(newKey, newCell);
      }
      newCell.push(entry.item);
      entry.cellKey = newKey;
    }
  }

  public remove(id: string): void {
    const entry = this.itemMap.get(id);
    if (!entry) return;

    const cell = this.grid.get(entry.cellKey);
    if (cell) {
      const idx = cell.findIndex((it) => it.id === id);
      if (idx !== -1) cell.splice(idx, 1);
      if (cell.length === 0) this.grid.delete(entry.cellKey);
    }
    this.itemMap.delete(id);
  }

  public clear(): void {
    this.grid.clear();
    this.itemMap.clear();
  }

  /**
   * Query all items within a given radius of (x, y)
   */
  public queryRadius(x: number, y: number, radius: number): SpatialItem<T>[] {
    const results: SpatialItem<T>[] = [];
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    const radiusSq = radius * radius;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const cell = this.grid.get(`${cx},${cy}`);
        if (!cell) continue;

        for (let i = 0; i < cell.length; i++) {
          const item = cell[i];
          const dx = item.x - x;
          const dy = item.y - y;
          const distSq = dx * dx + dy * dy;
          const totalRadius = radius + item.radius;
          if (distSq <= totalRadius * totalRadius) {
            results.push(item);
          }
        }
      }
    }
    return results;
  }

  /**
   * Find nearest item within maxRadius
   */
  public queryNearest(
    x: number,
    y: number,
    maxRadius: number,
    filter?: (item: SpatialItem<T>) => boolean
  ): { item: SpatialItem<T>; distance: number } | null {
    const items = this.queryRadius(x, y, maxRadius);
    let nearest: SpatialItem<T> | null = null;
    let minDistanceSq = maxRadius * maxRadius;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (filter && !filter(item)) continue;

      const dx = item.x - x;
      const dy = item.y - y;
      const dSq = dx * dx + dy * dy;
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        nearest = item;
      }
    }

    if (!nearest) return null;
    return { item: nearest, distance: Math.sqrt(minDistanceSq) };
  }
}
