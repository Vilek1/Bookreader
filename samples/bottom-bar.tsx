import { useNavigate, useLocation } from "react-router";
import { BOTTOM_BAR_TOKENS } from "./bottom-bar-tokens";
import type { BottomBarProps } from "./bottom-bar-types";

// =====================
// SVG ICONS INLINE
// =====================

// Library icon
const LibraryIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    className="absolute block w-full h-full"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      d="M6 11V15M14 9V15M10 5V15M5.8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V5.8C19 4.11984 19 3.27976 18.673 2.63803C18.3854 2.07354 17.9265 1.6146 17.362 1.32698C16.7202 1 15.8802 1 14.2 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19Z"
      stroke={isActive ? "#9E77ED" : "var(--app-icon-muted)"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

// Settings icon
const SettingsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    className="block w-full h-full"
    fill="none"
    viewBox="0 0 19.9136 22"
  >
    <path
      d="M7.35012 18.3711L7.93457 19.6856C8.1083 20.0768 8.39184 20.4093 8.75079 20.6426C9.10974 20.8759 9.52867 21.0001 9.95679 21C10.3849 21.0001 10.8038 20.8759 11.1628 20.6426C11.5217 20.4093 11.8053 20.0768 11.979 19.6856L12.5635 18.3711C12.7715 17.9047 13.1215 17.5159 13.5635 17.26C14.0082 17.0034 14.5228 16.8941 15.0335 16.9478L16.4635 17.1C16.8891 17.145 17.3187 17.0656 17.7001 16.8713C18.0816 16.6771 18.3984 16.3763 18.6123 16.0056C18.8265 15.635 18.9286 15.2103 18.9061 14.7829C18.8836 14.3555 18.7376 13.9438 18.4857 13.5978L17.639 12.4344C17.3375 12.0171 17.1764 11.5148 17.179 11C17.1789 10.4866 17.3415 9.98635 17.6435 9.57111L18.4901 8.40778C18.742 8.06175 18.888 7.65007 18.9105 7.22267C18.933 6.79528 18.831 6.37054 18.6168 6C18.4029 5.62923 18.086 5.32849 17.7046 5.13423C17.3232 4.93997 16.8936 4.86053 16.4679 4.90556L15.0379 5.05778C14.5272 5.11141 14.0127 5.00212 13.5679 4.74556C13.125 4.48825 12.775 4.09736 12.5679 3.62889L11.979 2.31444C11.8053 1.92317 11.5217 1.59072 11.1628 1.3574C10.8038 1.12408 10.3849 0.99993 9.95679 1C9.52867 0.99993 9.10974 1.12408 8.75079 1.3574C8.39184 1.59072 8.1083 1.92317 7.93457 2.31444L7.35012 3.62889C7.14305 4.09736 6.79299 4.48825 6.35012 4.74556C5.90534 5.00212 5.39079 5.11141 4.88012 5.05778L3.44568 4.90556C3.02001 4.86053 2.59042 4.93997 2.20899 5.13423C1.82757 5.32849 1.51069 5.62923 1.29679 6C1.08261 6.37054 0.98057 6.79528 1.00305 7.22267C1.02554 7.65007 1.17158 8.06175 1.42345 8.40778L2.27012 9.57111C2.57206 9.98635 2.73466 10.4866 2.73456 11C2.73466 11.5134 2.57206 12.0137 2.27012 12.4289L1.42345 13.5922C1.17158 13.9382 1.02554 14.3499 1.00305 14.7773C0.98057 15.2047 1.08261 15.6295 1.29679 16C1.5109 16.3706 1.82782 16.6712 2.20919 16.8654C2.59055 17.0596 3.02004 17.1392 3.44568 17.0944L4.87568 16.9422C5.38635 16.8886 5.90089 16.9979 6.34568 17.2544C6.7902 17.511 7.14189 17.902 7.35012 18.3711Z"
      stroke={isActive ? "#9E77ED" : "var(--app-icon-muted)"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M9.955 14C11.6119 14 12.955 12.6569 12.955 11C12.955 9.34315 11.6119 8 9.955 8C8.29815 8 6.955 9.34315 6.955 11C6.955 12.6569 8.29815 14 9.955 14Z"
      stroke={isActive ? "#9E77ED" : "var(--app-icon-muted)"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

// Book icon (FAB center button)
const BookIcon = () => (
  <svg
    className="absolute block w-full h-full"
    fill="none"
    viewBox="0 0 22 20"
  >
    <g>
      <path
        d="M20 4.2002C20 3.62365 19.9987 3.25112 19.9756 2.96778C19.9534 2.69619 19.9158 2.59534 19.8906 2.5459C19.7948 2.35793 19.6421 2.20522 19.4541 2.10938C19.4047 2.08419 19.3038 2.04662 19.0322 2.02442C18.7489 2.00127 18.3764 2 17.7998 2H17.4004C16.264 2 15.4713 2.00041 14.8545 2.05079C14.2493 2.10023 13.9011 2.19297 13.6377 2.32715C13.0735 2.61473 12.6147 3.07348 12.3272 3.6377C12.193 3.90106 12.1002 4.24933 12.0508 4.8545C12.0256 5.16295 12.0133 5.51531 12.0068 5.93262L12 7.40039V16.1104C12.4999 15.7067 13.0725 15.4026 13.6875 15.2158C14.4314 14.9899 15.235 15 16.4248 15H17.7998C18.3764 15 18.7489 14.9987 19.0322 14.9756C19.3038 14.9534 19.4047 14.9158 19.4541 14.8906C19.6421 14.7948 19.7948 14.6421 19.8906 14.4541C19.9158 14.4047 19.9534 14.3038 19.9756 14.0322C19.9987 13.7489 20 13.3764 20 12.7998V4.2002Z"
        fill="white"
      />
      <path
        d="M20 4.2002C20 3.62365 19.9987 3.25112 19.9756 2.96778C19.9534 2.69619 19.9158 2.59534 19.8906 2.5459C19.7948 2.35793 19.6421 2.20522 19.4541 2.10938C19.4047 2.08419 19.3038 2.04662 19.0322 2.02442C18.7489 2.00127 18.3764 2 17.7998 2H17.4004C16.264 2 15.4713 2.00041 14.8545 2.05079C14.2493 2.10023 13.9011 2.19297 13.6377 2.32715C13.0735 2.61473 12.6147 3.07348 12.3272 3.6377C12.193 3.90106 12.1002 4.24933 12.0508 4.8545C12.0256 5.16295 12.0133 5.51531 12.0068 5.93262L12 7.40039V16.1104C12.4999 15.7067 13.0725 15.4026 13.6875 15.2158C14.4314 14.9899 15.235 15 16.4248 15H17.7998C18.3764 15 18.7489 14.9987 19.0322 14.9756C19.3038 14.9534 19.4047 14.9158 19.4541 14.8906C19.6421 14.7948 19.7948 14.6421 19.8906 14.4541C19.9158 14.4047 19.9534 14.3038 19.9756 14.0322C19.9987 13.7489 20 13.3764 20 12.7998V4.2002ZM2 12.7998C2 13.3764 2.00127 13.7489 2.02442 14.0322C2.04662 14.3038 2.08419 14.4047 2.10938 14.4541C2.20522 14.6421 2.35793 14.7948 2.5459 14.8906C2.59534 14.9158 2.69619 14.9534 2.96778 14.9756C3.25112 14.9987 3.62365 15 4.2002 15H5.5752C6.76501 15 7.5686 14.9899 8.3125 15.2158C8.92749 15.4026 9.50015 15.7067 10 16.1104V7.40039C10 6.26396 9.9996 5.4713 9.94922 4.8545C9.89978 4.24933 9.80704 3.90106 9.67286 3.6377C9.38528 3.07348 8.92653 2.61473 8.36231 2.32715C8.09895 2.19297 7.75068 2.10023 7.14551 2.05079C6.52871 2.00041 5.73605 2 4.59961 2H4.2002C3.62365 2 3.25112 2.00127 2.96778 2.02442C2.69619 2.04662 2.59534 2.08419 2.5459 2.10938C2.35793 2.20522 2.20522 2.35793 2.10938 2.5459C2.08419 2.59534 2.04662 2.69619 2.02442 2.96778C2.00127 3.25112 2 3.62365 2 4.2002V12.7998Z"
        fill="white"
      />
      <path
        d="M2 12.7998C2 13.3764 2.00127 13.7489 2.02442 14.0322C2.04662 14.3038 2.08419 14.4047 2.10938 14.4541C2.20522 14.6421 2.35793 14.7948 2.5459 14.8906C2.59534 14.9158 2.69619 14.9534 2.96778 14.9756C3.25112 14.9987 3.62365 15 4.2002 15H5.5752C6.76501 15 7.5686 14.9899 8.3125 15.2158C8.92749 15.4026 9.50015 15.7067 10 16.1104V7.40039C10 6.26396 9.9996 5.4713 9.94922 4.8545C9.89978 4.24933 9.80704 3.90106 9.67286 3.6377C9.38528 3.07348 8.92653 2.61473 8.36231 2.32715C8.09895 2.19297 7.75068 2.10023 7.14551 2.05079C6.52871 2.00041 5.73605 2 4.59961 2H4.2002C3.62365 2 3.25112 2.00127 2.96778 2.02442C2.69619 2.04662 2.59534 2.08419 2.5459 2.10938C2.35793 2.20522 2.20522 2.35793 2.10938 2.5459C2.08419 2.59534 2.04662 2.69619 2.02442 2.96778C2.00127 3.25112 2 3.62365 2 4.2002V12.7998Z"
        fill="white"
      />
    </g>
  </svg>
);

// Background curve SVG path
const CurveBackground = () => (
  <svg
    className="block w-full h-full"
    fill="none"
    preserveAspectRatio="none"
    viewBox="0 0 393 107"
  >
    <path
      d="M197 0C211.146 0 223.385 8.15921 229.27 20.0282C232.44 26.4221 238.179 32 245.316 32H387C390.314 32 393 34.6863 393 38V81C393 95.3594 381.359 107 367 107H26C11.6406 107 0 95.3594 0 81V38C0 34.6863 2.68629 32 6 32H148.684C155.821 32 161.56 26.4221 164.73 20.0282C170.615 8.15921 182.854 0 197 0ZM197 1C184.534 1 173.592 7.51702 167.392 17.3298C162.927 24.3965 169.553 32 177.912 32H216.088C224.447 32 231.073 24.3965 226.608 17.3298C220.408 7.51702 209.466 1 197 1Z"
      fill="var(--app-nav-bg)"
    />
  </svg>
);

// =====================
// COMPONENT
// =====================

export function BottomBar({ activeBookId }: BottomBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Active route detection
  const isLibrary =
    location.pathname === "/" || location.pathname === "/library";
  const isBook = location.pathname.startsWith("/book/");
  const isSettings = location.pathname === "/settings";

  return (
    <div
      className="relative shrink-0 w-full"
      style={{ height: BOTTOM_BAR_TOKENS.containerHeight }}
    >
      <div className="flex flex-col items-center justify-end h-full w-full">
        <div
          className="relative w-full"
          style={{ height: BOTTOM_BAR_TOKENS.navHeight }}
        >
          {/* Curved Background SVG */}
          <div
            className="absolute left-0 w-full"
            style={{
              height: BOTTOM_BAR_TOKENS.curveHeight,
              top: BOTTOM_BAR_TOKENS.curveTop,
            }}
          >
            <CurveBackground />
          </div>

          {/* Navigation Items Container */}
          <div
            className="absolute flex items-center left-0 right-0 top-0 px-6 rounded-t-3xl"
            style={{ height: BOTTOM_BAR_TOKENS.navHeight }}
          >
            {/* Library Button */}
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex flex-col gap-3 items-center justify-center px-4 py-3 h-full"
              aria-label="Library"
              aria-current={isLibrary ? "page" : undefined}
            >
              <div
                className="relative w-6 h-6 overflow-clip"
                style={{ width: BOTTOM_BAR_TOKENS.iconSize, height: BOTTOM_BAR_TOKENS.iconSize }}
              >
                <div className="absolute inset-[8.33%]">
                  <LibraryIcon isActive={isLibrary} />
                </div>
              </div>
              <span
                className="font-['Inter',sans-serif] text-[12px] leading-[18px]"
                style={{
                  color: isLibrary
                    ? BOTTOM_BAR_TOKENS.activeTextColor
                    : "var(--app-text-muted)",
                }}
              >
                Library
              </span>
            </button>

            {/* Book Label (center placeholder) */}
            <div className="flex-1 flex flex-col items-center justify-end px-4 py-3 h-full gap-[5px]">
              <span
                className="font-['Inter',sans-serif] text-[12px] leading-[18px]"
                style={{
                  color: isBook
                    ? BOTTOM_BAR_TOKENS.activeColor
                    : "var(--app-text-secondary)",
                }}
              >
                Book
              </span>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => navigate("/settings")}
              className="flex-1 flex flex-col gap-3 items-center justify-center px-4 py-3 h-full"
              aria-label="Settings"
              aria-current={isSettings ? "page" : undefined}
            >
              <div
                className="relative w-6 h-6 overflow-clip"
                style={{ width: BOTTOM_BAR_TOKENS.iconSize, height: BOTTOM_BAR_TOKENS.iconSize }}
              >
                <div
                  className="absolute"
                  style={{
                    inset: "8.33% 12.67% 8.33% 12.69%",
                  }}
                >
                  <div
                    className="absolute"
                    style={{ inset: "-5% -5.58%" }}
                  >
                    <SettingsIcon isActive={isSettings} />
                  </div>
                </div>
              </div>
              <span
                className="font-['Inter',sans-serif] text-[12px] leading-[18px]"
                style={{
                  color: isSettings
                    ? BOTTOM_BAR_TOKENS.activeTextColor
                    : "var(--app-text-muted)",
                }}
              >
                Settings
              </span>
            </button>

            {/* Floating Action Button (FAB) - Center Book Button */}
            <button
              onClick={() => {
                if (activeBookId) {
                  navigate(`/book/${activeBookId}`);
                }
              }}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: BOTTOM_BAR_TOKENS.fabTop }}
              aria-label="Open current book"
              disabled={!activeBookId}
            >
              <div
                className="rounded-full"
                style={{
                  width: BOTTOM_BAR_TOKENS.fabSize,
                  height: BOTTOM_BAR_TOKENS.fabSize,
                  backgroundColor: isBook
                    ? BOTTOM_BAR_TOKENS.activeColor
                    : BOTTOM_BAR_TOKENS.inactiveBg,
                  opacity: BOTTOM_BAR_TOKENS.fabOpacity,
                  boxShadow: BOTTOM_BAR_TOKENS.fabShadow,
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 overflow-clip relative">
                    <div className="absolute inset-[8.33%_4.17%]">
                      <BookIcon />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}