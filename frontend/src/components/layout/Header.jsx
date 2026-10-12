import { Menu, PanelLeftClose, Search } from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import NotificationBell from "./NotificationBell.jsx";

function Header({
  title = "Resumen general",
  headerSearch,
  isSidebarOpen,
  showSidebarToggle = true,
  onToggleSidebar,
  onOpenProfile,
}) {
  return (
    <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {showSidebarToggle && (
          <button
            type="button"
            aria-label={
              isSidebarOpen ? "Ocultar navegación" : "Mostrar navegación"
            }
            aria-expanded={isSidebarOpen}
            onClick={onToggleSidebar}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-ink transition hover:bg-bg"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        )}
        <h1 className="truncate text-xl font-semibold tracking-[-0.035em] text-ink sm:text-2xl">
          {title}
        </h1>
      </div>
      {headerSearch && (
        <label className="hidden w-full max-w-[360px] items-center gap-2 rounded-[8px] border border-border bg-bg px-3 py-2.5 text-text-soft xl:flex">
          <Search className="h-5 w-5 shrink-0" />
          <input
            value={headerSearch.value}
            onChange={(event) => headerSearch.onChange(event.target.value)}
            placeholder={headerSearch.placeholder}
            className="w-full bg-transparent text-sm text-text-main outline-none placeholder:text-text-soft"
          />
        </label>
      )}
      <div className="flex shrink-0 items-center gap-2 sm:gap-5">
        <NotificationBell />
        <div className="hidden border-l border-border pl-5 sm:block">
          <UserMenu onClick={onOpenProfile} />
        </div>
      </div>
    </header>
  );
}

export default Header;
