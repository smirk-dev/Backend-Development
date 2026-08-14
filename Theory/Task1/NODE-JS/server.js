const express = require("express");
const app = express();

app.set("view engine", "ejs");

const students = [
    { id: 1, name: "Aarav", branch: "CSE" },
    { id: 2, name: "Diya", branch: "ECE" },
    { id: 3, name: "Rohan", branch: "IT" }
];

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/students", (req, res) => {
    res.render("students", { students: students });
});

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
});
