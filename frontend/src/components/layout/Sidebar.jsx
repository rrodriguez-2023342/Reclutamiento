import {
  Building2,
  BriefcaseBusiness,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useState, useRef, useEffect } from "react";
import UserMenu from "./UserMenu.jsx";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Postulantes", icon: UsersRound, to: "/postulantes" },
  { label: "Plazas activas", icon: BriefcaseBusiness, to: "/plazas" },
  {
    label: "Empresas/Patronos",
    icon: Building2,
    to: "/empresas",
    submenu: [
      { label: "Empresas", to: "/empresas" },
      { label: "Divisiones", to: "/empresas/divisiones" },
      { label: "Departamentos", to: "/empresas/departamentos" },
      { label: "Patronos", to: "/patronos" },
    ],
  },
  { label: "Puestos", icon: BriefcaseBusiness, to: "/empresas/puestos" },
  { label: "Colaboradores", icon: Shield, to: "/colaboradores" },
  { label: "Informes y docs", icon: FileText, to: "/informes" },
  { label: "Configuración", icon: Settings, to: "/configuracion" },
];

function Sidebar({ isOpen, onClose, onOpenProfile }) {
  const { user } = useAuth();
  const [flyoutKey, setFlyoutKey] = useState(null);
  const flyoutRef = useRef(null);

  const visibleNavigation =
    user?.rol === "Administrador RHCorp"
      ? navigation
      : navigation.filter((item) => item.to !== "/colaboradores");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        setFlyoutKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex w-[min(330px,86vw)] flex-col bg-[#1e3a8a] px-5 py-6 text-white shadow-2xl transition-transform duration-300 lg:w-[330px] lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center gap-4 px-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3162e9]">
          <BriefcaseBusiness className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[23px] font-extrabold leading-none tracking-[-0.045em]">
            GHCorp
          </p>
          <p className="mt-1 text-sm text-[#b5c5ee]">Gestión de candidatos</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 cursor-pointer lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-10 space-y-2" aria-label="Navegación principal">
        {visibleNavigation.map((item) => {
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isOpen = flyoutKey === item.label;
          return hasSubmenu ? (
            <div key={item.label} className="relative group">
              <button
                type="button"
                onClick={() => setFlyoutKey(isOpen ? null : item.label)}
                className={`flex h-14 items-center gap-4 rounded-2xl px-5 text-base font-semibold transition w-full ${isOpen ? "bg-[#3162e9] text-white" : "text-[#e1e9ff] hover:bg-white/10"}`}
              >
                <item.icon className="h-6 w-6" strokeWidth={2} />
                {item.label}
                <ChevronRight className={`ml-auto h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div
                  ref={flyoutRef}
                  className="absolute left-full top-0 z-10 ml-2 min-w-[200px] rounded-2xl bg-[#1e3a8a] py-2 shadow-2xl animate-flyout"
                  onMouseEnter={() => setFlyoutKey(item.label)}
                  onMouseLeave={() => setFlyoutKey(null)}
                >
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex h-12 items-center gap-3 rounded-xl px-5 text-sm font-semibold transition ${isActive ? "bg-[#3162e9] text-white" : "text-[#e1e9ff] hover:bg-white/10"}`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-14 items-center gap-4 rounded-2xl px-5 text-base font-semibold transition ${isActive ? "bg-[#3162e9] text-white" : "text-[#e1e9ff] hover:bg-white/10"}`
              }
            >
              <item.icon className="h-6 w-6" strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <UserMenu compact onClick={onOpenProfile} />
      </div>
</aside>
  );
}

export default Sidebar;
