"use client";

import { useState, useCallback } from "react";
import { AIRCON_TYPES, type AirconType } from "../data/aircon-types";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

export interface AirconTypeSelectorProps {
  /** 현재 선택된 유형의 slug (controlled) */
  value?: string | null;
  /** 선택 변경 콜백 */
  onChange?: (type: AirconType) => void;
  /** "button-group" = 가로 스크롤 버튼 / "dropdown" = 셀렉트 드롭다운 */
  variant?: "button-group" | "dropdown";
  /** "전체" 옵션 표시 여부 */
  showAll?: boolean;
  /** 추가 className */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AirconTypeSelector({
  value = null,
  onChange,
  variant = "button-group",
  showAll = true,
  className = "",
}: AirconTypeSelectorProps) {
  // uncontrolled fallback
  const [internalValue, setInternalValue] = useState<string | null>(value);
  const selected = value !== undefined ? value : internalValue;

  const handleSelect = useCallback(
    (slug: string | null) => {
      setInternalValue(slug);
      if (slug === null) {
        // "전체" 선택
        onChange?.(null as unknown as AirconType);
        return;
      }
      const type = AIRCON_TYPES.find((t) => t.slug === slug);
      if (type) onChange?.(type);
    },
    [onChange],
  );

  if (variant === "dropdown") {
    return (
      <DropdownSelector
        selected={selected}
        onSelect={handleSelect}
        showAll={showAll}
        className={className}
      />
    );
  }

  return (
    <ButtonGroupSelector
      selected={selected}
      onSelect={handleSelect}
      showAll={showAll}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Button Group (horizontal scroll — mobile-first)                     */
/* ------------------------------------------------------------------ */

function ButtonGroupSelector({
  selected,
  onSelect,
  showAll,
  className,
}: {
  selected: string | null;
  onSelect: (slug: string | null) => void;
  showAll: boolean;
  className: string;
}) {
  return (
    <div className={`w-full ${className}`} role="group" aria-label="에어컨 유형 선택">
      {/* 가로 스크롤 컨테이너 — 모바일에서 터치 스와이프 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1 snap-x snap-mandatory">
        {showAll && (
          <TypeButton
            label="전체"
            shortLabel="전체"
            isSelected={selected === null}
            onClick={() => onSelect(null)}
            iconPath="M4 6h16M4 12h16M4 18h16"
            priceHint={null}
          />
        )}
        {AIRCON_TYPES.map((type) => (
          <TypeButton
            key={type.slug}
            label={type.label}
            shortLabel={type.shortLabel}
            isSelected={selected === type.slug}
            onClick={() => onSelect(type.slug)}
            iconPath={type.iconPath}
            priceHint={type.priceRangeHint}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Individual Type Button                                              */
/* ------------------------------------------------------------------ */

function TypeButton({
  label,
  shortLabel,
  isSelected,
  onClick,
  iconPath,
  priceHint,
}: {
  label: string;
  shortLabel: string;
  isSelected: boolean;
  onClick: () => void;
  iconPath: string;
  priceHint: { min: number; max: number } | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      title={label}
      className={`
        flex flex-col items-center justify-center
        flex-shrink-0 snap-start
        min-w-[72px] px-3 py-2.5
        rounded-xl border text-center
        transition-all duration-150 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
        active:scale-95
        ${
          isSelected
            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }
      `}
    >
      {/* Icon */}
      <svg
        className={`w-6 h-6 mb-1 ${isSelected ? "text-blue-600" : "text-gray-400"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d={iconPath} />
      </svg>

      {/* Label */}
      <span className="text-xs font-medium leading-tight whitespace-nowrap">
        {shortLabel}
      </span>

      {/* Price hint */}
      {priceHint && (
        <span
          className={`text-[10px] mt-0.5 leading-none ${
            isSelected ? "text-blue-500" : "text-gray-400"
          }`}
        >
          {priceHint.min}~{priceHint.max}만
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Dropdown Selector (compact alternative)                             */
/* ------------------------------------------------------------------ */

function DropdownSelector({
  selected,
  onSelect,
  showAll,
  className,
}: {
  selected: string | null;
  onSelect: (slug: string | null) => void;
  showAll: boolean;
  className: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor="aircon-type-select" className="sr-only">
        에어컨 유형 선택
      </label>
      <select
        id="aircon-type-select"
        value={selected ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onSelect(val === "" ? null : val);
        }}
        className="
          w-full appearance-none
          rounded-xl border border-gray-200 bg-white
          px-4 py-3 pr-10
          text-sm font-medium text-gray-900
          shadow-sm
          transition-colors
          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
          active:bg-gray-50
        "
      >
        {showAll && <option value="">전체 에어컨 유형</option>}
        {AIRCON_TYPES.map((type) => (
          <option key={type.slug} value={type.slug}>
            {type.label} ({type.priceRangeHint.min}~{type.priceRangeHint.max}만 원)
          </option>
        ))}
      </select>

      {/* Chevron icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
