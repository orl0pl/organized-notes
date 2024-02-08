import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Replace with your actual path to the db module
import { verifySessionInApi } from '@/utils/session';

export default async function multimediaTagsHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

    const user = await verifySessionInApi(req, res);

    if (!user) {return;}

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
    CREATE TABLE IF NOT EXISTS TagMultimedia (
        idMultimedia SERIAL,
        klucz VARCHAR(255),
        wartosc VARCHAR(255),
        PRIMARY KEY (idMultimedia, klucz),
        FOREIGN KEY (idMultimedia) REFERENCES Multimedia(id)
    );
    `);

    const multimediaOwner = await db.query('SELECT osoba.id FROM multimedia JOIN osoba ON multimedia.osoba = osoba.id WHERE multimedia.id = $1', [query.id]);

    if (method === 'POST') {
        // Create a tag
        const { klucz, wartosc } = body;
        try {
            if (!user.administrator || !user.edytowanieCudzychMultimediów || multimediaOwner.rows[0].id !== user.id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const result = await db.query(
                `INSERT INTO TagMultimedia (idMultimedia, klucz, wartosc) VALUES ($1, $2, $3) RETURNING *;`,
                [query.id, klucz, wartosc]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all tags for multimedia
        try {
            const result = await db.query(`SELECT klucz, wartosc FROM TagMultimedia WHERE idMultimedia = $1`, [query.id]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        try {
            if (!user.administrator || !user.edytowanieCudzychMultimediów || multimediaOwner.rows[0].id !== user.id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            await db.query(`DELETE FROM TagMultimedia WHERE idMultimedia = $1 AND klucz = $2`, [query.id, body.klucz]);
            res.status(200).json({ message: "Multimedia tag deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    } else if (method === 'PUT') {
        try {
            if (!user.administrator || !user.edytowanieCudzychMultimediów || multimediaOwner.rows[0].id !== user.id) {
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const { klucz, wartosc } = req.body;
            await db.query(`UPDATE TagMultimedia SET wartosc = $2 WHERE idMultimedia = $3 AND klucz = $1`, [
                klucz,
                wartosc,
                query.id
            ]);
            res.status(200).json({ message: "Multimedia tag updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}