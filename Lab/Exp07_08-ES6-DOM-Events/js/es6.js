// Part A — every ES6 snippet from the manual, run live. Each demo writes to its own <pre>.
import multiply, { PI, add } from "./math.js";

const out = (id) => {
    const el = document.getElementById(id);
    el.textContent = "";
    return (...args) => {
        el.textContent += args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" ") + "\n";
    };
};

// 3.1 let and const
{
    const log = out("out-letconst");
    var x = 10;
    var x = 20; // allowed
    let y = 10;
    const z = 30;
    log("var x redeclared ->", x);
    log("let y =", y, "| const z =", z);
    try { z = 40; } catch (e) { log("z = 40  ->", `${e.name}: ${e.message}`); }
    if (true) {
        let blockVar = "inside";
        var funcVar = "outside";
    }
    try { blockVar; } catch (e) { log("blockVar ->", e.name); }
    log("funcVar  ->", funcVar);
}

// 3.2 Arrow functions
{
    const log = out("out-arrow");
    const add = (a, b) => a + b;
    const square = x => x * x;
    const greet = () => "Hello!";
    const multiply = (a, b) => {
        const result = a * b;
        return result;
    };
    log("add(3, 4)      =", add(3, 4));
    log("square(5)      =", square(5));
    log("greet()        =", greet());
    log("multiply(6, 7) =", multiply(6, 7));

    const counter = {
        count: 0,
        startArrow() { [1, 2, 3].forEach(() => this.count++); },
        startFunction() { [1, 2, 3].forEach(function () { try { this.count++; } catch { } }); }
    };
    counter.startArrow();
    log("arrow keeps outer this -> count =", counter.count);
    counter.startFunction();
    log("plain function loses this -> count =", counter.count, "(unchanged)");
}

// 3.3 Template literals
{
    const log = out("out-template");
    const name = "Alice";
    const age = 25;
    log("Old way :", "Hello, " + name + "! You are " + age + " years old.");
    log("Template:", `Hello, ${name}! You are ${age} years old.`);
    log(`Sum: ${5 + 3}`);
    log(`Upper: ${name.toUpperCase()}`);
    log(`
    <div>
        <h1>${name}</h1>
        <p>Age: ${age}</p>
    </div>`);
}

// 3.4 Destructuring
{
    const log = out("out-destructuring");
    const colors = ["red", "green", "blue"];
    const [first, second] = colors;
    const [, , thirdColor] = colors;
    log("first, second =", first, second);
    log("thirdColor    =", thirdColor);
    const person = { name: "Bob", age: 30, city: "Mumbai" };
    const { name, age } = person;
    const { name: fullName } = person;
    const { country = "India" } = person;
    log("name, age     =", name, age);
    log("fullName      =", fullName);
    log("country       =", country, "(default)");
}

// 3.5 Spread and rest
{
    const log = out("out-spread");
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    log("combined =", [...arr1, ...arr2]);
    const copy = [...arr1];
    log("copy === arr1 ?", copy === arr1, "| same items ?", copy.join() === arr1.join());
    const obj1 = { a: 1, b: 2 };
    log("obj2 =", { ...obj1, c: 3 });
    function sum(...numbers) {
        return numbers.reduce((total, n) => total + n, 0);
    }
    log("sum(1, 2, 3, 4) =", sum(1, 2, 3, 4));
    const [head, ...tail] = [10, 20, 30, 40];
    log("head =", head, "| tail =", tail);
}

// 3.6 Default parameters
{
    const log = out("out-default");
    function greet(name = "Guest", greeting = "Hello") {
        return `${greeting}, ${name}!`;
    }
    log(greet());
    log(greet("Alice"));
    log(greet("Bob", "Hi"));
}

// 3.7 Classes
{
    const log = out("out-class");
    class Animal {
        constructor(name, sound) {
            this.name = name;
            this.sound = sound;
        }
        speak() { return `${this.name} says ${this.sound}`; }
        static info() { return "Animals are living beings."; }
    }
    class Dog extends Animal {
        constructor(name) { super(name, "Woof"); }
        fetch() { return `${this.name} is fetching the ball.`; }
    }
    const dog = new Dog("Rex");
    log(dog.speak());
    log(dog.fetch());
    log(Animal.info());
    log("dog instanceof Animal ->", dog instanceof Animal);
}

// 3.8 Modules — math.js is a real separate file
{
    const log = out("out-module");
    log("PI          =", PI);
    log("add(2, 3)   =", add(2, 3));
    log("multiply(4, 5) =", multiply(4, 5), "(default export)");
}

// 3.9 Promises and async/await
{
    const log = out("out-promise");
    const fetchData = () => new Promise((resolve) => {
        setTimeout(() => resolve("Data loaded"), 1000);
    });
    document.getElementById("run-promise").addEventListener("click", async () => {
        const el = document.getElementById("out-promise");
        el.textContent = "";
        log("promise: waiting 1s ...");
        fetchData().then(data => log("promise  .then ->", data));
        async function loadData() {
            try {
                const data = await fetchData();
                log("async/await   ->", data);
            } catch (error) {
                console.error(error);
            }
        }
        await loadData();
    });
    log("Press the button to run both.");
}

// 3.10 Enhanced object literals
{
    const log = out("out-literal");
    const name = "Alice";
    const age = 25;
    const person = { name, age };
    const calculator = {
        add(a, b) { return a + b; },
        subtract(a, b) { return a - b; }
    };
    const key = "dynamicKey";
    const obj = { [key]: "value" };
    log("shorthand property ->", person);
    log("calculator.add(2, 3) / subtract(9, 4) ->", calculator.add(2, 3), calculator.subtract(9, 4));
    log("obj.dynamicKey ->", obj.dynamicKey);
}
