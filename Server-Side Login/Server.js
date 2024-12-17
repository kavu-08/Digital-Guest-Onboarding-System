// server.js (add this code to your existing server setup)
const bcrypt = require('bcrypt'); // For password hashing
const User = require('./models/User'); // Assuming you have a User model

// Login route
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id; // Store user ID in session
        res.redirect('/admin/hotels'); // Redirect to hotels page
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});
