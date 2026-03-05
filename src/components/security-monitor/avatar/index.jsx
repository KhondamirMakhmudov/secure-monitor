const Avatar = ({
  name,
  userId,
  photoUrl,
  userName,
  userJob,
  size = "large",
}) => {
  const isValidUser = userId && userId !== 0;

  const sizeClasses = {
    large: "w-40 h-40 text-5xl",
    medium: "w-20 h-20 text-2xl",
    small: "w-16 h-16 text-lg",
  };

  const fallbackColor = "bg-gradient-to-br from-blue-500 to-purple-600";
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className={`rounded-lg ${sizeClasses[size]} shadow-md flex items-center justify-center text-white font-bold overflow-hidden`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${fallbackColor}`}
          >
            {initials || "?"}
          </div>
        )}
      </div>

      {isValidUser && (
        <>
          <h1 className="text-center text-xl mt-[10px] font-semibold">
            {userName}
          </h1>
          {userJob && (
            <h2 className="text-center text-sm text-gray-500">{userJob}</h2>
          )}
        </>
      )}
    </div>
  );
};

export default Avatar;
