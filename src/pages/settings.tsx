import { useEffect, useState } from "react";
import styles from "@/styles/Home.module.css";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useTheme } from "next-themes";
import { mdiCog, mdiCreation, mdiHome, mdiPen, mdiWeatherNight } from "@mdi/js";
import Button from "@/components/button";
import Icon from "@mdi/react";
import Switch from "@/components/switch";
import { Input } from "@/components/input";
import { NavigationRail, NavigationRailItem } from "@/components/navigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Cookies from "cookies";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  const cookies = new Cookies(context.req, context.res);
  const cookieLocale = cookies.get("NEXT_LOCALE");
  console.log({
    ...session,
    props: {
      ...session.props,
      ...(await serverSideTranslations(cookieLocale || context.locale || "en", ["common", "settings"])),
    }});
  return {
    ...session,
    props: {
      ...session.props,
      ...(await serverSideTranslations(cookieLocale || context.locale || "en", ["common", "settings"])),
    },
  };
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const { setTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { t } = useTranslation("settings");
  useEffect(() => {
    if (typeof window !== "undefined" && loggedInUser) {
      setIsLoading(false);
    }
  }, [loggedInUser]);
  if (!isLoading) {
    return (
      <div
        className={"app"}
        style={{
          backgroundColor: "rgb(var(--md-sys-color-background))",
          color: "rgb(var(--md-sys-color-on-background))",
        }}
      >
        <NavigationRail>
          <NavigationRailItem icon={mdiHome} text={t("common:home")} href="/" />
          <NavigationRailItem icon={mdiPen} text={t("common:editor")} href="/editor" />
          <NavigationRailItem icon={mdiCreation} text={t("common:chat")} href="/chat" />
          <NavigationRailItem
            active
            icon={mdiCog}
            text={t("common:settings")}
            href="/settings"
          />
        </NavigationRail>
        <main
          style={{
            padding: 16,
          }}
        >
          <h1 className="display-medium">{t("settings:title")}</h1>
          <div className={styles.settingsGrid}>
            <div className={styles.profile}>
              <div className={`title-large ${styles.profileImg}`}>
                {loggedInUser.nazwa.charAt(0)}
              </div>
              <div className={styles.userInfo}>
                <span className="label-medium">
                  {t("settings:logged-in-as")}
                </span>

                <span className="title-medium">{loggedInUser.nazwa}</span>
              </div>
            </div>
            <Button displayType={"outlined"}>{t("settings:logout")}</Button>
            <label htmlFor="theme" className="body-large">
              {t("settings:theme.darkmode")}
            </label>
            <Switch
              icon={mdiWeatherNight}
              id="theme"
              defaultChecked={[
                "green-dark",
                "green-dark-medium-contrast",
                "green-dark-high-contrast",
              ].includes(theme || "")}
              onChange={(e) => {
                const ischecked = (e.target as HTMLInputElement).checked;
                if (!theme) {
                  setTheme("green-light");
                  return;
                }
                setTheme(
                  ischecked && theme !== undefined
                    ? theme?.replace("light", "dark")
                    : theme?.replace("dark", "light")
                );
              }}
            />
            <label htmlFor="lang" className="body-large">
              {t("settings:language.select-language")}
            </label>
            <select
              defaultValue={
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("NEXT_LOCALE="))
                  ?.split("=")[1]
              }
              name="lang"
              id="lang"
              onChange={(e) => {
                // router.push({ pathname, query }, asPath, { locale: e.target.value })
                document.cookie = `NEXT_LOCALE=${e.target.value};`;
                router.reload();
              }}
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </select>
            <label htmlFor="contrast" className="body-large">
              {t("settings:theme.contrast")}
            </label>
            <select id="contrast" defaultValue={theme?.split("-")[1] || ""} onChange={(e)=>{
                if(!theme) {
                    setTheme("green-light");
                    return;
                }
                setTheme(`${theme?.split("-").splice(0, 2).join("-")}${e.target.value}`)
            }}>
              <option value="">{t("settings:theme.contrast-default")}</option>
              <option value="-medium-contrast">{t("settings:theme.contrast-medium")}</option>
              <option value="-high-contrast">{t("settings:theme.contrast-high")}</option>
            </select>
          </div>
          <br />
        </main>
      </div>
    );
  } else {
    return "Loading...";
  }
}
