const mongoose = require('mongoose');
const Student = require('../models/Student');

// @desc    Get all students (or filter by search term)
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message,
    });
  }
};

// @desc    Get single student by ID or studentId
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }

    if (!student) {
      // Fallback search by custom studentId (case-insensitive)
      student = await Student.findOne({
        studentId: { $regex: `^${id}$`, $options: 'i' },
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student',
      error: error.message,
    });
  }
};

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Basic payload presence check
    if (!studentId || !name || !email || !department || semester === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: studentId, name, email, department, semester',
      });
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({
      studentId: studentId.trim().toUpperCase(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: `Student with ID '${studentId}' already exists`,
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester: Number(semester),
      contact: contact || 'N/A',
    });

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error creating student:', error.message);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'Field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value error: A student with this ${field} already exists`,
      });
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while adding student',
      error: error.message,
    });
  }
};

// @desc    Update an existing student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findById(id);
    }

    if (!student) {
      student = await Student.findOne({
        studentId: { $regex: `^${id}$`, $options: 'i' },
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' not found`,
      });
    }

    const { name, email, department, semester, contact } = req.body;

    if (name !== undefined) student.name = name;
    if (email !== undefined) student.email = email;
    if (department !== undefined) student.department = department;
    if (semester !== undefined) student.semester = Number(semester);
    if (contact !== undefined) student.contact = contact;

    const updatedStudent = await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate value conflict with another student record',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating student',
      error: error.message,
    });
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findByIdAndDelete(id);
    }

    if (!student) {
      student = await Student.findOneAndDelete({
        studentId: { $regex: `^${id}$`, $options: 'i' },
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
      },
    });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting student',
      error: error.message,
    });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
