"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type {
  PriceEntry,
  PriceSummary,
  CleaningMethod,
  IncludedService,
  SortField,
  SortOptions,
  FilterOptions,
  SourcePlatform,
} from "@/types/price";
import {
  CLEANING_METHOD_LABELS,
  INCLUDED_SERVICE_LABELS,
  SOURCE_PLATFORM_LABELS,
  SORT_FIELD_LABELS,
  DEFAULT_FILTER_OPTIONS,
  DEFAULT_SORT_OPTIONS,
} from "@/types/price";
import Tooltip, { InfoTooltip } from "./Tooltip";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PriceComparisonTableProps {
  /** 가격 항목 목록 (비교표 행 데이터) */
  entries: PriceEntry[];
  /** 가격 통계 요약 (비교표 상단 요약 카드) */
  summary: PriceSummary;
  /** 지역 한글명 (예: "강남구") */
  districtLabel: string;
  /** 에어컨 유형 한글명 (예: "벽걸이 에어컨") */
  airconTypeLabel: string;
  /** 마지막 데이터 갱신일 (표시용) */
  lastUpdated?: string;
  /** 추가 className */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** 포함 서비스 설명 (툴팁용) */
const SERVICE_DESCRIPTIONS: Record<IncludedService, string> = {
  "filter-wash": "에어컨 필터를 분리하여 물세척 또는 고압 세척합니다.",
  sanitization: "항균·살균 코팅으로 세균과 곰팡이 번식을 억제합니다.",
  "outdoor-unit": "실외기 열교환기 및 팬을 고압 세척합니다.",
  "drain-pipe": "에어컨 응축수 배수관의 막힘을 제거하고 세척합니다.",
  "mold-removal": "에어컨 내부 곰팡이를 전문 세정제로 제거합니다.",
  "odor-removal": "에어컨 악취를 전문 탈취제나 오존 처리로 제거합니다.",
  "operation-check": "청소 후 냉매 상태, 이상 소음 등 정상 작동을 점검합니다.",
};

/** 가격 범위 프리셋 (모바일 빠른 필터용) */
const PRICE_PRESETS = [
  { label: "전체", min: null, max: null },
  { label: "~5만원", min: null, max: 50000 },
  { label: "5~10만원", min: 50000, max: 100000 },
  { label: "10~15만원", min: 100000, max: 150000 },
  { label: "15만원~", min: 150000, max: null },
] as const;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** 가격을 "50,000원" 형식으로 포맷 */
function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

/** 가격 범위를 "50,000~60,000원" 형식으로 포맷 */
function formatPriceRange(price: number, priceMax: number | null): string {
  if (priceMax === null || priceMax === price) {
    return formatPrice(price);
  }
  return `${price.toLocaleString("ko-KR")}~${priceMax.toLocaleString("ko-KR")}원`;
}

/** 상대 날짜 표시 (예: "2일 전", "오늘") */
function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

/** 엔트리 필터링 */
function filterEntries(
  entries: PriceEntry[],
  filters: FilterOptions
): PriceEntry[] {
  return entries.filter((entry) => {
    if (
      filters.cleaningMethod !== "all" &&
      entry.cleaningMethod !== filters.cleaningMethod
    ) {
      return false;
    }
    if (
      filters.sourcePlatform !== "all" &&
      entry.sourcePlatform !== filters.sourcePlatform
    ) {
      return false;
    }
    if (filters.priceRange.min !== null && entry.price < filters.priceRange.min) {
      return false;
    }
    if (filters.priceRange.max !== null && entry.price > filters.priceRange.max) {
      return false;
    }
    if (filters.requiredServices.length > 0) {
      const hasAll = filters.requiredServices.every((svc) =>
        entry.includedServices.includes(svc)
      );
      if (!hasAll) return false;
    }
    if (!filters.includeIncomplete && entry.isIncomplete) {
      return false;
    }
    return true;
  });
}

/** 엔트리 정렬 */
function sortEntries(
  entries: PriceEntry[],
  sort: SortOptions
): PriceEntry[] {
  const sorted = [...entries];
  const dir = sort.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sort.field) {
      case "price":
        return (a.price - b.price) * dir;
      case "includedServicesCount":
        return (a.includedServices.length - b.includedServices.length) * dir;
      case "verifiedAt":
        return (
          (new Date(a.verifiedAt).getTime() -
            new Date(b.verifiedAt).getTime()) *
          dir
        );
      case "sourcePlatform":
        return a.sourcePlatform.localeCompare(b.sourcePlatform) * dir;
      default:
        return 0;
    }
  });

  return sorted;
}

