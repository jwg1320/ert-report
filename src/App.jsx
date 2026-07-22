import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "ert-report-writer-v1";

// 새 보고 기본값
const createEmptyReport = () => ({
  phenomenon: "",
  ph: "",
  leakAmount: "",
  leakRate: "",
  patient: "",
  noContact: true,
  responses: [""],
  actions: [""],
  isEnded: false,
  cleanup: "주변 정리정돈 후 철수",
  requestAnalysis: false,
  closeSituation: false,
});

// 전체 기본값
const createInitialData = () => ({
  title: "",
  second: createEmptyReport(),
  third: null,
});

// 예전 localStorage 데이터 구조를 새 구조로 자동 보정
const normalizeReport = (report = {}) => {
  let responses = [""];

  // 새 구조
  if (Array.isArray(report.responses)) {
    responses =
      report.responses.length > 0 ? report.responses : [""];
  }
  // 이전에 response 문자열로 저장했던 경우
  else if (
    typeof report.response === "string" &&
    report.response.trim()
  ) {
    responses = [report.response];
  }

  const actions =
    Array.isArray(report.actions) && report.actions.length > 0
      ? report.actions
      : [""];

  return {
    phenomenon: report.phenomenon ?? "",
    ph: report.ph ?? "",
    leakAmount: report.leakAmount ?? "",
    leakRate: report.leakRate ?? "",
    patient: report.patient ?? "",

    // 기존 데이터에 noContact가 없으면 기본 체크
    noContact:
      typeof report.noContact === "boolean"
        ? report.noContact
        : true,

    responses,
    actions,

    isEnded: report.isEnded ?? false,

    cleanup:
      report.cleanup ?? "주변 정리정돈 후 철수",

    requestAnalysis:
      report.requestAnalysis ?? false,

    closeSituation:
      report.closeSituation ?? false,
  };
};

const normalizeData = (savedData) => {
  if (!savedData) {
    return createInitialData();
  }

  const second = normalizeReport(savedData.second);

  return {
    title: savedData.title ?? "",
    second,

    // 2보가 이미 종료된 상태면 3보는 제거
    third:
      second.isEnded || !savedData.third
        ? null
        : normalizeReport(savedData.third),
  };
};

