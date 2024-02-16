import React, { HTMLInputTypeAttribute } from "react";

interface IInputProps {
	type?: HTMLInputTypeAttribute,
	displayType?: "outlined" | "filled";
    placeholder?: string;
}

export function Input({
	displayType,
    placeholder,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & IInputProps) {
	return (
		<div className={displayType === "outlined" ? "outlined-input-container" : "input-container"}>
			<input placeholder={placeholder} {...props} />
			<span className="label-text">{placeholder}</span>
		</div>
	);
}
