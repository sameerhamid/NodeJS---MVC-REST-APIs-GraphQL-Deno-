const hobbies = ["Codding", "Watching moveis"];

for (let hobby of hobbies) {
  console.log(hobby);
}

// map return a new array and you can add manipulaton to items of ther array

console.log(hobbies.map((hobby) => "Hobby: " + hobby));
hobbies.map(hobbies);
