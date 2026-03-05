"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Avatar from "../avatar";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { config } from "@/config";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";
import dayjs from "dayjs";

// Constants
const TIME_SECTION_NAMES = {
  0: "КПП АО ТЭС",
  1: "КПП АО ТЭС",
  2: "КПП АО ТЭС",
  3: "КПП АО ТЭС",
  4: "КПП АО ТЭС",
  5: "КПП АО ТЭС",
  6: "КПП АО ТЭС",
};

const TIME_SECTION_COLORS = {
  VIP: "bg-yellow-400 text-white",
  "КПП АО ТЭС": "bg-blue-100 text-blue-800",
  "График Созлаш": "bg-purple-100 text-purple-800",
  "Созлаш 9:00-17:00": "bg-green-100 text-green-800",
  "Созлаш 9:00-16:00": "bg-pink-100 text-pink-800",
  "АО ТЭС 9:00-17:00": "bg-orange-100 text-orange-800",
  "Созлаш 9:00-18:00": "bg-indigo-100 text-indigo-800",
};

const ERROR_MESSAGES = {
  0: "Доступ разрешён",
  16: "Нет доступа",
  32: "Проход запрещён (вне графика)",
};

// Animation configurations
const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  },
};

const NewUnifiedPanel = ({ data, variant = "main", panelNumber }) => {
  const { data: session } = useSession();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Derived values
  const isValidUser = data?.employee_id && data.employee_id !== 0;
  const errorCode = data?.error_code;
  const isSuccess = errorCode === "Успешно";
  const errorMessage = ERROR_MESSAGES[errorCode] || `${errorCode}`;

  const timestamp = data?.real_utc
    ? new Date(data.real_utc).toLocaleString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Tashkent",
      })
    : "";

  const formattedDate = data?.real_utc
    ? dayjs(data.real_utc).format("DD.MM.YYYY")
    : "";

  // Fetch employee info
  useEffect(() => {
    if (!isValidUser || !session?.accessToken) {
      setEmployeeInfo(null);
      return;
    }

    const fetchEmployeeInfo = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${config.GENERAL_AUTH_URL}staffio/employee/photo/${data?.employee_id}`,
          {
            headers: {
              'Authorization': `Bearer ${session?.accessToken}`
            }
          }
        );

        if (!res.ok) {
          setEmployeeInfo(null);
          return;
        }

        const json = await res.json();
        setEmployeeInfo(json);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setEmployeeInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeInfo();
  }, [data?.employee_id, session?.accessToken, isValidUser]);

  // Calculate badge info
  const sectionId =
    employeeInfo?.timeSectionIdExit ?? employeeInfo?.timeSectionIdEnter ?? 0;
  const graphicName = TIME_SECTION_NAMES[sectionId] || "Неизвестно";
  const badgeColor =
    TIME_SECTION_COLORS[graphicName] || "bg-gray-200 text-gray-800";

  const fullName = employeeInfo
    ? `${employeeInfo.last_name || ""} ${employeeInfo.first_name || ""} ${
        employeeInfo.middle_name || ""
      }`.trim()
    : data?.card_name || "Неизвестно";

  // Event type visual config
  const isEntry = data?.event_type === "Вход";
  const eventConfig = isEntry
    ? {
        icon: LoginIcon,
        label: "ВХОД",
        color: "bg-green-500",
        backgroundColor: "bg-green-500",
        textColor: "text-white",

      }
    : {
        icon: ExitToAppIcon,
        label: "ВЫХОД",
        color: "bg-red-500",
        lightColor: "bg-red-50",
        textColor: "text-white",
        backgroundColor: "bg-red-500",
      };

  // Empty state
  if (!data) {
    return (
      <motion.div
        {...ANIMATIONS.fadeIn}
        className={`rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center ${
          variant === "main" ? "min-h-[400px] p-12" : "min-h-[150px] p-6"
        }`}
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <PersonOutlineOutlinedIcon
              sx={{ fontSize: 32, color: "#9CA3AF" }}
            />
          </div>
          <p className="text-gray-400 font-medium">
            {variant === "main"
              ? "Ожидание прохода..."
              : `Сотрудник ${panelNumber}`}
          </p>
        </div>
      </motion.div>
    );
  }

  // Small variant (archive)
  if (variant === "small") {
    const EventIcon = eventConfig.icon;

    return (
      <motion.div
        {...ANIMATIONS.fadeIn}
        className={`relative rounded-xl bg-white p-6 shadow-sm border-2 transition-all hover:shadow-md ${
          isSuccess ? "border-green-300" : "border-red-300"
        }`}
      >
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Event type with icon - ENTER/EXIT sign style */}
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-md ${eventConfig.backgroundColor} ${eventConfig.textColor} ${eventConfig.borderColor} border-2 flex items-center gap-2 shadow-md uppercase tracking-wide`}
          >
            <EventIcon sx={{ fontSize: 20, color: 'white' }} />
            {eventConfig.label}
          </span>

          {/* Checkpoint */}
          <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-300">
            {data.checkPointName}
          </span>

          {/* Access status */}
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border ${
              isSuccess
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-red-50 text-red-700 border-red-300"
            }`}
          >
            {isSuccess ? "РАЗРЕШЕН" : "ЗАПРЕЩЕН"}
          </span>
        </div>

        {/* Content */}
        <div className="flex items-start gap-4 mt-2">
          <div className="flex-shrink-0">
            <Avatar
              name={data.card_name}
              userId={isValidUser ? data.employee_id : null}
              photoUrl={employeeInfo?.file_url || null}
              userName={employeeInfo?.fullName}
              userJob={employeeInfo?.positionName}
              size="large"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate mb-2">
              {fullName}
            </h3>

            {isValidUser && employeeInfo ? (
              <div className="space-y-2">
                <div className="inline-block">
                  <span className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    {employeeInfo.workplace?.position?.name || "–"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Отдел:</span>{" "}
                  {employeeInfo.workplace?.organizational_unit?.name || "–"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Информация о сотруднике недоступна
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <AccessTimeOutlinedIcon
                  sx={{ fontSize: 16, color: "#6B7280" }}
                />
                {formattedDate} в {timestamp}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Main variant (live display)
  return (
    <motion.div
      {...ANIMATIONS.fadeIn}
      className={`rounded-2xl p-6 bg-white shadow-lg border-4 transition-all ${
        isSuccess
          ? "border-green-400 shadow-green-100"
          : "border-red-400 shadow-red-100"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${badgeColor}`}
        >
          {graphicName === "VIP" && (
            <StarOutlinedIcon sx={{ fontSize: 18 }} />
          )}
          {graphicName === "VIP" ? "VIP СОТРУДНИК" : graphicName}
        </span>
        <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-lg font-medium">
          {formattedDate}
        </span>
      </div>

      {/* Employee info */}
      <div className="flex items-start gap-6 mb-6">
        <div className="flex-shrink-0">
          <Avatar
            name={data.card_name}
            userId={isValidUser ? data.employee_id : null}
            photoUrl={employeeInfo?.file_url || null}
            userName={employeeInfo?.fullName}
            userJob={employeeInfo?.positionName}
            size="large"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {fullName}
          </h1>

          {isValidUser && employeeInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AccountTreeIcon
                    sx={{
                      color: "#06A561",
                      backgroundColor: "#C4F8E2",
                      padding: "8px",
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Отдел
                  </p>
                  <p className="text-base text-gray-900 font-semibold">
                    {employeeInfo.workplace?.organizational_unit?.name || "–"}
                  </p>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <PersonOutlineOutlinedIcon
                    sx={{
                      color: "#F07427",
                      backgroundColor: "#FFEDD5",
                      padding: "8px",
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Должность
                  </p>
                  <p className="text-base text-gray-900 font-semibold">
                    {employeeInfo.workplace?.position?.name || "–"}
                  </p>
                </div>
              </div>

              {/* Door type */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <MeetingRoomIcon
                    sx={{
                      color: "#5149E5",
                      backgroundColor: "#E0E7FF",
                      padding: "8px",
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Тип двери
                  </p>
                  <p className="text-base text-gray-900 font-semibold">
                    {data.event_type}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AccessTimeOutlinedIcon
                    sx={{
                      color: "#E65E5E",
                      backgroundColor: "#FEE2E2",
                      padding: "8px",
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                    }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    Время прохода
                  </p>
                  <p className="text-base text-gray-900 font-semibold">
                    {timestamp}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium text-sm">
                ⚠️ Нет данных о сотруднике
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-20 h-20">
            {/* Pulse animation */}
            <div
              className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                isSuccess ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {/* Icon */}
            <div
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                isSuccess ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isSuccess ? (
                <CheckCircleIcon sx={{ fontSize: 44, color: "white" }} />
              ) : (
                <ReportIcon sx={{ fontSize: 44, color: "white" }} />
              )}
            </div>
          </div>

          <div className="text-center">
            <p
              className={`text-xl font-bold uppercase tracking-wide ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {isSuccess ? "ПРОХОД РАЗРЕШЕН" : "ПРОХОД ЗАПРЕЩЁН"}
            </p>
            <p className="text-gray-600 text-sm mt-1">{errorMessage}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewUnifiedPanel;