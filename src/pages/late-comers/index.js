import { useState, useMemo, useEffect } from "react";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import dayjs from "dayjs";
import Input from "@/components/input";
import { motion, AnimatePresence } from "framer-motion";
import ContentLoader from "@/components/loader";
import CustomSelect from "@/components/select";
import { useSession } from "next-auth/react";
import { config } from "@/config";
import Avatar from "@/components/security-monitor/avatar";
import ReactPaginate from "react-paginate";
import ExcelButton from "@/components/button/excel-button";
import { Typography } from "@mui/material";
import * as XLSX from "xlsx";
import ExcelJS from "xlsx-js-style";

export default function LateComers() {
  const { data: session } = useSession();
  const limit = 100;
  const [employeesMap, setEmployeesMap] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [today, setToday] = useState(dayjs().format("YYYY-MM-DD")); // faqat sana
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const startDate = `${today}T${startTime}`;
  const endDate = `${today}T${endTime}`;
  const [eventType, setEventType] = useState(null); // enter / exit
  const [errorCode, setErrorCode] = useState(null); // 0 / 32
  const [confirm, setConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastList, setLastList] = useState(false);
  const pageSize = 20;

  useEffect(() => {
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(today.toLocaleDateString("ru-RU", options));
  }, []);

  const {
    data: getLateComers,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: [KEYS.getLateComers, startDate, endDate, eventType, errorCode],
    url: URLS.getLateComers,
    params: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize || 0,
      start: startDate,
      end: endDate,
      event_type: eventType || null,
      error_code: errorCode || null,
      confirmed: confirm,
      late_list: lastList,
    },
  });
  

  const exportToExcel = (rows, filename) => {
    // 1) Headerlarni olish
    const headers = Object.keys(rows[0] || {});

    // 2) Excel sheet uchun formatlangan data
    const data = [
      // Header qatori
      headers.map((h) => ({
        v: h, // value
        t: "s",
        s: {
          font: { bold: true, color: { rgb: "FFFFFFFF" }, sz: 12 },
          fill: { fgColor: { rgb: "4F81BD" } }, // header background
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        },
      })),
      // Body qatorlari
      ...rows.map((row) =>
        headers.map((key) => ({
          v: row[key] ?? "",
          t: "s",
          s: {
            font: { sz: 11 },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thick", color: { argb: "000000" } },
              bottom: { style: "thick", color: { argb: "000000" } },
              left: { style: "thin", color: { argb: "808080" } },
              right: { style: "thin", color: { argb: "808080" } },
            },
          },
        }))
      ),
    ];

    // 3) Sheet yaratish
    const worksheet = ExcelJS.utils.aoa_to_sheet(
      data.map((row) => row.map((cell) => cell.v))
    );

    // Style-ni ulash
    worksheet["!cols"] = headers.map(() => ({ wch: 20 })); // column width

    // 4) Workbook yaratish
    const workbook = ExcelJS.utils.book_new();
    ExcelJS.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 5) Faylni yozish
    ExcelJS.writeFile(workbook, filename);
  };

  const buildQuery = (params) => {
    const query = new URLSearchParams();

    if (params.limit) query.append("limit", params.limit);
    if (params.offset !== undefined) query.append("offset", params.offset);
    if (params.start) query.append("start", params.start);
    if (params.end) query.append("end", params.end);
    if (params.event_type) query.append("event_type", params.event_type); // faqat Enter/Exit bo‘lsa
    if (params.error_code !== null && params.error_code !== undefined)
      query.append("error_code", params.error_code);
    if (params.confirmed !== null && params.confirmed !== undefined)
      query.append("confirmed", params.confirmed);
    if (params.late_list) query.append("late_list", params.late_list);

    return query.toString();
  };

  // excel yuklash handler
