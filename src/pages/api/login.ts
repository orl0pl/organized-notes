import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import db from '../../utils/db';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    if (method === 'POST') {
        const { login, haslo } = body;
        try {
            await db.connect();
            const user = await db.query('SELECT * FROM Osoba WHERE login = $1', [login]);
            if (user.rows.length > 0) {
                const { haslo: hashedPassword, salt } = user.rows[0];
                const hash = crypto.createHash('sha256').update(haslo + salt).digest('base64');

                if (hash === hashedPassword) {
                    const sessionId = crypto.randomBytes(32).toString('base64');
                    res.setHeader('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/;`);
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 7); // Set the expiry date to one week from now
                    // CREATE TABLE sesja
                    //await db.query('CREATE TABLE IF NOT EXISTS sesja (id VARCHAR(256) PRIMARY KEY,osoba INT,wygasa TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL \'1 WEEK\',FOREIGN KEY (osoba) REFERENCES Osoba(id));');
                    const insertSessionResult = await db.query(
                        `INSERT INTO Sesja (id, osoba, wygasa) VALUES ($1, $2, $3);`,
                        [sessionId, user.rows[0].id, expiryDate]
                    );
                    
                    res.status(200).json({ message: 'Login successful' });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Internal server error', error });
        } finally {
            //   await db.end();
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}
