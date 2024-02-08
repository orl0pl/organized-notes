import db from "@/utils/db";
import { verifySessionInApi } from "@/utils/session";
import { del } from "@vercel/blob";
import { NextApiRequest, NextApiResponse } from "next";

export default async function multimediaHandler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req;

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

	if (method === "GET") {
		try {
			const result = await db.query(
				`SELECT multimedia.*, osoba.nazwa as osoba_nazwa FROM multimedia JOIN osoba ON multimedia.osoba = osoba.id WHERE multimedia.id = $1 `,
				[query.id]
			);
			if (result.rows.length === 0) {
				res.status(404).json({ message: "Multimedia not found" });
			} else {
				res.status(200).json(result.rows[0]);
			}
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "DELETE") {
		try {
			if(!user.administrator || !user.edytowanieCudzychMultimediów){
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const result = await db.query(`DELETE FROM multimedia WHERE id = $1`, [query.id]);
			del(result.rows.map((row: any) => row.dane));
			res.status(200).json({ message: "Multimedia deleted successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else if (method === "PUT") {
		try {
			if(!user.administrator || !user.edytowanieCudzychMultimediów){
				res.status(401).json({ message: "Unauthorized" });
				return;
			}
			const { dane, folder } = req.body;
			// Define an array to store the update clauses
			const updateClauses = [];
			const values = [query.id];

			// Check if each value is defined and add corresponding clause to the array
			if (dane) {
				updateClauses.push('dane = $' + (values.length + 1));
				values.push(dane);
			}
			if (folder) {
				updateClauses.push('folder = $' + (values.length + 1));
				values.push(folder);
			}
			if (user.id) {
				updateClauses.push('osoba = $' + (values.length + 1));
				values.push(user.id.toString());
			}

			// Construct the SET clause by joining the update clauses with commas
			const setClause = updateClauses.join(', ');

			// Construct the SQL query with the SET clause
			const queryText = `UPDATE multimedia SET ${setClause} WHERE id = $1`;

			// Execute the query
			await db.query(queryText, values);
			res.status(200).json({ message: "Multimedia updated successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error", error });
		}
	} else {
		res.setHeader("Allow", ["GET", "DELETE", "PUT"]);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}