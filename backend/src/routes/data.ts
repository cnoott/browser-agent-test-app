import express from 'express';

const router = express.Router();

// Sample data for the table
const sampleTableData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 85000,
    startDate: '2022-03-15',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 72000,
    startDate: '2021-11-08',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    department: 'Sales',
    position: 'Sales Representative',
    salary: 55000,
    startDate: '2023-01-22',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    department: 'Engineering',
    position: 'DevOps Engineer',
    salary: 78000,
    startDate: '2022-07-10',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    department: 'HR',
    position: 'HR Specialist',
    salary: 58000,
    startDate: '2021-05-14',
    status: 'On Leave'
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 75000,
    startDate: '2022-12-01',
    status: 'Active'
  },
  {
    id: 7,
    name: 'Frank Castle',
    email: 'frank.castle@example.com',
    department: 'Security',
    position: 'Security Analyst',
    salary: 68000,
    startDate: '2023-02-28',
    status: 'Active'
  },
  {
    id: 8,
    name: 'Grace Kelly',
    email: 'grace.kelly@example.com',
    department: 'Design',
    position: 'UX Designer',
    salary: 70000,
    startDate: '2021-09-15',
    status: 'Active'
  },
  {
    id: 9,
    name: 'Henry Ford',
    email: 'henry.ford@example.com',
    department: 'Operations',
    position: 'Operations Manager',
    salary: 82000,
    startDate: '2020-04-03',
    status: 'Active'
  },
  {
    id: 10,
    name: 'Ivy Green',
    email: 'ivy.green@example.com',
    department: 'Finance',
    position: 'Financial Analyst',
    salary: 63000,
    startDate: '2022-08-17',
    status: 'Terminated'
  }
];

// GET /api/data/employees - Fetch employee data
router.get('/employees', (req, res) => {
  try {
    // Simulate some network delay for testing purposes
    setTimeout(() => {
      res.json({
        success: true,
        data: sampleTableData,
        total: sampleTableData.length,
        timestamp: new Date().toISOString()
      });
    }, 300);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee data'
    });
  }
});

// GET /api/data/employees/:id - Fetch specific employee
router.get('/employees/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const employee = sampleTableData.find(emp => emp.id === id);

    if (!employee) {
      res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
      return;
    }

    res.json({
      success: true,
      data: employee,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee'
    });
  }
});

export default router;