const handleDownloadExcel = async () => {
  if (isDownloading) return; // Prevent multiple clicks
  
  try {
    setIsDownloading(true);
    
    const query = buildQuery({
      limit: 1000,
      offset: 0,
      start: startDate,
      end: endDate,
      event_type: eventType,
      error_code: errorCode,
      confirmed: confirm,
      late_list: lastList,
    });
    
    // 1) asosiy API fetch (limit = 1000)
    const res = await fetch(
      `${config.PYTHON_API_URL_REPORT}${URLS.getLateComers}?${query}`
    );
    const json = await res.json();
    const lateComers = json?.data || [];

    // 2) xodimlarni olish
    const uniqueUserIds = [
      ...new Set(lateComers.map((item) => item.id)),
    ];
    const employeesMapExcel = {};
    await Promise.all(
      uniqueUserIds.map(async (id) => {
        try {
          const empRes = await fetch(
            `${config.GENERAL_AUTH_URL}staffio/employee/${id}`,
            {
              headers: {
                'Authorization': `Bearer ${session?.accessToken}`
              }
            }
          );
          if (empRes.ok) {
            const empJson = await empRes.json();
            employeesMapExcel[id] = empJson;
          } else {
            employeesMapExcel[id] = null;
          }
        } catch (err) {
          employeesMapExcel[id] = null;
        }
      })
    );

    // 3) excel rows tayyorlash
    const excelRows = lateComers.map((item, index) => {
      const employee = employeesMapExcel[item.employee_id];
      return {
        id: index + 1,
        Имя: employee
        ? `${employee?.first_name} ${employee?.last_name}  ${employee?.middle_name}`
        : "Неизвестно",
        Отдел: employee?.workplace?.organizational_unit?.name  || "-",
        Дата: dayjs(item.real_utc).format("DD.MM.YYYY"),
        Время: new Date(item.real_utc).toLocaleString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Tashkent",
        }),
        Дверь: item.event_type,
        Статус:
          item.error_code === 0
            ? "Вовремя"
            : item.error_code === 32
            ? "Опоздал"
            : "Неизвестно",
        Cтатус_события: item.confirmed
          ? "Подтверждённый"
          : "Неподтверждённый",
      };
    });

    // 4) export
    exportToExcel(excelRows, "Отчёты-КПП.xlsx");
  } catch (err) {
    console.error("Excel yuklashda xato:", err);
  } finally {
    setIsDownloading(false);
  }
};  
  // xodimlar ma’lumotlarini olish

  useEffect(() => {
    if (!getLateComers?.data?.data) return;

    const uniqueUserIds = [
      ...new Set(getLateComers.data?.data.map((item) => item.id)),
    ];

    const fetchEmployees = async () => {
      const results = {};

      await Promise.all(
        uniqueUserIds.map(async (id) => {
          try {
            const res = await fetch(
              `${config.GENERAL_AUTH_URL}staffio/employee/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${session?.accessToken}`,
                },
              }
            );

            if (res.ok) {
              const json = await res.json();
              results[id] = json;
            } else {
              results[id] = null;
            }
          } catch (err) {
            console.error("Ошибка при загрузке сотрудника:", err);
            results[id] = null;
          }
        })
      );

      setEmployeesMap(results);
    };

    fetchEmployees();
  }, [getLateComers?.data?.data, session?.accessToken]);

  console.log(employeesMap);
  

  const rows = useMemo(() => {
    if (!getLateComers?.data?.data) return [];
    return getLateComers.data?.data.map((item, index) => {
      const employee = employeesMap[item.employee_id];
      console.log(employee, "employee");
      console.log(employee?.file_url, "employee");
      return {
        id: item.id,
        employee_id: item.employee_id,
        index: index + 1,
        photo: employee?.file_url
          ? `${employee?.file_url}`
          : null,
        name: employee
          ? `${employee?.first_name} ${employee?.last_name}  ${employee?.middle_name}`
          : "Неизвестно",
        department: employee?.workplace?.organizational_unit?.name  || "-",
        date: dayjs(item.real_utc).format("DD.MM.YYYY"),
        time: new Date(item.real_utc).toLocaleString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Tashkent",
        }),
        event: item.event_type,
        status:
          item.error_code === 0
            ? "Вовремя"
            : item.error_code === 32
            ? "Опоздал"
            : "Неизвестно",
      };
    });
  }, [getLateComers?.data?.data, employeesMap]);

  const totalPages = Math.ceil((getLateComers?.data?.count || 0) / pageSize);

  // sahifa almashganda
  const handlePageClick = (event) => {
    setCurrentPage(event.selected + 1); // react-paginate 0-dan boshlaydi
  };

  return (
    <div className="my-[50px] space-y-[20px]">
      {/* Заголовок */}
      <div className="bg-white rounded-xl   p-6 mb-8 component-checkpoint">
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold  mb-2">
              Система учета опоздавших
            </h1>
            <p className="">Служба безопасности и HR отдел</p>
          </div>
          <div className="text-right">
            <p className="text-sm ">Сегодняшняя дата</p>
            <p className="text-lg font-semibold">{currentDate}</p>
          </div>
        </div>
      </div>
      <motion.div
        className="p-6  rounded-xl space-y-6  component-checkpoint "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between ">
          <Typography variant="h5">Список сотрудников</Typography>

          <ExcelButton onClick={handleDownloadExcel} disabled={isDownloading} />
        </div>
        {/* Фильтры */}
        <motion.div
          className="flex flex-wrap items-end gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-6">
            {/* Дата начала  */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Время начала
              </label>
              <Input
                inputClass="!h-[45px] border !border-gray-200 input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                type="time"
              />
            </div>

            {/* Дата окончания  */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Время окончания
              </label>

              <Input
                inputClass="!h-[45px] border !border-gray-200 input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                type="time"
              />
            </div>
          </div>

          <div className="flex gap-6">
            {/* Статус события */}
            <div className="flex flex-col w-44">
              <CustomSelect
                label="Статус события"
                value={eventType}
                onChange={setEventType}
                options={[
                  { value: null, label: "Все" },
                  { value: "Enter", label: "Вход" },
                  { value: "Exit", label: "Выход" },
                ]}
                placeholder="Выберите тип"
              />
            </div>

            {/* Статус */}
            <div className="flex flex-col w-44">
              <CustomSelect
                label="Статус"
                value={errorCode}
                onChange={setErrorCode}
                options={[
                  { value: null, label: "Все" },
                  { value: "0", label: "Вовремя" },
                  { value: "32", label: "Опоздал" },
                ]}
                placeholder="Выберите статус"
              />
            </div>

            {/* Тип события */}
            <div className="flex flex-col w-44">
              <CustomSelect
                label="Статус события"
                value={confirm}
                onChange={setConfirm}
                options={[
                  { value: null, label: "Все" },
                  { value: "true", label: "Подтверждённый" },
                  { value: "false", label: "Неподтверждённый" },
                ]}
                placeholder="Выберите тип"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <span className="mr-2 text-sm">Список опоздавших</span>
            <button
              onClick={() => setLastList(!lastList)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                lastList ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  lastList ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </motion.div>

        {/* Таблица */}
        {isLoading || isFetching ? (
          <ContentLoader />
        ) : (
          <div className="space-y-4">
            <motion.div
              className="shadow overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <table className="table min-w-full text-sm border border-gray-200">
                <thead>
                  <tr className="">
                    <th className="px-4 py-2 text-left font-semibold">№</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Сотрудник
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">Отдел</th>
                    <th className="px-4 py-2 text-left font-semibold">Дата</th>
                    <th className="px-4 py-2 text-left font-semibold">Время</th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Событие
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {(currentPage - 1) * pageSize + (index + 1)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {" "}
                          <Avatar size="small" photoUrl={row.photo} />
                          <p> {row.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">{row.department}</td>
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">{row.time}</td>
                      <td className="px-4 py-2">{row.event}</td>
                      <td className="px-4 py-2">
                        {row.status === "Вовремя" && (
                          <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-600 font-medium">
                            Вовремя
                          </span>
                        )}
                        {row.status === "Опоздал" && (
                          <span className="px-2 py-1 text-xs rounded-lg bg-red-100 text-red-600 font-medium">
                            Опоздал
                          </span>
                        )}
                        {row.status === "Неизвестно" && (
                          <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 font-medium">
                            Неизвестно
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Следующая"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={2}
                  pageCount={totalPages}
                  previousLabel="Предыдущая"
                  forcePage={currentPage - 1} // react-paginate uchun active page
                  containerClassName="flex items-center gap-2 text-sm"
                  pageClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  previousClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  nextClassName="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  activeClassName="!bg-blue-500 !text-white !border-blue-500 cursor-pointer"
                  breakClassName="px-2 text-gray-500"
                  disabledClassName="opacity-50 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
