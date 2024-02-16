import Icon from "@mdi/react";
import React from "react";

interface IButtonProps {
    type?: 'submit'
    displayType: 'filled' | 'text' | 'outlined' | 'tonal',
    icon?: string
}

export default function Button({ children, displayType, icon, ...props }: React.HTMLAttributes<HTMLButtonElement> & IButtonProps) {
    return (
        <button
            {...props}
            className={displayType}
        >
            <div className="state">
                {icon && <Icon path={icon} />}
                {children}
            </div>
        </button>
    )
}