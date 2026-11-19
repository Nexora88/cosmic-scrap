export class ObjectPool {
  constructor(factory, max = 1200) { this.factory = factory; this.max = max; this.items = []; this.created = 0; }
  acquire(...args) { const item = this.items.pop(); if (item) { item.reset(...args); return item; } this.created++; return this.factory(...args); }
  release(item) { if (item && this.items.length < this.max) this.items.push(item); }
  get size() { return this.items.length; }
  clear() { this.items.length = 0; }
}
