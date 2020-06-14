type Listener<T> = (data: T) => void;

export default class SignalEmitter<T = void> {
  private _listener: Set<Listener<T>> = new Set();

  public dispatch(payload: T): void {
    this._listener.forEach(listener => {
      listener(payload);
    });
  }

  public add(listener: Listener<T>): void {
    this._listener.add(listener);
  }

  public remove(listener: Listener<T>): void {
    this._listener.delete(listener);
  }

  public removeAll(): void {
    this._listener.clear();
  }
}
