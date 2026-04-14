import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  generatePriceCompareStaticParams,
  validatePriceCompareParams,
  cityPath,
  districtPath,
} from "../../../data/routes";
import { AIRCON_TYPES } from "../../../data/aircon-types";
import FilterNavigator from "../../../components/FilterNavigator";
import PriceComparisonTable from "../../../components/PriceComparisonTable";
import CleaningComparisonGrid from "../../../components/CleaningComparisonGrid";
import {
  getPriceEntries,
  calculatePriceSummary,
  ensureDataLoaded,
} from "@/data/priceData";
import type { AirconType as PriceAirconType, City as PriceCity } from "@/types/price";

/* ------------------------------------------------------------------ */
/* Slug Mapping (route slug → price data key)                          */
/* ------------------------------------------------------------------ */

/** 라우트 에어컨 유형 slug → 가격 데이터 AirconType 매핑 */
const AIRCON_SLUG_TO_TYPE: Record<string, PriceAirconType> = {
  "wall-mounted": "wall-mount",
  standing: "standing",
  ceiling: "ceiling",
  system: "system",
  window: "window",
};

/**
 * 라우트 구/시/군 slug (예: "gangnam-gu") → 가격 데이터 district slug (예: "gangnam")
 * "-gu", "-si", "-gun" 접미사를 제거한다.
 */
function routeDistrictToPriceDistrict(routeSlug: string): string {
  return routeSlug.replace(/-(gu|si|gun)$/, "");
}

/* ------------------------------------------------------------------ */
/* Static Generation                                                   */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return generatePriceCompareStaticParams();
}

