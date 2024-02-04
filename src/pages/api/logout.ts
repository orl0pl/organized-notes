import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'cookies';
import db from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const cookies = new Cookies(req, res);
      const session = cookies.get('session_id');
      cookies.set('session_id', '', { path: '/', expires: new Date(0) });

      db.query('DELETE FROM Sesja WHERE id = $1', [session]);
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during logout.' });
    }
  } else {
    // Method Not Allowed
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
