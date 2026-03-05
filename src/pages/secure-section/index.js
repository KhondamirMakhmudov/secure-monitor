import { useEffect, useState, useMemo } from "react";
import ConnectionStatus from "@/components/security-monitor/connection-status";
import Image from "next/image";
import NewUnifiedPanel from "@/components/security-monitor/new-unified-model";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import Turnstile from "@/components/security-monitor/turnstile";
import { get } from "lodash";
import { useSession } from "next-auth/react";

const Index = () => {
  const {data: session} = useSession()
  const [messages, setMessages] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [statusText, setStatusText] = useState("Не подключен");
  const [devices, setDevices] = useState([]);

  // Simple fetch for devices
  useEffect(() => {
      const fetchDevices = async () => {
        try {
          const response = await fetch("https://app.tpp.uz/acs/api/cameras", {
            headers: {
              "Authorization": `Bearer ${session?.accessToken}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          setDevices(Array.isArray(data) ? data : []);
          console.log("Fetched devices:", data);
        } catch (error) {
          console.error("Error fetching devices:", error);
        }
      };

      if (session?.accessToken) {
        fetchDevices();
      }
    }, [session?.accessToken]);// Empty dependency array - runs once on mount

  // Faqat КПП 1 va КПП 2 larni olish
  const checkpoints = useMemo(() => {
    if (!devices.length) return [];

    const filtered = devices.filter((d) =>
      ["КПП ТЭС", "КПП СОЗЛАШ", "КПП 3"].includes(d.checkPointName)
    );

    // Dublikatlarni faqat checkPointName bo'yicha olib tashlash
    const unique = filtered.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => t.checkPointName === item.checkPointName)
    );

    return unique;
  }, [devices]); // Only re-run when devices changes

  useEffect(() => {
    let ws = null;
    let isClosed = false;

    const connectWebSocket = () => {
      ws = new WebSocket(
        "ws://10.20.6.60:2022/api/v1/events/ws?entry_point_id=2"
      );

      ws.onopen = () => {
        if (!isClosed) {
          console.log("✅ WebSocket соединение установлено");
          setIsConnected(true);
          setStatusText("Подключено и контролируется");
        }
      };

      ws.onmessage = (event) => {
        if (isClosed) return;
        
        try {
          const json = JSON.parse(event.data);
          console.log("📨 Получен JSON:", json);

          setMessages((prev) => [json, ...prev.slice(0, 200)]);
          setActivityLog((prev) => [json, ...prev.slice(0, 19)]);
        } catch (e) {
          console.warn("⚠️ Не JSON:", event.data);
        }
      };

      ws.onclose = () => {
        if (!isClosed) {
          console.log("❌ WebSocket соединение закрыто");
          setIsConnected(false);
          setStatusText("Не подключен");
        }
      };

      ws.onerror = (error) => {
        if (!isClosed) {
          console.error("💥 Ошибка WebSocket:", error);
          setStatusText("Ошибка соединения");
        }
      };
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      isClosed = true;
      if (ws) {
        ws.close();
      }
    };
  }, []); // Empty dependency array - runs once on mount

  // Har bir checkpoint uchun eng so'nggi xabarni olish
  const latestForCheckpoint = (name) => {
    const filtered = messages.filter((msg) => msg.check_point_name === name);
    
    console.log(`All messages for ${name}:`, filtered.length);
    filtered.forEach((msg, idx) => {
      console.log(`  [${idx}] ${msg.card_name} - ${msg.real_utc}`);
    });
    
    if (filtered.length === 0) return null;
    
    // Create a copy and sort by real_utc timestamp (most recent first)
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.real_utc);
      const dateB = new Date(b.real_utc);
      return dateB - dateA; // Descending order (newest first)
    });
    
    console.log(`✅ LATEST for ${name}:`, sorted[0]?.card_name, sorted[0]?.real_utc);
    console.log('---');
    
    return sorted[0];
  };

  const latestMessages = checkpoints
    .map((cp) => latestForCheckpoint(cp.checkPointName))
    .filter(Boolean);

  const archiveMessages = messages.filter(
    (msg) => !latestMessages.includes(msg)
  );

  return (
    <div className="my-[50px]">
      <div className="flex items-center justify-between p-4 rounded-md">
        <div>
          <h1 className="text-4xl font-bold">Система контроля доступа</h1>
          <p className="text-gray-400 text-lg">
            Активность сотрудников в реальном времени
          </p>
        </div>
        <ConnectionStatus isConnected={isConnected} statusText={statusText} />
      </div>

      {/* Top status bars */}
      <div className="flex gap-6 items-center my-[20px]">
        {checkpoints.map((cp, i) => (
          <div
            key={cp.checkPointId}
            className="component-checkpoint p-4 rounded-md flex items-center gap-2 w-1/2"
          >
            <div
              className={`w-[10px] h-[10px] rounded-full ${
                i === 0 ? "bg-green-400 animate-pulse" : "bg-blue-400"
              }`}
            ></div>
            <p className="text-lg">{cp.checkPointName}</p>
          </div>
        ))}
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Main Panels for each checkpoint */}
          {checkpoints.map((cp) => {
            // Shu checkpointga tegishli barcha device larni chiqaramiz
            const devicesForCP = devices.filter(
              (d) =>  
                d.checkPointName?.trim().toLowerCase() ===
                cp.checkPointName?.trim().toLowerCase()
            );

            // Entry va Exit ni alohida ajratamiz
            const entryDevice = devicesForCP.find(
              (d) => d.doorType?.trim().toLowerCase() === "вход"
            );
            const exitDevice = devicesForCP.find(
              (d) => d.doorType?.trim().toLowerCase() === "выход"
            );

            const latestData = latestForCheckpoint(cp.checkPointName);

            return (
              <div
                key={cp.checkPointId}
                className="lg:col-span-3 flex flex-col"
              >
                <NewUnifiedPanel
                  key={latestData?.id || `empty-${cp.checkPointId}`}
                  data={latestData}
                  variant="main"
                />
                <div className="p-4 my-[15px] rounded-md turnstile">
                  <DoorFrontIcon sx={{ marginRight: "3px" }} />
                  Управление турникетами
                  <div className="turnstile-title p-4 rounded-md flex items-center gap-2 mt-[15px]">
                    <div className="bg-blue-400 animate-pulse w-[10px] h-[10px] rounded-full"></div>
                    <p className="text-lg">
                      Главный вход ({cp.checkPointName})
                    </p>
                  </div>
                  <div className="my-[30px]">
                    <Turnstile
                      ipEntry={entryDevice?.ipAddress}
                      ipExit={exitDevice?.ipAddress}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Archive */}
          <div className="component-checkpoint col-span-6 p-4 rounded-md flex items-center gap-2 w-full">
            <div className="bg-blue-400 w-[10px] h-[10px] rounded-full"></div>
            <p className="text-lg">Архив проходов</p>
          </div>
          <div className="max-h-[750px] overflow-y-auto space-y-4 pr-2 lg:col-span-6">
            {archiveMessages.length > 0 ? (
              archiveMessages.map((msg, idx) => (
                <NewUnifiedPanel
                  key={idx}
                  data={msg}
                  variant="small"
                  panelNumber={idx + 1}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center">Архив пуст</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

export async function getStaticProps() {
  return {
    props: {
      bgColor: "bg-gray-100",
      headerBg: "bg-white",
    },
  };
}