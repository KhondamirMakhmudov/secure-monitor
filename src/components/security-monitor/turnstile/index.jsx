"use client";

import { useEffect, useRef, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import { URLS } from "@/constants/url";

const Turnstile = ({ ipEntry, ipExit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  const { mutate: openTurnstile } = usePostPythonQuery({
    listKeyId: "open-door",
  });

  const handleAccess = (ip) => {
    if (!ip) {
      console.warn("❌ IP manzil yo‘q");
      return;
    }

    openTurnstile({
      url: URLS.openDoor,
      attributes: { ipAddress: String(ip) }, // API kutayotgan nom bilan yuboramiz
    });

    if (isOpen) return;
    setIsOpen(true);
    setCountdown(5);
  };

  useEffect(() => {
    if (!isOpen) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsOpen(false);
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isOpen]);

  return (
    <div className="space-y-[20px]">
      {/* Barrier UI */}
      <div className="relative h-32 w-full bg-gray-700 rounded-lg border-2 border-gray-600 overflow-hidden">
        {/* Left Door */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex items-center justify-center transition-all duration-1000 ease-in-out ${
            isOpen
              ? "translate-x-[-100%] bg-gradient-to-r from-green-500 to-green-600"
              : "translate-x-0 bg-gradient-to-r from-red-500 to-red-600"
          }`}
        >
          <div className="text-white font-bold rotate-90 text-xs tracking-widest">
            {isOpen ? "PASS" : "STOP"}
          </div>
        </div>

        {/* Right Door */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full flex items-center justify-center transition-all duration-1000 ease-in-out ${
            isOpen
              ? "translate-x-[100%] bg-gradient-to-l from-green-500 to-green-600"
              : "translate-x-0 bg-gradient-to-l from-red-500 to-red-600"
          }`}
        >
          <div className="text-white font-bold -rotate-90 text-xs tracking-widest">
            {isOpen ? "PASS" : "STOP"}
          </div>
        </div>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {isOpen ? (
            <LockOpenIcon
              fontSize="large"
              className="text-green-300 animate-bounce"
            />
          ) : (
            <LockIcon fontSize="large" className="text-red-300" />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="text-center gap-2 flex justify-between">
        <button
          disabled={isOpen}
          onClick={() => handleAccess(ipEntry)}
          className={`px-8 py-4 text-lg rounded-2xl font-bold transition-all w-1/3 duration-300 ${
            isOpen
              ? "bg-green-600 cursor-not-allowed opacity-70"
              : "bg-blue-400 hover:bg-blue-500 transition-all duration-200 hover:scale-105 active:scale-95"
          }`}
        >
          {isOpen ? `Открыто (${countdown})` : "Вход"}
        </button>

        <button
          disabled={isOpen}
          onClick={() => handleAccess(ipExit)}
          className={`px-8 py-4 text-lg rounded-2xl font-bold transition-all w-1/3 duration-300 ${
            isOpen
              ? "bg-green-600 cursor-not-allowed opacity-70"
              : "bg-blue-400 hover:bg-blue-500 transition-all duration-200 hover:scale-105 active:scale-95"
          }`}
        >
          {isOpen ? `Открыто (${countdown})` : "Выход"}
        </button>
      </div>
    </div>
  );
};

export default Turnstile;
