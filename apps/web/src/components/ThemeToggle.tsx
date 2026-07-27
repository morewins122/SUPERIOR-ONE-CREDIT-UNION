import { Sun } from "lucide-react";
import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }}
      className="rounded-full border border-slate-300 bg-white/70 px-3 py-2 text-sm text-slate-700"
      aria-label="Light mode enabled"
    >
      <Sun size={16} />
    </button>
  );
}
