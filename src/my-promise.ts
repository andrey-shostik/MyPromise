export class MyPromise {
  #state = "pending"; // pending, fulfilled, rejected
  #result = null;
  #error = null;

  #onFulfilled: { (data: any): void }[] = [];
  #onRejected: { (data: any): void }[] = [];

  constructor(callback) {
    callback(this.#resolve.bind(this), this.#reject.bind(this));
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
    if (this.#state === "pending") {
      this.#state = value;

      this.#handleStateChange();
    }
  }

  get state() {
    return this.#state;
  }

  get value() {
    return this.state === "fulfilled" ? this.#result : this.#error;
  }

  #resolve(result) {
    if (!this.#result) {
      this.#result = result;
    }

    this.state = "fulfilled";
  }

  #reject(error) {
    if (!this.#error) {
      this.#error = error;
    }

    this.state = "rejected";
  }

  #handleStateChange() {
    const listeners = {
      fulfilled: this.#onFulfilled,
      rejected: this.#onRejected,
    };
    const value = {
      fulfilled: this.#result,
      rejected: this.#error,
    };

    if (!listeners[this.state].length) {
      return false;
    }

    listeners[this.state].forEach((callback, index, array) => {
      callback(value[this.state]);
      delete array[index];
    });
  }

  #handleState(callback) {
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
      return this.#handleState(
        this.state === "fulfilled" ? successCallback : failureCallback,
      );
    }

    const { promise, resolve, reject } = MyPromise.withResolvers();

    if (successCallback) {
      this.#onFulfilled.push((result) => resolve(successCallback(result)));
    }

    if (failureCallback) {
      this.#onRejected.push((error) => reject(failureCallback(error)));
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
