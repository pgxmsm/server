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
      res.status(500).json({ message: 'Server error' });}

        })


















app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
})