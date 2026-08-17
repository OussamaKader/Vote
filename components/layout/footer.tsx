import { Link2 } from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const LINKEDIN_URL =
  "https://www.linkedin.com/in/oussama-mohamed-lemine-5a2449267/";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#2a2a2a] bg-[#111111] text-slate-200">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 truncate text-xs text-slate-300 sm:text-sm">
          <span
            className={`${poppins.className} font-medium tracking-wide`}
          >
            Voter en toute confiance
          </span>
        </div>

        <a
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn VoteCampus"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition-colors hover:border-blue-500 hover:text-blue-400"
        >
          <Link2 className="h-4 w-4" />
        </a>
      </div>
    </footer>
  );
}