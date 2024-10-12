const name = "Sameer";
let age = 23;
let hasHobbies = true;

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

console.log(sumarizeUser(name, age, hasHobbies));