/** 최저가 엔트리 ID 식별 */
function findLowestPriceId(entries: PriceEntry[]): string | null {
  if (entries.length === 0) return null;
  let lowest = entries[0];
  for (const entry of entries) {
    if (entry.price < lowest.price) {
      lowest = entry;
    }
  }
  return lowest.id;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

/** 가격 요약 카드 (비교표 상단) */
function PriceSummaryCard({
  summary,
}: {
  summary: PriceSummary;
  districtLabel: string;
  airconTypeLabel: string;
}) {
  if (summary.totalEntries === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="rounded-lg bg-blue-50 p-3">
        <p className="text-[10px] text-blue-500 font-medium mb-0.5">최저가</p>
        <p className="text-base font-bold text-blue-700">
          {formatPrice(summary.minPrice)}
        </p>
      </div>
      <div className="rounded-lg bg-blue-50 p-3">
        <p className="text-[10px] text-blue-500 font-medium mb-0.5">최고가</p>
        <p className="text-base font-bold text-blue-700">
          {formatPrice(summary.maxPrice)}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-[10px] text-gray-400 font-medium mb-0.5">평균가</p>
        <p className="text-sm font-semibold text-gray-700">
          {formatPrice(summary.avgPrice)}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-[10px] text-gray-400 font-medium mb-0.5">
          수집 건수
        </p>
        <p className="text-sm font-semibold text-gray-700">
          {summary.totalEntries}건
          <span className="text-[10px] text-gray-400 font-normal ml-1">
            (일반 {summary.generalCount} / 분해 {summary.disassemblyCount} / 완전분해{" "}
            {summary.completeDisassemblyCount})
          </span>
        </p>
      </div>
    </div>
  );
}

/** 필터 바 (청소 방식 + 가격 범위 + 정렬 + 출처) */
function FilterBar({
  filters,
  sort,
  onFilterChange,
  onSortChange,
  availablePlatforms,
  totalCount,
  filteredCount,
}: {
  filters: FilterOptions;
  sort: SortOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (sort: SortOptions) => void;
  availablePlatforms: SourcePlatform[];
  totalCount: number;
  filteredCount: number;
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const cleaningMethods: Array<{ value: CleaningMethod | "all"; label: string }> =
    [
      { value: "all", label: "전체" },
      { value: "general", label: "일반세척" },
      { value: "disassembly", label: "분해세척" },
      { value: "complete-disassembly", label: "완전분해" },
    ];

  const sortFields: Array<{ value: SortField; label: string }> = [
    { value: "price", label: "가격순" },
    { value: "includedServicesCount", label: "서비스 많은 순" },
    { value: "verifiedAt", label: "최근 확인순" },
  ];

  // 현재 선택된 가격 범위 프리셋 인덱스
  const activePricePresetIndex = PRICE_PRESETS.findIndex(
    (p) => p.min === filters.priceRange.min && p.max === filters.priceRange.max
  );

  return (
    <div className="space-y-2 mb-4 filter-transition">
      {/* 청소 방식 필터 (세그먼트 버튼) */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {cleaningMethods.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              onFilterChange({ ...filters, cleaningMethod: value })
            }
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${
                filters.cleaningMethod === value
                  ? "bg-blue-600 text-white shadow-sm scale-[1.02]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95"
              }
            `}
            aria-pressed={filters.cleaningMethod === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 가격 범위 프리셋 (가로 스크롤 가능한 칩) */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {PRICE_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                priceRange: { min: preset.min ?? null, max: preset.max ?? null },
              })
            }
            className={`
              flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200
              ${
                activePricePresetIndex === idx
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 active:scale-95"
              }
            `}
            aria-pressed={activePricePresetIndex === idx}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 정렬 + 출처 필터 + 고급 필터 토글 */}
      <div className="flex items-center gap-2">
        {/* 정렬 드롭다운 */}
        <div className="flex items-center gap-1.5 flex-1">
          <label
            htmlFor="sort-select"
            className="text-[10px] text-gray-400 shrink-0"
          >
            정렬
          </label>
          <select
            id="sort-select"
            value={sort.field}
            onChange={(e) =>
              onSortChange({
                ...sort,
                field: e.target.value as SortField,
              })
            }
            className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700 flex-1 min-w-0"
          >
            {sortFields.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {/* 정렬 방향 토글 */}
          <button
            type="button"
            onClick={() =>
              onSortChange({
                ...sort,
                direction: sort.direction === "asc" ? "desc" : "asc",
              })
            }
            className="p-1.5 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label={
              sort.direction === "asc" ? "내림차순으로 변경" : "오름차순으로 변경"
            }
          >
            <svg
              className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                sort.direction === "desc" ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>

        {/* 출처 필터 */}
        {availablePlatforms.length > 1 && (
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="platform-select"
              className="text-[10px] text-gray-400 shrink-0"
            >
              출처
            </label>
            <select
              id="platform-select"
              value={filters.sourcePlatform}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  sourcePlatform: e.target.value as SourcePlatform | "all",
                })
              }
              className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700"
            >
              <option value="all">전체</option>
              {availablePlatforms.map((platform) => (
                <option key={platform} value={platform}>
                  {SOURCE_PLATFORM_LABELS[platform]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 고급 필터 토글 */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`p-1.5 rounded-md transition-colors ${
            showAdvancedFilters
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-400"
          }`}
          aria-label="고급 필터"
          aria-expanded={showAdvancedFilters}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </button>
      </div>

      {/* 고급 필터 패널 (서비스 필터 + 불완전 데이터 토글) */}
      {showAdvancedFilters && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-3 animate-dropdown-in">
          {/* 필수 서비스 필터 */}
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-1.5">
              필수 포함 서비스
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(INCLUDED_SERVICE_LABELS) as IncludedService[]).map(
                (svc) => {
                  const isActive = filters.requiredServices.includes(svc);
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => {
                        const newServices = isActive
                          ? filters.requiredServices.filter((s) => s !== svc)
                          : [...filters.requiredServices, svc];
                        onFilterChange({
                          ...filters,
                          requiredServices: newServices,
                        });
                      }}
                      className={`
                        px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                            : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                        }
                      `}
                      aria-pressed={isActive}
                    >
                      {INCLUDED_SERVICE_LABELS[svc]}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 불완전 데이터 토글 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeIncomplete}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  includeIncomplete: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-[11px] text-gray-600">
              미확인 데이터 포함
            </span>
          </label>
        </div>
      )}

      {/* 필터 결과 건수 표시 */}
      {filteredCount !== totalCount && (
        <p className="text-[10px] text-blue-600 font-medium">
          {totalCount}건 중 {filteredCount}건 표시
        </p>
      )}
    </div>
  );
}

/** 포함 서비스 배지 리스트 (툴팁 포함) */
function ServiceBadges({
  services,
  additionalServices,
}: {
  services: IncludedService[];
  additionalServices: string[];
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {services.map((svc) => (
        <Tooltip
          key={svc}
          content={SERVICE_DESCRIPTIONS[svc]}
          position="top"
        >
          <span className="service-badge-interactive inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700">
            {INCLUDED_SERVICE_LABELS[svc]}
          </span>
        </Tooltip>
      ))}
      {additionalServices.map((svc, i) => (
        <span
          key={`additional-${i}`}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600"
        >
          {svc}
        </span>
      ))}
    </div>
  );
}

/** 불완전 데이터 경고 배지 */
function IncompleteWarning({ entry }: { entry: PriceEntry }) {
  if (!entry.isIncomplete) return null;

  const fieldLabels: Record<string, string> = {
    cleaningMethod: "청소 방식",
    includedServices: "포함 서비스",
    price: "가격",
    airconType: "에어컨 유형",
  };

  const reasons: Record<string, string> = {
    "not-specified": "미표기",
    ambiguous: "불명확",
    "crawl-error": "수집 오류",
  };

  return (
    <div className="mt-1.5 flex items-start gap-1 text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-1">
      <svg
        className="w-3 h-3 shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>
        일부 정보 미확인:{" "}
        {entry.incompleteFields
          .map(
            (f) =>
              `${fieldLabels[f.field] ?? f.field} (${reasons[f.reason] ?? f.reason})`
          )
          .join(", ")}
      </span>
    </div>
  );
}

/** 출처 URL에서 표시용 도메인 추출 */
function extractDisplayDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** 출처 플랫폼별 색상 매핑 */
const SOURCE_PLATFORM_COLORS: Record<SourcePlatform, { bg: string; text: string; hoverBg: string }> = {
  soomgo: { bg: "bg-orange-50", text: "text-orange-700", hoverBg: "hover:bg-orange-100" },
  danggeun: { bg: "bg-orange-50", text: "text-orange-700", hoverBg: "hover:bg-orange-100" },
  blog: { bg: "bg-green-50", text: "text-green-700", hoverBg: "hover:bg-green-100" },
  website: { bg: "bg-blue-50", text: "text-blue-700", hoverBg: "hover:bg-blue-100" },
  registration: { bg: "bg-purple-50", text: "text-purple-700", hoverBg: "hover:bg-purple-100" },
};

/** 출처 링크 컴포넌트 */
function SourceLink({ entry }: { entry: PriceEntry }) {
  const displayDomain = extractDisplayDomain(entry.sourceUrl);
  const platformLabel = SOURCE_PLATFORM_LABELS[entry.sourcePlatform];
  const colors = SOURCE_PLATFORM_COLORS[entry.sourcePlatform];

  if (!entry.sourceUrl || !displayDomain) {
    return (
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          출처: {platformLabel} (링크 없음)
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-2 border-t border-gray-100">
      <a
        href={entry.sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={`
          flex items-center justify-between gap-2 px-3 py-2 rounded-lg
          ${colors.bg} ${colors.hoverBg}
          transition-colors active:scale-[0.98] transform
        `}
        aria-label={`${entry.providerName}의 ${platformLabel} 원본 페이지로 이동 (새 탭)`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg
            className={`w-3.5 h-3.5 shrink-0 ${colors.text}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <div className="min-w-0">
            <span className={`text-[11px] font-medium ${colors.text}`}>
              {platformLabel}에서 상세 확인
            </span>
            <span className="block text-[9px] text-gray-400 truncate">
              {displayDomain}
            </span>
          </div>
        </div>
        <svg
          className={`w-3.5 h-3.5 shrink-0 ${colors.text} opacity-60`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </div>
  );
}

/** 개별 가격 행 (카드형 모바일 레이아웃) — 최저가 하이라이트 포함 */
function PriceRow({
  entry,
  isLowest,
}: {
  entry: PriceEntry;
  isLowest: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        rounded-xl border bg-white p-4 row-highlight card-tap-feedback
        ${
          isLowest
            ? "border-blue-300 ring-1 ring-blue-200 animate-highlight-pulse"
            : entry.isIncomplete
              ? "border-amber-200"
              : "border-gray-150"
        }
      `}
    >
      {/* 최저가 배지 */}
      {isLowest && (
        <div className="flex items-center gap-1 mb-2">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            최저가
          </span>
        </div>
      )}

      {/* 헤더: 업체명 + 출처 + 가격 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {entry.providerName}
            </h3>
            {entry.isIncomplete && (
              <Tooltip content="일부 정보가 미확인 상태입니다.">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400"
                  aria-label="일부 정보 미확인"
                />
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {SOURCE_PLATFORM_LABELS[entry.sourcePlatform]}
            </span>
            <Tooltip
              content={
                entry.cleaningMethod === "complete-disassembly"
                  ? "모든 부품을 완전히 분리하여 개별 세척하는 가장 철저한 방식"
                  : entry.cleaningMethod === "disassembly"
                    ? "전면 패널과 필터를 분해하여 내부까지 세척하는 방식"
                    : entry.cleaningMethod === "general"
                      ? "분해 없이 고압 스팀이나 세정제로 외부 세척하는 방식"
                      : "청소 방식이 확인되지 않았습니다"
              }
            >
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium service-badge-interactive ${
                  entry.cleaningMethod === "complete-disassembly"
                    ? "bg-purple-50 text-purple-600"
                    : entry.cleaningMethod === "disassembly"
                      ? "bg-blue-50 text-blue-600"
                      : entry.cleaningMethod === "general"
                        ? "bg-teal-50 text-teal-600"
                        : "bg-gray-100 text-gray-400"
                }`}
              >
                {CLEANING_METHOD_LABELS[entry.cleaningMethod]}
              </span>
            </Tooltip>
            <span className="text-[10px] text-gray-300">
              {formatRelativeDate(entry.verifiedAt)} 확인
            </span>
          </div>
        </div>

        {/* 가격 */}
        <div className="text-right shrink-0">
          <p
            className={`text-base font-bold ${
              isLowest ? "text-blue-700" : "text-gray-900"
            }`}
          >
            {formatPriceRange(entry.price, entry.priceMax)}
          </p>
          <p className="text-[10px] text-gray-400">{entry.priceUnit}</p>
        </div>
      </div>

      {/* 포함 서비스 배지 (툴팁 포함) */}
      <ServiceBadges
        services={entry.includedServices}
        additionalServices={entry.additionalServices}
      />

      {/* 불완전 데이터 경고 */}
      <IncompleteWarning entry={entry} />

      {/* 상세 정보 토글 */}
      {(entry.extraCharges.length > 0 || entry.additionalServices.length > 0) && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors"
          aria-expanded={isExpanded}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          {isExpanded ? "상세 접기" : "추가 요금·옵션 보기"}
        </button>
      )}

      {/* 확장 상세 영역 */}
      {isExpanded && entry.extraCharges.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 animate-dropdown-in">
          <p className="text-[10px] font-medium text-gray-500 mb-1">
            추가 요금 항목
          </p>
          <div className="space-y-1">
            {entry.extraCharges.map((charge, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-gray-600">
                  {charge.label}
                  {charge.condition && (
                    <span className="text-gray-400 ml-1">
                      ({charge.condition})
                    </span>
                  )}
                </span>
                <span
                  className={`font-medium ${
                    charge.amount < 0 ? "text-green-600" : "text-gray-700"
                  }`}
                >
                  {charge.amount < 0 ? "" : "+"}
                  {formatPrice(charge.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 출처 링크 */}
      <SourceLink entry={entry} />
    </div>
  );
}

/** 데이터 없음 안내 */
function EmptyState({
  districtLabel,
  airconTypeLabel,
  hasFilters,
  onResetFilters,
}: {
  districtLabel: string;
  airconTypeLabel: string;
  hasFilters: boolean;
  onResetFilters: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-sm text-gray-500 mb-1">
            선택한 조건에 맞는 데이터가 없습니다.
          </p>
          <p className="text-xs text-gray-400 mb-3">
            필터 조건을 변경하거나 초기화해 보세요.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            필터 초기화
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-1">
            {districtLabel} 지역 {airconTypeLabel} 청소 가격 데이터를 수집 중입니다.
          </p>
          <p className="text-xs text-gray-400">
            곧 업체별 가격, 포함 서비스, 출처 링크가 표시됩니다.
          </p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

/**
 * 가격 비교표 테이블 UI 컴포넌트
 *
 * 선택된 유형과 지역을 props로 받아 표준화된 가격 비교표를 렌더링한다.
 * - 업체명, 기본요금, 분해청소요금, 추가옵션 등 컬럼 포함
 * - 모바일 우선 카드형 레이아웃
 * - 필터(청소 방식, 출처, 가격 범위)·정렬(가격, 서비스 수, 최근 확인) 변경이 직관적으로 동작
 * - 최저가 하이라이트 및 서비스 툴팁으로 정보 투명성 확보
 * - 데이터 출처, 포함 서비스, 미확인 항목이 사용자에게 명확히 표시
 */
export default function PriceComparisonTable({
  entries,
  summary,
  districtLabel,
  airconTypeLabel,
  lastUpdated,
  className = "",
}: PriceComparisonTableProps) {
  // ── 필터·정렬 상태 ──
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS);
  const [sort, setSort] = useState<SortOptions>(DEFAULT_SORT_OPTIONS);

  // ── 사용 가능한 출처 플랫폼 목록 (필터 드롭다운용) ──
  const availablePlatforms = useMemo(() => {
    const platforms = new Set(entries.map((e) => e.sourcePlatform));
    return Array.from(platforms) as SourcePlatform[];
  }, [entries]);

  // ── 필터·정렬 적용 ──
  const processedEntries = useMemo(() => {
    const filtered = filterEntries(entries, filters);
    return sortEntries(filtered, sort);
  }, [entries, filters, sort]);

  // ── 최저가 엔트리 ID 식별 ──
  const lowestPriceId = useMemo(
    () => findLowestPriceId(processedEntries),
    [processedEntries]
  );

  // ── 필터 활성 여부 (기본값과 다른지) ──
  const hasActiveFilters = useMemo(
    () =>
      filters.cleaningMethod !== "all" ||
      filters.sourcePlatform !== "all" ||
      filters.requiredServices.length > 0 ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null ||
      !filters.includeIncomplete,
    [filters]
  );

  // ── 필터 초기화 ──
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_OPTIONS);
    setSort(DEFAULT_SORT_OPTIONS);
  }, []);

  return (
    <section className={`${className}`} aria-label="가격 비교표">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-gray-700">가격 비교표</h2>
          <InfoTooltip content="숨고, 당근마켓, 블로그, 업체 사이트에서 수집한 비식별 가격 데이터입니다. 실제 가격과 다를 수 있습니다." />
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-gray-400">
              {formatRelativeDate(lastUpdated)} 갱신
            </span>
          )}
          <span className="text-[10px] text-gray-300">
            {processedEntries.length}/{entries.length}건
          </span>
        </div>
      </div>

      {/* 가격 요약 카드 */}
      <PriceSummaryCard
        summary={summary}
        districtLabel={districtLabel}
        airconTypeLabel={airconTypeLabel}
      />

      {/* 필터·정렬 바 */}
      {entries.length > 0 && (
        <FilterBar
          filters={filters}
          sort={sort}
          onFilterChange={setFilters}
          onSortChange={setSort}
          availablePlatforms={availablePlatforms}
          totalCount={entries.length}
          filteredCount={processedEntries.length}
        />
      )}

      {/* 비교표 본문 (카드 리스트) */}
      {processedEntries.length > 0 ? (
        <div className="space-y-3" role="list" aria-label="가격 비교 목록">
          {processedEntries.map((entry) => (
            <div key={entry.id} role="listitem">
              <PriceRow
                entry={entry}
                isLowest={entry.id === lowestPriceId}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          districtLabel={districtLabel}
          airconTypeLabel={airconTypeLabel}
          hasFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* 필터 활성 시 초기화 안내 */}
      {hasActiveFilters && processedEntries.length > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-800 active:text-blue-900 transition-colors"
          >
            필터 초기화 ({entries.length}건 전체 보기)
          </button>
        </div>
      )}

      {/* 데이터 출처 안내 */}
      <p className="mt-4 text-[10px] text-gray-300 text-center">
        데이터 출처: 숨고, 당근마켓, 블로그, 업체 사이트 | 주 3회 갱신
      </p>
    </section>
  );
}
