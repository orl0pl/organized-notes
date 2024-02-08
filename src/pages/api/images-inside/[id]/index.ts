import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../../utils/db'; // Replace with your actual path to the db module
import { verifySessionInApi } from '@/utils/session';
import formidable from 'formidable';
import { del, put } from '@vercel/blob';
import * as crypto from 'crypto';
import fs from 'fs';

export default async function imagesHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    const user = await verifySessionInApi(req, res);

	if (!user) {return;}

    await db.query(`
    CREATE TABLE Multimedia (
        id SERIAL PRIMARY KEY,
        osoba INT,
        utworzone TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        folder INT,
        dane VARCHAR(255),
        FOREIGN KEY (osoba) REFERENCES Osoba(id),
        FOREIGN KEY (folder) REFERENCES Folder(id)
    );
    `);

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
                    `INSERT INTO Multimedia (osoba, dane) VALUES ($1, $2, $3) RETURNING *;`,
                    [user.id, blob.url, req.query.id]
                );






                res.status(201).json(result.rows[0]);
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Internal server error', error });
            }
        })
    } else if (method === 'GET') {
        // Retrieve all notes
        try {
            const result = await db.query(`SELECT * FROM Multimedia WHERE folder IS NULL`);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        // Delete a notatka
        try {
            if(!user.administrator || !user.edytowanieCudzychMultimediów){
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const result = await db.query(
                `DELETE FROM Multimedia WHERE folder = $1 RETURNING *;`,
                [req.query.id]
            );

            del(result.rows.map((row: any) => row.dane));

            if (result.rowCount === 0) {
                res.status(404).json({ message: 'Multimedia not found' });
            } else {
                res.status(200).json({ message: 'Multimedia deleted successfully', deletedFolder: result.rows[0] });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}