import Icon from "@mdi/react";

export default function Switch({ checked, onChange, icon, ...props}: {checked?: boolean, onChange?: () => void, icon?: string} & React.HTMLAttributes<HTMLInputElement>) {
    return (
        <label className="switch-container">
            <input type="checkbox" checked={checked}  {...props} />
            <span className="switch-slider">
                {icon && <Icon path={icon} />}
            </span>
        </label>
    )
}