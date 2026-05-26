export default function BrandLogo({ withText = true }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-500 to-cyan-400 shadow-[0_8px_24px_rgba(79,70,229,0.25)]">
        <svg
          viewBox="0 0 64 64"
          className="h-7 w-7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="22" r="10" fill="white" fillOpacity="0.95" />
          <path
            d="M39 38c0-6.627-5.373-12-12-12h-6c-6.627 0-12 5.373-12 12v1h30v-1Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M39 18l4 4 9-9"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="35"
            y="32"
            width="18"
            height="12"
            rx="6"
            fill="white"
            fillOpacity="0.2"
          />
        </svg>
      </div>

      {withText && (
        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-600">
            AI Job Matching
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Careea
          </h1>
        </div>
      )}
    </div>
  );
}