const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Escape user-controlled text before inserting it into HTML
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Reusable result page
function resultPage(title, message, errors = [], success = false) {
    const errorList = errors.length
        ? `<ul>${errors.map(error => `<li>${escapeHtml(error)}</li>`).join("")}</ul>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <main class="card result">
        <div class="icon">${success ? "✓" : "!"}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        ${errorList}
        <a class="button" href="/">Back to Registration</a>
        <p class="note">Validation performed by the ExpressJS server.</p>
    </main>
</body>
</html>`;
}

// GET route: display the registration form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST route: validate form data on the server
app.post("/register", (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string"
        ? req.body.email.trim()
        : "";
    const ageText = typeof req.body.age === "string" ? req.body.age.trim() : "";
    const password = typeof req.body.password === "string"
        ? req.body.password
        : "";

    const errors = [];

    // Name validation
    if (name.length < 3 || name.length > 50) {
        errors.push("Name must contain between 3 and 50 characters.");
    } else if (!/^[\p{L}\p{M} ]+$/u.test(name)) {
        errors.push("Name can contain only letters and spaces.");
    }

    // Email validation
    if (
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        errors.push("Please enter a valid email address.");
    }

    // Age validation
    const age = Number(ageText);
    if (
        ageText === "" ||
        !/^\d+$/.test(ageText) ||
        !Number.isSafeInteger(age) ||
        age < 16 ||
        age > 100
    ) {
        errors.push("Age must be a whole number between 16 and 100.");
    }

    // Password validation
    if (password.length < 8 || password.length > 128) {
        errors.push("Password must be between 8 and 128 characters.");
    } else if (
        !/[A-Z]/.test(password) ||
        !/[a-z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        errors.push(
            "Password must contain an uppercase letter, a lowercase letter, and a number."
        );
    }

    // Return validation errors
    if (errors.length > 0) {
        return res.status(400).send(
            resultPage(
                "Validation Failed",
                "Please correct the following errors:",
                errors
            )
        );
    }

    // Successful validation: do not store or display the password
    return res.status(200).send(
        resultPage(
            "Registration Successful!",
            `Welcome, ${name}! Your registration details passed server-side validation.`,
            [],
            true
        )
    );
});

// Handle unsupported routes
app.use((req, res) => {
    res.status(404).send(
        resultPage("Page Not Found", "The requested page does not exist.")
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("Press Ctrl+C to stop the server.");
});
