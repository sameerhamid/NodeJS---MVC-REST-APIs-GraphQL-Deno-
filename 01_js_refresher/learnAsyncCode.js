// setTimeout(log, 1);

// function log() {
//   console.log("Timer");
// }

// console.log("Hello");
// console.log("Hi");

/**
 * output is
 * Hello
 * Hi
 * Timer
 */

// function fetchData(callback) {
//   setTimeout(() => {
//     callback("Done");
//   }, 1500);
// }

// setTimeout(() => {
//   fetchData((text) => console.log(text));
// }, 2000);

function fetchData() {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Done");
    }, 1500);
  });
  return promise;
}

setTimeout(() => {
  fetchData()
    .then((text) => {
      console.log("first", text);
      return fetchData();
    })
    .then((text2) => {
      console.log("second", text2);
    });
}, 2000);

console.log("Hello");
console.log("Hi");
