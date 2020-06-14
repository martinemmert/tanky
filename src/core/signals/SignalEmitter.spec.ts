import SignalEmitter from "./SignalEmitter";

describe("SignalEmitter", () => {
  test("it should dispatch and call the registered listeners", () => {
    const emitter = new SignalEmitter();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();
    emitter.add(mockListener1);
    emitter.add(mockListener2);
    emitter.dispatch();
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(1);
  });

  test("it should dispatch and call the registered listeners and pass the payload", () => {
    const payload = { foo: "bar" };
    const payload2 = { foo: "foobar" };
    const emitter = new SignalEmitter<{ foo: string }>();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();
    emitter.add(mockListener1);
    emitter.add(mockListener2);
    emitter.dispatch(payload);
    expect(mockListener1).toHaveBeenNthCalledWith(1, payload);
    expect(mockListener2).toHaveBeenNthCalledWith(1, payload);
    emitter.dispatch(payload);
    emitter.dispatch(payload2);
    expect(mockListener1).toHaveBeenLastCalledWith(payload2);
    expect(mockListener2).toHaveBeenNthCalledWith(3, payload2);
  });

  test("it should remove a listener and don't call it during dispatching", () => {
    const emitter = new SignalEmitter();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();
    emitter.add(mockListener1);
    emitter.add(mockListener2);
    emitter.dispatch();
    emitter.remove(mockListener1);
    emitter.dispatch();
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(2);
  });

  test("it should remove all listeners and don't call them during dispatching", () => {
    const emitter = new SignalEmitter();
    const mockListener1 = jest.fn();
    const mockListener2 = jest.fn();
    emitter.add(mockListener1);
    emitter.add(mockListener2);
    emitter.dispatch();
    emitter.removeAll();
    emitter.dispatch();
    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(1);
  });
});
