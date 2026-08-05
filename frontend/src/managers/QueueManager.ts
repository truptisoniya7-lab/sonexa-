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

  updateQueue(queue: any[]) {
    this.queue = queue;
    this.persist();
  }

  addTrack(track: any) {
    if (track.queueSource === 'manual') {
      // Find the first auto track after currentIndex and insert before it
      let insertIndex = this.queue.length;
      for (let i = this.currentIndex + 1; i < this.queue.length; i++) {
        if (this.queue[i].queueSource === 'auto') {
          insertIndex = i;
          break;
        }
      }
      this.queue.splice(insertIndex, 0, track);
    } else {
      // Default to pushing at the end
      this.queue.push(track);
    }
    this.persist();
  }

  addAutoTracks(tracks: any[]) {
    this.queue.push(...tracks);
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

  jumpToIndex(index: number) {
    if (index >= 0 && index < this.queue.length) {
      this.currentIndex = index;
      this.persist();
    }
  }

  removeTrack(index: number) {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      if (this.currentIndex > index) {
        this.currentIndex--;
      } else if (this.currentIndex === index && this.currentIndex >= this.queue.length) {
        this.currentIndex = Math.max(0, this.queue.length - 1);
      }
      this.persist();
    }
  }

  reorderQueue(startIndex: number, endIndex: number) {
    const result = Array.from(this.queue);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Adjust currentIndex
    if (this.currentIndex === startIndex) {
      this.currentIndex = endIndex;
    } else if (this.currentIndex > startIndex && this.currentIndex <= endIndex) {
      this.currentIndex--;
    } else if (this.currentIndex < startIndex && this.currentIndex >= endIndex) {
      this.currentIndex++;
    }

    this.queue = result;
    this.persist();
  }

  clearAutoTracks() {
    this.queue = this.queue.filter((track, index) => {
      // Keep track if it's manual, or if we have already played past it (so history remains correct if needed)
      // Actually, if it's an auto track and it's AFTER the currentIndex, we remove it.
      if (index > this.currentIndex && track.queueSource === 'auto') {
        return false;
      }
      return true;
    });
    this.persist();
  }

  clearQueue() {
    this.queue = [];
    this.currentIndex = 0;
    this.persist();
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
