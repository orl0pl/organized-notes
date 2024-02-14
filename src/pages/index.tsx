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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from "next-i18next";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  
  const session = await sessionServerSideProps(context);
  return {
    ...session,
    props: await serverSideTranslations(context.locale || context.req.cookies.NEXT_LOCALE || 'en', [
      'common',
    ]),
  }
}

export default function Home({ loggedInUser }: { loggedInUser: User }) {
  const { setTheme } = useTheme();
  const {t} = useTranslation()
  return (
    <div className={"app"} style={{ backgroundColor: "rgb(var(--md-sys-color-background))", color: "rgb(var(--md-sys-color-on-background))" }}>
      <NavigationRail>
        <NavigationRailItem active icon={mdiHome} text="Home" href="/" />
        <NavigationRailItem icon={mdiPen} text="Write" href="/editor" />
        <NavigationRailItem icon={mdiCreation} text="Chat" href="/chat" />
        <NavigationRailItem icon={mdiCog} text="Settings" href="/settings" />
      </NavigationRail>
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
        <Button  type='tonal' icon={mdiCog}>
          {t('button')}
        </Button>
        <button className="filled">
          <div className="state">Test button</div>
        </button> <br />
        <button className="text">
          <div className="state">Test button2</div>
        </button> <br />
        <button className="outlined">
          <div className="state"><Icon path={mdiCog}/> Test button2</div>
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
        </label><br />
        <Switch icon={mdiCog} /><br />
        <Input placeholder="label test" type="outlined"/>
      </main>
    </div>

  );
}
