import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useTheme } from "next-themes";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import SharedNavBar from "@/components/sharedNavBar";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiFileDocument, mdiFolder, mdiFolderPlus } from "@mdi/js";
import FAB from "@/components/fab";
import Spinner from "@/components/spinner";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  return {
    ...session,
    props: {
      ...session.props,
      ...(await serverSideTranslations(context.locale || "en", [
        "common",
        "home",
      ])),
    },
  };
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState<false | true | null>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Folder[]>([]);

  useEffect(() => {
    if (isLoaded === false) {
      fetch("/api/folders-inside")
        .then((res) => res.json())
        .then((data) => setFolders(data))
        .catch((err) => setIsLoaded(null));
      fetch("/api/notes-inside")
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch((err) => setIsLoaded(null));
      setIsLoaded(true);
    }
  }, [isLoaded]);

  return (
    <div
      className={"app"}
      style={{
        backgroundColor: "rgb(var(--md-sys-color-background))",
        color: "rgb(var(--md-sys-color-on-background))",
      }}
    >
      <SharedNavBar active="/" />
      <main
        style={{
          padding: 16,
        }}
      >
        <h1 className="display-medium">{t("home:title")}</h1>
        <div className={styles.filesGrid}>
          {
            isLoaded === false && <Spinner />
          }
          {
          folders.map((folder) => {
            return (
              <div className={styles.file} key={folder.id}>
                <Icon path={mdiFolder}/>
                <a href={`/folder/${folder.id}`}>{folder.nazwa}</a>
              </div>
            )
          })
        }
        {
          notes.map((note) => {
            return (
              <div className={styles.file} key={note.id}>
                <Icon path={mdiFileDocument}/>
                <a href={`/note/${note.id}`}>{note.nazwa}</a>
              </div>
            )
          })
        }
        </div>
        <FAB icon={mdiFolderPlus} text={t("home:newFolder")} onClick={() => {}}/>
      </main>
    </div>
  );
}
