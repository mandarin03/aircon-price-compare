"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type {
  PriceEntry,
  AirconType,
  CleaningMethod,
  IncludedService,
} from "@/lib/types/price-data";
import {
  CLEANING_METHOD_LABELS,
  INCLUDED_SERVICE_LABELS,
} from "@/lib/types/price-data";
import {
  CLEANING_METHOD_INFO,
  INCLUDED_SERVICE_INFO,
} from "@/lib/constants/cleaning-services";
import {
  groupByCleaningMethod,
  calculateServiceCoverage,
  buildMethodPriceComparison,
  type CleaningMethodGroup,
  type ServiceCoverageStats,
  type MethodPriceComparison,
} from "@/lib/utils/comparison-table-utils";
import {
  formatPriceRangeCompact,
  type ServiceInclusionLevel,
  SERVICE_INCLUSION_LEVEL_LABELS,
  SERVICE_INCLUSION_LEVEL_COLORS,
} from "@/lib/types/cleaning-comparison";
import Tooltip, { InfoTooltip } from "./Tooltip";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CleaningComparisonGridProps {
  /** 가격 항목 목록 (해당 지역×유형의 전체 엔트리) */
  entries: PriceEntry[];
  /** 에어컨 유형 코드 (적용 가능 서비스 판단용) */
  airconType: AirconType;
  /** 에어컨 유형 한글명 */
  airconTypeLabel: string;
  /** 지역 한글명 (예: "강남구") */
  districtLabel: string;
  /** 추가 className */
  className?: string;
}

/** 그리드 표시 모드 */
type ViewMode = "grid" | "cards";

