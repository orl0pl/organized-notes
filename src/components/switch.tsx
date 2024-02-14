import Icon from "@mdi/react";

export default function Switch({ icon, ...props}: {defaultChecked?: boolean, checked?: boolean, onChange?: Function, icon?: string} & React.HTMLAttributes<HTMLInputElement>) {
    return (
        <label className="switch-container">
            <input type="checkbox"  {...props} />
            <span className="switch-slider">
                {icon && <Icon path={icon} />}
            </span>
        </label>
    )
}