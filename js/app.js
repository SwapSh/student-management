// This file contains the JavaScript code that handles user interactions, form submissions, and dynamic updates to the student data displayed on the webpage.

(() => {
  const LS_KEY = 'students_v1';
  let students = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  let editingIndex = null;
  const maxCourses = 10;

  // elements
  const form = document.getElementById('student-form');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const coursesEl = document.getElementById('courses');
  const courseInput = document.getElementById('course-input');
  const addCourseBtn = document.getElementById('add-course');
  const studentList = document.getElementById('student-list');
  const emptyMsg = document.getElementById('empty-msg');
  const totalCount = document.getElementById('total-count');
  const formTitle = document.getElementById('form-title');
  const globalSearch = document.getElementById('global-search');
  const filterRoll = document.getElementById('filter-roll');
  const filterName = document.getElementById('filter-name');
  const filterCourse = document.getElementById('filter-course');

  const fields = ['first_name','last_name','roll_number','cgpa','address','phone_number','email','academic_record'];

  function save() { localStorage.setItem(LS_KEY, JSON.stringify(students)); render(); }

  function getFormData() {
    const data = {};
    fields.forEach(f => {
      const el = document.getElementById(f);
      data[f] = el ? (el.type === 'number' ? (el.value ? Number(el.value) : '') : el.value.trim()) : '';
    });
    // courses
    const tags = Array.from(coursesEl.querySelectorAll('.tag')).map(t => Number(t.dataset.id));
    data.courses = tags;
    return data;
  }

  function setFormData(obj) {
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (!el) return;
      el.value = obj[f] !== undefined ? obj[f] : '';
    });
    // clear courses display
    coursesEl.innerHTML = '';
    (obj.courses || []).slice(0, maxCourses).forEach(addCourseTag);
  }

  function resetForm() {
    form.reset();
    coursesEl.innerHTML = '';
    editingIndex = null;
    saveBtn.textContent = 'Add Student';
    formTitle.textContent = 'Add Student';
  }

  function addCourseTag(id) {
    if (coursesEl.querySelectorAll('.tag').length >= maxCourses) return;
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.dataset.id = id;
    tag.innerHTML = `<span>#${id}</span><button type="button" title="remove">✕</button>`;
    tag.querySelector('button').addEventListener('click', () => { tag.remove(); });
    coursesEl.appendChild(tag);
  }

  addCourseBtn.addEventListener('click', () => {
    const v = courseInput.value.trim();
    if (!v) return;
    const id = Number(v);
    if (!Number.isFinite(id)) return;
    // prevent duplicate
    const existing = Array.from(coursesEl.querySelectorAll('.tag')).some(t => Number(t.dataset.id) === id);
    if (existing) { courseInput.value = ''; return; }
    addCourseTag(id);
    courseInput.value = '';
  });

  // allow Enter in course input
  courseInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCourseBtn.click(); }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    // basic validation
    if (!data.first_name || !data.last_name || !data.roll_number) {
      alert('Please fill first name, last name and roll number.');
      return;
    }
    // cgpa range validation (0..10)
    if (data.cgpa !== null && (data.cgpa < 0 || data.cgpa > 10)) {
      alert('CGPA must be between 0 and 10.');
      return;
    }
    // duplicate roll check
    const dupIndex = students.findIndex((s, i) => s.roll_number === Number(data.roll_number) && i !== editingIndex);
    if (dupIndex !== -1) { alert('A student with that roll number already exists.'); return; }

    if (editingIndex === null) {
      students.push(data);
      alert('Student added.');
    } else {
      students[editingIndex] = data;
      alert('Student updated.');
    }
    save();
    resetForm();
  });

  resetBtn.addEventListener('click', resetForm);

  function render() {
    // filters
    const q = globalSearch.value.trim().toLowerCase();
    const rollFilter = filterRoll.value.trim();
    const nameFilter = filterName.value.trim().toLowerCase();
    const courseFilter = filterCourse.value.trim();

    const filtered = students.filter(s => {
      if (rollFilter && String(s.roll_number) !== rollFilter) return false;
      if (nameFilter && (s.first_name.toLowerCase().indexOf(nameFilter) === -1)) return false;
      if (courseFilter && !s.courses.some(c => String(c) === courseFilter)) return false;
      if (!q) return true;
      // global q checks roll, name, course
      return String(s.roll_number).includes(q) ||
             s.first_name.toLowerCase().includes(q) ||
             s.last_name.toLowerCase().includes(q) ||
             s.courses.some(c => String(c).includes(q));
    });

    totalCount.textContent = students.length;

    if (!filtered.length) {
      studentList.innerHTML = '';
      emptyMsg.style.display = students.length ? 'none' : 'block';
      if (students.length) {
        emptyMsg.style.display = 'none';
        studentList.innerHTML = '<div class="empty">No matching students.</div>';
      }
      return;
    }
    emptyMsg.style.display = 'none';

    // build table
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Roll</th><th>Name</th><th>CGPA</th><th>Courses</th><th>Phone / Email</th><th>Actions</th>
        </tr>
      </thead>
    `;
    const tbody = document.createElement('tbody');
    filtered.forEach((s, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.roll_number}</td>
        <td><strong>${escapeHtml(s.first_name)} ${escapeHtml(s.last_name)}</strong><div class="muted" style="color:var(--muted);font-size:12px">${escapeHtml(s.address || '')}</div></td>
        <td>${(s.cgpa === null || s.cgpa === undefined || s.cgpa === '') ? '' : Number(s.cgpa).toFixed(2)}</td>
        <td>${(s.courses || []).slice(0,10).map(c => `<span class="tag" style="display:inline-block;margin-right:6px">${c}</span>`).join('')}</td>
        <td>${escapeHtml(s.phone_number || '')}<br/><small style="color:var(--muted)">${escapeHtml(s.email || '')}</small></td>
        <td class="actions">
          <button class="edit" data-i="${i}">Edit</button>
          <button class="delete" data-i="${i}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    studentList.innerHTML = '';
    studentList.appendChild(table);

    // hook action buttons
    studentList.querySelectorAll('button.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        editingIndex = i;
        setFormData(students[i]);
        saveBtn.textContent = 'Update Student';
        formTitle.textContent = 'Edit Student';
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
    studentList.querySelectorAll('button.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (!confirm('Delete student?')) return;
        students.splice(i,1);
        save();
      });
    });
  }

  // escape to avoid simple injection in table
  function escapeHtml(s){
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // quick helpers: load sample if empty (optional)
  if (!students.length) {
    // prefill example (comment out if unwanted)
    students.push({
      first_name: 'Alice', last_name: 'Khan', roll_number: 101, cgpa: 3.7,
      courses: [11,22], address: '123 College Lane', phone_number: '555-0101', email: 'alice@example.com', academic_record: 'Good'
    });
    save();
  }

  // filters and search
  [globalSearch, filterRoll, filterName, filterCourse].forEach(el => {
    el.addEventListener('input', () => render());
  });

  // initial render
  render();
  // expose reset for console if needed
  window.__sms = { students, save, render, resetForm };

})();