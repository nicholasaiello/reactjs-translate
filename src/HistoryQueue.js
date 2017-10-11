/**
 * Collection for recent queries
 */
class HistoryQueue {

  constructor(cacheKey = '_historyQueue', maxSize = 5) {
    this.queue = [];
    this.cacheKey = cacheKey;
    this.maxSize = maxSize;
  }

  _compare(x, query, frm, to) {
    return x.q === query && x.f === frm && x.t === to;
  }

  contains(query, frm, to) {
    return this.get(query, frm, to) !== undefined;
  }

  get(query, frm, to) {
    return this.queue.find((x) => (
      this._compare(x, query, frm, to)
    ));
  }

  getAll() {
    return this.queue;
  }

  add(query, frm, to) {
    if (this.contains(query, frm, to)) {
      this.remove(query, frm, to);
    } else if (this.queue.length >= this.maxSize) {
      this.queue.pop();
    }

    this.queue.unshift({q: query, f: frm, t: to});

    if (this.storeTimeoutId) {
      clearTimeout(this.storeTimeoutId);
      this.storeTimeoutId = null;
    }

    this.storeTimeoutId = setTimeout(() => {
      this.store();
    }, 1000);
  }

  remove(query, frm, to) {
    this.queue = this.queue.filter((x) => (
      !this._compare(x, query, frm, to)
    ));
  }

  /*
   *
   */

  restore() {
    this.queue = JSON.parse(
      window.localStorage.getItem(this.cacheKey) || '[]').filter((x) => x !== null);
  }

  store() {
    window.localStorage.setItem(
      this.cacheKey, JSON.stringify(this.queue.filter((x) => x !== null)));
  }
}

export default HistoryQueue;
