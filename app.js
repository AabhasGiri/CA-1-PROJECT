// Student records are saved in this browser.
const STORAGE_KEY = "languageSchoolStudents";

const sampleStudents = [
    { id: "1", name: "Aarav Sharma", email: "aarav@example.com", course: "English", status: "Active" },
    { id: "2", name: "Priya Verma", email: "priya@example.com", course: "IELTS", status: "Active" },
    { id: "3", name: "Rohan Gupta", email: "rohan@example.com", course: "German", status: "Active" },
    { id: "4", name: "Neha Singh", email: "neha@example.com", course: "French", status: "Inactive" }
];

function loadStudents() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) return sampleStudents.slice();

        const data = JSON.parse(saved);
        if (!Array.isArray(data)) return sampleStudents.slice();

        return data.filter(s => s && typeof s === "object").map((s, i) => ({
            id: String(s.id || Date.now() + i),
            name: String(s.name || ""),
            email: String(s.email || ""),
            course: String(s.course || ""),
            status: s.status === "Inactive" ? "Inactive" : "Active"
        }));
    } catch (error) {
        return sampleStudents.slice();
    }
}

let students = loadStudents();

function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        return true;
    } catch (error) {
        return false;
    }
}

function updateDashboard() {
    const studentCount = document.getElementById("studentCount");
    const courseCount = document.getElementById("courseCount");
    const instructorCount = document.getElementById("instructorCount");

    if (studentCount) studentCount.textContent = students.length;
    if (courseCount) courseCount.textContent = "4";
    if (instructorCount) instructorCount.textContent = "4";
}

function showStudents(searchText = "") {
    const table = document.getElementById("studentTableBody");
    if (!table) return;

    table.innerHTML = "";
    const search = searchText.trim().toLowerCase();

    const results = students.filter(student =>
        [student.name, student.email, student.course, student.status]
            .some(value => value.toLowerCase().includes(search))
    );

    results.forEach((student, index) => {
        const row = document.createElement("tr");
        [index + 1, student.name, student.email, student.course, student.status].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        actionCell.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editStudent(student.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        table.appendChild(row);
    });

    const emptyMessage = document.getElementById("emptyStudentMessage");
    if (emptyMessage) emptyMessage.hidden = results.length !== 0;

    updateDashboard();
}

function resetStudentForm() {
    const form = document.getElementById("studentForm");
    if (!form) return;

    form.reset();
    document.getElementById("studentId").value = "";
    document.getElementById("student-form-heading").textContent = "Add a Student";
    document.getElementById("saveStudentButton").textContent = "Add Student";
    document.getElementById("cancelEditButton").hidden = true;
}

function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;

    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentCourse").value = student.course;
    document.getElementById("studentStatus").value = student.status;
    document.getElementById("student-form-heading").textContent = "Edit Student";
    document.getElementById("saveStudentButton").textContent = "Update Student";
    document.getElementById("cancelEditButton").hidden = false;
    document.getElementById("studentMessage").textContent = "Edit the details and click Update Student.";
}

function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student || !confirm("Delete " + student.name + "?")) return;

    students = students.filter(s => s.id !== id);
    const saved = saveStudents();

    if (document.getElementById("studentId").value === id) resetStudentForm();
    showStudents(document.getElementById("studentSearch").value);

    document.getElementById("studentMessage").textContent =
        saved ? "Student deleted successfully." : "Deleted for this session, but browser storage is unavailable.";
}

document.addEventListener("DOMContentLoaded", () => {
    // The dashboard now loads counts even when the Students page is not open.
    updateDashboard();

    const form = document.getElementById("studentForm");
    if (form) {
        showStudents();

        form.addEventListener("submit", event => {
            event.preventDefault();

            const id = document.getElementById("studentId").value;
            const name = document.getElementById("studentName").value.trim();
            const email = document.getElementById("studentEmail").value.trim();
            const course = document.getElementById("studentCourse").value;
            const status = document.getElementById("studentStatus").value;
            const message = document.getElementById("studentMessage");

            if (!name || !email || !course) {
                message.textContent = "Please complete all fields.";
                return;
            }

            const duplicate = students.some(s =>
                s.email.toLowerCase() === email.toLowerCase() && s.id !== id
            );
            if (duplicate) {
                message.textContent = "This email address is already registered.";
                return;
            }

            if (id) {
                const student = students.find(s => s.id === id);
                if (!student) {
                    message.textContent = "Student record not found. Please try again.";
                    return;
                }
                Object.assign(student, { name, email, course, status });
            } else {
                students.push({ id: Date.now().toString(), name, email, course, status });
            }

            const saved = saveStudents();
            message.textContent = id ? "Student updated successfully." : "Student added successfully.";
            if (!saved) message.textContent += " Note: browser storage is unavailable.";

            resetStudentForm();

            // Clear old search text so the newly added/updated student is visible in the table.
            const search = document.getElementById("studentSearch");
            search.value = "";
            showStudents();
        });

        document.getElementById("studentSearch").addEventListener("input", function () {
            showStudents(this.value);
        });

        document.getElementById("cancelEditButton").addEventListener("click", () => {
            resetStudentForm();
            document.getElementById("studentMessage").textContent = "";
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", event => {
            event.preventDefault();
            const name = document.getElementById("contactName").value.trim();
            document.getElementById("contactFeedback").textContent =
                "Thank you, " + name + ". Your message has been checked.";
            contactForm.reset();
        });
    }
});
