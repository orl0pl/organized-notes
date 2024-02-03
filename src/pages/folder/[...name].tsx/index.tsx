import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
// import { Button, LayoutWithNavigationBar, NavigationBar, Text, ThemeProvider, useTheme } from "md3-react";
import { Ribeye, Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import { mdiAbTesting, mdiCog, mdiGlobeModel, mdiHome, mdiWeatherNight, mdiWeatherSunny } from "@mdi/js";
import { hexFromArgb } from "@material/material-color-utilities";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest } from "next";
import Cookies from "cookies";
import { db } from "@vercel/postgres";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useRouter } from "next/router";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  return {
    ...session
  }
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  // const { updateSourceColor, scheme, toggleMode, sourceColor, mode } =
  //   useTheme();
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/folder").then((res) => res.json()).then((data) => setFolders(data));
  }, []);
  return (
    <div className={"app " + roboto.className}>
      <main
        style={{
          padding: 16
        }}
      >
        <h1>Root Folder</h1>
        <label>
          Folder Name:
          <input type="text" name="folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
        </label>
        <button onClick={() => {
          fetch('/api/folder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nazwa: folderName, rodzic: null, osoba: loggedInUser.id }),
          });
          fetch("/api/folder").then((res) => res.json()).then((data) => setFolders(data));
        }}>Create Folder</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {folders.length > 0 ? folders.map((folder: Folder) => (
            <div key={folder.id}>
              <Link href={`/folder/${folder.nazwa}`} key={folder.id}>
                {folder.nazwa}
              </Link>
              - Created by {folder.osoba}
            </div>
          )) : <p>No folders inside</p>}

        </div>




      </main>
    </div>

  );
}
