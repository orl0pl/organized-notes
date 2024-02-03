import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../../utils/db'; // Replace with your actual path to the db module

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body, query } = req;
    console.log(query.name)

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
        const { rodzic, nazwa, osoba } = body;
        console.log(body)
        try {

            const result = await db.query(
                `INSERT INTO Folder (rodzic, nazwa, osoba) VALUES ($1, $2, $3) RETURNING *;`,
                [rodzic, nazwa, osoba]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'GET') {
        // Retrieve all folders
        try {
            var result;
            var parentId;
            if (query.name === undefined || query.name.length === 0) {
                result = await db.query(`SELECT * FROM Folder WHERE rodzic IS NULL;`);
                parentId = null;
            }
            else if (typeof query.name === "string" || (query.name.length === 1)) {
                result = await db.query(`SELECT id, nazwa
                FROM Folder
                WHERE rodzic = (SELECT id FROM Folder WHERE nazwa = $1 AND rodzic IS NULL);
                
                `, [query.name[0] || query.name]);
                var parentIdDbResult = await db.query(`SELECT id FROM Folder WHERE nazwa = $1 AND rodzic IS NULL`, [query.name[0] || query.name]);
                
                parentId = parentIdDbResult.rows[0].id;
            }
            else {
                var parentIdDbResult = await db.query(`
                WITH RECURSIVE FolderCTE AS (
                    SELECT * FROM Folder WHERE nazwa IN ($1)
                    UNION
                    SELECT f.* FROM Folder f
              INNER JOIN FolderCTE cte ON f.rodzic = cte.id
            )
                  SELECT id FROM FolderCTE;
                `, [query.name?.join(',')]);

                parentId = parentIdDbResult.rows[0].id;

                result = await db.query(`SELECT * FROM Folder WHERE rodzic = $1;`, [parentIdDbResult]);



                // console.log('idk', query.name?.join(','))
            }
            res.status(200).json({ result: result.rows, parentId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'PUT') {
        // Update a folder
        const { id, rodzic, nazwa, osoba } = body;
        try {
            const result = await db.query(
                `UPDATE Folder SET rodzic = $1, nazwa = $2, osoba = $3 WHERE id = $4 RETURNING *;`,
                [rodzic, nazwa, osoba, id]
            );

            if (result.rowCount === 0) {
                res.status(404).json({ message: 'Folder not found' });
            } else {
                res.status(200).json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else if (method === 'DELETE') {
        // Delete a folder
        const { folderId } = body;
        try {
            const result = await db.query(
                `DELETE FROM Folder WHERE id = $1 RETURNING *;`,
                [folderId]
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
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
}