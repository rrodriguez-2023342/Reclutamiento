import { Bell, Menu, PanelLeftClose, Search } from "lucide-react";
import UserMenu from "./UserMenu.jsx";

function Header({
  title = "Resumen general",
  headerSearch,
  isSidebarOpen,
  onToggleSidebar,
  onOpenProfile,
}) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between gap-4 border-b border-[#dce3ee] bg-white px-4 sm:h-[86px] sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label={
            isSidebarOpen ? "Ocultar navegación" : "Mostrar navegación"
          }
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#1e3a8a] transition hover:bg-[#f1f4f9] cursor-pointer"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <h1 className="truncate text-xl font-bold tracking-[-0.045em] text-[#071b3b] sm:text-[30px]">
          {title}
        </h1>
      </div>
      {headerSearch && (
        <label className="hidden w-full max-w-[360px] items-center gap-2 rounded-full border border-[#dce3ee] bg-[#f1f4f9] px-4 py-3 text-[#65758f] xl:flex">
          <Search className="h-5 w-5 shrink-0" />
          <input
            value={headerSearch.value}
            onChange={(event) => headerSearch.onChange(event.target.value)}
            placeholder={headerSearch.placeholder}
            className="w-full bg-transparent text-base outline-none placeholder:text-[#7787a2]"
          />
        </label>
      )}
      <div className="flex shrink-0 items-center gap-2 sm:gap-5">
        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e8edf6] cursor-pointer"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="hidden border-l border-[#e1e6ef] pl-5 sm:block">
          <UserMenu onClick={onOpenProfile} />
        </div>
      </div>
    </header>
  );
}

export default Header;
