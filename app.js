const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors'); // Add this line
// require('dotenv').config();
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require("./models/Leave");





const app = express()
const PORT = 8000

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.get('/about', (req, res) => {
  res.send('About route 🎉 ')
})



const jwtSecret =  'your_jwt_secret_key';

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'User registered successfully.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
});

// Login
router.post('/login', async (req, res) => {
                                                     
    const { email, password } = req.body;


    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with userId and token
        res.json({
            message: 'Login successful',
            userId: user._id,
            name : user.name,  // Include userId in the response
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
});


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ msg: 'User registered successfully.' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
});

// Login
router.post('/login', async (req, res) => {
                                                     
    const { email, password } = req.body;


    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send response with userId and token
        res.json({
            message: 'Login successful',
            userId: user._id,
            name : user.name,  // Include userId in the response
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server error.' });
    }
});



router.post('/adminlogin', async (req , res)=>{
    
    const {email , password} = req.body;

    try{
        const admin = await Admin.findOne({email});
        if(!admin){
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: 'Login successful',
            userId: admin._id,
            token  // Include userId in the response
        
        });


    }
    catch(error){
        console.log(error);
        res.status(500).json({ msg: 'Server error.' });
    }


});









router.post('/mark-attendance', async (req, res) => {
    const { uId,  aStatus  , userName } = req.body;  // Accept status and note from the request
    // console.log("\n\n\n\n\n\nHere is Req:" , req.body , "\n\n\n\n\n\n\n")
    // if (!userId) {
    //     return res.status(400).json({ message: 'User ID is required' });
    // }
    const today = new Date().setHours(0, 0, 0, 0);

    try {

      

        const attendance = new Attendance({
            userId : uId,
            date: today,
            name: userName,
            // status: status || 'Present',  // Default to 'Present' if status is not provided
           aStatus : aStatus
        });

        await attendance.save();

        res.status(200).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {




        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Attendance already marked for today' });
         }
        //   console.error(error);
      res.status(500).json({ message: 'Server error' });







    }
});




















app.get('/attendance/:userId', async (req, res) => {
    const { userId } = req.params;
    // console.log(req.params.userId);
    if(userId === "alltoday" ){

        try {
            // Get current date
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Midnight (start of the day)
            const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of the day
    
            // Find attendance records between startOfDay and endOfDay
            const todaysAttendance = await Attendance.find({
                date: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            });
    
            res.status(200).json(todaysAttendance);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching today\'s attendance', error });
        }

        
        
    }
    else{
        try {
            // Fetch all attendance records for the given userId
            const attendanceRecords = await Attendance.find({ userId }).sort({ date: -1 });
    
            if (attendanceRecords.length === 0) {
                return res.status(404).json({ message: 'No attendance records found for this user' });
            }
    
            res.status(200).json(attendanceRecords);
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            res.status(500).json({ message: 'Server error', error });
        }
    }

   
});





router.post('/leave' , async (req, res)=>{

    const {userId , reason , date , userName} = req.body;
    
//    let  user = `${userId}`;

    try{
        // console.log(userId , reason , date)
        const newLeave = new Leave({userId , date , reason , userName});
        await newLeave.save();
        
        res.status(200).json({message: "Leave Submitted."})

    }
    catch(error){
        res.status(505).json(error)
        console.log(error)
    }


});









router.get('/leave/:userId', async (req, res) => {
    const { userId } = req.params;
    // console.log(req.params.userId);

    try {
        // Fetch all attendance records for the given userId
        const leaveRecords = await Leave.find({ userId }).sort({ createdAt: -1 });

        if (leaveRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this user' });
        }

        res.status(200).json(leaveRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/pending-leave-requests', async (req, res) => {
    try {
      const pendingLeaves = await Leave.find({ leaveStatus: "pending" }).sort({createdAt : -1});  //.populate(User, 'name email');
      res.status(200).json(pendingLeaves);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });


router.put( '/leave/status'   ,async (req, res) => {
    
 
    try {
          // Receiving leaveId and new status from the request body
          const { leaveId, leaveUpdate } = req.body;

        // if (!['approved', 'rejected'].includes(leaveStatus)) {
        //     return res.status(400).json({ message: 'Invalid status' });
        // }

        const leaveRequest = await Leave.findById(leaveId);


        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leaveRequest.leaveStatus = leaveUpdate;  // Update status
        await leaveRequest.save();

        res.status(200).json({ message: `Leave request ${leaveUpdate} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
})  ;


router.get('/allusers/:userId' , async (req , res)=>{
    
    
try{ 
    const id = req.params.userId;
    //   const authAdmin = Admin.findById({adminUid});

      const admin = await Admin.findById(id);

      if (!admin) {
          return res.status(400).json({ msg: 'Invalid credentials.' });
      }



    //   if(!authAdmin){res.status(500).json({message: "authentication failed."})}
      const allUsers = await User.find().select('-password') ;
      res.status(200).json(allUsers );
    //   console.log('done');
}
catch(err){
    res.status(500).json({message: "server error" , err})
    // console.error("not done");
}

});








//   
// DELETE user by ID
router.delete('/deluser/:id', async (req, res) => {
    const { id } = req.params;
//    console.log(id);
    try {
        // Find and delete the user by ID
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
});
















app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})