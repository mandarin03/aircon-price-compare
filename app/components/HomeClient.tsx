"use client";

import { useState, useMemo } from "react";
import type {
  PriceEntry,
  CleaningMethod,
  AirconType,
  City,
  SortField,
  SourcePlatform,
  IncludedService,
} from "@/types/price";
import {
  CLEANING_METHOD_LABELS,
  INCLUDED_SERVICE_LABELS,
  SOURCE_PLATFORM_LABELS,
  AIRCON_TYPE_LABELS,
} from "@/types/price";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface HomeClientProps {
  entries: PriceEntry[];
  summary: {
    totalEntries: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  };
}

interface Filters {
  city: City | "all";
  airconType: AirconType | "all";
  cleaningMethod: CleaningMethod | "all";
  sortField: SortField;
  sortDirection: "asc" | "desc";
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatPriceRange(price: number, priceMax: number | null): string {
  if (priceMax === null || priceMax === price) return formatPrice(price);
  return `${price.toLocaleString("ko-KR")}~${priceMax.toLocaleString("ko-KR")}원`;
}

function formatRelativeDate(isoDate: string): string {
  const diffDays = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}개월 전`;
}

const CITY_LABELS: Record<City | "all", string> = {
  all: "전체",
  seoul: "서울",
  gyeonggi: "경기",
};

const PLATFORM_COLORS: Record<SourcePlatform, string> = {
  soomgo: "bg-orange-100 text-orange-700",
  danggeun: "bg-orange-100 text-orange-700",
  blog: "bg-green-100 text-green-700",
  website: "bg-blue-100 text-blue-700",
  registration: "bg-purple-100 text-purple-700",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function HomeClient({ entries, summary }: HomeClientProps) {
  const [filters, setFilters] = useState<Filters>({
    city: "all",
    airconType: "all",
    cleaningMethod: "all",
    sortField: "price",
    sortDirection: "asc",
  });

  // 필터링
  const filtered = useMemo(() => {
    let result = entries;

    if (filters.city !== "all") {
      result = result.filter((e) => e.regionCity === filters.city);
    }
    if (filters.airconType !== "all") {
      result = result.filter((e) => e.airconType === filters.airconType);
    }
    if (filters.cleaningMethod !== "all") {
      result = result.filter((e) => e.cleaningMethod === filters.cleaningMethod);
    }

    // 정렬
    const dir = filters.sortDirection === "asc" ? 1 : -1;
    result = [...result].sort((a, b) => {
      switch (filters.sortField) {
        case "price":
          return (a.price - b.price) * dir;
        case "includedServicesCount":
          return (a.includedServices.length - b.includedServices.length) * dir;
        case "verifiedAt":
          return (
            (new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime()) * dir
          );
        default:
          return 0;
      }
    });

    return result;
  }, [entries, filters]);

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      {/* Hero */}
      <section className="mb-5">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          에어컨 청소 가격 비교
        </h1>
        <p className="text-sm text-gray-500">
          서울·경기 지역 에어컨 청소 투명 가격 정보
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-3 py-1 font-medium">
            {summary.totalEntries}건 수집
          </span>
          <span>
            평균 <strong className="text-gray-900">{formatPrice(summary.avgPrice)}</strong>
          </span>
        </div>
      </section>

      {/* 필터 바 */}
      <section className="space-y-2 mb-4">
        {/* 지역 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {(["all", "seoul", "gyeonggi"] as const).map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, city }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.city === city
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {CITY_LABELS[city]}
            </button>
          ))}
        </div>

        {/* 에어컨 유형 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {(
            [
              { value: "all" as const, label: "전체" },
              { value: "wall-mount" as const, label: "벽걸이" },
              { value: "standing" as const, label: "스탠드" },
              { value: "ceiling" as const, label: "천장형" },
              { value: "system" as const, label: "시스템" },
              { value: "window" as const, label: "창문형" },
            ]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, airconType: value }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.airconType === value
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 청소 방식 */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {(
            [
              { value: "all" as const, label: "전체" },
              { value: "general" as const, label: "일반세척" },
              { value: "disassembly" as const, label: "분해세척" },
              { value: "complete-disassembly" as const, label: "완전분해" },
            ]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, cleaningMethod: value }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.cleaningMethod === value
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 정렬 + 결과 건수 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {filtered.length === entries.length
              ? `${filtered.length}건`
              : `${entries.length}건 중 ${filtered.length}건`}
          </span>
          <div className="flex items-center gap-1.5">
            <select
              value={filters.sortField}
              onChange={(e) =>
                setFilters((f) => ({ ...f, sortField: e.target.value as SortField }))
              }
              className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-gray-700"
            >
              <option value="price">가격순</option>
              <option value="includedServicesCount">서비스 많은 순</option>
              <option value="verifiedAt">최근 확인순</option>
            </select>
            <button
              type="button"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  sortDirection: f.sortDirection === "asc" ? "desc" : "asc",
                }))
              }
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              aria-label={filters.sortDirection === "asc" ? "내림차순" : "오름차순"}
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                  filters.sortDirection === "desc" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 가격 카드 리스트 */}
      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
            해당 조건의 가격 정보가 없습니다.
          </div>
        ) : (
          filtered.map((entry) => (
            <PriceCard key={entry.id} entry={entry} />
          ))
        )}
      </section>

      {/* 광고 영역 */}
      <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 py-3 text-center">
        <span className="text-xs text-gray-300">광고 영역</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PriceCard                                                           */
/* ------------------------------------------------------------------ */

function PriceCard({ entry }: { entry: PriceEntry }) {
  const platformColors = PLATFORM_COLORS[entry.sourcePlatform];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* 상단: 업체명 + 가격 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {entry.providerName}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${platformColors}`}>
              {SOURCE_PLATFORM_LABELS[entry.sourcePlatform]}
            </span>
            <span className="text-[10px] text-gray-400">
              {AIRCON_TYPE_LABELS[entry.airconType]}
            </span>
            <span className="text-[10px] text-gray-300">·</span>
            <span className="text-[10px] text-gray-400">
              {CLEANING_METHOD_LABELS[entry.cleaningMethod]}
            </span>
            {entry.regionDistrict && (
              <>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-400">
                  📍{entry.regionDistrict}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold text-blue-700">
            {formatPriceRange(entry.price, entry.priceMax)}
          </p>
          <p className="text-[10px] text-gray-400">{entry.priceUnit}</p>
        </div>
      </div>

      {/* 포함 서비스 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {entry.includedServices.map((svc) => (
          <span
            key={svc}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700"
          >
            {INCLUDED_SERVICE_LABELS[svc] ?? svc}
          </span>
        ))}
        {entry.additionalServices.map((svc, i) => (
          <span
            key={`add-${i}`}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-600"
          >
            {svc}
          </span>
        ))}
      </div>

      {/* 미확인 경고 */}
      {entry.isIncomplete && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1 mb-2">
          <span>⚠</span>
          <span>일부 정보 미확인</span>
        </div>
      )}

      {/* 출처 링크 */}
      <a
        href={entry.sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg ${platformColors} bg-opacity-50 hover:bg-opacity-100 transition-colors`}
      >
        <span className="text-[11px] font-medium">
          {SOURCE_PLATFORM_LABELS[entry.sourcePlatform]}에서 상세 확인 →
        </span>
        <span className="text-[9px] text-gray-400 truncate max-w-[150px]">
          {(() => {
            try {
              return new URL(entry.sourceUrl).hostname.replace(/^www\./, "");
            } catch {
              return "";
            }
          })()}
        </span>
      </a>

      {/* 확인일 */}
      <p className="text-[9px] text-gray-300 mt-1.5 text-right">
        {formatRelativeDate(entry.verifiedAt)} 확인
      </p>
    </div>
  );
}
