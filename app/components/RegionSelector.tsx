"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CITIES, type City, type District } from "../data/regions";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface RegionSelection {
  /** 선택된 시/도 */
  city: City | null;
  /** 선택된 구/시/군 */
  district: District | null;
}

export interface RegionSelectorProps {
  /** 현재 선택된 시/도 slug (controlled) */
  citySlug?: string | null;
  /** 현재 선택된 구/시 slug (controlled) */
  districtSlug?: string | null;
  /** 선택 변경 콜백 */
  onChange?: (selection: RegionSelection) => void;
  /** "inline" = 가로 나열 2단 / "stacked" = 세로 2단 */
  layout?: "inline" | "stacked";
  /** "전체" 옵션 표시 여부 */
  showAll?: boolean;
  /** 추가 className */
  className?: string;
  /** 플레이스홀더 텍스트 */
  cityPlaceholder?: string;
  districtPlaceholder?: string;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function RegionSelector({
  citySlug = null,
  districtSlug = null,
  onChange,
  layout = "inline",
  showAll = true,
  className = "",
  cityPlaceholder = "시/도 선택",
  districtPlaceholder = "구/시 선택",
}: RegionSelectorProps) {
  /* ---------- internal state (uncontrolled fallback) ---------- */
  const [internalCitySlug, setInternalCitySlug] = useState<string | null>(
    citySlug
  );
  const [internalDistrictSlug, setInternalDistrictSlug] = useState<
    string | null
  >(districtSlug);

  // Controlled vs uncontrolled
  const activeCitySlug =
    citySlug !== undefined ? citySlug : internalCitySlug;
  const activeDistrictSlug =
    districtSlug !== undefined ? districtSlug : internalDistrictSlug;

  // Resolve objects
  const selectedCity = CITIES.find((c) => c.slug === activeCitySlug) ?? null;
  const selectedDistrict =
    selectedCity?.districts.find((d) => d.slug === activeDistrictSlug) ?? null;

  /* ---------- dropdown open/close state ---------- */
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (
        districtRef.current &&
        !districtRef.current.contains(e.target as Node)
      ) {
        setIsDistrictOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- handlers ---------- */
  const handleCitySelect = useCallback(
    (slug: string | null) => {
      setInternalCitySlug(slug);
      setInternalDistrictSlug(null); // 시/도 변경 시 구/시 초기화
      setIsCityOpen(false);

      const city = slug ? CITIES.find((c) => c.slug === slug) ?? null : null;
      onChange?.({ city, district: null });
    },
    [onChange]
  );

  const handleDistrictSelect = useCallback(
    (slug: string | null) => {
      setInternalDistrictSlug(slug);
      setIsDistrictOpen(false);

      const district = slug
        ? selectedCity?.districts.find((d) => d.slug === slug) ?? null
        : null;
      onChange?.({ city: selectedCity, district });
    },
    [onChange, selectedCity]
  );

  /* ---------- render ---------- */
  const containerClass =
    layout === "inline"
      ? `flex gap-2 ${className}`
      : `flex flex-col gap-2 ${className}`;

  return (
    <div className={containerClass} role="group" aria-label="지역 선택">
      {/* 시/도 드롭다운 */}
      <CustomDropdown
        ref={cityRef}
        isOpen={isCityOpen}
        onToggle={() => {
          setIsCityOpen((v) => !v);
          setIsDistrictOpen(false);
        }}
        placeholder={cityPlaceholder}
        selectedLabel={selectedCity?.label ?? null}
        showAll={showAll}
        allLabel="전체 지역"
        onSelectAll={() => handleCitySelect(null)}
        isAllSelected={activeCitySlug === null}
        ariaLabel="시/도 선택"
        id="region-city-select"
      >
        {CITIES.map((city) => (
          <DropdownItem
            key={city.slug}
            label={city.label}
            sublabel={`${city.districts.length}개 지역`}
            isSelected={activeCitySlug === city.slug}
            onClick={() => handleCitySelect(city.slug)}
          />
        ))}
      </CustomDropdown>

      {/* 구/시 드롭다운 */}
      <CustomDropdown
        ref={districtRef}
        isOpen={isDistrictOpen}
        onToggle={() => {
          if (!selectedCity) return; // 시/도 미선택 시 비활성화
          setIsDistrictOpen((v) => !v);
          setIsCityOpen(false);
        }}
        placeholder={districtPlaceholder}
        selectedLabel={selectedDistrict?.label ?? null}
        showAll={showAll}
        allLabel={selectedCity ? `${selectedCity.label} 전체` : "전체"}
        onSelectAll={() => handleDistrictSelect(null)}
        isAllSelected={activeDistrictSlug === null && activeCitySlug !== null}
        disabled={!selectedCity}
        ariaLabel="구/시 선택"
        id="region-district-select"
      >
        {selectedCity?.districts.map((district) => (
          <DropdownItem
            key={district.slug}
            label={district.label}
            isSelected={activeDistrictSlug === district.slug}
            onClick={() => handleDistrictSelect(district.slug)}
          />
        ))}
      </CustomDropdown>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Custom Dropdown (touch-friendly, mobile-optimized)                  */
/* ------------------------------------------------------------------ */

import { forwardRef, type ReactNode } from "react";

interface CustomDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  placeholder: string;
  selectedLabel: string | null;
  showAll: boolean;
  allLabel: string;
  onSelectAll: () => void;
  isAllSelected: boolean;
  disabled?: boolean;
  children: ReactNode;
  ariaLabel: string;
  id: string;
}

const CustomDropdown = forwardRef<HTMLDivElement, CustomDropdownProps>(
  function CustomDropdown(
    {
      isOpen,
      onToggle,
      placeholder,
      selectedLabel,
      showAll,
      allLabel,
      onSelectAll,
      isAllSelected,
      disabled = false,
      children,
      ariaLabel,
      id,
    },
    ref
  ) {
    return (
      <div ref={ref} className="relative flex-1 min-w-0" id={id}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          className={`
            w-full flex items-center justify-between
            rounded-xl border bg-white
            px-4 py-3 text-left
            text-sm font-medium
            transition-all duration-150
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
            active:scale-[0.98]
            ${
              disabled
                ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                : isOpen
                  ? "border-blue-500 shadow-sm text-gray-900"
                  : "border-gray-200 text-gray-900 shadow-sm hover:border-gray-300"
            }
          `}
        >
          <span className={`truncate ${!selectedLabel ? "text-gray-400" : ""}`}>
            {selectedLabel ?? placeholder}
          </span>

          {/* Chevron */}
          <svg
            className={`
              ml-2 h-4 w-4 flex-shrink-0 transition-transform duration-200
              ${disabled ? "text-gray-200" : "text-gray-400"}
              ${isOpen ? "rotate-180" : ""}
            `}
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
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div
            role="listbox"
            className="
              absolute z-50 mt-1 w-full
              max-h-60 overflow-y-auto
              rounded-xl border border-gray-200 bg-white
              shadow-lg
              py-1
              scrollbar-hide
              animate-dropdown-in
            "
          >
            {showAll && (
              <DropdownItem
                label={allLabel}
                isSelected={isAllSelected}
                onClick={onSelectAll}
                isAllOption
              />
            )}
            {children}
          </div>
        )}
      </div>
    );
  }
);

/* ------------------------------------------------------------------ */
/* Dropdown Item                                                       */
/* ------------------------------------------------------------------ */

function DropdownItem({
  label,
  sublabel,
  isSelected,
  onClick,
  isAllOption = false,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onClick: () => void;
  isAllOption?: boolean;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-4 py-2.5 text-left text-sm
        transition-colors duration-100
        active:bg-blue-50
        ${
          isSelected
            ? "bg-blue-50 text-blue-700 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        }
        ${isAllOption ? "border-b border-gray-100" : ""}
      `}
    >
      <span className="truncate">{label}</span>
      <span className="flex items-center gap-1.5 flex-shrink-0 ml-2">
        {sublabel && (
          <span className="text-xs text-gray-400">{sublabel}</span>
        )}
        {isSelected && (
          <svg
            className="h-4 w-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
