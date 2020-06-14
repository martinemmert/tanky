/* eslint-disable @typescript-eslint/unbound-method */
import SignalEmitter from "./SignalEmitter";

export default class KeyboardSignals {
  private _document: HTMLDocument;
  private _onKeyDown: SignalEmitter<string>;
  private _onKeyUp: SignalEmitter<string>;
  private _emitting = false;

  public get onKeyDown(): SignalEmitter<string> {
    return this._onKeyDown;
  }

  public get onKeyUp(): SignalEmitter<string> {
    return this._onKeyUp;
  }

  constructor(document: HTMLDocument) {
    this._document = document;
    this._onKeyDown = new SignalEmitter();
    this._onKeyUp = new SignalEmitter();
    this._onKeyDownListener = this._onKeyDownListener.bind(this);
    this._onKeyUpListener = this._onKeyUpListener.bind(this);
  }

  start(document?: HTMLDocument): void {
    this._document = document ?? this._document;
    this._document.addEventListener("keydown", this._onKeyDownListener);
    this._document.addEventListener("keyup", this._onKeyUpListener);
    this._emitting = true;
  }

  stop(): void {
    this._emitting = false;
    this._document.removeEventListener("keydown", this._onKeyDownListener);
    this._document.removeEventListener("keyup", this._onKeyUpListener);
  }

  private _onKeyDownListener(event: KeyboardEvent): void {
    if (this._emitting) this._onKeyDown.dispatch(event.key);
  }

  private _onKeyUpListener(event: KeyboardEvent): void {
    if (this._emitting) this._onKeyUp.dispatch(event.key);
  }
}
