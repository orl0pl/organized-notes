import User from "@/interfaces/user";
import Cookies from "cookies";
import { GetServerSidePropsContext } from "next";
import db from "./db";

export async function sessionServerSideProps({ req, res }: GetServerSidePropsContext) {
const cookies = new Cookies(req, res);
  const session = cookies.get('session_id');
  console.log(session)

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
  if(!user.rowCount) {
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