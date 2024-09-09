const mongoose = require('mongoose');
const User = require('../models/User');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        // type: String,
        ref: User,
        required: true
    },

    name:{
        type: String,
        required : true
    },


    date: {
        type: Date,
        // default: Date.now,  // Automatically set to current date and time
        required: true
    },
    aStatus: {
        type: String,
        // enum: ['Present', 'Absent', 'Late'],
        // default: 'Present'
    },

}, { 
    timestamps: true
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

