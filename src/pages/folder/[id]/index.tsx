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
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch('/api/folders-inside/'+router.query.id).then((res) => res.json()).then((data) => {setFolders(data); });
  }, [router.query.id]);
  return (
    <div className={"app " + roboto.className}>
      <main
        style={{
          padding: 16
        }}
      >
        <h1>Folder: {router.query.id} <button>delete folder</button></h1>
        
        <label>
          Folder Name:
          <input type="text" name="folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
        </label>
        <button onClick={() => {
          fetch('/api/folders-inside/'+router.query.id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nazwa: folderName, rodzic: router.query.id, osoba: loggedInUser.id }),
          });
          fetch('/api/folders-inside/'+(router.query.id)).then((res) => res.json()).then((data) => {setFolders(data);});
        }}>Create New Folder Inside</button>
        <button onClick={() => {
          fetch('/api/folders-inside/'+router.query.id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nazwa: folderName, id: router.query.id, osoba: loggedInUser.id }),
          });
          fetch("/api/folder/"+(router.query.id)).then((res) => res.json()).then((data) => {setFolders(data);});
        }}>
          Change Folder Name
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {folders?.length ? folders.map((folder: Folder) => (
            <div key={folder.id}>
              <Link href={`/folder/${folder.id}`} key={folder.id}>
                {folder.nazwa}
              </Link>
              - Created by {folder.osoba}
            </div>
          )) : <p>No folders inside</p>}

        </div>
          <pre>
            {JSON.stringify(folders, null, 2)}
          </pre>
          {router.query.id?.toString() || "udef"}



      </main>
    </div>

  );
}
