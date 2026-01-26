// Vercel Serverless Function - Register endpoint
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { firstName, lastName, email, referrerId, instagram } = req.body;

        if (!firstName || !lastName || !email || !instagram) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get all users from KV
        const users = await kv.get('users') || [];

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate unique ID for the new user
        const userId = Math.random().toString(36).substring(2, 10);

        // Track referral
        if (referrerId) {
            const referrerIndex = users.findIndex(u => u.id === referrerId);
            if (referrerIndex !== -1) {
                users[referrerIndex].referrals = (users[referrerIndex].referrals || 0) + 1;
            }
        }

        const newUser = {
            id: userId,
            firstName,
            lastName,
            email,
            instagram, // Add Instagram handle to the user object
            referrerId: referrerId || null,
            referrals: 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await kv.set('users', users);

        res.json({
            success: true,
            userId: userId,
            downloadLink: "https://apps.apple.com/us/app/uplate/id6752828206",
            referralLink: `https://u-plate-referral-competition.vercel.app/?ref=${userId}`
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
}
