const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_LOGIN_TOKEN);
        let user;
        
        switch (decoded.role) {
            case 'Admin':
                user = await Admin.findById(decoded._id);
                break;
            case 'Student':
                user = await Student.findById(decoded._id);
                break;
            case 'Teacher':
                user = await Teacher.findById(decoded._id);
                break;
            case 'Parent':
                user = await Parent.findById(decoded._id);
                break;
            default:
                return res.status(401).json({ message: 'Invalid role' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user;
        req.role = decoded.role; 

        if (decoded.role === 'Admin') {
            const isAdminRequestingOwnData = req.params.adminId && req.params.adminId === decoded._id.toString();
            if (isAdminRequestingOwnData || user.role === 'Admin') {
                return next();
            }
            return res.status(403).json({ message: 'Insufficient permissions to access or modify this data' });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed', error: error.message });
    }
};
module.exports = { authenticate };