// API Client for Three-Tier Architecture
// Connects Netlify Presentation Layer to Render Application Layer

const API = (() => {
  // Configured Render URL for this deployment
  const DEFAULT_RENDER_URL = 'https://three-tier-student-management.onrender.com';
  const LOCAL_URL = 'http://localhost:5000';

  const getBaseUrl = () => {
    const saved = localStorage.getItem('sims_backend_url');
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return LOCAL_URL;
    }
    return DEFAULT_RENDER_URL;
  };

  const setBaseUrl = (url) => {
    if (!url) {
      localStorage.removeItem('sims_backend_url');
    } else {
      localStorage.setItem('sims_backend_url', url.trim().replace(/\/+$/, ''));
    }
  };

  const request = async (endpoint, options = {}, retries = 1) => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const controller = new AbortController();
      // Render free tier can take up to 45s to wake up on cold boot
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Render backend is waking up from sleep mode (cold start). Please retry in 20-30 seconds.');
      }
      console.error(`API Request failed for [${config.method || 'GET'}] ${url}:`, error);
      throw error;
    }
  };

  return {
    getBaseUrl,
    setBaseUrl,

    // Health check
    checkHealth: async () => {
      return request('/api/health');
    },

    // Fetch all students (with optional query filters)
    getStudents: async (search = '', department = '') => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/students${queryString}`);
    },

    // Fetch single student
    getStudentById: async (id) => {
      return request(`/api/students/${encodeURIComponent(id)}`);
    },

    // Create student
    createStudent: async (studentData) => {
      return request('/api/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    },

    // Update student
    updateStudent: async (id, studentData) => {
      return request(`/api/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      });
    },

    // Delete student
    deleteStudent: async (id) => {
      return request(`/api/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };
})();
