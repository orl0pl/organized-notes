import Icon from "@mdi/react"
import Link from "next/link"

export function NavigationRail({ children }: { children: React.ReactNode }) {
    return (
        <nav className="navigation-rail">
            {children}
        </nav>
    )
}

export function NavigationRailItem({ icon, text, href, active, inActiveIcon }: { icon: string, text: string, href: string, active?: boolean, inActiveIcon?: string }) {
    return (
        <Link className={active ? "active" : ""} href={href}>
            <Icon path={active ? icon : (inActiveIcon || icon)}/>
            <span>{text}</span>
        </Link>
    )
    
}