export class ClientReadableStream<T> {
  private subscribers: {
    eventType: string;
    callback: (data?: unknown) => void;
  }[] = [];

  on(eventType: string, callback: (data?: unknown) => void) {
    this.subscribers.push({
      eventType,
      callback,
    });
    return this;
  }

  removeListener(eventType: string, callback: (data?: unknown) => void) {
    const idx = this.subscribers.findIndex(
      (sub) => sub.eventType === eventType && sub.callback === callback
    );
    if (idx === -1) {
      return;
    }
    this.subscribers.splice(idx, 1);
  }

  cancel() {
    this.subscribers = [];
  }

  send<D>(eventType: string, data?: D): void {
    this.subscribers
      .filter((sub) => sub.eventType === eventType)
      .forEach((sub) => sub.callback(data));
  }
}
