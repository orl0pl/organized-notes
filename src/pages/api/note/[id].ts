import db from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req;

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
			const { nazwa, osoba } = req.body;
			await db.query(`UPDATE notatka SET nazwa = $1, osoba = $2 WHERE id = $3`, [
				nazwa,
				osoba,
				query.id,
			]);
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
