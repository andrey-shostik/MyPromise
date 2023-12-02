export class MyPromise {
  #state = "pending"; // pending, fulfilled, rejected
  #value = null;
  #error = null;

  #onFulfilled = [];
  #onRejected = [];

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

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
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

  #resolve(value) {
    if (!this.#value) {
      this.#value = value;
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
      fulfilled: this.#value,
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

  #handleFulfilled(successCallback) {
    if (!successCallback) {
      return this;
    }

    const value = successCallback(this.#value);

    if (MyPromise.isPromise(value)) {
      return value;
    }

    return MyPromise.resolve(value || this.#value);
  }

  #handleRejected(failureCallback) {
    if (!failureCallback) {
      return this;
    }
    const value = failureCallback(this.#value);

    if (MyPromise.isPromise(value)) {
      return value;
    }

    return MyPromise.resolve(value || this.#error);
  }

  then(successCallback, failureCallback) {
    if (this.state === "fulfilled") {
      return this.#handleFulfilled(successCallback);
    }

    if (this.state === "rejected") {
      return this.#handleRejected(failureCallback);
    }

    const { promise, resolve, reject } = MyPromise.withResolvers();

    if (successCallback) {
      this.#onFulfilled.push((value) => {
        resolve(successCallback(value));
      });
    }

    if (failureCallback) {
      this.#onRejected.push((error) => {
        reject(failureCallback(error));
      });
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
