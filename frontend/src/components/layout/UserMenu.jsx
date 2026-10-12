import { useAuth } from "../../hooks/useAuth.js";

const initialsFromName = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "US";

function UserMenu({ compact = false, onClick }) {
  const { user } = useAuth();
  const name = user?.nombre || "Colaborador";
  const role = user?.rol || "Sin rol";
  const content = (
    <>
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white ${compact ? "h-10 w-10 text-xs" : "h-10 w-10 text-xs"}`}
      >
        {initialsFromName(name)}
      </div>
      <div className="min-w-0 text-left">
        <p
          className={`truncate font-medium ${compact ? "text-sm text-white" : "text-sm text-text-main"}`}
        >
          {name}
        </p>
        <p
          className={`mt-0.5 text-xs ${compact ? "text-white/65" : "text-text-soft"}`}
        >
          {role}
        </p>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full cursor-pointer items-center gap-3 rounded-[8px] text-left transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-action"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}

export default UserMenu;
