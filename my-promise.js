export class MyPromise {
  #state = "pending"; // pending, fulfilled, rejected
  #value = null;
  #error = null;

  #onFulfilled = [];
  #onRejected = [];

  constructor(callback) {
    callback(this.#resolve.bind(this), this.#reject.bind(this));
  }

  static all(promises) {
    console.log(promises);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(error) {
    return new MyPromise((_, reject) => reject(error));
  }

  static withResolvers() {}

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

  #handleStateChange(successCallback, failureCallback) {
    if (this.state === "fulfilled") {
      if (this.#onFulfilled.length) {
        this.#onFulfilled.forEach((callback) => callback(this.#value));
        this.#onFulfilled = [];
      }

      if (successCallback) {
        const value = successCallback(this.#value);
        return value?.then ? value : MyPromise.resolve(value);
      }
    }

    if (this.state === "rejected") {
      if (this.#onRejected.length) {
        this.#onRejected.forEach((callback) => callback(this.#error));
        this.#onRejected = [];
      }

      if (failureCallback) {
        const value = failureCallback(this.#error);
        return value?.then ? value : MyPromise.resolve(value);
      }
    }

    return this;
  }

  then(successCallback, failureCallback) {
    if (this.state !== "pending") {
      return this.#handleStateChange(successCallback, failureCallback);
    }

    if (successCallback) {
      this.#onFulfilled.push(successCallback);
    }

    if (failureCallback) {
      this.#onRejected.push(failureCallback);
    }

    return new MyPromise();
  }

  catch() {}

  finally() {}
}
