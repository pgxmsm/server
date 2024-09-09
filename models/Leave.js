const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({

    userId: {
        type : mongoose.Schema.Types.ObjectId,
        // type : String ,
        required :  true,
        // ref: 'User'
    },
 userName:{
       type: String,
       required : true 
 },

    date: {
        type: Date,
        required : true
    },
    
    reason: {
        type: String,
        required : true
    },

    leaveStatus:{
        type : String,
        // enum: ['pending', 'approved', 'rejected'],
        default : "pending"
    },
    



}, {
    timestamps :true
});


const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave ;
