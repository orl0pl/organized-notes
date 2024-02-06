import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../utils/db'; // Replace with your actual path to the db module

export default async function noteTagsHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;

    await db.query(`
    CREATE TABLE IF NOT EXISTS Notatka (
        id SERIAL PRIMARY KEY,
        tekst TEXT,
        folder INT,
        nazwa VARCHAR(255),
        ostatnia_wersja INT,
        osoba INT,
        czas TIMESTAMP,
        UNIQUE(nazwa, folder),
        FOREIGN KEY (folder) REFERENCES Folder(id),
        FOREIGN KEY (osoba) REFERENCES Osoba(id),
        FOREIGN KEY (ostatnia_wersja) REFERENCES Notatka(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS TagNotatki (
        idNotatki SERIAL,
        klucz VARCHAR(255),
        wartosc VARCHAR(255),
        PRIMARY KEY (idNotatki, klucz),
        FOREIGN KEY (idNotatki) REFERENCES Notatka(id)
    );
    `);

    if (method === 'POST') {
        // Create a tag
        const { klucz, wartosc } = body;
        try {
            const result = await db.query(
                `INSERT INTO TagNotatki (idNotatki, klucz, wartosc) VALUES ($1, $2, $3) RETURNING *;`,
                [query.id, klucz, wartosc]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all tags for a note
        try {
            const result = await db.query(`SELECT klucz, wartosc FROM TagNotatki WHERE idNotatki = $1`, [query.id]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        try {
            await db.query(`DELETE FROM TagNotatki WHERE idNotatki = $1 AND klucz = $2`, [query.id, body.klucz]);
            res.status(200).json({ message: "Note tag deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    } else if (method === 'PUT') {
        try {
            const { klucz, wartosc } = req.body;
            await db.query(`UPDATE TagNotatki SET wartosc = $2 WHERE idNotatki = $3 AND klucz = $1`, [
                klucz,
                wartosc,
                query.id
            ]);
            res.status(200).json({ message: "Note tag updated successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error", error });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}