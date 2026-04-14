/**
 * 서울·경기 지역 데이터 정의
 *
 * 시/도 선택 시 해당 시/구 목록이 연동되는 계층형 드롭다운에 사용.
 * SEO 페이지 경로(slug)와 한국어 라벨을 포함한다.
 */

export interface District {
  /** URL slug (e.g. "gangnam-gu") — SEO 페이지 경로에 사용 */
  slug: string;
  /** 한국어 라벨 */
  label: string;
}

export interface City {
  /** URL slug (e.g. "seoul") */
  slug: string;
  /** 한국어 라벨 */
  label: string;
  /** 하위 구/시/군 목록 */
  districts: District[];
}

/**
 * 서울·경기 전체 지역 데이터
 */
export const CITIES: City[] = [
  {
    slug: "seoul",
    label: "서울특별시",
    districts: [
      { slug: "gangnam-gu", label: "강남구" },
      { slug: "gangdong-gu", label: "강동구" },
      { slug: "gangbuk-gu", label: "강북구" },
      { slug: "gangseo-gu", label: "강서구" },
      { slug: "gwanak-gu", label: "관악구" },
      { slug: "gwangjin-gu", label: "광진구" },
      { slug: "guro-gu", label: "구로구" },
      { slug: "geumcheon-gu", label: "금천구" },
      { slug: "nowon-gu", label: "노원구" },
      { slug: "dobong-gu", label: "도봉구" },
      { slug: "dongdaemun-gu", label: "동대문구" },
      { slug: "dongjak-gu", label: "동작구" },
      { slug: "mapo-gu", label: "마포구" },
      { slug: "seodaemun-gu", label: "서대문구" },
      { slug: "seocho-gu", label: "서초구" },
      { slug: "seongdong-gu", label: "성동구" },
      { slug: "seongbuk-gu", label: "성북구" },
      { slug: "songpa-gu", label: "송파구" },
      { slug: "yangcheon-gu", label: "양천구" },
      { slug: "yeongdeungpo-gu", label: "영등포구" },
      { slug: "yongsan-gu", label: "용산구" },
      { slug: "eunpyeong-gu", label: "은평구" },
      { slug: "jongno-gu", label: "종로구" },
      { slug: "jung-gu", label: "중구" },
      { slug: "jungnang-gu", label: "중랑구" },
    ],
  },
  {
    slug: "gyeonggi",
    label: "경기도",
    districts: [
      { slug: "suwon-si", label: "수원시" },
      { slug: "seongnam-si", label: "성남시" },
      { slug: "goyang-si", label: "고양시" },
      { slug: "yongin-si", label: "용인시" },
      { slug: "bucheon-si", label: "부천시" },
      { slug: "ansan-si", label: "안산시" },
      { slug: "anyang-si", label: "안양시" },
      { slug: "namyangju-si", label: "남양주시" },
      { slug: "hwaseong-si", label: "화성시" },
      { slug: "pyeongtaek-si", label: "평택시" },
      { slug: "uijeongbu-si", label: "의정부시" },
      { slug: "siheung-si", label: "시흥시" },
      { slug: "paju-si", label: "파주시" },
      { slug: "gimpo-si", label: "김포시" },
      { slug: "gwangmyeong-si", label: "광명시" },
      { slug: "gwangju-si", label: "광주시" },
      { slug: "gunpo-si", label: "군포시" },
      { slug: "hanam-si", label: "하남시" },
      { slug: "osan-si", label: "오산시" },
      { slug: "icheon-si", label: "이천시" },
      { slug: "anseong-si", label: "안성시" },
      { slug: "uiwang-si", label: "의왕시" },
      { slug: "yangpyeong-gun", label: "양평군" },
      { slug: "yeoju-si", label: "여주시" },
      { slug: "guri-si", label: "구리시" },
      { slug: "pocheon-si", label: "포천시" },
      { slug: "yangju-si", label: "양주시" },
      { slug: "dongducheon-si", label: "동두천시" },
      { slug: "gapyeong-gun", label: "가평군" },
      { slug: "yeoncheon-gun", label: "연천군" },
    ],
  },
];

/** 시/도 slug로 City 조회 */
export function getCityBySlug(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

/** 시/도 slug + 구/시 slug로 District 조회 */
export function getDistrictBySlug(
  citySlug: string,
  districtSlug: string
): District | undefined {
  const city = getCityBySlug(citySlug);
  return city?.districts.find((d) => d.slug === districtSlug);
}

/** 전체 시/도 slug 목록 */
export function getAllCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}

/** 특정 시/도의 전체 구/시 slug 목록 */
export function getDistrictSlugs(citySlug: string): string[] {
  const city = getCityBySlug(citySlug);
  return city ? city.districts.map((d) => d.slug) : [];
}

/** 전체 지역 조합 (정적 경로 생성용) */
export function getAllRegionCombinations(): {
  citySlug: string;
  districtSlug: string;
}[] {
  return CITIES.flatMap((city) =>
    city.districts.map((district) => ({
      citySlug: city.slug,
      districtSlug: district.slug,
    }))
  );
}
