import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Search, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getRoles,
    getUsuarios,
    getUsuarioEmpresas,
    setUsuarioEmpresas,
} from "../../services/usuarios.service.js";
import { getEmpresas } from "../../services/empresas.service.js";

const RRHH_ROLE_NAME = "Recursos Humanos";

// Obtiene los usuarios con el rol Recursos Humanos (sin tocar el estado)
const obtenerUsuariosRH = async () => {
    const roles = await getRoles();
    const rolRH = (roles || []).find((role) => role.nombre === RRHH_ROLE_NAME);
    if (!rolRH) return [];
    const resultado = await getUsuarios({
        rol_id: rolRH.id,
        limit: 100,
        page: 1,
    });
    return resultado?.data || [];
};

function Configuracion() {
    const [usuarios, setUsuarios] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [errorEmpresas, setErrorEmpresas] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [search, setSearch] = useState("");
    const [modalUser, setModalUser] = useState(null);
    const [seleccion, setSeleccion] = useState([]);
    const [buscadorEmpresas, setBuscadorEmpresas] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const cargarUsuarios = useCallback(async () => {
        try {
            const lista = await obtenerUsuariosRH();
            setUsuarios(lista);
            setError("");
        } catch (requestError) {
            setUsuarios([]);
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cargar los usuarios de Recursos Humanos.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        obtenerUsuariosRH()
            .then((lista) => {
                if (active) {
                    setUsuarios(lista);
                    setError("");
                }
            })
            .catch((requestError) => {
                if (active) {
                    setUsuarios([]);
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar los usuarios de Recursos Humanos.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        getEmpresas({ limit: 100 })
            .then((data) => {
                if (active) setEmpresas(data?.data || []);
            })
            .catch(() => {
                if (active) {
                    setEmpresas([]);
                    setErrorEmpresas("No se pudieron cargar las empresas. Recarga la página e inténtalo de nuevo.");
                }
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!successMessage) return undefined;
        const timer = window.setTimeout(() => setSuccessMessage(""), 5000);
        return () => window.clearTimeout(timer);
    }, [successMessage]);

    const usuariosFiltrados = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return usuarios;
        return usuarios.filter(
            (usuario) =>
                usuario.nombre.toLowerCase().includes(term) ||
                usuario.correo.toLowerCase().includes(term),
        );
    }, [usuarios, search]);

    const empresasFiltradas = useMemo(() => {
        const term = buscadorEmpresas.trim().toLowerCase();
        if (!term) return empresas;
        return empresas.filter((empresa) =>
            empresa.nombre_empresa.toLowerCase().includes(term),
        );
    }, [empresas, buscadorEmpresas]);

    const abrirModal = async (usuario) => {
        setModalUser(usuario);
        setModalError("");
        setBuscadorEmpresas("");
        setSeleccion(
            (usuario.empresas_asignadas || []).map((fila) => fila.empresa.id),
        );
        setModalLoading(true);
        try {
            const asignadas = await getUsuarioEmpresas(usuario.id);
            setSeleccion((asignadas || []).map((empresa) => empresa.id));
        } catch (requestError) {
            setModalError(
                requestError.response?.data?.message ||
                    "No fue posible cargar las empresas asignadas. Revisa la selección antes de guardar.",
            );
        } finally {
            setModalLoading(false);
        }
    };

    const alternarEmpresa = (id) => {
        setSeleccion((actual) =>
            actual.includes(id)
                ? actual.filter((empresaId) => empresaId !== id)
                : [...actual, id],
        );
    };

    const guardar = async () => {
        if (!modalUser) return;
        setGuardando(true);
        setModalError("");
        try {
            await setUsuarioEmpresas(modalUser.id, seleccion);
            const nombre = modalUser.nombre;
            setModalUser(null);
            setSuccessMessage(`Empresas actualizadas para ${nombre}`);
            await cargarUsuarios();
        } catch (requestError) {
            setModalError(
                requestError.response?.data?.message ||
                    "No fue posible guardar las empresas asignadas.",
            );
        } finally {
            setGuardando(false);
        }
    };

    return (
        <DashboardLayout title="Configuración">
            {successMessage && (
                <div
                    role="status"
                    className="mb-5 rounded-[10px] border border-border bg-success-bg px-5 py-4 font-semibold text-success"
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-[10px] border border-danger bg-danger-bg px-5 py-4 font-semibold text-danger"
                >
                    {error}
                </div>
            )}
            {errorEmpresas && (
                <div
                    role="alert"
                    className="mb-5 rounded-[10px] border border-danger bg-danger-bg px-5 py-4 font-semibold text-danger"
                >
                    {errorEmpresas}
                </div>
            )}

            <section className="rounded-[10px] border border-border bg-surface p-5 shadow-none sm:p-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                    <label className="flex h-14 items-center gap-3 rounded-[10px] border border-border px-4 text-text-soft focus-within:border-action focus-within:ring-2 focus-within:ring-action/15">
                        <Search className="h-5 w-5 shrink-0" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar usuario por nombre, correo o usuario"
                            className="w-full bg-transparent text-base outline-none placeholder:text-text-soft"
                        />
                    </label>

                    <Link
                        to="/colaboradores/nuevo"
                        className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-action px-6 font-bold text-white shadow-none transition hover:bg-ink"
                    >
                        <UserPlus className="h-5 w-5" />
                        Nuevo usuario RH
                    </Link>
                </div>

                <p className="mt-4 text-sm text-text-soft">
                    Asigna las empresas a las que cada usuario de Recursos
                    Humanos tendrá acceso. Los usuarios sin empresas asignadas
                    no verán colaboradores ni empresas en el sistema.
                </p>
            </section>

            <section className="mt-7 overflow-hidden rounded-[10px] border border-border bg-surface shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left">
                        <thead>
                            <tr className="text-base font-semibold text-text-soft">
                                <th className="border-b border-border px-7 py-5 font-semibold">
                                    Usuario
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Estado
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Empresas asignadas
                                </th>
                                <th className="border-b border-border px-7 py-5 text-right font-semibold">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-7 py-10 text-center font-semibold text-text-soft"
                                    >
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}

                            {!loading && usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-7 py-10 text-center text-text-soft"
                                    >
                                        {usuarios.length === 0
                                            ? "Aún no hay usuarios con el rol Recursos Humanos. Crea uno desde Colaboradores."
                                            : "No se encontraron usuarios con ese criterio."}
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                usuariosFiltrados.map((usuario) => {
                                    const asignadas =
                                        usuario.empresas_asignadas || [];
                                    return (
                                        <tr
                                            key={usuario.id}
                                            className="transition hover:bg-neutral-bg"
                                        >
                                            <td className="border-b border-border px-7 py-6">
                                                <p className="font-bold text-text-main">
                                                    {usuario.nombre}
                                                </p>
                                                <p className="mt-1 text-sm text-text-soft">
                                                    {usuario.correo}
                                                </p>
                                            </td>
                                            <td className="border-b border-border px-5 py-6">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${usuario.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                                                >
                                                    {usuario.activo
                                                        ? "Activo"
                                                        : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="border-b border-border px-5 py-6">
                                                {asignadas.length === 0 ? (
                                                    <span className="inline-flex rounded-full bg-pending-bg px-3 py-1 text-sm font-semibold text-pending">
                                                        Sin empresas asignadas
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {asignadas.map(
                                                            (fila) => (
                                                                <span
                                                                    key={
                                                                        fila.empresa
                                                                            .id
                                                                    }
                                                                    className="inline-flex items-center gap-1 rounded-full bg-neutral-bg px-3 py-1 text-sm font-semibold text-action"
                                                                >
                                                                    <Building2 className="h-3.5 w-3.5" />
                                                                    {
                                                                        fila.empresa
                                                                            .nombre_empresa
                                                                    }
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="border-b border-border px-7 py-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirModal(usuario)
                                                        }
                                                        aria-label={`Asignar empresas a ${usuario.nombre}`}
                                                        className="flex h-11 cursor-pointer items-center gap-2 rounded-[8px] bg-action px-4 font-bold text-white transition hover:bg-ink"
                                                    >
                                                        <Building2 className="h-4 w-4" />
                                                        Asignar empresas
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </section>

            {modalUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-lg rounded-[10px] border border-border bg-surface p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-text-main">
                            Asignar empresas
                        </h2>
                        <p className="mt-1 text-text-soft">
                            {modalUser.nombre} · {modalUser.correo}
                        </p>

                        {modalError && (
                            <div
                                role="alert"
                                className="mt-4 rounded-[10px] border border-danger bg-danger-bg px-4 py-3 font-semibold text-danger"
                            >
                                {modalError}
                            </div>
                        )}

                        <label className="mt-5 flex h-12 items-center gap-3 rounded-[10px] border border-border px-4 text-text-soft focus-within:border-action focus-within:ring-2 focus-within:ring-action/15">
                            <Search className="h-5 w-5 shrink-0" />
                            <input
                                value={buscadorEmpresas}
                                onChange={(event) =>
                                    setBuscadorEmpresas(event.target.value)
                                }
                                placeholder="Buscar empresa"
                                className="w-full bg-transparent text-base outline-none placeholder:text-text-soft"
                            />
                        </label>

                        <div className="mt-4 max-h-72 overflow-y-auto rounded-[10px] border border-border p-2">
                            {modalLoading && (
                                <p className="px-3 py-4 text-text-soft">
                                    Cargando empresas asignadas...
                                </p>
                            )}
                            {!modalLoading && empresasFiltradas.length === 0 && (
                                <p className="px-3 py-4 text-text-soft">
                                    No hay empresas disponibles.
                                </p>
                            )}
                            {!modalLoading &&
                                empresasFiltradas.map((empresa) => (
                                    <label
                                        key={empresa.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-3 transition hover:bg-neutral-bg"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={seleccion.includes(
                                                empresa.id,
                                            )}
                                            onChange={() =>
                                                alternarEmpresa(empresa.id)
                                            }
                                            className="h-5 w-5 shrink-0 accent-action"
                                        />
                                        <span className="font-semibold text-text-main">
                                            {empresa.nombre_empresa}
                                        </span>
                                        {!empresa.activo && (
                                            <span className="rounded-full bg-neutral-bg px-2 py-0.5 text-xs font-bold text-text-soft">
                                                Inactiva
                                            </span>
                                        )}
                                    </label>
                                ))}
                        </div>

                        <p className="mt-3 text-sm font-semibold text-text-soft">
                            {seleccion.length} empresa(s) seleccionada(s)
                        </p>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setModalUser(null)}
                                className="h-12 cursor-pointer rounded-[10px] border border-border bg-surface px-5 font-bold text-text-main transition hover:bg-neutral-bg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={guardar}
                                disabled={guardando}
                                className="h-12 cursor-pointer rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {guardando ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default Configuracion;
