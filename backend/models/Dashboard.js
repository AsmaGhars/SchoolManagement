const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DashboardSchema = new Schema({
    enrollments: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    successRate: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100
    },
    attendanceRate: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100
    }
});

const Dashboard = mongoose.model('Dashboard', DashboardSchema);

module.exports = Dashboard;
