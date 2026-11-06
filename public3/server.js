

const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(express.json());

let db;

// MYSQL CONNECTION
async function connectDB() {
    db = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "root",
        database: "StudentDB"
    });

    console.log("MySQL Connected Successfully!");

    await db.execute(`
        CREATE TABLE IF NOT EXISTS students (
            student_id INT PRIMARY KEY AUTO_INCREMENT,
            roll_no VARCHAR(30) UNIQUE,
            student_name VARCHAR(100) NOT NULL,
            gender VARCHAR(20) NOT NULL,
            branch VARCHAR(30) NOT NULL,
            year INT NOT NULL,
            phone VARCHAR(15) NOT NULL,
            email VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL
        )
    `);

    console.log("Students Table Ready!");
}

// WEBSITE
app.get("/", (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Student Management System</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f1f5f9;
}

header {
    background: #123c69;
    color: white;
    text-align: center;
    padding: 20px;
}

nav {
    background: #0b2545;
    padding: 15px;
    text-align: center;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 15px;
    font-weight: bold;
}

.container {
    width: 92%;
    max-width: 1100px;
    margin: 25px auto;
}

.box {
    background: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 8px #0001;
}

input, select, textarea {
    width: 100%;
    padding: 12px;
    margin: 7px 0 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
}

button {
    background: #123c69;
    color: white;
    padding: 11px 18px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 4px;
}

button:hover {
    background: #2563eb;
}

.delete {
    background: #dc2626;
}

.edit {
    background: #15803d;
}

.table-scroll {
    overflow-x: auto;
}

table {
    width: 100%;
    min-width: 850px;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background: #123c69;
    color: white;
}

tr:nth-child(even) {
    background: #f8fafc;
}

.card {
    background: white;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
}

footer {
    background: #0b2545;
    color: white;
    text-align: center;
    padding: 15px;
}
</style>
</head>

<body>

<header>
    <h1>Student Management System</h1>
    <p>Manage Student Information Easily</p>
</header>

<nav>
    <a href="#home">Home</a>
    <a href="#form">Add Student</a>
    <a href="#records">Student Records</a>
</nav>

<div class="container">

<section id="home">
    <h2>Dashboard</h2>
    <div class="card">
        <h3>Total Students</h3>
        <h2 id="total">0</h2>
    </div>
</section>

<section class="box" id="form">
    <h2 id="formTitle">Add New Student</h2>

    <form id="studentForm">
        <input type="hidden" id="student_id">

        <div class="grid">

            <div>
                <label>Roll Number</label>
                <input id="roll_no" required>
            </div>

            <div>
                <label>Student Name</label>
                <input id="student_name" required>
            </div>

            <div>
                <label>Gender</label>
                <select id="gender" required>
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                </select>
            </div>

            <div>
                <label>Branch</label>
                <select id="branch" required>
                    <option value="">Select Branch</option>
                    <option>CSE</option>
                    <option>ECE</option>
                    <option>EEE</option>
                    <option>IT</option>
                    <option>MECH</option>
                    <option>CIVIL</option>
                </select>
            </div>

            <div>
                <label>Year</label>
                <select id="year" required>
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>
            </div>

            <div>
                <label>Phone</label>
                <input type="tel" id="phone" required>
            </div>

            <div>
                <label>Email</label>
                <input type="email" id="email" required>
            </div>

            <div>
                <label>Address</label>
                <textarea id="address" required></textarea>
            </div>

        </div>

        <button type="submit" id="saveButton">Add Student</button>

        <button type="button" onclick="resetForm()">
            Cancel
        </button>

        <p id="message"></p>
    </form>
</section>

<section class="box" id="records">
    <h2>Student Records</h2>

    <input id="search"
        placeholder="Search by name or roll number">

    <div class="table-scroll">
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody id="studentTable">
                <tr><td colspan="10">Loading...</td></tr>
            </tbody>
        </table>
    </div>
</section>

</div>

<footer>
    Student Management System
</footer>

<script>
const form = document.getElementById("studentForm");
const message = document.getElementById("message");

let allStudents = [];

async function api(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    let data;

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error("Invalid response. Check server URL.");
    }

    if (!response.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

function showMessage(text, success = true) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

// LOAD STUDENTS
async function loadStudents() {
    try {
        allStudents = await api("/api/students");
        displayStudents(allStudents);

        document.getElementById("total").textContent =
            allStudents.length;

    } catch(error) {
        document.getElementById("studentTable").innerHTML =
            "<tr><td colspan='10'>" + error.message + "</td></tr>";

        showMessage(error.message, false);
    }
}

// DISPLAY STUDENTS
function displayStudents(students) {
    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    if (students.length === 0) {
        table.innerHTML =
            "<tr><td colspan='10'>No Students Found</td></tr>";
        return;
    }

    students.forEach(s => {
        const row = document.createElement("tr");

        [
            s.student_id, s.roll_no, s.student_name,
            s.gender, s.branch, s.year, s.phone,
            s.email, s.address
        ].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value ?? "";
            row.appendChild(td);
        });

        const actions = document.createElement("td");

        const edit = document.createElement("button");
        edit.textContent = "Edit";
        edit.className = "edit";
        edit.type = "button";
        edit.onclick = () => editStudent(s.student_id);

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.className = "delete";
        del.type = "button";
        del.onclick = () => deleteStudent(s.student_id);

        actions.append(edit, del);
        row.appendChild(actions);

        table.appendChild(row);
    });
}

