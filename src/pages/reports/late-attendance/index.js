import TitleOfThePage from "@/components/title";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/all/useGetQuery";
import { requestEventTracker, requestPython } from "@/services/api";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CustomTable } from "@/components/reports";
import usePostQuery from "@/hooks/all/usePostQuery";

const Index = () => {
  const { data: session } = useSession();
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);
  const [openLevel4Id, setOpenLevel4Id] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [filterSessionId, setFilterSessionId] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 16),
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));

  // LEVEL 1 - Root units
  const { data: level1List, isLoading: level1Loading } = useGetQuery({
    key: KEYS.orgUnit,
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      is_root: true,
      limit: 150,
    },
    enabled: !!session?.accessToken,
  });

  console.log("=== LEVEL 1 ===");
  console.log("level1Loading:", level1Loading);
  console.log("level1List:", level1List);
  console.log("type of level1List:", typeof level1List);
  console.log("is array?:", Array.isArray(level1List));

  // LEVEL 2 - Level 1 child
  const { data: level2List, isLoading: level2Loading } = useGetQuery({
    key: [KEYS.orgUnit, openLevel1Id],
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { parent_id: openLevel1Id, limit: 150 },
    enabled: !!openLevel1Id && !!session?.accessToken,
  });

  // LEVEL 3 - Level 2 child
  const { data: level3List, isLoading: level3Loading } = useGetQuery({
    key: [KEYS.orgUnit, openLevel2Id],
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { parent_id: openLevel2Id, limit: 150 },
    enabled: !!openLevel2Id && !!session?.accessToken,
  });

  // LEVEL 4 - Level 3 child
  const { data: level4List, isLoading: level4Loading } = useGetQuery({
    key: [KEYS.orgUnit, openLevel3Id],
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { parent_id: openLevel3Id, limit: 150 },
    enabled: !!openLevel3Id && !!session?.accessToken,
  });

  // LEVEL 5 - Level 4 child
  const { data: level5List, isLoading: level5Loading } = useGetQuery({
    key: [KEYS.orgUnit, openLevel4Id],
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { parent_id: openLevel4Id, limit: 150 },
    enabled: !!openLevel4Id && !!session?.accessToken,
  });

  // SELECTED UNIT - Get selected unit details with employees
  const { data: selectedUnitData, isLoading: selectedUnitLoading } =
    useGetQuery({
      key: [KEYS.orgUnit, "detail", selectedUnitId],
      url: selectedUnitId ? `${URLS.orgUnit}` : null,
      apiClient: requestPython,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      params: { id: selectedUnitId },
      enabled: !!selectedUnitId && !!session?.accessToken,
    });

  const { mutate: sessionofSelectedEmployee } = usePostQuery({
    listKeyId: "sessionOfTheEmployee",
    apiClient: requestEventTracker,
    onSuccess: (data) => {
      // Set the filterSessionId from the response
      setFilterSessionId(data?.filterSessionId);
    },
  });

  // TARDINESS DATA - Fetch tardiness data using filterSessionId
  const { data: tardinessData, isLoading: tardinessLoading } = useGetQuery({
    key: ["tardiness", filterSessionId, startDate, endDate],
    url: URLS.tardiness,
    apiClient: requestEventTracker,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      filter_session_id: filterSessionId,
      start_date: startDate,
      end_date: endDate,
    },
    enabled: !!filterSessionId && !!session?.accessToken,
  });

  // When workplaceData changes, automatically send employee IDs
  const handleEmployeeClick = () => {
    if (workplaceData && workplaceData.length > 0) {
      const employeeIds = workplaceData.map((item) => item.employee_id);
      sessionofSelectedEmployee({
        url: URLS.sessionOfTheEmployee,
        attributes: {
          employeeIds: employeeIds,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
    }
  };

  // Helper function to find unit in nested structure
  const findUnitInTree = (unitId, data, allLevels) => {
    // Check in all level data
    for (let levelData of allLevels) {
      if (Array.isArray(levelData)) {
        const found = levelData.find((item) => item.id === unitId);
        if (found) return found;
      }
    }
    return null;
  };

  // Extract data from response object
  const level1Data = level1List?.data || level1List || [];
  const level2Data = level2List?.data || level2List || [];
  const level3Data = level3List?.data || level3List || [];
  const level4Data = level4List?.data || level4List || [];
  const level5Data = level5List?.data || level5List || [];

  // Try to get unit from API first, then fallback to finding in tree
  let unitDetailData = selectedUnitData?.data || selectedUnitData;
  if (!unitDetailData || !unitDetailData.workplace) {
    unitDetailData = findUnitInTree(selectedUnitId, null, [
      level1Data,
      level2Data,
      level3Data,
      level4Data,
      level5Data,
    ]);
  }

  const workplaceData = unitDetailData?.workplace || [];

  // Auto-trigger employee click when workplaceData is available
  useEffect(() => {
    if (workplaceData && workplaceData.length > 0) {
      handleEmployeeClick();
    }
  }, [workplaceData]);

  const tardinessDataList = tardinessData?.data || tardinessData || [];

  const TreeNode = ({ item, level, onSelect, isSelected, hasChildren }) => (
    <div style={{ paddingLeft: `${(level - 1) * 16}px`, marginTop: "4px" }}>
      <button
        onClick={() => {
          if (level === 1)
            setOpenLevel1Id(openLevel1Id === item.id ? null : item.id);
          else if (level === 2)
            setOpenLevel2Id(openLevel2Id === item.id ? null : item.id);
          else if (level === 3)
            setOpenLevel3Id(openLevel3Id === item.id ? null : item.id);
          else if (level === 4)
            setOpenLevel4Id(openLevel4Id === item.id ? null : item.id);
          setSelectedUnitId(item.id);
        }}
        className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-all ${
          isSelected
            ? "bg-sky-500/20 border border-sky-500/40 text-sky-400"
            : "hover:bg-white/[0.03] text-slate-300"
        }`}
      >
        {hasChildren ? (
          level === 1 && openLevel1Id === item.id ? (
            <ExpandMoreIcon
              sx={{ fontSize: 18 }}
              className="flex-shrink-0 mt-0.5"
            />
          ) : level === 2 && openLevel2Id === item.id ? (
            <ExpandMoreIcon
              sx={{ fontSize: 18 }}
              className="flex-shrink-0 mt-0.5"
            />
          ) : level === 3 && openLevel3Id === item.id ? (
            <ExpandMoreIcon
              sx={{ fontSize: 18 }}
              className="flex-shrink-0 mt-0.5"
            />
          ) : level === 4 && openLevel4Id === item.id ? (
            <ExpandMoreIcon
              sx={{ fontSize: 18 }}
              className="flex-shrink-0 mt-0.5"
            />
          ) : (
            <ChevronRightIcon
              sx={{ fontSize: 18 }}
              className="flex-shrink-0 mt-0.5"
            />
          )
        ) : (
          <div className="w-6 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-mono-cyber text-sm break-words whitespace-normal">
            {item.name}
          </p>
          <p className="font-mono-cyber text-xs text-slate-600 break-words whitespace-normal">
            {item.unit_code}
          </p>
        </div>
      </button>
    </div>
  );

  return (
    <div>
      <div className="my-6">
        <TitleOfThePage
          title="Список опаздавших"
          definition="Журнал опозданий сотрудников"
        />
      </div>

      {/* Date Range Filters */}
      <div className="mb-6 grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <label className="block text-sm font-mono-cyber text-slate-400 mb-2">
            Начальная дата
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-white/[0.1] rounded-lg text-sm text-slate-300 font-mono-cyber focus:outline-none focus:border-sky-500/50"
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-mono-cyber text-slate-400 mb-2">
            Конечная дата
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-white/[0.1] rounded-lg text-sm text-slate-300 font-mono-cyber focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar - Organizational structure */}
        <div className="col-span-3">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.07] p-4 [box-shadow:0_4px_24px_rgba(0,0,0,0.4)] max-h-[600px] overflow-y-auto">
            <h3 className="font-display text-sm font-semibold text-slate-300 mb-3 px-3">
              Структура организации
            </h3>

            {/* Level 1 */}
            <div>
              {level1Loading ? (
                <p className="text-xs text-slate-600 px-3 py-2">Загрузка...</p>
              ) : level1Data &&
                Array.isArray(level1Data) &&
                level1Data.length > 0 ? (
                level1Data.map((item) => (
                  <div key={item.id}>
                    <TreeNode
                      item={item}
                      level={1}
                      isSelected={selectedUnitId === item.id}
                      hasChildren={true}
                    />

                    {/* Level 2 */}
                    {openLevel1Id === item.id && (
                      <div>
                        {level2Loading ? (
                          <p className="text-xs text-slate-600 ml-8 py-2">
                            Загрузка...
                          </p>
                        ) : level2Data &&
                          Array.isArray(level2Data) &&
                          level2Data.length > 0 ? (
                          level2Data.map((item2) => (
                            <div key={item2.id}>
                              <TreeNode
                                item={item2}
                                level={2}
                                isSelected={selectedUnitId === item2.id}
                                hasChildren={true}
                              />

                              {/* Level 3 */}
                              {openLevel2Id === item2.id && (
                                <div>
                                  {level3Loading ? (
                                    <p className="text-xs text-slate-600 ml-12 py-2">
                                      Загрузка...
                                    </p>
                                  ) : level3Data &&
                                    Array.isArray(level3Data) &&
                                    level3Data.length > 0 ? (
                                    level3Data.map((item3) => (
                                      <div key={item3.id}>
                                        <TreeNode
                                          item={item3}
                                          level={3}
                                          isSelected={
                                            selectedUnitId === item3.id
                                          }
                                          hasChildren={true}
                                        />

                                        {/* Level 4 */}
                                        {openLevel3Id === item3.id && (
                                          <div>
                                            {level4Loading ? (
                                              <p className="text-xs text-slate-600 ml-16 py-2">
                                                Загрузка...
                                              </p>
                                            ) : level4Data &&
                                              Array.isArray(level4Data) &&
                                              level4Data.length > 0 ? (
                                              level4Data.map((item4) => (
                                                <div key={item4.id}>
                                                  <TreeNode
                                                    item={item4}
                                                    level={4}
                                                    marginLeft={5}
                                                    isSelected={
                                                      selectedUnitId ===
                                                      item4.id
                                                    }
                                                    hasChildren={true}
                                                  />

                                                  {/* Level 5 */}
                                                  {openLevel4Id ===
                                                    item4.id && (
                                                    <div>
                                                      {level5Loading ? (
                                                        <p className="text-xs text-slate-600 ml-20 py-2">
                                                          Загрузка...
                                                        </p>
                                                      ) : level5Data &&
                                                        Array.isArray(
                                                          level5Data,
                                                        ) &&
                                                        level5Data.length >
                                                          0 ? (
                                                        level5Data.map(
                                                          (item5) => (
                                                            <TreeNode
                                                              key={item5.id}
                                                              item={item5}
                                                              level={5}
                                                              isSelected={
                                                                selectedUnitId ===
                                                                item5.id
                                                              }
                                                              hasChildren={
                                                                false
                                                              }
                                                            />
                                                          ),
                                                        )
                                                      ) : null}
                                                    </div>
                                                  )}
                                                </div>
                                              ))
                                            ) : null}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : null}
                                </div>
                              )}
                            </div>
                          ))
                        ) : null}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 px-3 py-2">Нет данных</p>
              )}
            </div>
          </div>
        </div>

        {/* Right content area */}
        <div className="col-span-9">
          {selectedUnitId && (
            <CustomTable
              title={`Опоздания - ${unitDetailData?.name || "Подразделение"}`}
              columns={["#", "Сотрудник", "Время прихода", "Причина", "Статус"]}
              data={tardinessDataList}
              isLoading={tardinessLoading}
              renderRow={(item, index) => (
                <>
                  <td className="px-4 py-3 text-sm text-slate-400 font-mono-cyber">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div className="font-mono-cyber">
                      {item.employee?.first_name} {item.employee?.last_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.employee?.tabel_number}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 font-mono-cyber">
                    {item.arrival_time || item.check_in_time || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {item.reason || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-mono-cyber ${
                        item.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : item.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.status === "approved"
                        ? "Одобрено"
                        : item.status === "pending"
                          ? "На рассмотрении"
                          : "Отклонено"}
                    </span>
                  </td>
                </>
              )}
              dataCount={tardinessDataList.length}
              pageSize={20}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default Index;
