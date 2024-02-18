import { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSidePropsContext } from "next";
import User from "@/interfaces/user";
import { sessionServerSideProps } from "@/utils/session";
import { useTheme } from "next-themes";
import { mdiCog, mdiCreation, mdiHome, mdiPen } from "@mdi/js";
import Button from "@/components/button";
import Icon from "@mdi/react";
import Switch from "@/components/switch";
import { Input } from "@/components/input";
import { NavigationRail, NavigationRailItem } from "@/components/navigation";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await sessionServerSideProps(context);
  console.log(context.locale);
  return {
    ...session,
    props: await serverSideTranslations(context.locale || "en", ["common"]),
  };
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { t } = useTranslation();
  return (
    <div
      className={"app"}
      style={{
        backgroundColor: "rgb(var(--md-sys-color-background))",
        color: "rgb(var(--md-sys-color-on-background))",
      }}
    >
      <NavigationRail>
        <NavigationRailItem active icon={mdiHome} text="Home" href="/" />
        <NavigationRailItem icon={mdiPen} text="Write" href="/editor" />
        <NavigationRailItem icon={mdiCreation} text="Chat" href="/chat" />
        <NavigationRailItem icon={mdiCog} text="Settings" href="/settings" />
      </NavigationRail>
      <main
        style={{
          padding: 16,
        }}
      >
        <h1>Ustawienia</h1>
        Motyw: Zielony
        <br />
        Tryb ciemny{" "}
        <Switch
          icon={mdiCog}
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
                ? theme?.replace("dark", "light")
                : theme?.replace("light", "dark")
            );
          }}
        />
        <br />
      </main>
    </div>
  );
}