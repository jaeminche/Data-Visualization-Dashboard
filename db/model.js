// Which customer uses Memoride, and who does not?
// How often does a customer use Memoride?
// How many days per month
// Duration (total, per month)
// Duration (per day)
// Evolution of these parameters
// How many routes are done?
// Routes per month
// Average duration per route
// Characteristics of route
// How do they use memoride?
// Motion sensor versus taxi mode (per user and in total)

class Org {
  // get userArray() {if (userArray[0].org === this.id) {return userArray}}
  constructor(name, id, avg) {
    this.name = name;
    this.id = id;
    this.avg = avg;
    this.userArray = userArray;
  }
}
class User {
  constructor(name, id, org, time, avg) {
    this.name = name;
    this.id = id;
    this.org = org;
    this.time = time;
    this.avg = avg;
  }
}

let testUser = new User("james", 2, 1, 60, 6);
let testOrg = new Org("Acti84Health", 1, 10);
// console.log("TCL: testOrg", testOrg);
// console.log("test: ", testUser);

const userArray = [];
for (let testUser of ["jae", "dan", "a", "nick"]) {
  userArray.push(new User(testUser));
}
// console.log("TCL: userArray", userArray);
