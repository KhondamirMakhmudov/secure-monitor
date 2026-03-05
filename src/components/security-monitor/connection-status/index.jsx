const ConnectionStatus = ({ isConnected, statusText }) => {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-4 h-4 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"
        }`}
      />
      <span
        className={`text-lg font-medium ${
          isConnected ? "text-green-400" : "text-red-400"
        }`}
      >
        {statusText}
      </span>
    </div>
  );
};

export default ConnectionStatus;