// ADD OR UPDATE
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("student_id").value;

    const student = {
        roll_no: document.getElementById("roll_no").value.trim(),
        student_name: document.getElementById("student_name").value.trim(),
        gender: document.getElementById("gender").value,
        branch: document.getElementById("branch").value,
        year: document.getElementById("year").value,
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim()
    };

    try {
        const result = await api(
            id ? "/api/students/" + id : "/api/students",
            {
                method: id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        showMessage(result.message);
        resetForm();
        loadStudents();

    } catch(error) {
        showMessage(error.message, false);
    }
});

// EDIT
function editStudent(id) {
    const s = allStudents.find(
        item => Number(item.student_id) === Number(id)
    );

    if (!s) return;

    document.getElementById("student_id").value = s.student_id;
    document.getElementById("roll_no").value = s.roll_no;
    document.getElementById("student_name").value = s.student_name;
    document.getElementById("gender").value = s.gender;
    document.getElementById("branch").value = s.branch;
    document.getElementById("year").value = s.year;
    document.getElementById("phone").value = s.phone;
    document.getElementById("email").value = s.email;
    document.getElementById("address").value = s.address;

    document.getElementById("formTitle").textContent =
        "Update Student";

    document.getElementById("saveButton").textContent =
        "Update Student";

    document.getElementById("form").scrollIntoView({
        behavior: "smooth"
    });
}

// DELETE
async function deleteStudent(id) {
    if (!confirm("Do you want to delete this student?")) return;

    try {
        const result = await api("/api/students/" + id, {
            method: "DELETE"
        });

        showMessage(result.message);
        loadStudents();

    } catch(error) {
        showMessage(error.message, false);
    }
}

// RESET
function resetForm() {
    form.reset();

    document.getElementById("student_id").value = "";
    document.getElementById("formTitle").textContent =
        "Add New Student";

    document.getElementById("saveButton").textContent =
        "Add Student";
}

// SEARCH
document.getElementById("search").addEventListener("input", function() {
    const key = this.value.toLowerCase();

    const filtered = allStudents.filter(s =>
        String(s.student_name).toLowerCase().includes(key) ||
        String(s.roll_no).toLowerCase().includes(key)
    );

    displayStudents(filtered);
});

loadStudents();
</script>

</body>
</html>
`);
});

// GET ALL STUDENTS
app.get("/api/students", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM students ORDER BY student_id DESC"
        );

        res.json(rows);

    } catch(error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

// ADD STUDENT
app.post("/api/students", async (req, res) => {
    try {
        const {
            roll_no, student_name, gender, branch,
            year, phone, email, address
        } = req.body;

        if (!roll_no || !student_name || !gender || !branch ||
            !year || !phone || !email || !address) {
            return res.status(400).json({
                error: "Please fill all fields"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO students
            (roll_no, student_name, gender, branch, year,
             phone, email, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                roll_no, student_name, gender, branch,
                Number(year), phone, email, address
            ]
        );

        res.status(201).json({
            message: "Student Added Successfully!",
            studentId: result.insertId
        });

    } catch(error) {
        console.error("ADD ERROR:", error);

        res.status(500).json({
            error: error.code === "ER_DUP_ENTRY"
                ? "Roll number already exists"
                : error.message
        });
    }
});

// UPDATE STUDENT
app.put("/api/students/:id", async (req, res) => {
    try {
        const {
            roll_no, student_name, gender, branch,
            year, phone, email, address
        } = req.body;

        const [result] = await db.execute(
            `UPDATE students SET
            roll_no=?, student_name=?, gender=?, branch=?,
            year=?, phone=?, email=?, address=?
            WHERE student_id=?`,
            [
                roll_no, student_name, gender, branch,
                Number(year), phone, email, address,
                req.params.id
            ]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({message: "Student Updated Successfully!"});

    } catch(error) {
        res.status(500).json({error: error.message});
    }
});

// DELETE STUDENT
app.delete("/api/students/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM students WHERE student_id=?",
            [req.params.id]
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({message: "Student Deleted Successfully!"});

    } catch(error) {
        res.status(500).json({error: error.message});
    }
});

// START SERVER
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                "Website running at http://localhost:" + PORT
            );
        });

    } catch(error) {
        console.error("Server Error:", error.message);
        process.exit(1);
    }
}

startServer();
