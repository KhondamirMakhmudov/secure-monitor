import Avatar from "../avatar";
import StatusBadge from "../status-badge";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";

const SmallPanel = ({ data, panelNumber }) => {
  if (!data) {
    return (
      <div className="border border-gray-300 rounded-2xl p-6 min-h-[150px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="">
            <PersonIcon sx={{ width: "30px", height: "30px" }} />
          </div>
          <p className="text-sm">Сотрудник {panelNumber}</p>
        </div>
      </div>
    );
  }

  const hasError = data.error_code && data.error_code !== "Нет ошибки.";
  const timestamp = new Date(data.real_utc + "Z").toLocaleString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Tashkent",
  });

  return (
    <div className=" border border-gray-300 rounded-2xl p-6 min-h-[150px] flex items-center justify-center ">
      <div className="w-full h-full flex items-start space-x-2 animate-slide-in">
        <Avatar name={data.card_name} userId={data.employee_id} size="medium" />
        <div className="flex-1 min-w-0">
          <h3 className="text-black font-semibold text-sm truncate mb-1">
            {data.card_name}
          </h3>
          <div className=" space-x-2 mb-1">
            {data && data?.error_code === "Нет доступа (неавторизован)" && (
              <div className=" p-1 bg-red-500/20 border-2 border-red-500/50 rounded-xl w-full">
                <p className="text-red-300 font-semibold text-sm">
                  <ReportIcon /> {data?.error_code}
                </p>
              </div>
            )}

            {data && data?.error_code === "Ошибка по расписанию" && (
              <div className=" p-1 bg-red-500/20 border-2 border-red-500/50 rounded-xl w-full">
                <p className="text-red-300 font-semibold text-sm">
                  <ReportIcon /> {data?.error_code}
                </p>
              </div>
            )}

            {data && data?.error_code === "Нет ошибки." && (
              <div className="p-1 bg-[#C4F8E2] border-2 border-[#06A561] rounded-xl w-full">
                <div className="text-[#06A561] font-semibold text-sm flex items-center gap-2">
                  <CheckCircleIcon />
                  <p>{data?.error_code}</p>
                </div>
              </div>
            )}
            <span className="text-gray-400 text-sm">
              {" "}
              Время действие: <b>{timestamp}</b>
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Тип двери: <b>{data.event_type}</b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmallPanel;
