document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('student-form');
    const studentList = document.getElementById('student-list');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const formTitle = document.getElementById('form-title');
    const loading = document.getElementById('loading');
    const noData = document.getElementById('no-data');

    // Fetch and display students initially
    fetchStudents();

    // Form Submissions
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('student-id').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const major = document.getElementById('major').value;

        const payload = { name, email, major };

        if (id) {
            // Update mode
            await updateStudent(id, payload);
        } else {
            // Create mode
            await createStudent(payload);
        }
    });

    // Reset Form when Cancel is clicked
    cancelBtn.addEventListener('click', resetForm);

    async function fetchStudents() {
        loading.classList.remove('hidden');
        noData.classList.add('hidden');
        studentList.innerHTML = '';

        try {
            const response = await fetch('/api/students');
            const data = await response.json();

            loading.classList.add('hidden');

            if (data.length === 0) {
                noData.classList.remove('hidden');
            } else {
                data.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${student.id}</td>
                        <td><strong>${student.name}</strong></td>
                        <td>${student.email}</td>
                        <td>${student.major}</td>
                        <td>
                            <button class="btn btn-edit" onclick="editStudent(${student.id}, '${student.name}', '${student.email}', '${student.major}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
                        </td>
                    `;
                    studentList.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            loading.innerText = 'Failed to load students. Check console.';
        }
    }

    async function createStudent(payload) {
        try {
            const response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                resetForm();
                fetchStudents();
            } else {
                alert('Error creating student');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function updateStudent(id, payload) {
        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                resetForm();
                fetchStudents();
            } else {
                alert('Error updating student');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    window.editStudent = (id, name, email, major) => {
        document.getElementById('student-id').value = id;
        document.getElementById('name').value = name;
        document.getElementById('email').value = email;
        document.getElementById('major').value = major;

        formTitle.innerText = `Edit Student #${id}`;
        submitBtn.innerText = 'Update Student';
        cancelBtn.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteStudent = async (id) => {
        if (!confirm(`Are you sure you want to delete student #${id}?`)) return;

        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchStudents();
            } else {
                alert('Error deleting student');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function resetForm() {
        studentForm.reset();
        document.getElementById('student-id').value = '';
        formTitle.innerText = 'Add New Student';
        submitBtn.innerText = 'Add Student';
        cancelBtn.classList.add('hidden');
    }
});
