import http from "http";
import { MyPromise } from "./my-promise.js";

const main = () => {
  const myPromise = new MyPromise((res, rej) => {
    setTimeout(() => res("i'm alive"), 1000);
  }).then(console.log);
};

const server = http.createServer((req, res) => {
  res.end(JSON.stringify({ data: "Hello My Promise!" }));
  main();
});

server.listen(4000);
