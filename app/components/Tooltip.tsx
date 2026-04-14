"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface TooltipProps {
  /** 툴팁 내용 */
  content: ReactNode;
  /** 툴팁 트리거 요소 */
  children: ReactNode;
  /** 툴팁 위치 (기본: top) */
  position?: "top" | "bottom" | "left" | "right";
  /** 최대 너비 (px) */
  maxWidth?: number;
  /** 추가 className */
  className?: string;
  /** 툴팁이 비활성 상태인지 */
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * 모바일 친화적 툴팁 컴포넌트
 *
 * - 데스크톱: hover로 표시
 * - 모바일: tap으로 표시/숨기기 (300ms 딜레이 후 자동 닫힘 없음, 외부 탭으로 닫힘)
 * - 화면 밖으로 나가지 않도록 위치 자동 조정
 *
 * @example
 * ```tsx
 * <Tooltip content="필터 세척: 에어컨 필터를 분리하여 세척합니다.">
 *   <span className="underline">필터 세척</span>
 * </Tooltip>
 * ```
 */
export default function Tooltip({
  content,
  children,
  position = "top",
  maxWidth = 240,
  className = "",
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // 외부 클릭 감지하여 닫기 (모바일)
  useEffect(() => {
    if (!isVisible) return;

    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    }

    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isVisible]);

  // 위치 자동 조정 (화면 밖 방지)
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // 상단에 공간 부족하면 하단으로
    if (position === "top" && triggerRect.top < tooltipRect.height + 8) {
      newPosition = "bottom";
    }
    // 하단에 공간 부족하면 상단으로
    if (
      position === "bottom" &&
      viewportHeight - triggerRect.bottom < tooltipRect.height + 8
    ) {
      newPosition = "top";
    }

    setAdjustedPosition(newPosition);
  }, [isVisible, position]);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    setIsVisible(true);
  }, [disabled]);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 100);
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsVisible((prev) => !prev);
  }, [disabled]);

  // 마우스 진입 시 타임아웃 취소
  const handleTooltipMouseEnter = useCallback(() => {
    clearTimeout(timeoutRef.current);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    hide();
  }, [hide]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (disabled) return <>{children}</>;

  // 위치별 CSS 클래스
  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  // 화살표 위치별 CSS
  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
  };

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={(e) => {
        e.stopPropagation();
        toggle();
      }}
      role="button"
      tabIndex={0}
      aria-describedby={isVisible ? "tooltip-content" : undefined}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className={`
            absolute z-50 ${positionClasses[adjustedPosition]}
            animate-tooltip-in pointer-events-auto
          `}
          style={{ maxWidth }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="rounded-lg bg-gray-800 text-white text-[11px] leading-relaxed px-3 py-2 shadow-lg">
            {content}
          </div>
          {/* 화살표 */}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[adjustedPosition]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Info Icon variant (question mark circle)                            */
/* ------------------------------------------------------------------ */

export interface InfoTooltipProps {
  /** 툴팁 내용 */
  content: ReactNode;
  /** 아이콘 크기 (기본: 14) */
  size?: number;
  /** 추가 className */
  className?: string;
}

/**
 * 물음표 아이콘이 포함된 인라인 정보 툴팁
 *
 * @example
 * ```tsx
 * <span>분해세척 <InfoTooltip content="에어컨 전면 패널을 분해하여 세척하는 방식" /></span>
 * ```
 */
export function InfoTooltip({
  content,
  size = 14,
  className = "",
}: InfoTooltipProps) {
  return (
    <Tooltip content={content} position="top">
      <svg
        className={`inline-block text-gray-400 hover:text-gray-600 transition-colors cursor-help ${className}`}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-label="정보"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    </Tooltip>
  );
}
