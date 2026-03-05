"use client";

import Layout from "@/components/layout";
import Header from "@/components/header";
import UnifiedPanel from "@/components/security-monitor/unified-model";
import ActivityTable from "@/components/security-monitor/activity-table";
import ConnectionStatus from "@/components/security-monitor/connection-status";

import { useEffect, useState } from "react";
import Image from "next/image";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [statusText, setStatusText] = useState("Не подключен");

  useEffect(() => {
    const ws = new WebSocket(
      "ws://10.40.9.46:2020/api/v1/event/new/ws?entry_point_id=1"
    );

    ws.onopen = () => {
      console.log("✅ WebSocket соединение установлено");
      setIsConnected(true);
      setStatusText("Подключено и контролируется");
    };

    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data);
        console.log("📨 Получен JSON:", json);

        // Katta va kichik panellar uchun
        setMessages((prev) => [json, ...prev.slice(0, 200)]);

        // Jadval uchun
        setActivityLog((prev) => [json, ...prev.slice(0, 19)]);
      } catch (e) {
        console.warn("⚠️ Не JSON:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket соединение закрыто");
      setIsConnected(false);
      setStatusText("Не подключен");
    };

    ws.onerror = (error) => {
      console.error("💥 Ошибка WebSocket:", error);
      setStatusText("Ошибка соединения");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white !text-black my-[50px] px-6 py-6 rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Монитор для охраны</h1>
          <p className="text-gray-400 text-lg">
            Активность сотрудников в реальном времени
          </p>
        </div>
        <ConnectionStatus isConnected={isConnected} statusText={statusText} />
      </div>

      {/* Unified Panel (Main + 3 Small) */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[600px] text-center space-y-6">
          <Image
            src="/icons/id-card-animate.svg"
            alt="id-card"
            width={500}
            height={400}
          />
          <p className="text-gray-400 text-lg max-w-md">
            Пока что нет данных о проходах через турникеты. Подключите систему и
            дождитесь первого события.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-3">
            <UnifiedPanel data={messages[0]} variant="main" />
          </div>

          {/* Scrollable Small Panels */}
          <div className="max-h-[750px] overflow-y-auto space-y-4 pr-2 lg:col-span-2">
            {messages.slice(1).map((msg, idx) => (
              <UnifiedPanel
                key={idx}
                data={msg}
                variant="small"
                panelNumber={idx + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity table */}
      {/* {activityLog.length >= 5 && <ActivityTable data={activityLog} />} */}
    </div>
  );
};

export default Index;
