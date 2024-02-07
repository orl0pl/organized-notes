import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  return {
    ...session
  }
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const [color, setColor] = useState("#ff0000");
  const [compact, setCompact] = useState(
    true
  )

  useEffect(() => {
    if (window) {
      window
        .matchMedia("(max-width: 768px)")
        .addEventListener('change', e => setCompact(e.matches));
    }
  }, []);
  return (
    <div className={"app "+roboto.className}>

      <main
        style={{
          padding: 16
        }}
      >
        <Link href={'dashboard/userManagement'}>Dashboard</Link><br />
        <Link href={'dashboard/login'}>Login</Link><br />
        <button onClick={()=>{
          fetch('/api/logout', {
            method: 'POST',
          })
        }}>Logout</button>

        {JSON.stringify(loggedInUser)}


        
      </main>
    </div>

  );
}
