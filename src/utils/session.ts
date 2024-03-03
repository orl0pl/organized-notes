import User from "@/interfaces/user";
import Cookies from "cookies";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import db from "./db";
import { NextRequest } from "next/server";

export async function sessionServerSideProps({ req, res }: GetServerSidePropsContext) {
  const cookies = new Cookies(req, res);
  const session = cookies.get('session_id');

  if (!session) {
    return {
      redirect: {
        destination: `/dashboard/login?redirect=${req.url}`,
        permanent: false
      }
    }
  }
  await db.query('DELETE FROM Sesja WHERE wygasa < NOW()');
  const user = await db.query('SELECT Osoba.* FROM Osoba JOIN Sesja ON Osoba.id = Sesja.osoba WHERE Sesja.id = $1', [session]);
  if(user.rows.length === 0) {
    return {
      redirect: {
        destination: `/dashboard/login?redirect=${req.url}`,
        permanent: false
      }
    }
  }

  delete user.rows[0].haslo,
  delete user.rows[0].salt

  const loggedInUser: Omit<User, 'haslo' | 'salt'> = user.rows[0]

  

  return {
    props: {
      loggedInUser: loggedInUser
    }
  }
}

export async function verifySessionInApi(req: NextApiRequest, res: NextApiResponse) {
  const session = req.cookies.session_id || req.body.session_id || req.query.session_id || null;

  console.log(session) // DEBUG REMOVE
  
	const sessionInDb = await db.query(`SELECT * FROM Sesja WHERE id = $1`, [session]);
  
  console.log(sessionInDb.rows)

	if (sessionInDb.rows.length === 0) {
		res.status(401).json({ message: "Invalid session" });
    if(req.cookies.session_id) {
      const cookies = new Cookies(req, res);
      cookies.set('session_id', '', { path: '/', expires: new Date(0) });
    }
		return;
	}

  

	const users = await db.query(`SELECT * FROM osoba WHERE id = $1`, [sessionInDb.rows[0].osoba]);

	if (users.rows.length === 0) {
		res.status(401).json({ message: "Invalid user" });
		return;
	}

  const loggedInUser: User = users.rows[0]

  return loggedInUser;
  
}