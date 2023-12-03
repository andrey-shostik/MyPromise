export class MyPromise {
  private _state: "pending" | "fulfilled" | "rejected" = "pending";
  private _result = null;
  private _error = null;

  private _onFulfilled: { (data: any): void }[] = [];
  private _onRejected: { (data: any): void }[] = [];

  constructor(callback) {
    callback(this.resolve.bind(this), this.reject.bind(this));
  }

  static isPromise(value) {
    if (!value) {
      return false;
    }

    if (typeof value === "object" && value.then) {
      return true;
    }
  }

  static withResolvers() {
    let resolve, reject;
    const promise = new MyPromise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  }

  static all(promises) {
    // @TODO
  }

  static resolve(result) {
    return new MyPromise((resolve) => resolve(result));
  }

  static reject(error) {
    return new MyPromise((_, reject) => reject(error));
  }

  set state(value) {
    if (this._state === "pending") {
      this._state = value;

      this.handleStateChange();
    }
  }

  get state() {
    return this._state;
  }

  get value() {
    return this.state === "fulfilled" ? this._result : this._error;
  }

  private resolve(result) {
    if (!this._result) {
      this._result = result;
    }

    this.state = "fulfilled";
  }

  private reject(error) {
    if (!this._error) {
      this._error = error;
    }

    this.state = "rejected";
  }

  private handleStateChange() {
    const listeners = {
      fulfilled: this._onFulfilled,
      rejected: this._onRejected,
    };
    const value = {
      fulfilled: this._result,
      rejected: this._error,
    };

    if (!listeners[this.state].length) {
      return false;
    }

    listeners[this.state].forEach((callback, index, array) => {
      callback(value[this.state]);
      delete array[index];
    });
  }

  private handleState(callback) {
    if (!callback) {
      return this;
    }

    const value = callback(this.value);

    if (MyPromise.isPromise(value)) {
      return value;
    }

    return MyPromise.resolve(value || this.value);
  }

  then(successCallback, failureCallback?) {
    if (this.state !== "pending") {
      return this.handleState(
        this.state === "fulfilled" ? successCallback : failureCallback,
      );
    }

    const { promise, resolve, reject } = MyPromise.withResolvers();

    if (successCallback) {
      this._onFulfilled.push((result) => resolve(successCallback(result)));
    }

    if (failureCallback) {
      this._onRejected.push((error) => reject(failureCallback(error)));
    }

    return promise;
  }

  catch() {
    // @TODO
  }

  finally() {
    // @TODO
  }
}
