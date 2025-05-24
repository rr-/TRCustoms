interface BaseIconProps {
  children: React.ReactNode;
}

const BaseIcon = ({ children }: BaseIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="Icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        {children}
      </g>
    </svg>
  );
};

export { BaseIcon };
