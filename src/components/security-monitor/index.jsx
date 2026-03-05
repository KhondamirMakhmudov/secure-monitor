import { useCallback, useEffect, useState } from "react";
import UnifiedPanel from "./unified-panel"; // BIRLASHGAN COMPONENT
import ActivityTable from "./activity-table";
import ConnectionStatus from "./ConnectionStatus";

const SecurityMonitor = () => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState([null, null, null, null]);
  const [wsUrl, setWsUrl] = useState("ws://10.40.9.46:2020/api/v1/event/ws");
  const [statusText, setStatusText] = useState("Ulanmagan");

  const processNewActivity = useCallback((data) => {
    setActivities((prev) => [data, prev[0], prev[1], prev[2]]);
  }, []);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setIsConnected(true);
        setStatusText("Ulangan va Kuzatmoqda");
        setWs(socket);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          processNewActivity(data);
        } catch (e) {
          console.error("JSON xatolik:", e);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setStatusText("Ulanmagan");
        setWs(null);
      };

      socket.onerror = (error) => {
        console.error("WebSocket xatosi:", error);
        setStatusText("Ulanishda xatolik");
      };
    } catch (error) {
      console.error("WebSocket ulana olmadi:", error);
    }
  }, [wsUrl, processNewActivity]);

  const disconnect = useCallback(() => {
    if (ws) ws.close();
  }, [ws]);

  const toggleConnection = () => {
    if (isConnected) disconnect();
    else connect();
  };

  const clearAllPanels = () => {
    setActivities([null, null, null, null]);
  };

  const addDemoEvent = () => {
    const names = [
      "Абдуллаев Рустам",
      "Саидова Зилола",
      "Турсунов Улуғбек",
      "Исмойилов Дилшод",
      "Мирзаева Нилуфар",
      "Каримов Шерзод",
    ];
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const demo = {
      ipAddress: "1.2.3." + Math.floor(Math.random() * 100),
      employee_id: Math.floor(Math.random() * 900 + 100),
      event_type: random(["Вход", "Выход"]),
      method: "ID yoki karta",
      error_code: random([
        "Нет ошибки.",
        "Ошибка по расписанию",
        "Карта заблокирована",
      ]),
      card_name: random(names),
      serial_number: null,
      real_utc: new Date().toISOString(),
    };

    processNewActivity(demo);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 min-h-screen text-white">
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <UnifiedPanel data={activities[0]} variant="main" />
          </div>
          <div className="space-y-6">
            <UnifiedPanel
              data={activities[1]}
              variant="small"
              panelNumber={1}
            />
            <UnifiedPanel
              data={activities[2]}
              variant="small"
              panelNumber={2}
            />
            <UnifiedPanel
              data={activities[3]}
              variant="small"
              panelNumber={3}
            />
          </div>
          <div className="col-span-3">
            <ActivityTable data={activities.slice(4)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityMonitor;
