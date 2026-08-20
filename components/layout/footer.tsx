import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const DEVELOPERS = [
  {
    name: "Yahya ElGaïd",
    url: "https://www.facebook.com/share/1FZZhFYtiw/?mibextid=wwXIfr",
    avatar: "/yahya.png",
    initials: "YE",
  },
  {
    name: "Oussama Mohamed Lemine",
    url: "https://www.linkedin.com/in/oussama-mohamed-lemine-5a2449267/",
    avatar: "/oussama.png",
    initials: "OM",
  },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-[#2a2a2a] bg-[#111111] text-slate-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-4">
        
        {/* Left: Developed by */}
        <div className={`${poppins.className} flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4`}>
          <span className="text-sm font-medium tracking-wide text-slate-400">
            Développé par
          </span>

          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            {DEVELOPERS.map((dev) => (
              <a
                key={dev.name}
                href={dev.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dev.name}
                className="group flex items-center gap-2.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 transition-all hover:border-blue-500 hover:bg-slate-800"
              >
                {/* Avatar */}
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-600">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.classList.add(
                          "flex", "items-center", "justify-center",
                          "bg-slate-700", "text-[9px]", "font-bold"
                        );
                        parent.textContent = dev.initials;
                      }
                    }}
                  />
                </div>
                {/* Name */}
                <span className="text-sm font-medium text-slate-300 group-hover:text-blue-400">
                  {dev.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Right: VoteCampus */}
<div className="flex items-center gap-3">
  <span className={`${poppins.className} text-xs font-semibold tracking-widest text-slate-500`}>
    © 2026 AEM-MAROC. Tous droits réservés.
  </span>
  <a
    href="https://www.facebook.com/share/g/1C1cPv9JEm/?mibextid=wwXIfr"
    target="_blank"
    rel="noopener noreferrer"
    className="text-slate-400 hover:text-blue-600 transition-colors"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  </a>
</div>

      </div>
    </footer>
  );
}