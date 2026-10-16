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
    <header className="sticky top-0 z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-border bg-surface px-4 py-3 sm:flex sm:h-[68px] sm:justify-between sm:gap-4 sm:py-0 sm:px-6 lg:px-8">
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
        <h1 className="min-w-0 break-words text-base font-semibold leading-tight tracking-[-0.035em] text-ink sm:truncate sm:text-2xl">
          {title}
        </h1>
      </div>
      {headerSearch && (
        <label className="col-span-2 flex w-full min-w-0 items-center gap-2 rounded-[8px] border border-border bg-bg px-3 py-2.5 text-text-soft sm:col-span-1 sm:ml-auto sm:w-full sm:max-w-[260px] xl:max-w-[360px]">
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
        <div className="min-w-0 sm:border-l sm:border-border sm:pl-5">
          <UserMenu onClick={onOpenProfile} hideTextMobile />
        </div>
      </div>
    </header>
  );
}

export default Header;
