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
import {
  mdiChevronDown,
  mdiChevronUp,
  mdiFileDocument,
  mdiFileDocumentPlus,
  mdiFolder,
  mdiFolderPlus,
} from "@mdi/js";
import FAB, { FabContainer } from "@/components/fab";
import Spinner from "@/components/spinner";
import Button from "@/components/button";
import { Input } from "@/components/input";
import { Modal, ModalActions } from "@/components/modal";

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
  const router = useRouter();
  const { id } = router.query;
  const [isLoaded, setIsLoaded] = useState<false | true | null>(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | undefined>(
    undefined
  );
  const [currentFolderTags, setCurrentFolderTags] = useState<
    { klucz: string; wartosc: string }[]
  >([]);
  const [tagValue, setTagValue] = useState("");
  const [tagKey, setTagKey] = useState("");
  const [folderName, setFolderName] = useState("");
  const [notes, setNotes] = useState<Folder[]>([]);
  const [detailsShown, setDetailsShown] = useState(false);
  const [addFolderModalOpen, setAddFolderModalOpen] = useState(false);
  const [changeFolderNameModalOpen, setChangeFolderNameModalOpen] =
    useState(false);
  const [deleteFolderModalOpen, setDeleteFolderModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded === false) {
      fetch(`/api/folders-inside/${id}`)
        .then((res) => res.json())
        .then((data) => setFolders(data))
        .catch((err) => setIsLoaded(null));
      fetch(`/api/notes-inside/${id}`)
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch((err) => setIsLoaded(null));
      fetch(`/api/folder/${id}`)
        .then((res) => res.json())
        .then((data) => setCurrentFolder(data))
        .catch((err) => setIsLoaded(null));
      fetch(`/api/folder-tags/${id}`)
        .then((res) => res.json())
        .then((data) => setCurrentFolderTags(data))
        .catch((err) => setIsLoaded(null));
      setIsLoaded(true);
    }
  }, [id, isLoaded]);

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
        <h1 className="display-small">{t("home:title")}</h1>
        {currentFolder !== undefined && (
          <div>
            <h2 className="title-large">
              {t("home:inside-folder", { name: currentFolder.nazwa })}
            </h2>
          </div>
        )}
        <span
          className="title-small"
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => setDetailsShown(!detailsShown)}
        >
          {t("home:folder-more-info")}{" "}
          {detailsShown ? (
            <Icon path={mdiChevronUp} />
          ) : (
            <Icon path={mdiChevronDown} />
          )}
        </span>
        {detailsShown && (
          <div className={styles.details}>
            <span>
              {t("home:created-by", { name: currentFolder?.osoba_nazwa })}
            </span>
            <div className={styles.rowWithGap}>
              <Button
                displayType={"tonal"}
                onClick={() => setChangeFolderNameModalOpen(true)}
              >
                {t("home:edit-name")}
              </Button>
              <Button
                displayType={"tonal"}
                onClick={() => setDeleteFolderModalOpen(true)}
              >
                {t("home:delete")}
              </Button>
            </div>
            <br />
            <span className="title-small">{t("home:folder-tags")}</span>
            <table className={styles.tagsTable}>
              <thead>
                <tr>
                  <th className="label-large">{t("home:tag-key")}</th>
                  <th className="label-large">{t("home:tag-value")}</th>
                  <th className="label-large">{t("home:tag-action")}</th>
                </tr>
              </thead>
              <tbody>
                {currentFolderTags.length === 0 && currentFolder && (
                  <tr>
                    <td colSpan={3}>{t("home:folder-no-tags")}</td>
                  </tr>
                )}
                {currentFolderTags.map((tag) => (
                  <tr key={tag.klucz}>
                    <td>{tag.klucz}</td>
                    <td>{tag.wartosc}</td>
                    <td>
                      <Button
                        onClick={() => {
                          fetch("/api/folder-tags/" + router.query.id, {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              klucz: tag.klucz,
                              wartosc: tagValue,
                            }),
                          });
                          setIsLoaded(false);
                        }}
                        displayType={"text"}
                      >
                        {t("common:edit")}
                      </Button>
                      <button
                        onClick={() => {
                          fetch("/api/folder-tags/" + router.query.id, {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              klucz: tag.klucz,
                            }),
                          });
                          setIsLoaded(false);
                        }}
                      >
                        {t("common:delete")}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <Input
                      type="text"
                      name="key"
                      value={tagKey}
                      placeholder={t("home:tag-key")}
                      onChange={(e) => setTagKey(e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      type="text"
                      name="value"
                      value={tagValue}
                      placeholder={t("home:tag-value")}
                      onChange={(e) => setTagValue(e.target.value)}
                    />
                  </td>
                  <td>
                    <Button
                      onClick={() => {
                        fetch("/api/folder-tags/" + router.query.id, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            klucz: tagKey,
                            wartosc: tagValue,
                          }),
                        }).catch((err) => {
                          alert(err);
                        });
                        setTagKey("");
                        setTagValue("");
                        setIsLoaded(false);
                      }}
                      displayType={"tonal"}
                    >
                      Add
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.filesGrid}>
          {isLoaded === false && <Spinner />}
          {folders.map((folder) => {
            return (
              <div className={styles.file} key={folder.id}>
                <Icon path={mdiFolder} />
                <a href={`/folder/${folder.id}`}>{folder.nazwa}</a>
              </div>
            );
          })}
          {notes.map((note) => {
            return (
              <div className={styles.file} key={note.id}>
                <Icon path={mdiFileDocument} />
                <a href={`/note/${note.id}`}>{note.nazwa}</a>
              </div>
            );
          })}
          {notes.length === 0 && folders.length === 0 && isLoaded && (
            <p>{t("home:empty-folder")}</p>
          )}
        </div>
        <FabContainer>
          <FAB
            icon={mdiFolderPlus}
            text={t("home:newFolder")}
            onClick={() => {
              setAddFolderModalOpen(true);
            }}
          />
          <FAB
            icon={mdiFileDocumentPlus}
            text={t("home:newNote")}
            onClick={() => {}}
          />
        </FabContainer>
      </main>
      {addFolderModalOpen && (
        <Modal
          dissmissOnBackgroundClick
          hideModal={() => setAddFolderModalOpen(false)}
        >
          <h1>{t("home:newFolder")}</h1>
          <Input
            displayType="filled"
            placeholder={t("home:folder-name")}
          ></Input>
          <br />
          <ModalActions>
            <Button
              displayType="outlined"
              onClick={() => setAddFolderModalOpen(false)}
            >
              {t("common:cancel")}
            </Button>
            <Button displayType="filled">{t("common:save")}</Button>
          </ModalActions>
        </Modal>
      )}
      {changeFolderNameModalOpen && (
        <Modal
          dissmissOnBackgroundClick
          hideModal={() => setChangeFolderNameModalOpen(false)}
        >
          <h1>{t("home:changeFolderName")}</h1>
          <Input
            displayType="filled"
            placeholder={t("home:folder-name")}
          ></Input>
          <br />
          <ModalActions>
            <Button
              displayType="outlined"
              onClick={() => setChangeFolderNameModalOpen(false)}
            >
              {t("common:cancel")}
            </Button>
            <Button displayType="filled">{t("common:save")}</Button>
          </ModalActions>
        </Modal>
      )}
      {deleteFolderModalOpen && (
        <Modal
          dissmissOnBackgroundClick
          hideModal={() => setDeleteFolderModalOpen(false)}
        >
          <h1>{t("home:deleteFolder")}</h1>
          <p>{t("home:deleteFolderWarning")}</p>
          <ModalActions>
            <Button
              displayType="outlined"
              onClick={() => setDeleteFolderModalOpen(false)}
            >
              {t("common:cancel")}
            </Button>
            <Button displayType="filled">{t("common:delete")}</Button>
          </ModalActions>
        </Modal>
      )}
    </div>
  );
}
