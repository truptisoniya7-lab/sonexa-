export class QueueManager {
  private queue: any[] = [];
  private currentIndex: number = 0;

  constructor(initialQueue: any[] = [], initialIndex: number = 0) {
    this.queue = initialQueue;
    this.currentIndex = initialIndex;
  }

  setQueue(queue: any[]) {
    this.queue = queue;
    this.currentIndex = 0;
    this.persist();
  }

  addTrack(track: any) {
    this.queue.push(track);
    this.persist();
  }

  next(): any | null {
    if (this.currentIndex < this.queue.length - 1) {
      this.currentIndex++;
      this.persist();
      return this.queue[this.currentIndex];
    }
    return null;
  }

  prev(): any | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.persist();
      return this.queue[this.currentIndex];
    }
    return null;
  }

  getCurrentTrack() {
    return this.queue[this.currentIndex] || null;
  }

  getQueue() {
    return this.queue;
  }

  private persist() {
    // In a full implementation, this calls /api/queue to save to playback_queue
    try {
      localStorage.setItem('sonexa_queue', JSON.stringify({
        queue: this.queue,
        index: this.currentIndex
      }));
    } catch (e) {}
  }
}
