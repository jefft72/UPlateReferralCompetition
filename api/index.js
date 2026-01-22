// Vercel Serverless Function - Root API endpoint
export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        res.status(200).json({ 
            message: 'UPlate Referral Competition API',
            endpoints: {
                register: '/api/register',
                leaderboard: '/api/leaderboard'
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}