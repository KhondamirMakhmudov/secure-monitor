import TitleOfThePage from "@/components/title";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/all/useGetQuery";
import { requestEventTracker, requestPython } from "@/services/api";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
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
    new Date().toISOString().slice(0, 10),
  );

  // Track last employee IDs sent to avoid duplicate mutation calls
  const lastSentEmployeeIdsRef = useRef(null);

  // ─── LEVEL QUERIES ────────────────────────────────────────────────────────

  const { data: level1List, isLoading: level1Loading } = useGetQuery({
    key: KEYS.orgUnit,
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { is_root: true, limit: 150 },
    enabled: !!session?.accessToken,
  });

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

  // ─── SELECTED UNIT DETAIL ─────────────────────────────────────────────────

  const { data: selectedUnitData } = useGetQuery({
    key: [KEYS.orgUnit, "detail", selectedUnitId],
    url: URLS.orgUnit,
    apiClient: requestPython,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { id: selectedUnitId },
    enabled: !!selectedUnitId && !!session?.accessToken,
  });

  // ─── DERIVE FLAT DATA ─────────────────────────────────────────────────────

  const level1Data = level1List?.data ?? level1List ?? [];
  const level2Data = level2List?.data ?? level2List ?? [];
  const level3Data = level3List?.data ?? level3List ?? [];
  const level4Data = level4List?.data ?? level4List ?? [];
  const level5Data = level5List?.data ?? level5List ?? [];

  const findUnitInTree = useCallback(
    (unitId) => {
      for (const levelData of [
        level1Data,
        level2Data,
        level3Data,
        level4Data,
        level5Data,
      ]) {
        if (Array.isArray(levelData)) {
          const found = levelData.find((item) => item.id === unitId);
          if (found) return found;
        }
      }
      return null;
    },
    [level1Data, level2Data, level3Data, level4Data, level5Data],
  );

  let unitDetailData = selectedUnitData?.data ?? selectedUnitData;
  if (!unitDetailData?.workplace) {
    unitDetailData = findUnitInTree(selectedUnitId);
  }

  const workplaceData = unitDetailData?.workplace ?? [];

  // ─── SESSION MUTATION ─────────────────────────────────────────────────────

  const { mutate: sessionofSelectedEmployee } = usePostQuery({
    listKeyId: "sessionOfTheEmployee",
    apiClient: requestEventTracker,
    onSuccess: (data) => {
      // Log raw response so you can confirm the correct key name
      console.log("Mutation raw response:", JSON.stringify(data));

      // Support all common casing variants — update once you see the real key
      const sessionId =
        data?.filter_session_id ??
        data?.filterSessionId ??
        data?.session_id ??
        data?.sessionId ??
        data?.id ??
        null;

      if (sessionId) {
        setFilterSessionId(sessionId);
      } else {
        console.warn(
          "Could not extract session ID from mutation response. " +
            "Check the console log above for the correct key name.",
        );
      }
    },
    onError: (error) => {
      console.error("Session mutation error:", error?.response?.data ?? error);
    },
  });

  // ─── FIRE MUTATION WHEN workplaceData CHANGES ─────────────────────────────
  // Uses a ref to prevent re-firing when the mutate reference changes,
  // and skips duplicate calls for the same employee list.

  useEffect(() => {
    if (!workplaceData || workplaceData.length === 0) return;

    const employeeIds = workplaceData.map((item) => item.employee_id);
    const serialized = JSON.stringify(employeeIds);

    // Skip if we already sent the exact same list
    if (lastSentEmployeeIdsRef.current === serialized) return;
    lastSentEmployeeIdsRef.current = serialized;

    // Reset previous session so tardiness query doesn't fire stale data
    setFilterSessionId(null);

    sessionofSelectedEmployee({
      url: URLS.sessionOfTheEmployee,
      attributes: { employeeIds },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workplaceData]);
  // NOTE: intentionally excluding `sessionofSelectedEmployee` and `session`
  // from deps — they change every render and would cause infinite loops.

  // ─── TARDINESS QUERY ──────────────────────────────────────────────────────

  const { data: tardinessData, isLoading: tardinessLoading } = useGetQuery({
    key: ["tardiness", filterSessionId, startDate],
    url: URLS.tardiness,
    apiClient: requestEventTracker,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      date: startDate?.split("T")[0],
      filter_session_id: filterSessionId,
    },
    enabled: !!filterSessionId && !!session?.accessToken,
  });

  const tardinessDataList = tardinessData?.data ?? tardinessData ?? [];

  // ─── UNIT SELECT HANDLER ──────────────────────────────────────────────────

  const handleNodeClick = useCallback((item, level) => {
    // Reset sent-ref so new unit triggers a fresh mutation
    lastSentEmployeeIdsRef.current = null;

    setSelectedUnitId(item.id);
    setFilterSessionId(null);

    if (level === 1)
      setOpenLevel1Id((prev) => (prev === item.id ? null : item.id));
    else if (level === 2)
      setOpenLevel2Id((prev) => (prev === item.id ? null : item.id));
    else if (level === 3)
      setOpenLevel3Id((prev) => (prev === item.id ? null : item.id));
    else if (level === 4)
      setOpenLevel4Id((prev) => (prev === item.id ? null : item.id));
  }, []);

  // ─── TREE NODE ────────────────────────────────────────────────────────────

  const isLevelOpen = (level, id) => {
    if (level === 1) return openLevel1Id === id;
    if (level === 2) return openLevel2Id === id;
    if (level === 3) return openLevel3Id === id;
    if (level === 4) return openLevel4Id === id;
    return false;
  };

  const TreeNode = ({ item, level, hasChildren }) => {
    const isSelected = selectedUnitId === item.id;
    const isOpen = isLevelOpen(level, item.id);

    return (
      <div style={{ paddingLeft: `${(level - 1) * 16}px`, marginTop: "4px" }}>
        <button
          onClick={() => handleNodeClick(item, level)}
          className={`w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-all ${
            isSelected
              ? "bg-sky-500/20 border border-sky-500/40 text-sky-400"
              : "hover:bg-white/[0.03] text-slate-300"
          }`}
        >
          {hasChildren ? (
            isOpen ? (
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
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="my-6">
        <TitleOfThePage
          title="Список опаздавших"
          definition="Журнал опозданий сотрудников"
        />
      </div>

      {/* Date Filter */}
      <div className="mb-6 grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <label className="block text-sm font-mono-cyber text-slate-400 mb-2">
            Дата отчёта
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              // Re-trigger tardiness fetch for new date with same session
            }}
            className="w-full px-3 py-2 bg-slate-900 border border-white/[0.1] rounded-lg text-sm text-slate-300 font-mono-cyber focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left sidebar */}
        <div className="col-span-3">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/[0.07] p-4 [box-shadow:0_4px_24px_rgba(0,0,0,0.4)] max-h-[600px] overflow-y-auto">
            <h3 className="font-display text-sm font-semibold text-slate-300 mb-3 px-3">
              Структура организации
            </h3>

            {level1Loading ? (
              <p className="text-xs text-slate-600 px-3 py-2">Загрузка...</p>
            ) : Array.isArray(level1Data) && level1Data.length > 0 ? (
              level1Data.map((item1) => (
                <div key={item1.id}>
                  <TreeNode item={item1} level={1} hasChildren />

                  {openLevel1Id === item1.id && (
                    <div>
                      {level2Loading ? (
                        <p className="text-xs text-slate-600 ml-8 py-2">
                          Загрузка...
                        </p>
                      ) : Array.isArray(level2Data) && level2Data.length > 0 ? (
                        level2Data.map((item2) => (
                          <div key={item2.id}>
                            <TreeNode item={item2} level={2} hasChildren />

                            {openLevel2Id === item2.id && (
                              <div>
                                {level3Loading ? (
                                  <p className="text-xs text-slate-600 ml-12 py-2">
                                    Загрузка...
                                  </p>
                                ) : Array.isArray(level3Data) &&
                                  level3Data.length > 0 ? (
                                  level3Data.map((item3) => (
                                    <div key={item3.id}>
                                      <TreeNode
                                        item={item3}
                                        level={3}
                                        hasChildren
                                      />

                                      {openLevel3Id === item3.id && (
                                        <div>
                                          {level4Loading ? (
                                            <p className="text-xs text-slate-600 ml-16 py-2">
                                              Загрузка...
                                            </p>
                                          ) : Array.isArray(level4Data) &&
                                            level4Data.length > 0 ? (
                                            level4Data.map((item4) => (
                                              <div key={item4.id}>
                                                <TreeNode
                                                  item={item4}
                                                  level={4}
                                                  hasChildren
                                                />

                                                {openLevel4Id === item4.id && (
                                                  <div>
                                                    {level5Loading ? (
                                                      <p className="text-xs text-slate-600 ml-20 py-2">
                                                        Загрузка...
                                                      </p>
                                                    ) : Array.isArray(
                                                        level5Data,
                                                      ) &&
                                                      level5Data.length > 0 ? (
                                                      level5Data.map(
                                                        (item5) => (
                                                          <TreeNode
                                                            key={item5.id}
                                                            item={item5}
                                                            level={5}
                                                            hasChildren={false}
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

        {/* Right content */}
        <div className="col-span-9">
          {selectedUnitId && (
            <CustomTable
              title={`Опоздания — ${unitDetailData?.name ?? "Подразделение"}`}
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
                    {item.arrival_time ?? item.check_in_time ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {item.reason ?? "-"}
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
