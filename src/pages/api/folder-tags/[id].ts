import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Replace with your actual path to the db module

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

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
        const { klucz, wartosc } = body;
        console.log(body)
        try {

            const result = await db.query(
                `INSERT INTO TagFolderu (idfolderu, klucz, wartosc) VALUES ($1, $2, $3) RETURNING *;`,
                [ query.id, klucz, wartosc,]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all folders that are inside
        try {
            // CREATE TABLE TagFolderu (
            //     idFolderu INT,
            //     klucz VARCHAR(255),
            //     wartosc VARCHAR(255),
            //     PRIMARY KEY (idFolderu, klucz),
            //     FOREIGN KEY (idFolderu) REFERENCES Folder(id)
            // );
            
            const result = await db.query(`SELECT klucz, wartosc FROM TagFolderu WHERE idFolderu = $1`, [query.id]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        try {
            await db.query(`DELETE FROM TagFolderu WHERE idfolderu = $1 AND klucz = $2`, [query.id, body.klucz]);
            res.status(200).json({ message: "Folder tag deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }

    } else if (method === 'PUT') {
        try {
            const { klucz, wartosc } = req.body;
            await db.query(`UPDATE TagFolderu SET wartosc = $2 WHERE idFolderu = $3 AND klucz = $1`, [
                klucz,
                wartosc,
                query.id
            ]);
            res.status(200).json({ message: "Folder tag updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }

    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}