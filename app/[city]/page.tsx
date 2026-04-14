import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  generateCityStaticParams,
  validateCityParam,
  districtPath,
} from "../data/routes";
import { AIRCON_TYPES } from "../data/aircon-types";

/* ------------------------------------------------------------------ */
/* Static Generation                                                   */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return generateCityStaticParams();
}

export const dynamicParams = false;

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = validateCityParam(citySlug);
  if (!city) return {};

  const title = `${city.label} 에어컨 청소 가격 비교`;
  const description = `${city.label} 지역 에어컨 청소 가격을 한눈에 비교하세요. 벽걸이, 스탠드, 천장형, 시스템 에어컨 유형별 청소 비용 투명 정보를 제공합니다.`;

  return {
    title,
    description,
    keywords: [
      `${city.label} 에어컨 청소`,
      `${city.label} 에어컨 청소 가격`,
      `${city.label} 에어컨 청소 비교`,
      ...AIRCON_TYPES.map((t) => `${city.label} ${t.label} 청소`),
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

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = validateCityParam(citySlug);
  if (!city) notFound();

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
          <li className="text-gray-700 font-medium">{city.label}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {city.label} 에어컨 청소 가격 비교
        </h1>
        <p className="text-sm text-gray-500">
          {city.label} 지역의 구/시/군을 선택하면 에어컨 유형별 청소 가격을
          비교할 수 있습니다.
        </p>
      </section>

      {/* District Grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          지역 선택
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {city.districts.map((district) => (
            <Link
              key={district.slug}
              href={districtPath(city.slug, district.slug)}
              className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-center"
            >
              {district.label}
            </Link>
          ))}
        </div>
      </section>

      {/* SEO: 에어컨 유형 안내 */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          비교 가능한 에어컨 유형
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {AIRCON_TYPES.map((type) => (
            <div
              key={type.slug}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <h3 className="text-sm font-medium text-gray-900">
                {type.label}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {type.description}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                약 {type.priceRangeHint.min}~{type.priceRangeHint.max}만 원
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
