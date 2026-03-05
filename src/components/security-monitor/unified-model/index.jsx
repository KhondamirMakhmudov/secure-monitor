"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // 👈 qo‘shildi
import Avatar from "../avatar";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { config } from "@/config";

const UnifiedPanel = ({ data, variant = "main", panelNumber }) => {
  const { data: session } = useSession();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const isValidUser = data?.employee_id && data.employee_id !== 0;

  const timestamp = data?.real_utc
    ? new Date(data.real_utc + "Z").toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Tashkent",
      })
    : "";

  const fetchedUserIds = new Set();

  useEffect(() => {
    const userId = data?.employee_id;
    if (!userId || !session?.accessToken) return;

    if (fetchedUserIds.has(userId)) return;

    const fetchEmployeeInfo = async () => {
      try {
        const res = await fetch(
          `${config.JAVA_API_URL}api/employees/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const json = await res.json();
        setEmployeeInfo(json);
        fetchedUserIds.add(userId); // ✅ global Set ga qo‘shamiz
      } catch (error) {
        console.error("Ошибка:", error);
      }
    };

    fetchEmployeeInfo();
  }, [data?.employee_id, session?.accessToken]);

  const errorType = data?.error_code;
  const isSuccess = errorType === "Нет ошибки.";
  const errorMessage =
    errorType === "Ошибка по расписанию"
      ? "Проход запрещён (вне графика)"
      : errorType === "Нет доступа (неавторизован)"
      ? "Нет доступа"
      : isSuccess
      ? "Доступ разрешён"
      : errorType;

  const errorColor = isSuccess ? "#06A561" : "#f87171";

  const animationProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  };

  // === EMPTY STATE ===
  if (!data) {
    return variant === "main" ? (
      <motion.div
        {...animationProps}
        className="bg-white/10 p-12 min-h-[400px] rounded-2xl border border-gray-300 flex items-center justify-center"
      >
        <p className="text-gray-400">Нет данных</p>
      </motion.div>
    ) : (
      <motion.div
        {...animationProps}
        className="border border-gray-300 rounded-2xl p-6 min-h-[150px] flex items-center justify-center"
      >
        <p className="text-gray-400">Сотрудник {panelNumber}</p>
      </motion.div>
    );
  }

  // === SMALL PANEL ===
  if (variant === "small") {
    return (
      <motion.div
        key={data?.id || data?.employee_id}
        {...animationProps}
        className={`rounded-2xl p-4 bg-cover ${
          isSuccess ? "border-green-500" : "border-red-500"
        } border-[2px]`}
        style={{ backgroundImage: "url('/images/background_id_card.jpg')" }}
      >
        <div className="flex items-start gap-3">
          <Avatar
            name={data.card_name}
            userId={isValidUser ? data.employee_id : null}
            size="small"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-black font-semibold text-sm truncate mb-1">
              {data.card_name || "Неизвестно"}
            </h3>

            <div
              className="flex items-center gap-1 px-2 py-[2px] mb-2 text-xs font-medium rounded-md border"
              style={{
                backgroundColor: isSuccess ? "#C4F8E2" : "#fee2e2",
                color: isSuccess ? "#06A561" : "#DC2626",
                borderColor: isSuccess ? "#06A561" : "#fca5a5",
              }}
            >
              {isSuccess ? (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              ) : (
                <ReportIcon sx={{ fontSize: 16 }} />
              )}
              {errorMessage}
            </div>

            <p className="text-xs text-gray-500">
              Тип двери: <b>{data.event_type || "–"}</b>
            </p>

            <p className="text-xs text-gray-500 mb-2">
              Время действие: <b>{timestamp}</b>
            </p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 text-sm flex items-center gap-1"
            >
              {expanded ? (
                <>
                  <ExpandLessIcon fontSize="small" /> Скрыть
                </>
              ) : (
                <>
                  <ExpandMoreIcon fontSize="small" /> Подробнее
                </>
              )}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  {...animationProps}
                  className="mt-2 text-xs text-black space-y-1"
                >
                  {isValidUser ? (
                    <>
                      <p>Здание: {data.device?.building || "–"}</p>
                      <p>
                        Подразделение:{" "}
                        {employeeInfo?.department?.nameDep || "–"}
                      </p>
                      <p>Отдел: {employeeInfo?.structureName || "–"}</p>
                      <p>Должность: {employeeInfo?.jobTitleName || "–"}</p>
                    </>
                  ) : (
                    <p className="text-red-500">Нет данных о сотруднике</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // === MAIN PANEL ===
  return (
    <motion.div
      key={data?.id || data?.employee_id}
      {...animationProps}
      className={`rounded-2xl p-4 bg-cover ${
        isSuccess ? "border-green-500" : "border-red-500"
      } border-[2px]`}
      style={{ backgroundImage: "url('/images/background_id_card.jpg')" }}
    >
      <div className="w-full h-full">
        <div className="flex items-start gap-5">
          <Avatar
            name={data.card_name}
            userId={isValidUser ? data.employee_id : null}
            size="large"
          />
          <div>
            <h1 className="text-4xl font-bold text-black leading-tight">
              {isValidUser
                ? `${employeeInfo?.firstName || ""} ${
                    employeeInfo?.lastName || ""
                  } ${employeeInfo?.fatherName || ""}`
                : data.card_name || "Неизвестно"}
            </h1>

            {isValidUser ? (
              <>
                <p className="text-black text-[17px] mt-[10px]">
                  Здание: {data?.device?.building}
                </p>
                <p className="text-black text-[17px]">
                  Подразделение: {employeeInfo?.department?.nameDep}
                </p>
                <p className="text-black text-[17px]">
                  Отдел : {employeeInfo?.structureName}
                </p>
                <p className="text-black text-[17px]">
                  Должность : {employeeInfo?.jobTitleName}
                </p>
              </>
            ) : (
              <div className="mt-3 text-red-600 font-medium text-base">
                Нет данных о сотруднике
              </div>
            )}

            <p className="text-black text-[17px]">
              Тип двери: {data?.event_type}
            </p>
          </div>
        </div>

        <div
          className={`mt-6 p-4 border-2 rounded-xl w-full ${
            isSuccess
              ? "bg-[#C4F8E2] border-[#06A561]"
              : "bg-red-500/20 border-red-500/50"
          }`}
        >
          <div
            className={`font-semibold text-lg flex items-center gap-2 ${
              isSuccess ? "text-[#06A561]" : "text-red-500"
            }`}
          >
            {isSuccess ? (
              <CheckCircleIcon sx={{ width: 30, height: 30 }} />
            ) : (
              <ReportIcon sx={{ width: 30, height: 30 }} />
            )}
            <p>{errorMessage}</p>
          </div>
        </div>

        <div className="flex items-center justify-start mt-[20px]">
          <p className="text-black text-base">
            Время действие: <b>{timestamp}</b>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UnifiedPanel;