function App() {
  // localStorage에서 자동 불러오기
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        return normalizeData(JSON.parse(saved));
      }
    } catch (error) {
      console.error(
        "저장 데이터 불러오기 실패:",
        error
      );
    }

    return createInitialData();
  });

  const [copied, setCopied] = useState("");

  // 입력 내용 변경 시 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("자동 저장 실패:", error);
    }
  }, [data]);

  // 일반 항목 수정
  const updateReport = (
    reportKey,
    field,
    value
  ) => {
    setData((prev) => ({
      ...prev,

      [reportKey]: {
        ...prev[reportKey],
        [field]: value,
      },
    }));
  };

  // =========================
  // 대응 내용
  // =========================

  const updateResponse = (
    reportKey,
    index,
    value
  ) => {
    setData((prev) => {
      const newResponses = [
        ...prev[reportKey].responses,
      ];

      newResponses[index] = value;

      return {
        ...prev,

        [reportKey]: {
          ...prev[reportKey],
          responses: newResponses,
        },
      };
    });
  };

  const addResponse = (reportKey) => {
    setData((prev) => ({
      ...prev,

      [reportKey]: {
        ...prev[reportKey],

        responses: [
          ...prev[reportKey].responses,
          "",
        ],
      },
    }));
  };

  const removeResponse = (
    reportKey,
    index
  ) => {
    setData((prev) => {
      if (
        prev[reportKey].responses.length === 1
      ) {
        return prev;
      }

      const newResponses =
        prev[reportKey].responses.filter(
          (_, responseIndex) =>
            responseIndex !== index
        );

      return {
        ...prev,

        [reportKey]: {
          ...prev[reportKey],
          responses: newResponses,
        },
      };
    });
  };

  // =========================
  // 조치 내용
  // =========================

  const updateAction = (
    reportKey,
    index,
    value
  ) => {
    setData((prev) => {
      const newActions = [
        ...prev[reportKey].actions,
      ];

      newActions[index] = value;

      return {
        ...prev,

        [reportKey]: {
          ...prev[reportKey],
          actions: newActions,
        },
      };
    });
  };

  const addAction = (reportKey) => {
    setData((prev) => ({
      ...prev,

      [reportKey]: {
        ...prev[reportKey],

        actions: [
          ...prev[reportKey].actions,
          "",
        ],
      },
    }));
  };

  const removeAction = (
    reportKey,
    index
  ) => {
    setData((prev) => {
      if (
        prev[reportKey].actions.length === 1
      ) {
        return prev;
      }

      const newActions =
        prev[reportKey].actions.filter(
          (_, actionIndex) =>
            actionIndex !== index
        );

      return {
        ...prev,

        [reportKey]: {
          ...prev[reportKey],
          actions: newActions,
        },
      };
    });
  };

  // =========================
  // 종료
  // =========================

  const toggleEnd = (
    reportKey,
    checked
  ) => {
    setData((prev) => ({
      ...prev,

      [reportKey]: {
        ...prev[reportKey],
        isEnded: checked,
      },

      // 2보에서 종료하면 3보 삭제
      ...(reportKey === "second" &&
      checked
        ? {
            third: null,
          }
        : {}),
    }));
  };

  // =========================
  // 3보 생성
  // =========================

  const createThirdReport = () => {
    setData((prev) => ({
      ...prev,

      // 2보 내용을 그대로 가져옴
      third: {
        ...prev.second,

        responses: [
          ...prev.second.responses,
        ],

        actions: [
          ...prev.second.actions,
        ],

        // 종료 관련 항목만 초기화
        isEnded: false,
        requestAnalysis: false,
        closeSituation: false,
      },
    }));
  };

  // =========================
  // 최종 복사용 텍스트 생성
  // =========================

  const buildReportText = (
    reportKey,
    reportName
  ) => {
    const report = data[reportKey];

    if (!report) return "";

    const lines = [];

    // 제목
    if (data.title.trim()) {
      lines.push(
        `[${data.title.trim()}]`
      );
    }

    // 2보 / 3보
    lines.push(`<${reportName}>`);

    // 현상
    if (report.phenomenon.trim()) {
      lines.push(
        `-. 현상: ${report.phenomenon.trim()}`
      );
    }

    // 성상
    const properties = [];

    if (report.ph.trim()) {
      properties.push(
        `pH ${report.ph.trim()}`
      );
    }

    if (report.leakAmount.trim()) {
      properties.push(
        report.leakAmount.trim()
      );
    }

    if (report.leakRate.trim()) {
      properties.push(
        report.leakRate.trim()
      );
    }

    if (properties.length > 0) {
      lines.push(
        `-. 성상: ${properties.join(", ")}`
      );
    }

    // 환자 여부
    // 접촉자 없음 체크 시 고정 문구
    if (report.noContact) {
      lines.push(
        "-. 환자 여부: 접촉자 없음"
      );
    }
    // 체크 해제 후 직접 입력했을 때
    else if (report.patient.trim()) {
      lines.push(
        `-. 환자 여부: ${report.patient.trim()}`
      );
    }

    // 대응 내용
    const validResponses =
      report.responses.filter(
        (response) =>
          response.trim() !== ""
      );

    // 대응 내용 1개일 때
    if (validResponses.length === 1) {
      lines.push("");

      lines.push(
        `-. 대응 내용: ${validResponses[0].trim()}`
      );
    }

    // 대응 내용 2개 이상
    if (validResponses.length > 1) {
      lines.push("");

      lines.push("-. 대응 내용:");

      validResponses.forEach(
        (response, index) => {
          lines.push(
            `${index + 1}. ${response.trim()}`
          );
        }
      );
    }

    // 조치 내용
    const validActions =
      report.actions.filter(
        (action) =>
          action.trim() !== ""
      );

    if (validActions.length > 0) {
      lines.push("");

      lines.push("-. 조치 내용:");

      validActions.forEach(
        (action, index) => {
          lines.push(
            `${index + 1}. ${action.trim()}`
          );
        }
      );
    }

    // 종료 내용
    if (report.isEnded) {
      lines.push("");

      if (report.cleanup.trim()) {
        lines.push(
          `정리 확인: ${report.cleanup.trim()}`
        );
      }

      // 1번
      if (report.requestAnalysis) {
        lines.push(
          "원인분석 및 재발방지대책 요청하겠습니다."
        );
      }

      // 2번
      if (report.closeSituation) {
        lines.push(
          "**상황 종료합니다."
        );
      }
    }

    return lines.join("\n");
  };

  // =========================
  // 복사
  // =========================

  const copyText = async (
    reportKey,
    reportName
  ) => {
    const text = buildReportText(
      reportKey,
      reportName
    );

    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(reportName);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (error) {
      console.error(error);

      alert(
        "복사에 실패했습니다."
      );
    }
  };

  // =========================
  // 전체 초기화
  // =========================

  const resetAll = () => {
    const confirmed =
      window.confirm(
        "작성 중인 모든 내용을 초기화하시겠습니까?"
      );

    if (!confirmed) return;

    const initialData =
      createInitialData();

    setData(initialData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialData)
    );
  };

  return (
    <div className="app">
      <div className="container">

        {/* 상단 */}
        <header className="header">
          <div>
            <h1>출동 대응 보고 작성</h1>

            <p>
              작성 내용은 현재 기기에
              자동 저장됩니다.
            </p>
          </div>

          <button
            type="button"
            className="reset-button"
            onClick={resetAll}
          >
            전체 초기화
          </button>
        </header>

        {/* 제목 */}
        <section className="card title-section">
          <label className="main-label">
            제목
          </label>

          <input
            type="text"
            placeholder="예: 그린1동 1F H23기둥"
            value={data.title}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
          />

          <div className="title-preview">
            [{data.title || "제목"}]
          </div>
        </section>

        {/* 2보 */}
        <ReportForm
          reportKey="second"
          reportName="2보"
          report={data.second}
          updateReport={updateReport}
          updateResponse={
            updateResponse
          }
          addResponse={addResponse}
          removeResponse={
            removeResponse
          }
          updateAction={updateAction}
          addAction={addAction}
          removeAction={removeAction}
          toggleEnd={toggleEnd}
        />

        {/* 2보 결과 */}
        <ReportPreview
          reportName="2보"
          text={buildReportText(
            "second",
            "2보"
          )}
          copied={copied}
          onCopy={() =>
            copyText(
              "second",
              "2보"
            )
          }
        />

        {/* 3보 작성 */}
        {!data.second.isEnded &&
          !data.third && (
            <button
              type="button"
              className="third-create-button"
              onClick={
                createThirdReport
              }
            >
              + 3보 작성
            </button>
          )}

        {/* 3보 */}
        {data.third && (
          <>
            <ReportForm
              reportKey="third"
              reportName="3보"
              report={data.third}
              updateReport={
                updateReport
              }
              updateResponse={
                updateResponse
              }
              addResponse={
                addResponse
              }
              removeResponse={
                removeResponse
              }
              updateAction={
                updateAction
              }
              addAction={addAction}
              removeAction={
                removeAction
              }
              toggleEnd={toggleEnd}
            />

            <ReportPreview
              reportName="3보"
              text={buildReportText(
                "third",
                "3보"
              )}
              copied={copied}
              onCopy={() =>
                copyText(
                  "third",
                  "3보"
                )
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

// =========================
// 보고서 입력 폼
// =========================

function ReportForm({
  reportKey,
  reportName,
  report,
  updateReport,
  updateResponse,
  addResponse,
  removeResponse,
  updateAction,
  addAction,
  removeAction,
  toggleEnd,
}) {
  return (
    <section className="card report-card">

      {/* 보고 차수 + 종료 */}
      <div className="report-header">
        <h2>{reportName}</h2>

        <label className="end-check">
          <input
            type="checkbox"
            checked={report.isEnded}
            onChange={(e) =>
              toggleEnd(
                reportKey,
                e.target.checked
              )
            }
          />

          <span>종료</span>
        </label>
      </div>

      {/* 현상 */}
      <div className="field">
        <label className="main-label">
          현상
        </label>

        <textarea
          placeholder="현장 현상을 입력하세요."
          value={
            report.phenomenon
          }
          onChange={(e) =>
            updateReport(
              reportKey,
              "phenomenon",
              e.target.value
            )
          }
        />
      </div>

      {/* 성상 */}
      <div className="field">
        <label className="main-label">
          성상
        </label>

        <div className="property-grid">
          <div className="property-item">
            <span>pH</span>

            <input
              type="text"
              placeholder="예: 3"
              value={report.ph}
              onChange={(e) =>
                updateReport(
                  reportKey,
                  "ph",
                  e.target.value
                )
              }
            />
          </div>

          <div className="property-item">
            <span>Leak량</span>

            <input
              type="text"
              placeholder="예: 10L"
              value={
                report.leakAmount
              }
              onChange={(e) =>
                updateReport(
                  reportKey,
                  "leakAmount",
                  e.target.value
                )
              }
            />
          </div>

          <div className="property-item">
            <span>Leak 속도</span>

            <input
              type="text"
              placeholder="예: 초당 1방울"
              value={
                report.leakRate
              }
              onChange={(e) =>
                updateReport(
                  reportKey,
                  "leakRate",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </div>

      {/* 환자 여부 */}
      <div className="field">
        <div className="patient-title-row">

          <span className="main-label patient-title">
            환자 여부
          </span>

          <label className="no-contact-check">
            <input
              type="checkbox"
              checked={
                report.noContact
              }
              onChange={(e) =>
                updateReport(
                  reportKey,
                  "noContact",
                  e.target.checked
                )
              }
            />

            <span>
              접촉자 없음
            </span>
          </label>
        </div>

        <input
          type="text"
          className="patient-input"
          placeholder={
            report.noContact
              ? "접촉자 없음"
              : "환자 정보를 입력하세요."
          }
          value={report.patient}
          disabled={
            report.noContact
          }
          onChange={(e) =>
            updateReport(
              reportKey,
              "patient",
              e.target.value
            )
          }
        />
      </div>

      {/* 대응 내용 */}
      <div className="field content-field">
        <label className="main-label">
          대응 내용
        </label>

        <div className="item-list">
          {report.responses.map(
            (response, index) => (
              <div
                className="numbered-row"
                key={index}
              >
                <div className="number">
                  {index + 1}
                </div>

                <textarea
                  className="list-textarea"
                  rows="3"
                  placeholder={`${index + 1}번째 대응 내용을 입력하세요.`}
                  value={response}
                  onChange={(e) =>
                    updateResponse(
                      reportKey,
                      index,
                      e.target.value
                    )
                  }
                />

                {report.responses.length > 1 && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      removeResponse(
                        reportKey,
                        index
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="add-button"
          onClick={() =>
            addResponse(reportKey)
          }
        >
          + 대응 내용 추가
        </button>
      </div>

      {/* 조치 내용 */}
      <div className="field content-field">
        <label className="main-label">
          조치 내용
        </label>

        <div className="item-list">
          {report.actions.map(
            (action, index) => (
              <div
                className="numbered-row"
                key={index}
              >
                <div className="number">
                  {index + 1}
                </div>

                <textarea
                  className="list-textarea"
                  rows="3"
                  placeholder={`${index + 1}번째 조치 내용을 입력하세요.`}
                  value={action}
                  onChange={(e) =>
                    updateAction(
                      reportKey,
                      index,
                      e.target.value
                    )
                  }
                />

                {report.actions.length > 1 && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      removeAction(
                        reportKey,
                        index
                      )
                    }
                  >
                    ×
                  </button>
                )}
              </div>
            )
          )}
        </div>

        <button
          type="button"
          className="add-button"
          onClick={() =>
            addAction(reportKey)
          }
        >
          + 조치 내용 추가
        </button>
      </div>

      {/* 종료 관련 */}
      {report.isEnded && (
        <div className="end-section">

          {/* 정리 확인 */}
          <div className="field">
            <label className="main-label">
              정리 확인
            </label>

            <input
              type="text"
              value={report.cleanup}
              onChange={(e) =>
                updateReport(
                  reportKey,
                  "cleanup",
                  e.target.value
                )
              }
            />
          </div>

          {/* 종료 문구 선택 */}
          <div className="end-options">

            <label className="end-option">
              <input
                type="checkbox"
                checked={
                  report.requestAnalysis
                }
                onChange={(e) =>
                  updateReport(
                    reportKey,
                    "requestAnalysis",
                    e.target.checked
                  )
                }
              />

              <span>
                1. 원인분석 및 재발방지대책 요청하겠습니다.
              </span>
            </label>

            <label className="end-option">
              <input
                type="checkbox"
                checked={
                  report.closeSituation
                }
                onChange={(e) =>
                  updateReport(
                    reportKey,
                    "closeSituation",
                    e.target.checked
                  )
                }
              />

              <span>
                2. 상황 종료합니다.
              </span>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}

// =========================
// 최종 내용 미리보기
// =========================

function ReportPreview({
  reportName,
  text,
  copied,
  onCopy,
}) {
  return (
    <section className="preview-card">
      <div className="preview-header">
        <h3>
          {reportName} 최종 내용
        </h3>

        <button
          type="button"
          className="copy-button"
          onClick={onCopy}
        >
          {copied === reportName
            ? "복사 완료!"
            : "내용 복사"}
        </button>
      </div>

      <pre>{text}</pre>
    </section>
  );
}

export default App;