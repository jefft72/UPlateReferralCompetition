// Vercel Serverless Function - Leaderboard endpoint
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get all users from KV
    const users = await kv.get('users') || [];
    const sortedUsers = [...users].sort((a, b) => (b.referrals || 0) - (a.referrals || 0));
    
    res.json(sortedUsers.map(u => ({
        name: `${u.firstName} ${u.lastName}`,
        referrals: u.referrals || 0
    })));
}
