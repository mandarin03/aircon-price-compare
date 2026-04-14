import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  generateDistrictStaticParams,
  validateDistrictParam,
  cityPath,
  priceComparePath,
} from "../../data/routes";
import { AIRCON_TYPES } from "../../data/aircon-types";

/* ------------------------------------------------------------------ */
/* Static Generation                                                   */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return generateDistrictStaticParams();
}

export const dynamicParams = false;

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; district: string }>;
}): Promise<Metadata> {
  const { city: citySlug, district: districtSlug } = await params;
  const result = validateDistrictParam(citySlug, districtSlug);
  if (!result) return {};

  const { city, district } = result;
  const regionName = `${city.label} ${district.label}`;
  const title = `${regionName} 에어컨 청소 가격 비교`;
  const description = `${regionName} 에어컨 청소 가격을 유형별로 비교하세요. 벽걸이, 스탠드, 천장형, 시스템 에어컨 청소 업체별 투명 가격 정보를 제공합니다.`;

  return {
    title,
    description,
    keywords: [
      `${district.label} 에어컨 청소`,
      `${regionName} 에어컨 청소 가격`,
      `${district.label} 에어컨 청소 비교`,
      ...AIRCON_TYPES.map((t) => `${district.label} ${t.label} 청소`),
      ...AIRCON_TYPES.map((t) => `${regionName} ${t.label} 청소 가격`),
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

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ city: string; district: string }>;
}) {
  const { city: citySlug, district: districtSlug } = await params;
  const result = validateDistrictParam(citySlug, districtSlug);
  if (!result) notFound();

  const { city, district } = result;

  return (
    <div className="max-w-screen-md mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-4" aria-label="breadcrumb">
        <ol className="flex items-center gap-1">
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
          <li className="text-gray-700 font-medium">{district.label}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {city.label} {district.label} 에어컨 청소 가격 비교
        </h1>
        <p className="text-sm text-gray-500">
          에어컨 유형을 선택하면 {district.label} 지역의 청소 가격을 비교할 수
          있습니다.
        </p>
      </section>

      {/* Aircon Type Cards */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          에어컨 유형 선택
        </h2>
        <div className="space-y-3">
          {AIRCON_TYPES.map((type) => (
            <Link
              key={type.slug}
              href={priceComparePath(city.slug, district.slug, type.slug)}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={type.iconPath}
                    />
                  </svg>
                </div>
                {/* Text */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>
              {/* Price hint + arrow */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400">
                  {type.priceRangeHint.min}~{type.priceRangeHint.max}만 원
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors"
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO text */}
      <section className="rounded-xl bg-gray-100 p-4 text-xs text-gray-500 leading-relaxed">
        <h2 className="font-semibold text-gray-700 mb-1">
          {district.label} 에어컨 청소 안내
        </h2>
        <p>
          {city.label} {district.label} 지역의 에어컨 청소 가격을 업체별로
          투명하게 비교할 수 있습니다. 벽걸이, 스탠드, 천장형, 시스템 에어컨
          등 유형별 청소 비용과 포함 서비스를 확인하세요. 모든 가격 정보는
          숨고, 당근, 블로그, 업체 사이트 등에서 수집한 참고 정보이며, 실제
          가격과 다를 수 있습니다.
        </p>
      </section>
    </div>
  );
}
