// server.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.use(express.static('public')); // For serving static files

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotelDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Schemas
const hotelSchema = new mongoose.Schema({
    name: String,
    logo: String,
    address: String,
    qrCode: String
});

const guestSchema = new mongoose.Schema({
    hotelId: mongoose.Schema.Types.ObjectId,
    fullName: String,
    mobileNumber: String,
    address: String,
    purposeOfVisit: String,
    stayDates: { from: Date, to: Date },
    emailId: String,
    idProofNumber: String
});

const Hotel = mongoose.model('Hotel', hotelSchema);
const Guest = mongoose.model('Guest', guestSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});
const upload = multer({ storage: storage });

// Routes for Main Admin
app.get('/admin/hotels', async (req, res) => {
    const hotels = await Hotel.find();
    res.render('hotels', { hotels });
});

app.post('/add-hotel', upload.single('logo'), async (req, res) => {
    const { name, address } = req.body;
    const qrCode = await QRCode.toDataURL(`http://localhost:3000/hotel/${name}`);
    const newHotel = new Hotel({ name, logo: req.file.filename, address, qrCode });
    await newHotel.save();
    res.redirect('/admin/hotels');
});

// Route to display guest form
app.get('/hotel/:name', async (req, res) => {
    const hotel = await Hotel.findOne({ name: req.params.name });
    res.render('guest-form', { hotel });
});

// Route to handle guest form submission
app.post('/submit-guest', async (req, res) => {
    const { hotelId, fullName, mobileNumber, address, purposeOfVisit, stayDates, emailId, idProofNumber } = req.body;
    const newGuest = new Guest({ hotelId, fullName, mobileNumber, address, purposeOfVisit, stayDates, emailId, idProofNumber });
    await newGuest.save();
    res.render('thankyou');
});

// Routes for Guest Admin
app.get('/admin/guests/:hotelId', async (req, res) => {
    const guests = await Guest.find({ hotelId: req.params.hotelId });
    res.render('guests', { guests });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
