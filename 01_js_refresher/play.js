const name = "Sameer";
let age = 23;
let hasHobbies = true;

// basic function syntex
function sumarizeUser(name, age, hasHobbies) {
  return (
    "Name is " +
    name +
    ", age is " +
    age +
    " and the user has hobbies: " +
    hasHobbies
  );
}

// arrow function syntax
const sumarizeUser1 = (userName, age, hasHobbies) => {
  return (
    "Name is " +
    userName +
    ", age is " +
    age +
    " and the user has hobbies: " +
    hasHobbies
  );
};
console.log(sumarizeUser(name, age, hasHobbies));
console.log(sumarizeUser(name, age, hasHobbies));
