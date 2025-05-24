interface TextInputProps extends React.HTMLAttributes<HTMLInputElement> {
  type?: string | undefined;
}

const TextInput = ({ type, ...props }: TextInputProps) => {
  return (
    <input
      className="TextInput--input Input"
      type={type || "text"}
      {...props}
    />
  );
};

export { TextInput };
