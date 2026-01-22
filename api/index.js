const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = 'users.json';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Load or initialize data
let users = [];
if (fs.existsSync(DATA_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {
        console.error("Error reading data file:", e);
    }
}

// Save data helper
const saveData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

// Register endpoint
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, referrerId } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate unique ID for the new user (simple random string)
    const userId = Math.random().toString(36).substring(2, 10);

    // Track referral
    if (referrerId) {
        const referrer = users.find(u => u.id === referrerId);
        if (referrer) {
            referrer.referrals = (referrer.referrals || 0) + 1;
        }
    }

    const newUser = {
        id: userId,
        firstName,
        lastName,
        email,
        referrerId: referrerId || null,
        referrals: 0,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveData();

    res.json({
        success: true,
        userId: userId,
        downloadLink: "https://apps.apple.com/us/app/uplate/id6752828206",
        referralLink: `https://u-plate-referral-competition.vercel.app/?ref=${userId}`
    });
});

// Admin endpoint to see leaderboard (optional, for checking)
app.get('/api/leaderboard', (req, res) => {
    const sortedUsers = [...users].sort((a, b) => (b.referrals || 0) - (a.referrals || 0));
    res.json(sortedUsers.map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        referrals: u.referrals || 0
    })));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default function handler(req, res) {
    if (req.method === 'GET') {
        res.status(200).json({ message: 'API is working!' });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}