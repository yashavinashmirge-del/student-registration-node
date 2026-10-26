
const express = require("express");
const { validateStudent } = require("./validator");

const app = express();
const PORT = 3000;

// Parse form data submitted using POST
app.use(express.urlencoded({ extended: false }));

// Escape user input before displaying it in HTML
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Reusable HTML page
function page(content) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Student Registration</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f1f5f9;
                margin: 0;
                padding: 30px 15px;
            }
            .container {
                max-width: 480px;
                margin: auto;
                background: white;
                padding: 28px;
                border-radius: 12px;
                box-shadow: 0 4px 18px #0001;
            }
            h1 { color: #1e3a8a; text-align: center; }
            label { display: block; margin-top: 16px; }
            input, select {
                width: 100%;
                box-sizing: border-box;
                padding: 11px;
                margin-top: 7px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
            }
            button {
                width: 100%;
                margin-top: 22px;
                padding: 12px;
                border: none;
                border-radius: 6px;
                background: #2563eb;
                color: white;
                cursor: pointer;
                font-size: 16px;
            }
            .success {
                background: #dcfce7;
                color: #166534;
                padding: 14px;
                border-radius: 6px;
            }
            .error {
                background: #fee2e2;
                color: #991b1b;
                padding: 14px;
                border-radius: 6px;
            }
            a { color: #2563eb; }
        </style>
    </head>
    <body>
        <main class="container">
            <h1>Student Registration</h1>
            ${content}
        </main>
    </body>
    </html>`;
}

// GET: Display the registration form
app.get("/", (req, res) => {
    res.send(page(`
        <p>Enter your details to register.</p>
        <form action="/register" method="POST">
            <label for="name">Full Name</label>
            <input id="name" name="name" required
                   minlength="2" maxlength="50"
                   placeholder="Enter your full name">

            <label for="email">Email Address</label>
            <input id="email" name="email" type="email" required
                   placeholder="student@example.com">

            <label for="age">Age</label>
            <input id="age" name="age" type="number"
                   min="16" max="60" step="1" required>

            <label for="course">Course</label>
            <select id="course" name="course" required>
                <option value="">Select a course</option>
                <option>Computer Engineering</option>
                <option>IT</option>
                <option>Mechanical</option>
                <option>Civil</option>
            </select>

            <button type="submit">Register Student</button>
        </form>
    `));
});

// POST: Validate and process submitted form data
app.post("/register", (req, res) => {
    const student = {
        name: req.body.name || "",
        email: req.body.email || "",
        age: req.body.age || "",
        course: req.body.course || ""
    };

    const errors = validateStudent(student);

    if (errors.length > 0) {
        const errorList = errors
            .map(error => `<li>${escapeHtml(error)}</li>`)
            .join("");

        return res.status(400).send(page(`
            <div class="error">
                <strong>Registration failed!</strong>
                <ul>${errorList}</ul>
            </div>
            <p><a href="/">Return to the form</a></p>
        `));
    }

    res.status(200).send(page(`
        <div class="success">
            <h2>Registration Successful!</h2>
            <p>Your details have passed server-side validation.</p>
        </div>
        <h3>Student Details</h3>
        <p><strong>Name:</strong> ${escapeHtml(student.name.trim())}</p>
        <p><strong>Email:</strong> ${escapeHtml(student.email.trim())}</p>
        <p><strong>Age:</strong> ${escapeHtml(student.age.trim())}</p>
        <p><strong>Course:</strong> ${escapeHtml(student.course)}</p>
        <p><a href="/">Register another student</a></p>
    `));
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send(page(`
        <div class="error">Page not found (404).</div>
        <p><a href="/">Go to registration</a></p>
    `));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
