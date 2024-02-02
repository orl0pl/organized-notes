import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto'
import db from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;

  try {
    await db.connect();

    if (method === 'GET') {
      const result = await db.query('SELECT * FROM Osoba');
      res.status(200).json(result.rows);
    } else if (method === 'POST') {
      const salt = crypto.randomBytes(2).toString('base64')
      const {
        nazwa,
        login,
        haslo,
        tworzenieFolderu,
        edytowanieFolderow,
        dodawanieNotatek,
        edytowanieCudzychNotatek,
        dodawanieMultimediów,
        edytowanieCudzychMultimediów,
        administrator,
      } = body;

      await db.query(
        `
        INSERT INTO Osoba (nazwa, login, haslo, salt, tworzenieFolderu, edytowanieFolderow, dodawanieNotatek, edytowanieCudzychNotatek, dodawanieMultimediów, edytowanieCudzychMultimediów, administrator)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
        [
          nazwa,
          login,
          crypto.createHash('sha256').update(haslo+salt).digest().toString('base64'),
          salt,
          tworzenieFolderu,
          edytowanieFolderow,
          dodawanieNotatek,
          edytowanieCudzychNotatek,
          dodawanieMultimediów,
          edytowanieCudzychMultimediów,
          administrator,
        ]
      );

      res.status(201).json({ message: 'User added successfully' });
    } else if (method === 'DELETE') {
      const { userId } = body;
      await db.query('DELETE FROM Osoba WHERE id = $1', [userId]);
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    // await db.end();
  }
}