import db from "@/utils/db";
import { verifySessionInApi } from "@/utils/session";
import { NextApiRequest, NextApiResponse } from "next";

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req;

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

	const user = await verifySessionInApi(req, res);

	if (!user) {return;}

	const folderOwner = await db.query('SELECT osoba.id FROM osoba JOIN folder ON osoba.id = folder.osoba WHERE folder.id = $1', [query.id]);

	if (method === "GET") {
		try {
			// CREATE TABLE Dostep (
			// 	folder INT,
			// 	osoba INT,
			// 	edycja BOOL,
			// 	usuwanie BOOL,
			// 	PRIMARY KEY (folder, osoba),
			// 	FOREIGN KEY (folder) REFERENCES Folder(id),
			// 	FOREIGN KEY (osoba) REFERENCES Osoba(id)
			// );

			const isAllowed = (await db.query(
				`SELECT * FROM dostep WHERE folder = $1 AND osoba = $2`, [query.id, user.id]
			)).rows.length > 0;

			if (!isAllowed && folderOwner.rows[0].osoba !== user.id && !user.administrator) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			
			const result = await db.query(
				`SELECT folder.*, osoba.nazwa as osoba_nazwa FROM folder JOIN osoba ON folder.osoba = osoba.id WHERE folder.id = $1 `,
				[query.id]
			);

			if (result.rows.length === 0) {
				res.status(404).json({ message: "Folder not found" });
			} else {
				res.status(200).json(result.rows[0]);
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "DELETE") {
		
		try {
			const isAllowedToDelete = (await db.query(
				`SELECT * FROM dostep WHERE folder = $1 AND osoba = $2 AND usuwanie = TRUE`, [query.id, user.id]
			)).rows.length > 0;

			if (!isAllowedToDelete && folderOwner.rows[0].osoba !== user.id && (!user.administrator || !user.edytowanieFolderow) ) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			await db.query(`DELETE FROM folder WHERE id = $1`, [query.id]);
			res.status(200).json({ message: "Folder deleted successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "PUT") {
		try {
			const isAllowedToEdit = (await db.query(
				`SELECT * FROM dostep WHERE folder = $1 AND osoba = $2 AND edycja = TRUE`, [query.id, user.id]
			)).rows.length > 0;

			if (!isAllowedToEdit && folderOwner.rows[0].osoba !== user.id  && (!user.administrator || !user.edytowanieFolderow) ) {
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const { nazwa } = req.body;
			await db.query(`UPDATE folder SET nazwa = $1, osoba = $2 WHERE id = $3`, [
				nazwa,
				user.id,
				query.id,
			]);
			res.status(200).json({ message: "Folder updated successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else {
		res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
