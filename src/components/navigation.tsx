import Icon from "@mdi/react"
import Link from "next/link"

export function NavigationRail({ children }: { children: React.ReactNode }) {
    return (
        <nav className="navigation-rail">
            {children}
        </nav>
    )
}

export function NavigationRailItem({ icon, text, href, active }: { icon: string, text: string, href: string, active?: boolean }) {
    return (
        <Link className={active ? "active" : ""} href={href}>
            <Icon path={icon}/>
            <span>{text}</span>
        </Link>
    )
    
}