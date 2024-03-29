import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';
import db from '../../../utils/db'; // Replace with your actual path to the db module
import { verifySessionInApi } from '@/utils/session';
import { put } from '@vercel/blob';
import * as crypto from 'crypto';
import { errors as formidableErrors } from 'formidable';
import formidable from 'formidable';
import PersistentFile from 'formidable/PersistentFile';
import fs from 'fs'

export const config = {
    api: {
        bodyParser: false,
    }
};


export default async function multimediaHandler(req: NextApiRequest, res: NextApiResponse) {
    await db.query(`
    CREATE TABLE IF NOT EXISTS Multimedia (
        id SERIAL PRIMARY KEY,
        osoba INT,
        utworzone TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        folder INT,
        dane VARCHAR(255),
        FOREIGN KEY (osoba) REFERENCES Osoba(id),
        FOREIGN KEY (folder) REFERENCES Folder(id)
    );
            `);
    const { method, body } = req;

    const user = await verifySessionInApi(req as unknown as NextApiRequest, res);

    if (!user) { return; }

    if (method === 'POST') {
        const form = formidable({})
        form.parse(req, async (err, fields, files) => {
            try {
                if (!user.administrator && !user.dodawanieMultimediów) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }

                if (err) {
                    console.error('Error parsing form data:', err);
                    res.status(500).json({ error: 'Error parsing form data' });
                    return;
                }


                if (!files.file?.length) {
                    res.status(400).json({ message: 'No file uploaded' });
                    return;
                }
                const file = files.file[0];

                const blob = await put(`media-${user.id}-${crypto.randomBytes(16).toString('base64url')}.${(file.mimetype || 'image/png').split('/')[1]}`, fs.readFileSync(file.filepath), { access: 'public', addRandomSuffix: false });

                const result = await db.query(
                    `INSERT INTO Multimedia (osoba, dane) VALUES ($1, $2) RETURNING *;`,
                    [user.id, blob.url]
                );






                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error', error });
            }
        })

    } else if (method === 'GET') {
        // Retrieve all multimedia
        try {
            const result = await db.query(`SELECT * FROM Multimedia WHERE folder IS NULL`);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}