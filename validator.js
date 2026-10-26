
function validateStudent(student) {
    const errors = [];

    const name = (student.name || "").trim();
    const email = (student.email || "").trim();
    const ageText = String(student.age || "").trim();
    const course = (student.course || "").trim();

    if (!/^[a-zA-Z ]{2,50}$/.test(name)) {
        errors.push("Name must contain 2–50 letters and spaces only.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Please enter a valid email address.");
    }

    if (!/^\d+$/.test(ageText) ||
        Number(ageText) < 16 ||
        Number(ageText) > 60) {
        errors.push("Age must be a whole number between 16 and 60.");
    }

    const allowedCourses = ["Computer Engineering", "IT", "Mechanical", "Civil"];

    if (!allowedCourses.includes(course)) {
        errors.push("Please select a valid course.");
    }

    return errors;
}

module.exports = { validateStudent };
