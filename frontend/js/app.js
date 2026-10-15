// Application Logic for Student Information Management System

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const studentsTableBody = document.getElementById('studentsTableBody');
  const recordCountBadge = document.getElementById('recordCountBadge');
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const departmentFilter = document.getElementById('departmentFilter');
  const refreshBtn = document.getElementById('refreshBtn');

  // Stats
  const statTotalStudents = document.getElementById('statTotalStudents');
  const statDepartments = document.getElementById('statDepartments');
  const statAvgSemester = document.getElementById('statAvgSemester');
  const statApiHealth = document.getElementById('statApiHealth');
  const backendPill = document.getElementById('backendPill');
  const backendStatusText = document.getElementById('backendStatusText');

  // Modals & Triggers
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const emptyAddBtn = document.getElementById('emptyAddBtn');
  const addModal = document.getElementById('addModal');
  const editModal = document.getElementById('editModal');
  const deleteModal = document.getElementById('deleteModal');
  const configModal = document.getElementById('configModal');
  const apiConfigBtn = document.getElementById('apiConfigBtn');

  // Forms
  const addStudentForm = document.getElementById('addStudentForm');
  const editStudentForm = document.getElementById('editStudentForm');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const backendUrlInput = document.getElementById('backendUrlInput');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const testConnectionBtn = document.getElementById('testConnectionBtn');

  // Modal Closers
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      closeModal(document.getElementById(targetId));
    });
  });

  // State
  let currentStudents = [];
  let deleteTargetId = null;
  let searchDebounceTimeout = null;

  // Toast Notification System
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check text-success';
    if (type === 'error') icon = 'fa-triangle-exclamation text-danger';
    if (type === 'warning') icon = 'fa-circle-exclamation text-warning';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Modal Helpers
  function openModal(modal) {
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  // Check Backend Health
  async function verifyBackendHealth() {
    try {
      statApiHealth.textContent = 'Checking...';
      const health = await API.checkHealth();
      if (health && health.status === 'healthy') {
        statApiHealth.textContent = 'Online (Render)';
        statApiHealth.style.color = 'var(--success)';
        backendStatusText.textContent = 'Render API (Online)';
        backendPill.querySelector('.dot').style.backgroundColor = 'var(--success)';
      }
    } catch (err) {
      statApiHealth.textContent = 'Disconnected';
      statApiHealth.style.color = 'var(--danger)';
      backendStatusText.textContent = 'Render API (Offline)';
      backendPill.querySelector('.dot').style.backgroundColor = 'var(--danger)';
    }
  }

  // Load & Render Students
  async function loadStudents() {
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    studentsTableBody.innerHTML = '';

    const searchTerm = searchInput.value.trim();
    const departmentTerm = departmentFilter.value;

    try {
      const res = await API.getStudents(searchTerm, departmentTerm);
      currentStudents = res.data || [];
      renderTable(currentStudents);
      updateStats(currentStudents);
      verifyBackendHealth();
    } catch (err) {
      showToast(err.message || 'Failed to load students from backend', 'error');
      renderTable([]);
    } finally {
      loadingState.style.display = 'none';
    }
  }

  // Render Table
  function renderTable(students) {
    studentsTableBody.innerHTML = '';
    recordCountBadge.textContent = `${students.length} record${students.length === 1 ? '' : 's'}`;

    if (students.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    students.forEach((student) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="id-badge">${escapeHtml(student.studentId)}</span></td>
        <td>
          <strong>${escapeHtml(student.name)}</strong>
        </td>
        <td>
          <a href="mailto:${escapeHtml(student.email)}" class="text-muted small">${escapeHtml(student.email)}</a>
        </td>
        <td><span class="dept-pill">${escapeHtml(student.department)}</span></td>
        <td><span class="sem-badge">Sem ${escapeHtml(student.semester)}</span></td>
        <td><span class="small">${escapeHtml(student.contact || 'N/A')}</span></td>
        <td class="text-right">
          <div class="action-buttons">
            <button class="action-btn edit-btn" data-id="${student._id}" title="Edit Student">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="action-btn delete-btn" data-id="${student._id}" data-name="${escapeHtml(student.name)}" data-studentid="${escapeHtml(student.studentId)}" title="Delete Student">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      `;

      // Attach button listeners
      const editBtn = tr.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => openEditModal(student));

      const delBtn = tr.querySelector('.delete-btn');
      delBtn.addEventListener('click', () => {
        deleteTargetId = student._id || student.studentId;
        document.getElementById('deleteStudentName').textContent = student.name;
        document.getElementById('deleteStudentId').textContent = student.studentId;
        openModal(deleteModal);
      });

      studentsTableBody.appendChild(tr);
    });
  }

  // Update Stats Dashboard
  function updateStats(students) {
    statTotalStudents.textContent = students.length;

    const uniqueDepts = new Set(students.map((s) => s.department).filter(Boolean));
    statDepartments.textContent = uniqueDepts.size;

    if (students.length > 0) {
      const totalSem = students.reduce((acc, s) => acc + (Number(s.semester) || 0), 0);
      statAvgSemester.textContent = (totalSem / students.length).toFixed(1);
    } else {
      statAvgSemester.textContent = '-';
    }
  }

  // Open Edit Modal
  function openEditModal(student) {
    document.getElementById('editDocId').value = student._id || student.studentId;
    document.getElementById('editStudentId').value = student.studentId;
    document.getElementById('editName').value = student.name;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editDepartment').value = student.department;
    document.getElementById('editSemester').value = student.semester;
    document.getElementById('editContact').value = student.contact || '';
    openModal(editModal);
  }

  // Event Listeners for Filters
  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(loadStudents, 350);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    loadStudents();
  });

  departmentFilter.addEventListener('change', loadStudents);
  refreshBtn.addEventListener('click', loadStudents);

  // Add Student Handler
  openAddModalBtn.addEventListener('click', () => {
    addStudentForm.reset();
    openModal(addModal);
  });

  emptyAddBtn.addEventListener('click', () => {
    addStudentForm.reset();
    openModal(addModal);
  });

  addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveAddBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';

    const payload = {
      studentId: document.getElementById('addStudentId').value.trim(),
      name: document.getElementById('addName').value.trim(),
      email: document.getElementById('addEmail').value.trim(),
      department: document.getElementById('addDepartment').value,
      semester: Number(document.getElementById('addSemester').value),
      contact: document.getElementById('addContact').value.trim(),
    };

    try {
      const res = await API.createStudent(payload);
      showToast(res.message || 'Student added successfully!', 'success');
      closeModal(addModal);
      addStudentForm.reset();
      loadStudents();
    } catch (err) {
      showToast(err.message || 'Failed to add student', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add Student';
    }
  });

  // Edit Student Handler
  editStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveEditBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

    const docId = document.getElementById('editDocId').value;
    const payload = {
      name: document.getElementById('editName').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      department: document.getElementById('editDepartment').value,
      semester: Number(document.getElementById('editSemester').value),
      contact: document.getElementById('editContact').value.trim(),
    };

    try {
      const res = await API.updateStudent(docId, payload);
      showToast(res.message || 'Student updated successfully!', 'success');
      closeModal(editModal);
      loadStudents();
    } catch (err) {
      showToast(err.message || 'Failed to update student', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Update Student';
    }
  });

  // Delete Student Handler
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!deleteTargetId) return;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

    try {
      const res = await API.deleteStudent(deleteTargetId);
      showToast(res.message || 'Student deleted successfully', 'success');
      closeModal(deleteModal);
      deleteTargetId = null;
      loadStudents();
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete';
    }
  });

  // API Config Modal Handlers
  apiConfigBtn.addEventListener('click', () => {
    backendUrlInput.value = API.getBaseUrl();
    openModal(configModal);
  });

  saveConfigBtn.addEventListener('click', () => {
    const newUrl = backendUrlInput.value.trim();
    API.setBaseUrl(newUrl);
    showToast('Backend URL updated successfully!', 'success');
    closeModal(configModal);
    loadStudents();
  });

  testConnectionBtn.addEventListener('click', async () => {
    const originalText = testConnectionBtn.innerHTML;
    testConnectionBtn.disabled = true;
    testConnectionBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';

    // Temporarily point to input value for test
    const testUrl = backendUrlInput.value.trim().replace(/\/+$/, '');
    try {
      const res = await fetch(`${testUrl}/api/health`);
      if (res.ok) {
        showToast('Connection Successful! Render API is responding.', 'success');
      } else {
        showToast(`Server returned HTTP ${res.status}`, 'warning');
      }
    } catch (err) {
      showToast(`Connection failed: Cannot reach ${testUrl}`, 'error');
    } finally {
      testConnectionBtn.disabled = false;
      testConnectionBtn.innerHTML = originalText;
    }
  });

  // Initial load
  loadStudents();
});
