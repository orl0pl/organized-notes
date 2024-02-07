import db from "@/utils/db";
import { verifySessionInApi } from "@/utils/session";
import { NextApiRequest, NextApiResponse } from "next";

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req;

	const user = await verifySessionInApi(req, res);

	if (!user) {return;}

	await db.query(`
	CREATE TABLE IF NOT EXISTS Notatka (
		id SERIAL PRIMARY KEY,
		tekst TEXT NOT NULL,
		folder INT,
		nazwa VARCHAR(255) NOT NULL,
		ostatnia_wersja INT,
		osoba INT,
		czas TIMESTAMP,
		UNIQUE(nazwa, folder),
		FOREIGN KEY (folder) REFERENCES Folder(id),
		FOREIGN KEY (osoba) REFERENCES Osoba(id),
		FOREIGN KEY (ostatnia_wersja) REFERENCES Notatka(id) ON DELETE SET NULL
	);
            `);

	if (method === "GET") {
		try {
			const result = await db.query(
				`SELECT notatka.*, osoba.nazwa as osoba_nazwa FROM notatka JOIN osoba ON notatka.osoba = osoba.id WHERE notatka.id = $1 `,
				[query.id]
			);
			if (result.rows.length === 0) {
				res.status(404).json({ message: "Notatka not found" });
			} else {
				res.status(200).json(result.rows[0]);
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "DELETE") {
		try {
			await db.query(`DELETE FROM notatka WHERE id = $1`, [query.id]);
			res.status(200).json({ message: "Notatka deleted successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "PUT") {
		try {
			const { nazwa, tekst, folder } = req.body;
			// Define an array to store the update clauses
			const updateClauses = [];
			const values = [query.id];

			// Check if each value is defined and add corresponding clause to the array
			if (tekst) {
				updateClauses.push('tekst = $' + (values.length + 1));
				values.push(tekst);
			}
			if (folder) {
				updateClauses.push('folder = $' + (values.length + 1));
				values.push(folder);
			}
			if (nazwa) {
				updateClauses.push('nazwa = $' + (values.length + 1));
				values.push(nazwa);
			}
			if (user.id) {
				updateClauses.push('osoba = $' + (values.length + 1));
				values.push(user.id.toString());
			}

			// Construct the SET clause by joining the update clauses with commas
			const setClause = updateClauses.join(', ');

			// Construct the SQL query with the SET clause
			const queryText = `UPDATE notatka SET ${setClause} WHERE id = $1`;

			// Execute the query
			await db.query(queryText, values);
			res.status(200).json({ message: "Notatka updated successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else {
		res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
