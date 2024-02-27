import Icon from "@mdi/react";
import React from "react";

export default function FAB({icon, text, onClick}:{icon: string, text: string, onClick: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <button
            className="fab"
            onClick={onClick}
        >
            <Icon path={icon} />
            <span>{text}</span>
        </button>
    )

}

export function FabContainer({children}:{children: React.ReactNode}) {
    return (
        <div className="fab-container">
            {children}
        </div>
    )
}