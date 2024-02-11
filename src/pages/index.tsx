import { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";

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
    <div className={"app"}>

      <main
        style={{
          padding: 16
        }}
      >
        <Link href={'dashboard/userManagement'}>Dashboard</Link><br />
        <Link href={'dashboard/login'}>Login</Link><br />
        <button className="tonal" onClick={() => {
          fetch('/api/logout', {
            method: 'POST',
          })
        }}><div className="state">
            Logout</div></button><br />

        {/* {JSON.stringify(loggedInUser)} */}

        <button className="filled">
          <div className="state">Test button</div>
        </button> <br />
        <button className="text">
          <div className="state">Test button2</div>
        </button> <br />
        <button className="outlined">
          <div className="state">Test button2</div>
        </button> <br />
        <div className="input-container">
          
          <input placeholder="Label text" type="text" />
          <span className="label-text">Label text</span>
        </div>

      </main>
    </div>

  );
}
