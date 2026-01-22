// Migration endpoint - Run once to load existing users.json data into KV
import { kv } from '@vercel/kv';
import usersData from '../users.json' assert { type: 'json' };

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Security: Only allow in development or with a secret key
    const secret = req.query.secret;
    if (process.env.NODE_ENV === 'production' && secret !== process.env.MIGRATE_SECRET) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        // Load existing users into KV
        await kv.set('users', usersData);
        
        res.json({ 
            success: true, 
            message: 'Migration complete',
            usersCount: usersData.length 
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Migration failed', 
            details: error.message 
        });
    }
}