/** 청소 방식 컬럼 순서 (unknown 제외) */
const DISPLAY_METHODS: Exclude<CleaningMethod, "unknown">[] = [
  "general",
  "disassembly",
  "complete-disassembly",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** 가격을 "5만원" 형식으로 포맷 */
function formatPriceShort(price: number): string {
  if (price === 0) return "-";
  const man = Math.round(price / 10000);
  return `${man}만원`;
}

/** 포함 비율에서 inclusion level 결정 */
function getInclusionLevel(
  rate: number,
  sampleCount: number,
): ServiceInclusionLevel {
  if (sampleCount === 0) return "no-data";
  if (rate === 0) return "not-included";
  if (rate >= 0.9) return "always";
  if (rate >= 0.6) return "usually";
  if (rate >= 0.3) return "sometimes";
  return "rarely";
}

/** Inclusion level에 따른 아이콘/텍스트 */
function getInclusionIcon(level: ServiceInclusionLevel): {
  icon: string;
  ariaLabel: string;
} {
  switch (level) {
    case "always":
      return { icon: "O", ariaLabel: "기본 포함" };
    case "usually":
      return { icon: "O", ariaLabel: "대부분 포함" };
    case "sometimes":
      return { icon: "\u25B3", ariaLabel: "선택적 포함" };
    case "rarely":
      return { icon: "\u25B3", ariaLabel: "일부만 포함" };
    case "not-included":
      return { icon: "X", ariaLabel: "미포함" };
    case "no-data":
      return { icon: "-", ariaLabel: "데이터 없음" };
  }
}

/** 청소 방식별 색상 테마 */
const METHOD_COLORS: Record<
  Exclude<CleaningMethod, "unknown">,
  { bg: string; text: string; border: string; lightBg: string; badge: string }
> = {
  general: {
    bg: "bg-teal-500",
    text: "text-teal-700",
    border: "border-teal-200",
    lightBg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
  },
  disassembly: {
    bg: "bg-blue-500",
    text: "text-blue-700",
    border: "border-blue-200",
    lightBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  "complete-disassembly": {
    bg: "bg-purple-500",
    text: "text-purple-700",
    border: "border-purple-200",
    lightBg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
};

/** 가격이 가장 낮은 방식 식별 */
function findLowestPriceMethod(
  comparison: MethodPriceComparison[],
): CleaningMethod | null {
  const withData = comparison.filter((c) => c.count > 0 && c.method !== "unknown");
  if (withData.length === 0) return null;
  let lowest = withData[0];
  for (const c of withData) {
    if (c.avgPrice < lowest.avgPrice) lowest = c;
  }
  return lowest.method;
}

/* ------------------------------------------------------------------ */
/* Build comparison matrix data                                        */
/* ------------------------------------------------------------------ */

interface MethodServiceData {
  rate: number;
  sampleCount: number;
  level: ServiceInclusionLevel;
}

interface ServiceRow {
  service: IncludedService;
  label: string;
  shortLabel: string;
  description: string;
  applicable: boolean;
  byMethod: Record<Exclude<CleaningMethod, "unknown">, MethodServiceData>;
}

function buildServiceMatrix(
  entries: PriceEntry[],
  airconType: AirconType,
): ServiceRow[] {
  const activeEntries = entries.filter((e) => e.isActive);

  const methodEntries: Record<
    Exclude<CleaningMethod, "unknown">,
    PriceEntry[]
  > = {
    general: [],
    disassembly: [],
    "complete-disassembly": [],
  };

  for (const entry of activeEntries) {
    if (entry.cleaningMethod !== "unknown") {
      methodEntries[entry.cleaningMethod].push(entry);
    }
  }

  return INCLUDED_SERVICE_INFO.sort((a, b) => a.priority - b.priority).map(
    (info) => {
      const applicable =
        info.applicableAirconTypes.length === 0 ||
        info.applicableAirconTypes.includes(airconType);

      const byMethod = {} as Record<
        Exclude<CleaningMethod, "unknown">,
        MethodServiceData
      >;

      for (const method of DISPLAY_METHODS) {
        const methodGroup = methodEntries[method];
        const sampleCount = methodGroup.length;
        const includedCount = methodGroup.filter((e) =>
          e.includedServices.includes(info.code),
        ).length;
        const rate = sampleCount > 0 ? includedCount / sampleCount : 0;

        byMethod[method] = {
          rate,
          sampleCount,
          level: getInclusionLevel(rate, sampleCount),
        };
      }

      return {
        service: info.code,
        label: info.label,
        shortLabel: info.shortLabel,
        description: info.description,
        applicable,
        byMethod,
      };
    },
  );
}

/* ------------------------------------------------------------------ */
/* useScrollIndicator hook                                             */
/* ------------------------------------------------------------------ */

type ScrollPosition = "start" | "middle" | "end" | "none";

function useScrollIndicator(ref: React.RefObject<HTMLDivElement | null>) {
  const [scrollPos, setScrollPos] = useState<ScrollPosition>("none");

  const updateScrollPos = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 2) {
      setScrollPos("none");
    } else if (scrollLeft <= 2) {
      setScrollPos("start");
    } else if (scrollLeft >= maxScroll - 2) {
      setScrollPos("end");
    } else {
      setScrollPos("middle");
    }
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    updateScrollPos();
    el.addEventListener("scroll", updateScrollPos, { passive: true });
    window.addEventListener("resize", updateScrollPos);

    return () => {
      el.removeEventListener("scroll", updateScrollPos);
      window.removeEventListener("resize", updateScrollPos);
    };
  }, [ref, updateScrollPos]);

  return scrollPos;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** 방식별 가격 요약 헤더 카드 — 최저가 하이라이트 포함 */
function MethodPriceHeader({
  comparison,
  methodGroups,
  lowestMethod,
}: {
  comparison: MethodPriceComparison[];
  methodGroups: CleaningMethodGroup[];
  lowestMethod: CleaningMethod | null;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {DISPLAY_METHODS.map((method) => {
        const comp = comparison.find((c) => c.method === method);
        const group = methodGroups.find((g) => g.method === method);
        const colors = METHOD_COLORS[method];
        const info = CLEANING_METHOD_INFO.find((m) => m.code === method);
        const isLowest = lowestMethod === method;

        return (
          <div
            key={method}
            className={`
              rounded-xl border ${colors.border} ${colors.lightBg} p-3 text-center
              transition-all duration-200
              ${isLowest ? "ring-2 ring-blue-300 shadow-sm" : ""}
            `}
          >
            {/* 최저가 배지 */}
            {isLowest && comp && comp.count > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-blue-600 text-white mb-1">
                가장 저렴
              </span>
            )}

            {/* 방식명 + 툴팁 */}
            <Tooltip
              content={info?.description ?? CLEANING_METHOD_LABELS[method]}
              position="bottom"
              maxWidth={200}
            >
              <div
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.badge} cursor-help ${!isLowest ? "mb-1.5" : ""}`}
              >
                {info?.shortLabel ?? CLEANING_METHOD_LABELS[method]}
              </div>
            </Tooltip>

            {/* 가격 범위 */}
            {comp && comp.count > 0 ? (
              <>
                <p className={`text-sm font-bold ${colors.text}`}>
                  {formatPriceRangeCompact(comp.minPrice, comp.maxPrice)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  평균 {formatPriceShort(comp.avgPrice)}
                </p>
                {comp.priceRatioVsGeneral !== null &&
                  comp.method !== "general" && (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      일반 대비{" "}
                      <span className="font-medium">
                        {comp.priceRatioVsGeneral}배
                      </span>
                    </p>
                  )}
              </>
            ) : (
              <p className="text-xs text-gray-300 mt-1">데이터 수집 중</p>
            )}

            {/* 데이터 건수 */}
            <p className="text-[9px] text-gray-300 mt-1">
              {group?.count ?? 0}건
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** 그리드 뷰: 테이블 형태의 서비스 포함 비교 매트릭스 — 툴팁 + 스크롤 표시 포함 */
function GridView({
  serviceRows,
  methodGroups,
  highlightedRow,
  onHighlightRow,
}: {
  serviceRows: ServiceRow[];
  methodGroups: CleaningMethodGroup[];
  highlightedRow: string | null;
  onHighlightRow: (service: string | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPos = useScrollIndicator(scrollRef);

  const scrollFadeClass =
    scrollPos === "start"
      ? "scroll-fade-right"
      : scrollPos === "end"
        ? "scroll-fade-left"
        : scrollPos === "middle"
          ? "scroll-fade-both"
          : "";

  return (
    <div className="relative">
      {/* 스크롤 힌트 (모바일) */}
      {scrollPos === "start" && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-0.5 text-[9px] text-gray-400 bg-white/80 backdrop-blur-sm rounded-l-md px-1.5 py-0.5 shadow-sm">
            <svg
              className="w-3 h-3 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            스크롤
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`overflow-x-auto -mx-4 px-4 ${scrollFadeClass}`}
      >
        <table
          className="w-full border-collapse text-xs"
          role="table"
          aria-label="청소 방식별 포함 서비스 비교표"
        >
          {/* 테이블 헤더 */}
          <thead>
            <tr>
              <th
                scope="col"
                className="text-left py-2 pr-2 text-[10px] font-medium text-gray-400 w-[100px] min-w-[100px] sticky left-0 bg-white z-10 sticky-col-shadow"
              >
                포함 서비스
              </th>
              {DISPLAY_METHODS.map((method) => {
                const info = CLEANING_METHOD_INFO.find(
                  (m) => m.code === method,
                );
                const colors = METHOD_COLORS[method];
                const group = methodGroups.find((g) => g.method === method);

                return (
                  <th
                    key={method}
                    scope="col"
                    className="text-center py-2 px-1"
                  >
                    <Tooltip
                      content={info?.description ?? ""}
                      position="bottom"
                      maxWidth={200}
                    >
                      <div
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.badge} cursor-help`}
                      >
                        {info?.shortLabel ?? CLEANING_METHOD_LABELS[method]}
                      </div>
                    </Tooltip>
                    {group && group.count > 0 && (
                      <div className="text-[9px] text-gray-300 mt-0.5">
                        {group.count}건
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* 테이블 바디 */}
          <tbody>
            {serviceRows
              .filter((row) => row.applicable)
              .map((row, idx) => {
                const isHighlighted = highlightedRow === row.service;

                return (
                  <tr
                    key={row.service}
                    className={`
                      transition-colors duration-150 cursor-pointer
                      ${
                        isHighlighted
                          ? "bg-blue-50/60"
                          : idx % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/50"
                      }
                    `}
                    onMouseEnter={() => onHighlightRow(row.service)}
                    onMouseLeave={() => onHighlightRow(null)}
                    onTouchStart={() =>
                      onHighlightRow(
                        isHighlighted ? null : row.service
                      )
                    }
                  >
                    {/* 서비스명 (sticky left) + 툴팁 */}
                    <td
                      className={`py-2.5 pr-2 font-medium text-gray-700 sticky left-0 z-10 sticky-col-shadow transition-colors duration-150 ${
                        isHighlighted
                          ? "bg-blue-50/60"
                          : idx % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50/50"
                      }`}
                    >
                      <Tooltip
                        content={row.description}
                        position="right"
                        maxWidth={200}
                      >
                        <span className="text-xs cursor-help border-b border-dotted border-gray-300">
                          {row.shortLabel}
                        </span>
                      </Tooltip>
                    </td>

                    {/* 각 청소 방식별 포함 상태 셀 */}
                    {DISPLAY_METHODS.map((method) => {
                      const data = row.byMethod[method];
                      const { icon, ariaLabel } = getInclusionIcon(data.level);
                      const levelLabel =
                        SERVICE_INCLUSION_LEVEL_LABELS[data.level];
                      const levelColors =
                        SERVICE_INCLUSION_LEVEL_COLORS[data.level];

                      // 셀 툴팁 내용 생성
                      const tooltipContent = data.sampleCount > 0
                        ? `${row.label} — ${CLEANING_METHOD_LABELS[method]}\n${Math.round(data.rate * 100)}% 포함 (${data.sampleCount}건 기준)\n수준: ${levelLabel}`
                        : `${row.label} — ${CLEANING_METHOD_LABELS[method]}\n데이터 수집 중`;

                      return (
                        <td
                          key={method}
                          className="text-center py-2.5 px-1 grid-cell-highlight"
                          aria-label={`${row.label} - ${CLEANING_METHOD_LABELS[method]}: ${ariaLabel}`}
                        >
                          <Tooltip
                            content={
                              <span className="whitespace-pre-line">
                                {tooltipContent}
                              </span>
                            }
                            position="top"
                            maxWidth={200}
                          >
                            <span className="inline-flex flex-col items-center gap-0.5 cursor-help">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${levelColors} transition-transform duration-150 hover:scale-110`}
                              >
                                {icon}
                              </span>
                              <span className="text-[9px] text-gray-400 leading-tight">
                                {data.sampleCount > 0 ? levelLabel : ""}
                              </span>
                            </span>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 카드 뷰: 청소 방식별 카드를 수평 스크롤 — 툴팁 + 하이라이트 포함 */
function CardsView({
  serviceRows,
  methodGroups,
  comparison,
  lowestMethod,
}: {
  serviceRows: ServiceRow[];
  methodGroups: CleaningMethodGroup[];
  comparison: MethodPriceComparison[];
  lowestMethod: CleaningMethod | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPos = useScrollIndicator(scrollRef);

  return (
    <div className="relative">
      {/* 스크롤 힌트 */}
      {scrollPos === "start" && (
        <div className="absolute right-0 top-4 z-20 pointer-events-none">
          <div className="flex items-center gap-0.5 text-[9px] text-gray-400 bg-white/80 backdrop-blur-sm rounded-l-md px-1.5 py-0.5 shadow-sm">
            <svg
              className="w-3 h-3 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            스와이프
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {DISPLAY_METHODS.map((method) => {
          const info = CLEANING_METHOD_INFO.find((m) => m.code === method);
          const comp = comparison.find((c) => c.method === method);
          const group = methodGroups.find((g) => g.method === method);
          const colors = METHOD_COLORS[method];
          const applicableRows = serviceRows.filter((r) => r.applicable);
          const isLowest = lowestMethod === method;

          return (
            <div
              key={method}
              className={`
                flex-shrink-0 w-[280px] snap-center rounded-xl border bg-white overflow-hidden
                card-tap-feedback transition-all duration-200
                ${isLowest ? `${colors.border} ring-2 ring-blue-300 shadow-md` : colors.border}
              `}
            >
              {/* 카드 헤더 */}
              <div className={`${colors.lightBg} px-4 py-3 border-b ${colors.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold ${colors.text}`}
                    >
                      {info?.label ?? CLEANING_METHOD_LABELS[method]}
                    </span>
                    {isLowest && comp && comp.count > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-blue-600 text-white">
                        최저가
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {group?.count ?? 0}건
                  </span>
                </div>
                {comp && comp.count > 0 ? (
                  <p className={`text-lg font-bold ${colors.text} mt-1`}>
                    {formatPriceRangeCompact(comp.minPrice, comp.maxPrice)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 mt-1">데이터 수집 중</p>
                )}
                {info?.description && (
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                    {info.description}
                  </p>
                )}
              </div>

              {/* 포함 서비스 목록 */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-medium text-gray-400 mb-2">
                  포함 서비스
                </p>
                <ul className="space-y-2">
                  {applicableRows.map((row) => {
                    const data = row.byMethod[method];
                    const { icon } = getInclusionIcon(data.level);
                    const levelLabel =
                      SERVICE_INCLUSION_LEVEL_LABELS[data.level];
                    const levelColors =
                      SERVICE_INCLUSION_LEVEL_COLORS[data.level];

                    return (
                      <li
                        key={row.service}
                        className="flex items-center justify-between"
                      >
                        <Tooltip
                          content={row.description}
                          position="right"
                          maxWidth={200}
                        >
                          <span className="text-xs text-gray-700 cursor-help border-b border-dotted border-gray-200">
                            {row.label}
                          </span>
                        </Tooltip>
                        <Tooltip
                          content={
                            data.sampleCount > 0
                              ? `${Math.round(data.rate * 100)}% 포함 (${data.sampleCount}건 기준)`
                              : "데이터 수집 중"
                          }
                          position="left"
                          maxWidth={160}
                        >
                          <span className="flex items-center gap-1.5 cursor-help">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${levelColors} transition-transform duration-150 hover:scale-110`}
                            >
                              {icon}
                            </span>
                            <span className="text-[9px] text-gray-400 w-12 text-right">
                              {data.sampleCount > 0 ? levelLabel : "-"}
                            </span>
                          </span>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 추천 대상 */}
              {info && info.code !== "unknown" && (
                <div className={`px-4 py-2.5 ${colors.lightBg} border-t ${colors.border}`}>
                  <p className="text-[10px] text-gray-500">
                    <span className="font-medium">추천:</span>{" "}
                    {method === "general"
                      ? "비용 부담 없이 기본 청소가 필요한 경우"
                      : method === "disassembly"
                        ? "내부까지 깨끗하게 세척하고 싶은 경우"
                        : "오래 사용하여 완전한 세척이 필요한 경우"}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 비교 인사이트 텍스트 */
function ComparisonInsight({
  comparison,
}: {
  comparison: MethodPriceComparison[];
}) {
  const general = comparison.find((c) => c.method === "general");
  const disassembly = comparison.find((c) => c.method === "disassembly");
  const complete = comparison.find((c) => c.method === "complete-disassembly");

  if (!general || !disassembly || general.count === 0 || disassembly.count === 0)
    return null;

  const ratio = disassembly.priceRatioVsGeneral;
  if (ratio === null) return null;

  return (
    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
      <p className="text-[11px] text-blue-700">
        <svg
          className="inline-block w-3.5 h-3.5 mr-1 -mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        분해세척은 일반세척 대비 약 <strong>{ratio}배</strong> 비싸지만, 내부
        열교환기까지 세척하여 청소 효과가 높습니다.
        {complete && complete.count > 0 && complete.priceRatioVsGeneral && (
          <>
            {" "}
            완전분해세척은 약 <strong>{complete.priceRatioVsGeneral}배</strong>{" "}
            비용이 들지만 가장 철저한 세척 방식입니다.
          </>
        )}
      </p>
    </div>
  );
}

/** 데이터 투명성 안내 */
function DataTransparencyNote({
  totalEntries,
  methodGroups,
}: {
  totalEntries: number;
  methodGroups: CleaningMethodGroup[];
}) {
  const noDataMethods = DISPLAY_METHODS.filter((m) => {
    const group = methodGroups.find((g) => g.method === m);
    return !group || group.count === 0;
  });

  if (noDataMethods.length === 0 && totalEntries >= 3) return null;

  return (
    <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
      <p className="text-[10px] text-gray-400">
        {totalEntries < 3 && (
          <>
            현재 수집된 데이터가 {totalEntries}건으로, 비교 결과가 제한적일 수
            있습니다.{" "}
          </>
        )}
        {noDataMethods.length > 0 && (
          <>
            {noDataMethods
              .map((m) => CLEANING_METHOD_LABELS[m])
              .join(", ")}{" "}
            방식은 아직 데이터 수집 중입니다.{" "}
          </>
        )}
        데이터는 주 3회 갱신됩니다.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

/**
 * 청소 방식별 포함 서비스 비교 그리드 컴포넌트
 *
 * 일반세척 / 분해세척 / 완전분해세척 3가지 청소 방식을 컬럼으로,
 * 포함 서비스(필터 세척, 항균·살균, 실외기 청소 등)를 행으로 배치하여
 * 한눈에 서비스 포함 여부를 비교할 수 있는 그리드 UI.
 *
 * 인터랙션 기능:
 * - 서비스명/셀 툴팁: 터치·호버 시 상세 설명 및 포함 비율 표시
 * - 행 하이라이트: 마우스/터치로 서비스 행 강조
 * - 최저가 방식 하이라이트: 가장 저렴한 청소 방식 자동 강조
 * - 스크롤 인디케이터: 모바일에서 가로 스크롤 가능 안내
 *
 * 모바일 반응형:
 * - 기본: 그리드(테이블) 뷰 — 좁은 화면에서 가로 스크롤 + 서비스명 sticky
 * - 카드 뷰: 청소 방식별 카드를 좌우 스와이프로 비교
 */
export default function CleaningComparisonGrid({
  entries,
  airconType,
  airconTypeLabel,
  districtLabel,
  className = "",
}: CleaningComparisonGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);

  // Build data
  const activeEntries = useMemo(
    () => entries.filter((e) => e.isActive),
    [entries],
  );
  const methodGroups = useMemo(
    () => groupByCleaningMethod(activeEntries, true),
    [activeEntries],
  );
  const comparison = useMemo(
    () => buildMethodPriceComparison(entries),
    [entries],
  );
  const serviceRows = useMemo(
    () => buildServiceMatrix(entries, airconType),
    [entries, airconType],
  );
  const lowestMethod = useMemo(
    () => findLowestPriceMethod(comparison),
    [comparison],
  );

  const totalEntries = activeEntries.length;

  return (
    <section
      className={`${className}`}
      aria-label="청소 방식별 서비스 비교"
    >
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              청소 방식별 비교
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {districtLabel} {airconTypeLabel} 기준
            </p>
          </div>
          <InfoTooltip content="일반세척·분해세척·완전분해세척의 가격과 포함 서비스를 비교합니다. 셀을 터치하면 상세 정보를 확인할 수 있습니다." />
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-white text-gray-700 shadow-sm"
                : "text-gray-400 hover:text-gray-600 active:bg-gray-200"
            }`}
            aria-pressed={viewMode === "grid"}
            aria-label="그리드 뷰"
          >
            <svg
              className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M3 14h18M3 6h18M3 18h18"
              />
            </svg>
            표
          </button>
          <button
            type="button"
            onClick={() => setViewMode("cards")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
              viewMode === "cards"
                ? "bg-white text-gray-700 shadow-sm"
                : "text-gray-400 hover:text-gray-600 active:bg-gray-200"
            }`}
            aria-pressed={viewMode === "cards"}
            aria-label="카드 뷰"
          >
            <svg
              className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            카드
          </button>
        </div>
      </div>

      {/* 방식별 가격 요약 헤더 */}
      <MethodPriceHeader
        comparison={comparison}
        methodGroups={methodGroups}
        lowestMethod={lowestMethod}
      />

      {/* 비교 뷰 */}
      {viewMode === "grid" ? (
        <GridView
          serviceRows={serviceRows}
          methodGroups={methodGroups}
          highlightedRow={highlightedRow}
          onHighlightRow={setHighlightedRow}
        />
      ) : (
        <CardsView
          serviceRows={serviceRows}
          methodGroups={methodGroups}
          comparison={comparison}
          lowestMethod={lowestMethod}
        />
      )}

      {/* 비교 인사이트 */}
      <ComparisonInsight comparison={comparison} />

      {/* 데이터 투명성 안내 */}
      <DataTransparencyNote
        totalEntries={totalEntries}
        methodGroups={methodGroups}
      />

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-[9px] text-gray-400 font-medium">범례:</span>
        {(
          [
            "always",
            "usually",
            "sometimes",
            "rarely",
            "not-included",
          ] as ServiceInclusionLevel[]
        ).map((level) => {
          const { icon } = getInclusionIcon(level);
          const levelColors = SERVICE_INCLUSION_LEVEL_COLORS[level];
          return (
            <Tooltip
              key={level}
              content={
                level === "always"
                  ? "90% 이상의 업체에서 기본 포함"
                  : level === "usually"
                    ? "60~89%의 업체에서 포함"
                    : level === "sometimes"
                      ? "30~59%의 업체에서 포함"
                      : level === "rarely"
                        ? "30% 미만의 업체에서 포함"
                        : "포함하지 않는 서비스"
              }
              position="top"
              maxWidth={180}
            >
              <span className="flex items-center gap-1 cursor-help">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold ${levelColors}`}
                >
                  {icon}
                </span>
                <span className="text-[9px] text-gray-400">
                  {SERVICE_INCLUSION_LEVEL_LABELS[level]}
                </span>
              </span>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
