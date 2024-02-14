import Icon from "@mdi/react";
import React from "react";

interface IButtonProps {
    type: 'filled' | 'text' | 'outlined' | 'tonal',
    icon?: string
}

export default function Button({ children, type, icon, ...props }: React.HTMLAttributes<HTMLButtonElement> & IButtonProps) {
    return (
        <button
            {...props}
            className={type}
        >
            <div className="state">
                {icon && <Icon path={icon} />}
                {children}
            </div>
        </button>
    )
}