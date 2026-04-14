import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기사님 서비스 등록",
  description:
    "에어컨 청소 기사님, 서비스 정보를 등록하고 더 많은 고객에게 노출되세요. 간단한 구글폼 작성으로 무료 등록이 가능합니다.",
  keywords: [
    "에어컨 청소 기사 등록",
    "에어컨 청소 업체 등록",
    "에어컨 청소 서비스 등록",
  ],
};

/**
 * Google Form URL for service registration.
 * Replace this placeholder with the actual Google Form URL
 * after creating the form via the Apps Script in /forms/create-google-form.gs
 */
const GOOGLE_FORM_URL =
  process.env.NEXT_PUBLIC_REGISTRATION_FORM_URL ||
  "https://docs.google.com/forms/d/e/PLACEHOLDER/viewform";

const GOOGLE_FORM_EMBED_URL = GOOGLE_FORM_URL.includes("PLACEHOLDER")
  ? null
  : GOOGLE_FORM_URL + "?embedded=true";

export default function PartnerPage() {
  return (
    <div className="max-w-screen-md mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          에어컨 청소 서비스 등록
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          서울·경기 지역 에어컨 청소 기사님,
          <br />
          서비스 정보를 등록하고{" "}
          <strong className="text-blue-600">무료로</strong> 고객에게
          노출되세요.
        </p>
      </section>

      {/* Benefits Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          등록 혜택
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <BenefitCard
            icon="📊"
            title="가격 비교표 노출"
            description="서울·경기 지역별 에어컨 청소 가격 비교표에 업체 정보가 게재됩니다."
          />
          <BenefitCard
            icon="🔗"
            title="출처 링크 연결"
            description="숨고, 당근, 블로그 등 기사님의 기존 플랫폼 페이지로 고객이 직접 이동합니다."
          />
          <BenefitCard
            icon="🔒"
            title="연락처 비공개"
            description="전화번호·이메일은 내부 연락용으로만 사용되며, 사이트에 직접 노출되지 않습니다."
          />
          <BenefitCard
            icon="💰"
            title="완전 무료"
            description="서비스 등록과 게재 모두 무료입니다. 별도 비용이 발생하지 않습니다."
          />
        </div>
      </section>

      {/* Registration Steps */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          등록 절차
        </h2>
        <div className="space-y-4">
          <StepItem
            step={1}
            title="구글폼 작성"
            description="아래 등록 양식에서 업체명, 서비스 지역, 에어컨 유형별 가격, 포함 서비스, 출처 링크를 입력합니다."
            duration="약 5분 소요"
          />
          <StepItem
            step={2}
            title="관리자 검토"
            description="입력하신 정보를 검토하여 표준 카테고리(에어컨 유형, 청소 방식, 포함 서비스)에 맞게 정리합니다."
            duration="영업일 기준 2~3일"
          />
          <StepItem
            step={3}
            title="비교표 게재"
            description="검토 완료 후, 해당 지역의 에어컨 청소 가격 비교표에 업체 정보가 게재됩니다."
            duration="검토 완료 즉시"
          />
        </div>
      </section>

      {/* Required Info Summary */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          작성 항목 안내
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            <InfoRow
              label="기본 정보"
              items={["업체명", "담당자 성함", "연락처"]}
              required
            />
            <InfoRow
              label="서비스 지역"
              items={["서울/경기 선택", "세부 구/시/군 선택"]}
              required
            />
            <InfoRow
              label="가격 정보"
              items={[
                "에어컨 유형별 가격",
                "(벽걸이·스탠드·천장형·시스템)",
              ]}
              required
            />
            <InfoRow
              label="청소 방식"
              items={["분해/비분해 선택", "포함 서비스 선택"]}
              required
            />
            <InfoRow
              label="출처 링크"
              items={[
                "숨고·당근·블로그 등",
                "고객 연결용 대표 URL",
              ]}
              required
            />
            <InfoRow
              label="추가 정보"
              items={["경력", "추가 요금 안내", "기타 안내"]}
              required={false}
            />
          </div>
        </div>
      </section>

      {/* Privacy Notice */}
      <section className="mb-10">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
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
            개인정보 보호 안내
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • 연락처(전화번호, 이메일)는 <strong>내부 연락용</strong>
              으로만 사용됩니다.
            </li>
            <li>
              • 사이트에는 업체명, 가격, 서비스 내용,{" "}
              <strong>출처 링크</strong>만 게재됩니다.
            </li>
            <li>
              • 기사님 연락처를 직접 노출하지 않고, 기존 플랫폼 출처
              링크로만 연결합니다.
            </li>
            <li>
              • 등록 정보 수정·삭제를 원하시면 언제든 문의해 주세요.
            </li>
          </ul>
        </div>
      </section>

      {/* Google Form CTA / Embed */}
      <section className="mb-10" id="form">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          서비스 등록 양식
        </h2>

        {GOOGLE_FORM_EMBED_URL ? (
          /* Embedded Google Form */
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <iframe
              src={GOOGLE_FORM_EMBED_URL}
              width="100%"
              height="1200"
              className="border-0"
              title="에어컨 청소 서비스 등록 양식"
              loading="lazy"
            >
              로딩 중…
            </iframe>
          </div>
        ) : (
          /* Fallback: Link to Google Form */
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              구글폼으로 등록하기
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              아래 버튼을 누르면 구글폼 등록 양식으로 이동합니다.
              <br />
              작성 시간은 약 5분 정도 소요됩니다.
            </p>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
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
              등록 양식 작성하기
            </a>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          <FaqItem
            question="등록비가 있나요?"
            answer="아닙니다. 서비스 등록과 가격 비교표 게재 모두 무료입니다."
          />
          <FaqItem
            question="등록 후 얼마나 걸리나요?"
            answer="관리자 검토 후 영업일 기준 2~3일 내에 비교표에 게재됩니다. 이메일을 입력하신 경우 결과를 안내드립니다."
          />
          <FaqItem
            question="고객이 저에게 어떻게 연락하나요?"
            answer="기사님의 연락처는 사이트에 직접 노출되지 않습니다. 고객은 등록 시 입력한 출처 링크(숨고, 당근, 블로그 등)를 통해 기존 플랫폼으로 이동하여 연락합니다."
          />
          <FaqItem
            question="등록 정보를 수정하거나 삭제할 수 있나요?"
            answer="네, 언제든 하단 이메일로 문의해 주시면 수정 또는 삭제 처리해 드립니다."
          />
          <FaqItem
            question="어떤 정보가 사이트에 노출되나요?"
            answer="업체명, 에어컨 유형별 가격, 청소 방식, 포함 서비스, 출처 링크만 노출됩니다. 전화번호와 이메일은 내부 연락용으로만 사용됩니다."
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pb-4">
        <a
          href="#form"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg px-8 py-3 text-sm transition-colors shadow-sm"
        >
          지금 무료 등록하기
        </a>
        <p className="text-xs text-gray-400 mt-3">
          문의사항이 있으시면 contact@aircon-compare.kr 로 연락해 주세요.
        </p>
      </section>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl border border-gray-200 p-4">
      <span className="text-2xl flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function StepItem({
  step,
  title,
  description,
  duration,
}: {
  step: number;
  title: string;
  description: string;
  duration: string;
}) {
  return (
    <div className="flex gap-4">
      {/* Step number */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">
          {step}
        </div>
        {step < 3 && (
          <div className="w-px h-full bg-blue-200 mt-1" />
        )}
      </div>
      {/* Content */}
      <div className="pb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        <span className="inline-block text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 mt-1.5">
          {duration}
        </span>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  items,
  required,
}: {
  label: string;
  items: string[];
  required: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-24 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        {required && (
          <span className="ml-1 text-red-500 text-xs">*</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-0.5"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
      <summary className="flex items-center justify-between cursor-pointer px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors">
        <span>{question}</span>
        <svg
          className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="px-4 pb-3 text-xs text-gray-500 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
