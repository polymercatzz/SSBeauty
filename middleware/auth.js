// middleware/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Middleware to check if user is employee/staff
const isEmployee = (req, res, next) => {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Employee only.' });
    }
    next();
};

// Middleware to check if user is customer
const isCustomer = (req, res, next) => {
    if (req.user.role !== 'customer' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Customer only.' });
    }
    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isEmployee,
    isCustomer,
    JWT_SECRET
};
