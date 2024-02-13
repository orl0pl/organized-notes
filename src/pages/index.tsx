import { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useTheme } from "next-themes";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  return {
    ...session
  }
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const { setTheme } = useTheme();
  return (
    <div className={"app"} style={{ backgroundColor: "rgb(var(--md-sys-color-background))", color: "rgb(var(--md-sys-color-on-background))" }}>

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
        </button> <br /><br />
        <div className="input-container">

          <input placeholder="Label text" type="text" />
          <span className="label-text">Label text</span>
        </div><br /><br />
        <div className="outlined-input-container">

          <input onChange={(e) => ['green-dark', 'green-dark-medium-contrast', 'green-dark-high-contrast', 'green-light', 'green-light-medium-contrast', 'green-light-high-contrast'].includes(e.target.value) && setTheme(e.target.value)} placeholder="Label text" type="text" />
          <span className="label-text">Label text</span>
        </div><br /><br />
        <label className="switch-container">
          <input type="checkbox"/>
          <span className="switch-slider"></span>
        </label>
      </main>
    </div>

  );
}
