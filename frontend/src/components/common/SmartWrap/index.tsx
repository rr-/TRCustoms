import "./index.css";

interface SmartWrapProps {
  text: string;
}

const SmartWrap = ({ text }: SmartWrapProps) => {
  return (
    <span className="SmartWrap">
      {text.split(/(\s*[:-]\s*)/).map((word, i) => (
        <span key={i} className="SmartWrap--part">
          {word}
        </span>
      ))}
    </span>
  );
};

export { SmartWrap };
