interface IInputProps {
	type?: "outlined" | "filled";
    placeholder?: string;
}

export function Input({
	children,
	type,
    placeholder,
	...props
}: React.HTMLAttributes<HTMLInputElement> & IInputProps) {
	return (
		<div className={type === "outlined" ? "outlined-input-container" : "input-container"}>
			<input placeholder={placeholder} {...props} />
			<span className="label-text">{placeholder}</span>
		</div>
	);
}
