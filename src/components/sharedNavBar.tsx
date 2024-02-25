import {
  mdiCog,
  mdiCogOutline,
  mdiCreation,
  mdiCreationOutline,
  mdiFolderOpen,
  mdiFolderOutline,
  mdiPen,
  mdiPencil,
  mdiPencilOutline,
} from "@mdi/js";
import { NavigationRail, NavigationRailItem } from "./navigation";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export default function SharedNavBar({ active }: { active: '/' | 'editor' | 'chat' | 'settings' }) {
  const { t } = useTranslation("settings");
  return (
    <NavigationRail>
      <NavigationRailItem
        icon={mdiFolderOpen}
        inActiveIcon={mdiFolderOutline}
        text={t("common:home")}
        href="/"
        active={active === "/"}
      />
      <NavigationRailItem
        icon={mdiPencil}
        inActiveIcon={mdiPencilOutline}
        text={t("common:editor")}
        href="/editor"
        active={active === "editor"}
      />
      <NavigationRailItem
        icon={mdiCreation}
        inActiveIcon={mdiCreationOutline}
        text={t("common:chat")}
        href="/chat"
        active={active === "chat"}
      />
      <NavigationRailItem
        icon={mdiCog}
        inActiveIcon={mdiCogOutline}
        text={t("common:settings")}
        href="/settings"
        active={active === "settings"}
      />
    </NavigationRail>
  );
}
