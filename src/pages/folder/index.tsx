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
  const [folders, setFolders] = useState([]);
  const [folderName, setFolderName] = useState("");

  useEffect(() => {
    fetch('/api/folders-inside').then((res) => res.json()).then((data) => setFolders(data));
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
          fetch('/api/folders-inside', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nazwa: folderName, rodzic: null, osoba: loggedInUser.id }),
          });
          fetch('/api/folders-inside').then((res) => res.json()).then((data) => setFolders(data));
        }}>Create Folder</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {folders.length > 0 ? folders.map((folder: Folder) => (
            <div key={folder.id}>
              <Link href={`/folder/${folder.id}`} key={folder.id}>
                {folder.nazwa}
              </Link>
              - Created by {folder.osoba}
            </div>
          )) : <p>No folders</p>}

        </div>
        <pre>
            {JSON.stringify(folders, null, 2)}
          </pre>



      </main>
    </div>

  );
}
