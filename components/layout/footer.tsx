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
        <span className={`${poppins.className} text-xs font-semibold tracking-widest text-slate-500`}>
          © 2026 AEM-MAROC. Tous droits réservés.
        </span>

      </div>
    </footer>
  );
}