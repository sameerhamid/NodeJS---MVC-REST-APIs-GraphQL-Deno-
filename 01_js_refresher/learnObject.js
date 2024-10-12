const person = {
  name: "Sameer",
  age: 23,

  // in arrow fuction the this.name will be undefined becoz arrow fuction don't create this instead here this refers to the global scope to the global node runtime scope
  //   greet: () => {
  //     console.log("Hi, I am ", this.name);
  //   },

  //   greet: function () {
  //     console.log("Hi, I am ", this.name);
  //   },

  greet() {
    console.log("Hi, I am ", this.name);
  },
};

const coppiedPerson = {
  ...person,
  hobbies: ["Cooking", "Programming"],
};

console.log(person);
console.log(coppiedPerson);
