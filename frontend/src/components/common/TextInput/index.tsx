interface TextInputProps {
  type?: string | undefined;
  maxLength?: number | undefined;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void | undefined;
  value?: string | undefined;
  placeholder?: string | undefined;
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
