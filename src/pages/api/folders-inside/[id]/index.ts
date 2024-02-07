import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../../utils/db'; // Replace with your actual path to the db module
import { verifySessionInApi } from '@/utils/session';

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

    const user = await verifySessionInApi(req, res);

	if (!user) {return;}

    await db.query(`
                CREATE TABLE IF NOT EXISTS Folder (
                    id SERIAL PRIMARY KEY,
                    rodzic INT,
                    nazwa VARCHAR(255) NOT NULL,
                    osoba INT,
                    UNIQUE (id, rodzic),
                    FOREIGN KEY (rodzic) REFERENCES Folder (id) ON DELETE CASCADE,
                    FOREIGN KEY (osoba) REFERENCES Osoba (id)
                );
            `);

    if (method === 'POST') {
        // Create a folder
        const { rodzic, nazwa } = body;
        try {
            if(!user.administrator || !user.tworzenieFolderu){
                res.status(401).json({ message: "Unauthorized" });
                return;
            }
            const result = await db.query(
                `INSERT INTO Folder (rodzic, nazwa, osoba) VALUES ($1, $2, $3) RETURNING *;`,
                [rodzic, nazwa, user.id]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all folders that are inside
        try {
            
            const result = await db.query(`SELECT folder.*, osoba.nazwa FROM folder JOIN osoba ON folder.osoba = osoba.id WHERE folder.rodzic = $1`, [query.id]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        // Delete a folder
        if(!user.administrator || !user.edytowanieFolderow){
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            const result = await db.query(
                `DELETE FROM Folder WHERE rodzic = $1 OR id = $1 RETURNING *;`,
                [query.id]
            );

            if (result.rowCount === 0) {
                res.status(404).json({ message: 'Folder not found' });
            } else {
                res.status(200).json({ message: 'Folder deleted successfully', deletedFolder: result.rows[0] });
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