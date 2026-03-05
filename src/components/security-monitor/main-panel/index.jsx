import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Avatar from "../avatar";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from "next/image";
import { config } from "@/config";

const MainPanel = ({ data }) => {
  const { data: session, status } = useSession();
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSessionReady = status === "authenticated";

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      if (!data?.employee_id || !session?.accessToken) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${config.JAVA_API_URL}api/employees/${data.employee_id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        if (!res.ok) throw new Error("Xodim ma'lumoti olinmadi");

        const json = await res.json();
        setEmployeeInfo(json);
      } catch (error) {
        console.error("Xato: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeInfo();
  }, [data?.employee_id, session]);

  if (!data || status !== "authenticated") {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-gray-300 p-12 min-h-[500px] flex items-center justify-center">
        <div className="flex items-center justify-center flex-col text-gray-400">
          <div className="text-8xl mb-8">
            <Image
              src={"/images/profile.png"}
              alt="profile"
              width={50}
              height={50}
            />
          </div>
          <p className="text-3xl font-bold mb-4">Asosiy Panel</p>
          <p className="text-xl">Eng so'nggi faoliyat bu yerda ko'rsatiladi</p>
        </div>
      </div>
    );
  }

  const timestamp = new Date(data.real_utc + "Z").toLocaleString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Tashkent",
  });

  return (
    <div
      className="border border-gray-300 rounded-2xl p-8 min-h-[400px] bg-cover"
      style={{
        backgroundImage: "url('/images/background_id_card.jpg')",
      }}
    >
      <div className="w-full h-full animate-scale-in">
        <div className="flex items-start gap-5">
          <Avatar
            key={data?.employee_id}
            name={data?.card_name}
            userId={data?.employee_id}
            size="large"
          />

          <div>
            <h1 className="text-4xl font-bold text-black leading-tight">
              {employeeInfo?.firstName} {employeeInfo?.lastName}{" "}
              {employeeInfo?.fatherName}
            </h1>

            <p className="text-black text-[17px] mt-[10px]">
              Здание: {data?.device.building}
            </p>

            <p className="text-black text-[17px]">
              Подразделение: {employeeInfo?.department?.nameDep}
            </p>
            <p className="text-black text-[17px] ">
              Отдел : {employeeInfo?.structureName}
            </p>

            <p className="text-black text-[17px] ">
              Должность : {employeeInfo?.jobTitleName}
            </p>

            <p className="text-black text-[17px] ">
              Тип двери: {data?.event_type}
            </p>
          </div>
        </div>

        {data.error_code === "Нет доступа (неавторизован)" && (
          <div className="mt-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl w-full">
            <p className="text-red-300 font-semibold text-xl uppercase flex items-center gap-2">
              <ReportIcon sx={{ width: "40px", height: "40px" }} />
              {data?.error_code}
            </p>
          </div>
        )}

        {data.error_code === "Ошибка по расписанию" && (
          <div className="mt-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl w-full">
            <p className="text-red-500/50 font-semibold text-lg uppercase flex items-center gap-2">
              <ReportIcon sx={{ width: "30px", height: "30px" }} />
              {"Проход запрещён. Вне установленного рабочего графика"}
            </p>
          </div>
        )}

        {data.error_code === "Нет ошибки." && (
          <div className="mt-6 p-4 bg-[#C4F8E2] border-2 border-[#06A561] rounded-xl w-full">
            <div className="text-[#06A561] font-semibold text-lg uppercase flex items-center gap-2">
              <CheckCircleIcon sx={{ width: "30px", height: "30px" }} />
              <p>
                {"Доступ разрешён. Сотрудник успешно прошёл через турникет"}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-start mt-[20px]">
          <p className="text-black text-base">
            Время действие: <b>{timestamp}</b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
