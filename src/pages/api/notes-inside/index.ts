import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Replace with your actual path to the db module
import { verifySessionInApi } from '@/utils/session';

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    const user = await verifySessionInApi(req, res);

	if (!user) {return;}

    await db.query(`
	CREATE TABLE IF NOT EXISTS Notatka (
		id SERIAL PRIMARY KEY,
		tekst TEXT,
		folder INT,
		nazwa VARCHAR(255),
		ostatnia_wersja INT,
		osoba INT,
		czas TIMESTAMP default CURRENT_TIMESTAMP,
		UNIQUE(nazwa, folder),
		FOREIGN KEY (folder) REFERENCES Folder(id),
		FOREIGN KEY (osoba) REFERENCES Osoba(id),
		FOREIGN KEY (ostatnia_wersja) REFERENCES Notatka(id) ON DELETE SET NULL
	);
            `);

    if (method === 'POST') {
        const { nazwa, tekst, ostatnia_wersja } = body;
        try {

            const result = await db.query(
                `INSERT INTO Notatka (nazwa, osoba, tekst, ostatnia_wersja) VALUES ($1, $2, $3, $4) RETURNING *;`,
                [nazwa, user.id, tekst, ostatnia_wersja]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all notes
        try {
            const result = await db.query(`SELECT * FROM Notatka WHERE folder IS NULL`);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        // Delete a notatka
        const { folderId } = body;
        try {
            const result = await db.query(
                `DELETE FROM Notatka WHERE folder = $1 RETURNING *;`,
                [folderId]
            );

            if (result.rowCount === 0) {
                res.status(404).json({ message: 'Notatka not found' });
            } else {
                res.status(200).json({ message: 'Notatka deleted successfully', deletedFolder: result.rows[0] });
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