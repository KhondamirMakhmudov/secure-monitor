"use client";

import React from "react";

const ActivityTable = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length < 5) return null;

  return (
    <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 overflow-x-auto">
      <table className="min-w-full text-left text-sm text-white border-collapse">
        <thead>
          <tr className="text-blue-300 border-b border-white/20">
            <th className="py-3 px-4">№</th>
            <th className="py-3 px-4">Аватар</th>
            <th className="py-3 px-4">Ф.И.О.</th>
            <th className="py-3 px-4">Время</th>
            <th className="py-3 px-4">Тип прохода</th>
            <th className="py-3 px-4">Метод</th>
            <th className="py-3 px-4">Ошибка</th>
            <th className="py-3 px-4">Контрольная точка</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const tashkentTime = item?.real_utc
              ? new Date(item.real_utc + "Z").toLocaleString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZone: "Asia/Tashkent",
                })
              : "-";

            return (
              <tr
                key={idx}
                className="border-t border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">{idx + 1}</td>
                <td className="py-3 px-4">
                  <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.card_name?.[0] || "?"}
                  </div>
                </td>
                <td className="py-3 px-4">{item.card_name || "Неизвестно"}</td>
                <td className="py-3 px-4">{tashkentTime}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      item.event_type === "Вход" ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {item.event_type}
                  </span>
                </td>
                <td className="py-3 px-4">{item.method || "-"}</td>
                <td className="py-3 px-4 text-red-400">
                  {item.error_code && item.error_code !== "Нет ошибки."
                    ? item.error_code
                    : ""}
                </td>
                <td className="py-3 px-4">
                  {item.device?.checkPointName || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
