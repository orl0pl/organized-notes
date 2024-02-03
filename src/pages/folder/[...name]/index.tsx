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
  const [currentFolderId, setCurrentFolderId] = useState<number | null | undefined>(undefined);
  const [folderName, setFolderName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/folder/"+(typeof router.query.name === "string" ? router.query.name : router.query.name?.join("/") )).then((res) => res.json()).then((data) => {setFolders(data.result); setCurrentFolderId(data.parentId)});
  }, [router.query.name]);
  return (
    <div className={"app " + roboto.className}>
      <main
        style={{
          padding: 16
        }}
      >
        <h1>Folder: {typeof router.query.name === "string" ? router.query.name : router.query.name?.join("/") }</h1>
        <label>
          Folder Name:
          <input type="text" name="folderName" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
        </label>
        <button onClick={() => {
          fetch('/api/folder/'+(typeof router.query.name === "string" ? router.query.name : router.query.name?.join("/")), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nazwa: folderName, rodzic: currentFolderId, osoba: loggedInUser.id }),
          });
          fetch("/api/folder/"+(typeof router.query.name === "string" ? router.query.name : router.query.name?.join("/") )).then((res) => res.json()).then((data) => {setFolders(data.result); setCurrentFolderId(data.parentId)});
        }}>Create Folder</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {folders?.length ? folders.map((folder: Folder) => (
            <div key={folder.id}>
              <Link href={`/folder/${typeof router.query.name === "string" ? router.query.name : router.query.name?.join("/")}/${folder.nazwa}`} key={folder.id}>
                {folder.nazwa}
              </Link>
              - Created by {folder.osoba}
            </div>
          )) : <p>No folders inside</p>}

        </div>
          <pre>
            {JSON.stringify(folders, null, 2)}
          </pre>
          {currentFolderId?.toString() || "udef"}



      </main>
    </div>

  );
}
