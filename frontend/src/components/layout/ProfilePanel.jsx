import { LogOut, Mail, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

function ProfilePanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const name = user?.nombre || "Colaborador";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar perfil"
          className="fixed inset-0 z-30 cursor-pointer bg-ink/30"
          onClick={onClose}
        />
      )}
      <aside
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-[390px] flex-col border-l border-border bg-surface p-6 transition-transform duration-300 sm:p-7 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
            Mi perfil
          </h2>
          <button
            type="button"
            aria-label="Cerrar perfil"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[8px] text-text-soft transition hover:bg-bg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-8 flex flex-col items-center border-b border-border pb-7 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-xl font-semibold text-white">
            {initialsFromName(name)}
          </div>
          <p className="mt-4 text-lg font-semibold text-text-main">{name}</p>
          <p className="mt-1 text-sm font-medium text-action">
            {user?.rol || "Sin rol"}
          </p>
        </div>
        <dl className="mt-7 space-y-5">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <div>
              <dt className="text-sm text-text-soft">Correo electrónico</dt>
              <dd className="mt-1 break-all font-medium text-text-main">
                {user?.correo || "No disponible"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-action" />
            <div>
              <dt className="text-sm text-text-soft">Rol</dt>
              <dd className="mt-1 font-medium text-text-main">
                {user?.rol || "No disponible"}
              </dd>
            </div>
          </div>
        </dl>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="mt-auto flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[7px] bg-action px-5 py-3 font-medium text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </button>
      </aside>
    </>
  );
}

export default ProfilePanel;
