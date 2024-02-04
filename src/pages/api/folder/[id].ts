import db from "@/utils/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function folderHandler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;

    if (method === 'GET') {
        try {
            const result = await db.query(`SELECT * FROM folder WHERE id = $1`, [query.id]);
            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Folder not found' });
            } else {
                res.status(200).json(result.rows[0]);
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}
