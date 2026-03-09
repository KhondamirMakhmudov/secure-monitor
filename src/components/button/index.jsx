const Button = ({
  children,
  onClick,
  disabled,
  sx,
  type = "submit",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={sx}
      className={`w-full py-[10px] rounded-md text-white transition-all bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-600"
          : "cursor-pointer"
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
