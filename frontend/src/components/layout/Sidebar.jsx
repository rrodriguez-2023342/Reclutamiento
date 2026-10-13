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

  const esAdmin = user?.rol === "Administrador RHCorp";
  const esStaff = esAdmin || user?.rol === "Recursos Humanos";

  const visibleNavigation = navigation.filter((item) => {
    if (item.to === "/colaboradores") return esStaff;
    if (item.to === "/configuracion") return esAdmin;
    return true;
  });

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
      className={`fixed inset-y-0 left-0 z-20 flex w-[min(330px,86vw)] flex-col bg-ink px-5 py-6 text-white transition-transform duration-300 lg:w-[330px] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center gap-4 px-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[9px] bg-surface/10 text-accent">
          <BriefcaseBusiness className="h-7 w-7" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[23px] font-extrabold leading-none tracking-[-0.045em]">
            GH<span className="font-script">Corp.</span>
          </p>
          <p className="mt-1 text-xs text-white/65">Gestión de candidatos</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onClose}
          className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-white/80 transition hover:bg-surface/10 cursor-pointer lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-8 space-y-1.5" aria-label="Navegación principal">
        {visibleNavigation.map((item) => {
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isOpen = flyoutKey === item.label;
          return hasSubmenu ? (
            <div key={item.label} className="relative group">
              <button
                type="button"
                onClick={() => setFlyoutKey(isOpen ? null : item.label)}
                className={`flex h-12 items-center gap-3 rounded-[8px] px-4 text-sm font-medium transition w-full ${isOpen ? "bg-accent/15 text-accent" : "text-white/75 hover:bg-surface/10 hover:text-white"}`}
              >
                <item.icon className="h-6 w-6" strokeWidth={2} />
                {item.label}
                <ChevronRight className={`ml-auto h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div
                  ref={flyoutRef}
                  className="absolute left-full top-0 z-10 ml-2 min-w-[200px] rounded-[9px] border border-white/10 bg-ink py-2 shadow-xl animate-flyout"
                  onMouseEnter={() => setFlyoutKey(item.label)}
                  onMouseLeave={() => setFlyoutKey(null)}
                >
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.label}
                      to={sub.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex h-11 items-center gap-3 rounded-[7px] px-4 text-sm font-medium transition ${isActive ? "bg-accent/15 text-accent" : "text-white/75 hover:bg-surface/10 hover:text-white"}`
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
                `flex h-12 items-center gap-3 rounded-[8px] px-4 text-sm font-medium transition ${isActive ? "bg-accent/15 text-accent before:mr-[-0.5rem] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-accent before:content-['']" : "text-white/75 hover:bg-surface/10 hover:text-white"}`
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
