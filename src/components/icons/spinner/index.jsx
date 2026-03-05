const SpinnerIcon = ({ props, color = "black", width, height, classname }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M30 8V15.5"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M52.5 30.5H45"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45.9088 46.4097L40.6055 41.1064"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 53V45.5"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0918 46.4097L19.3951 41.1064"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 30.5H15"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0918 14.5898L19.3951 19.8931"
        stroke={color}
        strokeWidth="3.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SpinnerIcon;
