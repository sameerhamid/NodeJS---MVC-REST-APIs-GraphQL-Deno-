const hobbies = ["Codding", "Watching moveis"];

for (let hobby of hobbies) {
  console.log(hobby);
}

// map return a new array and you can add manipulaton to items of ther array

// console.log(hobbies.map((hobby) => "Hobby: " + hobby));
// hobbies.map(hobbies);

// const coppiedHobbies = hobbies.slice()
const coppiedHobbies = [...hobbies, "Cooking"];
console.log(coppiedHobbies);

function toArray(...args) {
  return args;
}

console.log(toArray(1, 2, 3, 4));

// --------- array destructuring

const [hobby1, hobby2] = coppiedHobbies;
console.log(hobby1, hobby2);