export const dynamicParams = false;

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; district: string; airconType: string }>;
}): Promise<Metadata> {
  const {
    city: citySlug,
    district: districtSlug,
    airconType: airconTypeSlug,
  } = await params;
  const result = validatePriceCompareParams(
    citySlug,
    districtSlug,
    airconTypeSlug
  );
  if (!result) return {};

  const { city, district, airconType } = result;
  const regionName = `${city.label} ${district.label}`;
  const title = `${regionName} ${airconType.label} 청소 가격 비교`;
  const description = `${regionName} ${airconType.label} 청소 가격을 업체별로 비교하세요. 분해청소·일반청소 방식별 비용과 포함 서비스를 투명하게 확인할 수 있습니다. 약 ${airconType.priceRangeHint.min}~${airconType.priceRangeHint.max}만 원 범위.`;

  return {
    title,
    description,
    keywords: [
      `${district.label} ${airconType.label} 청소`,
      `${regionName} ${airconType.label} 청소 가격`,
      `${district.label} ${airconType.shortLabel} 에어컨 청소`,
      `${district.label} 에어컨 청소 가격`,
      `${regionName} 에어컨 청소 비교`,
      `${airconType.label} 청소 비용`,
      `${airconType.shortLabel} 에어컨 분해청소`,
    ],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

export default async function PriceComparePage({
  params,
}: {
  params: Promise<{ city: string; district: string; airconType: string }>;
}) {
  const {
    city: citySlug,
    district: districtSlug,
    airconType: airconTypeSlug,
  } = await params;
  const result = validatePriceCompareParams(
    citySlug,
    districtSlug,
    airconTypeSlug
  );
  if (!result) notFound();

  const { city, district, airconType } = result;

  // Supabase에서 데이터 로드 (빌드 시 1회)
  await ensureDataLoaded();

  // 가격 데이터 조회 (라우트 slug → 가격 데이터 키 변환)
  const priceAirconType = AIRCON_SLUG_TO_TYPE[airconType.slug];
  const priceDistrict = routeDistrictToPriceDistrict(district.slug);
  const priceCity = city.slug as PriceCity;

  const entries = priceAirconType
    ? getPriceEntries(priceCity, priceDistrict, priceAirconType)
    : [];
  const summary = priceAirconType
    ? calculatePriceSummary(priceCity, priceDistrict, priceAirconType)
    : {
        airconType: "wall-mount" as PriceAirconType,
        regionCity: priceCity,
        regionDistrict: priceDistrict,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
        medianPrice: 0,
        totalEntries: 0,
        generalCount: 0,
        disassemblyCount: 0,
        completeDisassemblyCount: 0,
        lastUpdated: new Date().toISOString(),
      };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4" aria-label="breadcrumb">
        <ol className="flex items-center gap-1 flex-wrap">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              홈
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={cityPath(city.slug)}
              className="hover:text-blue-600 transition-colors"
            >
              {city.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={districtPath(city.slug, district.slug)}
              className="hover:text-blue-600 transition-colors"
            >
              {district.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-700 font-medium">{airconType.label}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={airconType.iconPath}
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {district.label} {airconType.label} 청소 가격
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          {city.label} {district.label} 지역의 {airconType.label} 청소
          가격을 업체별로 비교합니다.
        </p>
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-3 py-1">
          <span>참고 가격:</span>
          <span className="font-semibold">
            {airconType.priceRangeHint.min}~{airconType.priceRangeHint.max}만
            원
          </span>
        </div>
      </section>

      {/* Ad Slot: Top (configurable) */}
      <AdSlot position="top" className="mb-4" />

      {/* Cleaning Method Comparison Grid */}
      <CleaningComparisonGrid
        entries={entries}
        airconType={priceAirconType ?? "wall-mount"}
        airconTypeLabel={airconType.label}
        districtLabel={district.label}
        className="mb-6"
      />

      {/* Price Comparison Table */}
      <PriceComparisonTable
        entries={entries}
        summary={summary}
        districtLabel={district.label}
        airconTypeLabel={airconType.label}
        lastUpdated={summary.lastUpdated}
        className="mb-6"
      />

      {/* Ad Slot: Middle (configurable) */}
      <AdSlot position="middle" className="mb-6" />

      {/* 필터 변경 → 해당 조합 URL로 자동 이동 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          다른 지역·유형 비교
        </h2>
        <FilterNavigator
          initialCitySlug={city.slug}
          initialDistrictSlug={district.slug}
          initialAirconTypeSlug={airconType.slug}
          airconTypeVariant="button-group"
          regionLayout="inline"
        />
      </section>

      {/* Data Transparency Notice */}
      <section className="mb-6">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <h3 className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            가격 정보 안내
          </h3>
          <ul className="text-xs text-amber-700 space-y-0.5">
            <li>
              모든 가격은 숨고, 당근, 블로그, 업체 사이트에서 수집한 참고
              정보입니다.
            </li>
            <li>실제 가격은 에어컨 상태, 추가 서비스에 따라 달라질 수 있습니다.</li>
            <li>출처 링크를 통해 원본 정보를 직접 확인하세요.</li>
          </ul>
        </div>
      </section>

      {/* SEO Content */}
      <section className="rounded-xl bg-gray-100 p-4 text-xs text-gray-500 leading-relaxed mb-6">
        <h2 className="font-semibold text-gray-700 mb-1">
          {district.label} {airconType.label} 청소 가격 안내
        </h2>
        <p>
          {city.label} {district.label} 지역에서 {airconType.label} 청소를
          찾고 계신다면, 이 페이지에서 다양한 업체의 가격과 서비스를 한눈에
          비교할 수 있습니다. {airconType.label} 청소 가격은 일반적으로{" "}
          {airconType.priceRangeHint.min}만 원에서{" "}
          {airconType.priceRangeHint.max}만 원 사이이며, 분해 청소 여부와
          포함 서비스에 따라 달라집니다. 가격 데이터는 숨고, 당근마켓, 블로그,
          업체 사이트 등에서 수집하여 주 3회 갱신합니다.
        </p>
      </section>

      {/* Ad Slot: Bottom (configurable) */}
      <AdSlot position="bottom" className="mb-4" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ad Slot Component                                                   */
/* ------------------------------------------------------------------ */

/**
 * 광고 배치 슬롯 컴포넌트.
 * position prop으로 위치를 식별하여, 설정 변경만으로
 * 광고 위치(상단/중간/하단)를 유연하게 조절할 수 있다.
 */
function AdSlot({
  position,
  className = "",
}: {
  position: "top" | "middle" | "bottom";
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-dashed border-gray-200 bg-gray-50 py-3 text-center ${className}`}
      data-ad-slot={position}
      aria-label={`광고 영역 (${position})`}
    >
      {/* 애드센스 연동 시 아래 주석을 해제하고 ca-pub-ID와 슬롯 ID를 교체하세요 */}
      <span className="text-xs text-gray-300">광고 영역 ({position})</span>
    </div>
  );
}
