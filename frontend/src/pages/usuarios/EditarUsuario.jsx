import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Field,
    Input,
    Select,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getRoles,
    getUsuarioById,
    updateUsuario,
} from "../../services/usuarios.service.js";
import {
    defaultUsuarioValues,
    usuarioSchema,
} from "../../validators/usuarios.validator.js";

function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [serverError, setServerError] = useState("");
    const [loadingUser, setLoadingUser] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(usuarioSchema),
        defaultValues: defaultUsuarioValues,
    });

    const selectedRole = watch("rol_id") ?? 2;

    useEffect(() => {
        let active = true;
        getRoles()
            .then((data) => active && setRoles(data || []))
            .catch(() => active && setRoles([]));
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        setLoadingUser(true);
        getUsuarioById(id)
            .then((data) => {
                if (active) {
                    reset({
                        ...defaultUsuarioValues,
                        nombre: data.nombre || "",
                        correo: data.correo || "",
                        rol_id: data.rol?.id ?? 2,
                        activo: data.activo ?? true,
                    });
                }
            })
            .catch((requestError) => {
                if (active) {
                    setServerError(
                        requestError.response?.data?.message ||
                        "No fue posible cargar el usuario.",
                    );
                }
            })
            .finally(() => active && setLoadingUser(false));

        return () => {
            active = false;
        };
    }, [id, reset]);

    const onSubmit = async (values) => {
        try {
            setServerError("");
            await updateUsuario(id, { ...values, rol_id: Number(values.rol_id) });
            navigate("/usuarios", {
                state: { mensaje: "Usuario actualizado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible actualizar el usuario.",
            );
        }
    };

    return (
        <DashboardLayout title="Editar Usuario">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/usuarios")}
                        aria-label="Volver a usuarios"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Editar Usuario
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Actualiza la información del usuario.
                        </p>
                    </div>
                </div>

                {loadingUser ? (
                    <div className="rounded-[26px] bg-white p-10 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                        Cargando usuario...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8"
                        noValidate
                    >
                        {serverError && (
                            <div
                                role="alert"
                                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-600"
                            >
                                {serverError}
                            </div>
                        )}

                        <div className="grid gap-5">
                            <Field label="Nombre *" error={errors.nombre?.message}>
                                <Input
                                    registration={register("nombre")}
                                    placeholder="Ej. Carlos Méndez"
                                />
                            </Field>

                            <Field label="Correo *" error={errors.correo?.message}>
                                <Input
                                    type="email"
                                    registration={register("correo")}
                                    placeholder="nombre@empresa.com"
                                />
                            </Field>

                            <Field label="Rol *" error={errors.rol_id?.message}>
                                <Select
                                    registration={{
                                        ...register("rol_id", { valueAsNumber: true }),
                                        value: selectedRole,
                                        onChange: (event) =>
                                            setValue("rol_id", Number(event.target.value), {
                                            shouldValidate: true,
                                        }),
                                    }}
                                >
                                    {roles.length === 0 ? (
                                        <option value={2}>Usuario</option>
                                    ) : (
                                        roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.nombre}
                                            </option>
                                            ))
                                        )}
                                </Select>
                            </Field>
                            
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce3ee] px-4 py-4 text-[#071b3b]">
                                <input
                                    type="checkbox"
                                    {...register("activo")}
                                    className="h-5 w-5 cursor-pointer accent-[#3162e9]"
                                />
                                <span className="font-semibold">Usuario activo</span>
                            </label>
                        </div>
                            
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/usuarios")}
                                className="h-14 cursor-pointer rounded-2xl border border-[#dce3ee] px-6 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-7 font-bold text-white transition hover:bg-[#183fca] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-5 w-5" />
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}

export default EditarUsuario;
