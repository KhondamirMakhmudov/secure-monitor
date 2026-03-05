const StatusBadge = ({ eventType, hasError, size = "large" }) => {
  let statusBg = "bg-orange-500";
  let statusText = "CHIQISH";
  let statusIcon = "🚪";

  if (hasError) {
    statusBg = "bg-red-500";
    statusText = "Ошибка по расписанию";
    statusIcon = "🚫";
  } else if (eventType === "Вход") {
    statusBg = "bg-green-500";
    statusText = "KIRISH";
    statusIcon = "✅";
  }

  const sizeClasses = {
    large: "px-8 py-4 text-2xl",
    medium: "px-4 py-2 text-lg",
    small: "px-2 py-1 text-xs",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-md ${statusBg} text-white font-bold shadow-lg`}
    >
      {`${statusIcon} ${statusText}`}
    </div>
  );
};

export default StatusBadge;
