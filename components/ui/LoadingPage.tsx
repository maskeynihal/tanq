"use client";

export default function LoadingPage({
  message = "Pumping the gas...",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 80"
            width="64"
            height="80"
            className="text-primary"
          >
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="10" y="20" width="30" height="30" rx="2" />
              <path d="M40 25h10v10h-10z" />
              <path d="M50 30v15c0 5-5 5-5 5H10s-5 0-5-5V30" />
              <path d="M20 20v-5a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v5" />
              <path d="M50 25v-5a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v20" />
              <path d="M55 40v5" />
              <circle cx="55" cy="50" r="3" />
            </g>
          </svg>
        </div>
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
