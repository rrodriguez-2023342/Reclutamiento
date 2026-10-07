import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  Plus,
  Save,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
  AffiliationField,
  BooleanField,
  Field,
  Input,
  PasswordInput,
  SearchableSelect,
  Select,
  Textarea,
} from "../../components/postulantes/formControls.jsx";
import StepIndicator from "../../components/postulantes/StepIndicator.jsx";
import ItemRepetible from "../../components/postulantes/ItemRepetible.jsx";
import {
  createPostulante,
  getPostulanteById,
  updatePostulante,
} from "../../services/postulantes.service.js";
import { getPlazas } from "../../services/plazas.service.js";
import {
  subirDocumento,
  getDocumentos,
} from "../../services/documentos.service.js";
import {
  defaultPostulanteValues,
  postulanteSchema,
} from "../../validators/postulantes.validator.js";
import {
  TIPOS_DOCUMENTO,
  etiquetasTipoDocumento,
  acceptPorTipo,
} from "./etiquetas.js";
import { verifyCurrentPassword } from "../../services/auth.service.js";

const DRAFT_KEY = "borrador-postulante";
const civilStates = [
  ["SOLTERO", "Soltero(a)"],
  ["CASADO", "Casado(a)"],
  ["UNIDO", "Unido(a)"],
  ["VIUDO", "Viudo(a)"],
  ["DIVORCIADO", "Divorciado(a)"],
];
const relationships = [
  ["PADRE", "Padre"],
  ["MADRE", "Madre"],
  ["ESPOSO_A", "Esposo(a)"],
  ["HIJO_A", "Hijo(a)"],
  ["HERMANO_A", "Hermano(a)"],
  ["EMERGENCIA", "Emergencia"],
];
const educationLevels = [
  ["PRIMARIA", "Primaria"],
  ["BASICOS", "Básicos"],
  ["DIVERSIFICADO", "Diversificado"],
  ["TECNICO", "Técnico"],
  ["LICENCIATURA", "Licenciatura"],
  ["MAESTRIA", "Maestría"],
  ["OTRO", "Otro"],
];

const emptyFamily = {
  parentesco: "PADRE",
  nombres_apellidos: "",
  edad: undefined,
  direccion: "",
  ocupacion: "",
  telefono: "",
};
const emptyEducation = {
  nivel: "PRIMARIA",
  estado: "COMPLETA",
  establecimiento: "",
  ano_inicial: undefined,
  ano_final: undefined,
};
const emptyLanguage = { idioma: "", habla: null, lee: null, escribe: null };
const emptyCourse = {
  nombre_curso: "",
  establecimiento_pais: "",
  tiempo_duracion: "",
  fecha_inicial: "",
  fecha_final: "",
};
const emptyExperience = {
  empresa: "",
  puesto: "",
  direccion: "",
  telefono: "",
  jefe_inmediato: "",
  fecha_ingreso: "",
  fecha_retiro: "",
  salario_inicial: undefined,
  salario_final: undefined,
  tareas_realizadas: "",
  motivo_retiro: undefined,
  motivo_retiro_otro: "",
};
const emptyReference = { nombre: "", telefono: "", direccion: "" };

function AddButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 cursor-pointer text-sm font-bold text-[#3162e9] transition hover:text-[#183fca]"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}
function ErrorText({ error }) {
  return (
    error && (
      <p className="mt-1 text-xs font-semibold text-red-500">{error.message}</p>
    )
  );
}

// Normaliza los datos del API al formato que espera el formulario
const aTexto = (valor) => (valor === null || valor === undefined ? "" : valor);
const aFecha = (valor) => (valor ? String(valor).slice(0, 10) : "");
const aNumero = (valor) =>
  valor === null || valor === undefined || valor === ""
    ? undefined
    : Number(valor);
const aEnum = (valor) => (valor === null || valor === undefined ? "" : valor);

function normalizarPostulante(p) {
  const lista = (items) => (Array.isArray(items) ? items : []);
  return {
    nombre_completo: aTexto(p.nombre_completo),
    direccion: aTexto(p.direccion),
    lugar_nacimiento: aTexto(p.lugar_nacimiento),
    fecha_nacimiento: aFecha(p.fecha_nacimiento),
    telefono: aTexto(p.telefono),
    correo: aTexto(p.correo),
    estado_civil: aEnum(p.estado_civil),
    sexo: aEnum(p.sexo),
    dpi: aTexto(p.dpi),
    dpi_extendido_en: aTexto(p.dpi_extendido_en),
    nit: aTexto(p.nit),
    igss: aTexto(p.igss),
    perfil_facebook: aTexto(p.perfil_facebook),
    plaza_id: p.plaza?.id || p.plaza_id || undefined,
    salario_aspira: aNumero(p.salario_aspira),
    fecha_inicio_disponible: aFecha(p.fecha_inicio_disponible),
    trabajar_extraordinario: p.trabajar_extraordinario ?? null,
    trabajar_turnos_rotativos: p.trabajar_turnos_rotativos ?? null,
    medio_enterado: aEnum(p.medio_enterado),
    medio_enterado_especificar: aTexto(p.medio_enterado_especificar),
    tiene_parientes_empresa: p.tiene_parientes_empresa ?? null,
    parientes_empresa_nombre: aTexto(p.parientes_empresa_nombre),
    porque_gustaria_trabajar: aTexto(p.porque_gustaria_trabajar),
    porque_deberiamoss_contratar: aTexto(p.porque_deberiamoss_contratar),
    fortaleza_1: aTexto(p.fortaleza_1),
    fortaleza_2: aTexto(p.fortaleza_2),
    fortaleza_3: aTexto(p.fortaleza_3),
    debilidad_1: aTexto(p.debilidad_1),
    debilidad_2: aTexto(p.debilidad_2),
    debilidad_3: aTexto(p.debilidad_3),
    afiliacion_gremial: p.afiliacion_gremial ?? null,
    afiliacion_gremial_especificar: aTexto(p.afiliacion_gremial_especificar),
    afiliacion_politica: p.afiliacion_politica ?? null,
    afiliacion_politica_especificar: aTexto(p.afiliacion_politica_especificar),
    afiliacion_sociales: p.afiliacion_sociales ?? null,
    afiliacion_sociales_especificar: aTexto(p.afiliacion_sociales_especificar),
    afiliacion_religiosa: p.afiliacion_religiosa ?? null,
    afiliacion_religiosa_especificar: aTexto(p.afiliacion_religiosa_especificar),
    afiliacion_civicos: p.afiliacion_civicos ?? null,
    afiliacion_civicos_especificar: aTexto(p.afiliacion_civicos_especificar),
    afiliacion_sindicales: p.afiliacion_sindicales ?? null,
    afiliacion_sindicales_especificar: aTexto(p.afiliacion_sindicales_especificar),
    afiliacion_deportiva: p.afiliacion_deportiva ?? null,
    afiliacion_deportiva_especificar: aTexto(p.afiliacion_deportiva_especificar),
    afiliacion_otros: p.afiliacion_otros ?? null,
    afiliacion_otros_especificar: aTexto(p.afiliacion_otros_especificar),
    practica_deporte: p.practica_deporte ?? null,
    deporte_cual: aTexto(p.deporte_cual),
    ha_estado_enfermo_gravedad: p.ha_estado_enfermo_gravedad ?? null,
    ha_estado_enfermo_gravedad_especificar: aTexto(p.ha_estado_enfermo_gravedad_especificar),
    toma_medicamento: p.toma_medicamento ?? null,
    toma_medicamento_especificar: aTexto(p.toma_medicamento_especificar),
    fuma_o_bebe: p.fuma_o_bebe ?? null,
    fuma_bebe_frecuencia: aTexto(p.fuma_bebe_frecuencia),
    impedimento_fisico: p.impedimento_fisico ?? null,
    impedimento_fisico_especificar: aTexto(p.impedimento_fisico_especificar),
    estudia_actualidad: p.estudia_actualidad ?? null,
    estudia_que: aTexto(p.estudia_que),
    estudia_establecimiento: aTexto(p.estudia_establecimiento),
    estudia_horario: aTexto(p.estudia_horario),
    posee_conocimientos_tecnicos: p.posee_conocimientos_tecnicos ?? null,
    conocimientos_tecnicos_especificar: aTexto(p.conocimientos_tecnicos_especificar),
    equipo_maquinaria: aTexto(p.equipo_maquinaria),
    personas_dependientes: aNumero(p.personas_dependientes),
    total_efectivo_hogar: aNumero(p.total_efectivo_hogar),
    vivienda_tipo: aEnum(p.vivienda_tipo),
    vivienda_valor: aNumero(p.vivienda_valor),
    vivienda_renta_monto: aNumero(p.vivienda_renta_monto),
    vivienda_otra_especificar: aTexto(p.vivienda_otra_especificar),
    vivienda_asegurada: p.vivienda_asegurada ?? null,
    vivienda_seguro_monto: aNumero(p.vivienda_seguro_monto),
    tiene_otro_inmueble: p.tiene_otro_inmueble ?? null,
    otro_inmueble_especificar: aTexto(p.otro_inmueble_especificar),
    otro_inmueble_monto: aNumero(p.otro_inmueble_monto),
    tiene_vehiculo: p.tiene_vehiculo ?? null,
    tipo_vehiculo: aTexto(p.tipo_vehiculo),
    vehiculo_marca: aTexto(p.vehiculo_marca),
    vehiculo_placa: aTexto(p.vehiculo_placa),
    licencia_tipo: aTexto(p.licencia_tipo),
    licencia_numero: aTexto(p.licencia_numero),
    vehiculo_asegurado: p.vehiculo_asegurado ?? null,
    vehiculo_seguro_monto: aNumero(p.vehiculo_seguro_monto),
    ingresos_adicionales: p.ingresos_adicionales ?? null,
    ingresos_adicionales_monto: aNumero(p.ingresos_adicionales_monto),
    ingresos_adicionales_motivo: aTexto(p.ingresos_adicionales_motivo),
    tiene_cuenta_bancaria: p.tiene_cuenta_bancaria ?? null,
    banco: aTexto(p.banco),
    tipo_cuenta_bancaria: aTexto(p.tipo_cuenta_bancaria),
    numero_cuenta_bancaria: aTexto(p.numero_cuenta_bancaria),
    deudas_pendientes: p.deudas_pendientes ?? null,
    deudas_monto: aNumero(p.deudas_monto),
    deudas_institucion: aTexto(p.deudas_institucion),
    deudas_motivo: aTexto(p.deudas_motivo),
    tiene_hipotecas: p.tiene_hipotecas ?? null,
    hipoteca_motivo: aTexto(p.hipoteca_motivo),
    hipoteca_monto: aNumero(p.hipoteca_monto),
    hipoteca_institucion: aTexto(p.hipoteca_institucion),
    otras_deudas: p.otras_deudas ?? null,
    otra_deuda_motivo: aTexto(p.otra_deuda_motivo),
    otra_deuda_monto: aNumero(p.otra_deuda_monto),
    otra_deuda_institucion: aTexto(p.otra_deuda_institucion),
    detenido_policia: p.detenido_policia ?? null,
    detenido_motivo: aTexto(p.detenido_motivo),
    procesado_legalmente: p.procesado_legalmente ?? null,
    procesado_motivo: aTexto(p.procesado_motivo),
    conoce_detenido_entorno: p.conoce_detenido_entorno ?? null,
    conoce_detenido_motivo: aTexto(p.conoce_detenido_motivo),
    datosFamiliares: lista(p.datosFamiliares).map((i) => ({
      parentesco: i.parentesco ?? "PADRE",
      nombres_apellidos: aTexto(i.nombres_apellidos),
      edad: aNumero(i.edad),
      direccion: aTexto(i.direccion),
      ocupacion: aTexto(i.ocupacion),
      telefono: aTexto(i.telefono),
    })),
    educacionHistorial: lista(p.educacionHistorial).map((i) => ({
      nivel: i.nivel ?? "PRIMARIA",
      estado: i.estado ?? "COMPLETA",
      establecimiento: aTexto(i.establecimiento),
      ano_inicial: aNumero(i.ano_inicial),
      ano_final: aNumero(i.ano_final),
    })),
    idiomas: lista(p.idiomas).map((i) => ({
      idioma: aTexto(i.idioma),
      habla: i.habla ?? null,
      lee: i.lee ?? null,
      escribe: i.escribe ?? null,
    })),
    capacitaciones: lista(p.capacitaciones).map((i) => ({
      nombre_curso: aTexto(i.nombre_curso),
      establecimiento_pais: aTexto(i.establecimiento_pais),
      tiempo_duracion: aTexto(i.tiempo_duracion),
      fecha_inicial: aFecha(i.fecha_inicial),
      fecha_final: aFecha(i.fecha_final),
    })),
    experienciaLaboral: lista(p.experienciaLaboral).map((i) => ({
      empresa: aTexto(i.empresa),
      puesto: aTexto(i.puesto),
      direccion: aTexto(i.direccion),
      telefono: aTexto(i.telefono),
      jefe_inmediato: aTexto(i.jefe_inmediato),
      fecha_ingreso: aFecha(i.fecha_ingreso),
      fecha_retiro: aFecha(i.fecha_retiro),
      salario_inicial: aNumero(i.salario_inicial),
      salario_final: aNumero(i.salario_final),
      tareas_realizadas: aTexto(i.tareas_realizadas),
        motivo_retiro: aEnum(i.motivo_retiro),
        motivo_retiro_otro: aTexto(i.motivo_retiro_otro),
    })),
    referenciasPersonales: lista(p.referenciasPersonales).map((i) => ({
      nombre: aTexto(i.nombre),
      telefono: aTexto(i.telefono),
      direccion: aTexto(i.direccion),
    })),
  };
}

function FormularioPostulante({ postulanteId }) {
  const esEdicion = Boolean(postulanteId);
  const navigate = useNavigate();
  const [draft] = useState(() =>
    !esEdicion && typeof window !== "undefined"
      ? window.localStorage.getItem(DRAFT_KEY)
      : null,
  );
  const [cargando, setCargando] = useState(esEdicion);
  const [errorCarga, setErrorCarga] = useState("");
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [serverError, setServerError] = useState("");
  const [draftDismissed, setDraftDismissed] = useState(false);
  const [documentosExistentes, setDocumentosExistentes] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelPassword, setCancelPassword] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [plazas, setPlazas] = useState([]);
  const {
    register,
    control,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postulanteSchema),
    defaultValues: defaultPostulanteValues,
  });
  const family = useFieldArray({ control, name: "datosFamiliares" });
  const education = useFieldArray({ control, name: "educacionHistorial" });
  const languages = useFieldArray({ control, name: "idiomas" });
  const courses = useFieldArray({ control, name: "capacitaciones" });
  const experience = useFieldArray({ control, name: "experienciaLaboral" });
  const references = useFieldArray({ control, name: "referenciasPersonales" });
  const values = useWatch({ control }) || defaultPostulanteValues;

  useEffect(() => {
    let active = true;
    getPlazas({ activo: true })
      .then((data) => active && setPlazas(data))
      .catch(() => active && setPlazas([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!draft) return;
    try {
      reset({ ...defaultPostulanteValues, ...JSON.parse(draft) });
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, [draft, reset]);

  useEffect(() => {
    if (esEdicion) return;
    const timer = window.setTimeout(
      () => window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values)),
      500,
    );
    return () => window.clearTimeout(timer);
  }, [values, esEdicion]);

  // En modo edición se cargan los datos del postulante y se precargan normalizados en el formulario
  useEffect(() => {
    if (!esEdicion) return undefined;
    let active = true;
    Promise.all([
      getPostulanteById(postulanteId),
      getDocumentos(postulanteId).catch(() => []),
    ])
      .then(([data, docs]) => {
        if (active && data) {
          reset(normalizarPostulante(data));
          setDocumentosExistentes(docs);
        }
      })
      .catch((errorCargaApi) => {
        if (!active) return;
        setErrorCarga(
          errorCargaApi.response?.status === 404
            ? "Postulante no encontrado"
            : "No fue posible cargar la información del postulante.",
        );
      })
      .finally(() => {
        if (active) setCargando(false);
      });
    return () => {
      active = false;
    };
  }, [esEdicion, postulanteId, reset]);

  const boolean = (name, label) => (
    <BooleanField
      label={label}
      value={values[name]}
      onChange={(value) => setValue(name, value, { shouldDirty: true })}
    />
  );
  // Booleano que limpia sus campos dependientes cuando la respuesta es "No"
  const booleanLimpia = (name, label, limpiar = {}) => (
    <BooleanField
      label={label}
      value={values[name]}
      onChange={(value) => {
        setValue(name, value, { shouldDirty: true });
        if (value !== true) {
          for (const [campo, vacio] of Object.entries(limpiar)) {
            setValue(campo, vacio, { shouldDirty: true });
          }
        }
      }}
    />
  );
  const affiliation = (name, label) => (
    <AffiliationField
      label={label}
      value={values[name]}
      especificarRegistration={register(`${name}_especificar`)}
      onChange={(value) => {
        setValue(name, value, { shouldDirty: true });
        if (value !== true) {
          setValue(`${name}_especificar`, "", { shouldDirty: true });
        }
      }}
    />
  );
  const stepFields = {
    1: [
      "nombre_completo",
      "direccion",
      "lugar_nacimiento",
      "fecha_nacimiento",
      "telefono",
      "correo",
      "estado_civil",
      "dpi",
    ],
    2: ["plaza_id"],
    3: [],
    4: ["datosFamiliares"],
    5: ["educacionHistorial", "idiomas", "capacitaciones"],
    6: ["experienciaLaboral"],
    7: ["referenciasPersonales"],
    8: [],
  };
  const next = async (event) => {
    event?.preventDefault();
    if (step >= 8) return;
    try {
      const valid = await trigger(stepFields[step]);
      if (!valid) {
        if (step === 4) {
          const resultado = postulanteSchema.shape.datosFamiliares.safeParse(
            getValues("datosFamiliares"),
          );
          if (!resultado.success && resultado.error.issues.length > 0) {
            setServerError(resultado.error.issues[0].message);
            return;
          }
        }
        setServerError("Complete los campos requeridos antes de continuar.");
        return;
      }
      setServerError("");
      const nextStep = step + 1;
      setStep(nextStep);
      setMaxStep((current) => Math.max(current, nextStep));
    } catch (err) {
      console.error("Error validando paso:", err);
      setServerError("Error de validación. Intente de nuevo.");
    }
  };
  const submit = async (data) => {
    if (step !== 8) return;
    setServerError("");
    try {
      let postulanteIdFinal = postulanteId;

      if (esEdicion) {
        await updatePostulante(postulanteId, data);
      } else {
        const creado = await createPostulante(data);
        postulanteIdFinal = creado.id;
        window.localStorage.removeItem(DRAFT_KEY);
      }

      // Subir documentos seleccionados (si los hay)
      const documentos = getValues("documentos") || {};
      for (const tipo of TIPOS_DOCUMENTO) {
        const archivo = documentos[tipo];
        if (archivo instanceof File) {
          try {
            await subirDocumento(postulanteIdFinal, tipo, archivo);
          } catch (docError) {
            if (docError.response?.status === 413) {
              alert(
                `${tipo}: ${docError.response.data?.message || "El archivo excede el límite máximo de 2MB"}`,
              );
            } else {
              console.error(`Error subiendo ${tipo}:`, docError);
            }
          }
        }
      }

      navigate(esEdicion ? `/postulantes/${postulanteId}` : "/postulantes", {
        state: {
          mensaje: esEdicion
            ? "Postulante actualizado correctamente"
            : "Postulante registrado correctamente",
        },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          (esEdicion
            ? "No fue posible guardar los cambios."
            : "No fue posible registrar al postulante."),
      );
    }
  };
  const discardDraft = () => {
    window.localStorage.removeItem(DRAFT_KEY);
    reset(defaultPostulanteValues);
    setDraftDismissed(true);
  };

  const cancelarFormulario = async (event) => {
    event.preventDefault();
    setCancelError("");
    setCancelando(true);
    try {
      await verifyCurrentPassword(cancelPassword);
      if (!esEdicion) window.localStorage.removeItem(DRAFT_KEY);
      navigate(esEdicion ? `/postulantes/${postulanteId}` : "/postulantes");
    } catch (error) {
      setCancelError(
        error.response?.data?.message ||
          "No fue posible validar la contraseña.",
      );
    } finally {
      setCancelando(false);
    }
  };

  const titulo = esEdicion ? "Editar Postulante" : "Nuevo Postulante";

  if (cargando)
    return (
      <DashboardLayout title={titulo}>
        <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
          Cargando información del postulante…
        </div>
      </DashboardLayout>
    );
  if (errorCarga)
    return (
      <DashboardLayout title={titulo}>
        <section className="rounded-[26px] bg-white p-10 text-center shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
          <CircleAlert className="mx-auto h-10 w-10 text-[#df353c]" />
          <h2 className="mt-4 text-xl font-bold text-[#071b3b]">
            {errorCarga}
          </h2>
          <button
            type="button"
            onClick={() => navigate("/postulantes")}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-5 py-3 font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </button>
        </section>
      </DashboardLayout>
    );

  return (
    <DashboardLayout
      title={titulo}
      locked
      headerSearch={{
        value: "",
        onChange: () => {},
        placeholder: "Buscar postulante...",
      }}
    >
      {cancelOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#071b3b]/50 p-4">
          <form
            onSubmit={cancelarFormulario}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold text-[#071b3b]">
              Cancelar formulario
            </h2>
            <p className="mt-2 text-sm text-[#5b6e8b]">
              Confirma la contraseña del usuario conectado para salir.
            </p>
            {cancelError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                {cancelError}
              </p>
            )}
            <label className="mt-4 block text-sm font-semibold text-[#071b3b]">
              <span className="mb-2 block">Contraseña</span>
              <PasswordInput
                autoFocus
                value={cancelPassword}
                onChange={(event) => setCancelPassword(event.target.value)}
                className="h-12 w-full rounded-xl border border-[#dce3ee] px-4 outline-none focus:border-[#3162e9]"
              />
            </label>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setCancelOpen(false);
                  setCancelPassword("");
                  setCancelError("");
                }}
                className="w-full rounded-xl border border-[#dce3ee] px-4 py-2 font-semibold text-[#071b3b] cursor-pointer sm:w-auto"
              >
                Continuar formulario
              </button>
              <button
                type="submit"
                disabled={cancelando || !cancelPassword}
                className="w-full rounded-xl bg-[#df353c] px-4 py-2 font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {cancelando ? "Validando..." : "Confirmar salida"}
              </button>
            </div>
          </form>
        </div>
      )}
      <StepIndicator currentStep={step} maxStep={maxStep} onGoTo={setStep} />
      <form
        onSubmit={(e) => {
          if (step !== 8) {
            e.preventDefault();
            return;
          }
          handleSubmit(submit)(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && step !== 8) e.preventDefault();
        }}
        className="mt-7 rounded-[26px] bg-white p-5 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-7 lg:p-10"
      >
        {draft && !draftDismissed && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-[#b9d8ff] bg-[#edf6ff] px-4 py-3 text-sm text-[#2456a6] sm:flex-row sm:items-center">
            Se restauró un borrador guardado automáticamente.
            <button
              type="button"
              onClick={discardDraft}
              className="font-bold underline cursor-pointer"
            >
              Descartar borrador
            </button>
          </div>
        )}
        {serverError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {serverError}
          </div>
        )}
        {step === 1 && (
          <section>
            <Title
              title="Sección 1: Información personal"
              description="Ingrese los datos personales y de identificación del postulante."
            />
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Nombre completo *"
                error={errors.nombre_completo?.message}
              >
                <Input
                  registration={register("nombre_completo")}
                  placeholder="Nombre completo"
                />
              </Field>
              <Field
                label="Dirección actual *"
                error={errors.direccion?.message}
              >
                <Input
                  registration={register("direccion")}
                  placeholder="Dirección de domicilio"
                />
              </Field>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Field
                label="Lugar de nacimiento *"
                error={errors.lugar_nacimiento?.message}
              >
                <Input registration={register("lugar_nacimiento")} />
              </Field>
              <Field
                label="Fecha de nacimiento *"
                error={errors.fecha_nacimiento?.message}
              >
                <Input
                  type="date"
                  registration={register("fecha_nacimiento")}
                />
              </Field>
              <Field label="Teléfono *" error={errors.telefono?.message}>
                <Input
                  registration={register("telefono")}
                  placeholder="0000-0000"
                />
              </Field>
              <Field
                label="Correo electrónico *"
                error={errors.correo?.message}
              >
                <Input type="email" registration={register("correo")} />
              </Field>
              <Field
                label="Estado civil *"
                error={errors.estado_civil?.message}
              >
                <Select registration={register("estado_civil")}>
                  <option value="">Seleccione</option>
                  {civilStates.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Género">
                <Select registration={register("sexo")}>
                  <option value="">Seleccione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </Select>
              </Field>
              <Field label="Número de DPI *" error={errors.dpi?.message}>
                <Input
                  registration={register("dpi")}
                  placeholder="0000-00000-0000"
                />
              </Field>
              <Field label="Extendido en">
                <Input registration={register("dpi_extendido_en")} />
              </Field>
              <Field label="Número de NIT">
                <Input registration={register("nit")} />
              </Field>
              <Field label="No. afiliación I.G.S.S.">
                <Input registration={register("igss")} />
              </Field>
              <Field label="Perfil de Facebook" className="md:col-span-2">
                <Input
                  registration={register("perfil_facebook")}
                  placeholder="facebook.com/usuario"
                />
              </Field>
            </div>
          </section>
        )}
        {step === 2 && (
          <section>
            <Title
              title="Sección 2: Puesto y perfil"
              description="Registre las expectativas laborales y una breve autoevaluación."
            />
            <div className="grid gap-5 md:grid-cols-3">
              <Field
                label="Plaza a la que aplica *"
                error={errors.plaza_id?.message}
              >
                <SearchableSelect
                  control={control}
                  name="plaza_id"
                  options={[
                    { value: "", label: "Seleccione una plaza" },
                    ...plazas.map((plaza) => ({
                      value: plaza.id,
                      label: plaza.nombre,
                    })),
                  ]}
                  placeholder="Seleccione una plaza"
                  valueAsNumber
                  error={errors.plaza_id?.message}
                />
              </Field>
              <Field label="Salario al que aspira">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  registration={register("salario_aspira", {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <Field label="Fecha disponible para iniciar">
                <Input
                  type="date"
                  registration={register("fecha_inicio_disponible")}
                />
              </Field>
              <Field label="Medio por el que se enteró">
                <Select
                  registration={register("medio_enterado")}
                  onChange={(e) => {
                    const medio = e.target.value;
                    setValue("medio_enterado", medio || null, {
                      shouldDirty: true,
                    });
                    setValue("medio_enterado_especificar", "", {
                      shouldDirty: true,
                    });
                  }}
                >
                  <option value="">Seleccione</option>
                  <option value="ANUNCIO">Anuncio</option>
                  <option value="REFERENCIA">Referencia</option>
                  <option value="OTRO">Otro</option>
                </Select>
              </Field>
              {values.medio_enterado && (
                <Field label="Especifique">
                  <Input
                    registration={register("medio_enterado_especificar")}
                  />
                </Field>
              )}
              {booleanLimpia(
                "tiene_parientes_empresa",
                "¿Tiene parientes o amigos trabajando en la empresa?",
                { parientes_empresa_nombre: "" },
              )}
              {values.tiene_parientes_empresa === true && (
                <Field label="Nombre">
                  <Input registration={register("parientes_empresa_nombre")} />
                </Field>
              )}
              <div className="md:col-span-2 grid gap-5 sm:grid-cols-2">
                {boolean(
                  "trabajar_extraordinario",
                  "¿Puede trabajar tiempo extraordinario?",
                )}
                {boolean(
                  "trabajar_turnos_rotativos",
                  "¿Puede trabajar turnos rotativos?",
                )}
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="¿Por qué le gustaría trabajar con nosotros?">
                <Textarea registration={register("porque_gustaria_trabajar")} />
              </Field>
              <Field label="¿Por qué deberíamos contratarle?">
                <Textarea
                  registration={register("porque_deberiamoss_contratar")}
                />
              </Field>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TextGroup
                title="Fortalezas"
                names={["fortaleza_1", "fortaleza_2", "fortaleza_3"]}
                register={register}
              />
              <TextGroup
                title="Debilidades"
                names={["debilidad_1", "debilidad_2", "debilidad_3"]}
                register={register}
              />
            </div>
          </section>
        )}
        {step === 3 && (
          <section>
            <Title
              title="Sección 3: Salud, hábitos y economía"
              description="Esta información es opcional; complete solo lo que corresponda."
            />
            <div className="grid gap-6 md:grid-cols-2">
              {affiliation("afiliacion_gremial", "Afiliación gremial")}
              {affiliation("afiliacion_politica", "Afiliación política")}
              {affiliation("afiliacion_sociales", "Afiliación social")}
              {affiliation("afiliacion_religiosa", "Afiliación religiosa")}
              {affiliation("afiliacion_civicos", "Afiliación cívica")}
              {affiliation("afiliacion_sindicales", "Afiliación sindical")}
              {affiliation("afiliacion_deportiva", "Afiliación deportiva")}
              {affiliation("afiliacion_otros", "Otras afiliaciones")}
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-3">
              {boolean("practica_deporte", "¿Practica deporte?")}
              {values.practica_deporte === true && (
                <Field label="¿Cuál deporte?">
                  <Input registration={register("deporte_cual")} />
                </Field>
              )}
              {affiliation(
                "ha_estado_enfermo_gravedad",
                "¿Ha estado enfermo de gravedad?",
              )}
              {affiliation("toma_medicamento", "¿Toma algún medicamento?")}
              {boolean("fuma_o_bebe", "¿Fuma o bebe?")}
              {values.fuma_o_bebe === true && (
                <Field label="Frecuencia">
                  <Input registration={register("fuma_bebe_frecuencia")} />
                </Field>
              )}
              {affiliation(
                "impedimento_fisico",
                "¿Tiene algún impedimento físico?",
              )}
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              <Field label="Número de personas que dependen de usted">
                <Input
                  type="number"
                  min="0"
                  registration={register("personas_dependientes", {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <Field label="Total efectivo que aporta al hogar">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  registration={register("total_efectivo_hogar", {
                    valueAsNumber: true,
                  })}
                />
              </Field>
              <Field label="Tipo de vivienda">
                <Select
                  registration={register("vivienda_tipo")}
                  onChange={(e) => {
                    const tipo = e.target.value;
                    setValue("vivienda_tipo", tipo, { shouldDirty: true });
                    setValue("vivienda_valor", undefined, { shouldDirty: true });
                    setValue("vivienda_renta_monto", undefined, {
                      shouldDirty: true,
                    });
                    setValue("vivienda_otra_especificar", "", {
                      shouldDirty: true,
                    });
                  }}
                >
                  <option value="">Seleccione</option>
                  <option value="PROPIA">Propia</option>
                  <option value="ALQUILADA">Alquilada</option>
                  <option value="FAMILIAR">Familiar</option>
                  <option value="OTRA">Otra</option>
                </Select>
              </Field>
              {values.vivienda_tipo === "PROPIA" && (
                <Field label="Valor de vivienda">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    registration={register("vivienda_valor", {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              )}
              {values.vivienda_tipo === "ALQUILADA" && (
                <Field label="Monto de renta">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    registration={register("vivienda_renta_monto", {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              )}
              {values.vivienda_tipo === "OTRA" && (
                <Field label="Especifique el tipo de vivienda">
                  <Input registration={register("vivienda_otra_especificar")} />
                </Field>
              )}
              <BooleanField
                label="¿Tiene asegurada su vivienda?"
                value={values.vivienda_asegurada}
                onChange={(value) => {
                  setValue("vivienda_asegurada", value, {
                    shouldDirty: true,
                  });
                  if (value !== true) {
                    setValue("vivienda_seguro_monto", undefined, {
                      shouldDirty: true,
                    });
                  }
                }}
              />
              {values.vivienda_asegurada === true && (
                <Field label="Monto del seguro">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    registration={register("vivienda_seguro_monto", {
                      valueAsNumber: true,
                    })}
                  />
                </Field>
              )}
              {boolean("tiene_otro_inmueble", "¿Tiene otro inmueble?")}
              {values.tiene_otro_inmueble === true && (
                <>
                  <Field label="Especifique el inmueble *">
                    <Input
                      registration={register("otro_inmueble_especificar")}
                    />
                  </Field>
                  <Field label="Monto *">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      registration={register("otro_inmueble_monto", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                </>
              )}
              {boolean("tiene_vehiculo", "¿Tiene vehículo?")}
              {values.tiene_vehiculo === true && (
                <>
                  <Field label="Tipo de vehículo *">
                    <Select
                      registration={register("tipo_vehiculo")}
                    >
                      <option value="">Seleccione</option>
                      <option value="CARRO">Carro</option>
                      <option value="MOTO">Moto</option>
                      <option value="CAMION">Camión</option>
                      <option value="PICKUP">Pickup</option>
                      <option value="AUTOBUS">Autobús</option>
                      <option value="OTRO">Otro</option>
                    </Select>
                  </Field>
                  <Field label="Marca *">
                    <Input registration={register("vehiculo_marca")} />
                  </Field>
                  <Field label="Placa *">
                    <Input
                      registration={register("vehiculo_placa")}
                      placeholder="P-123ABC"
                    />
                  </Field>
                  <Field label="Tipo de licencia *">
                    <Input registration={register("licencia_tipo")} />
                  </Field>
                  <Field label="Número de licencia *">
                    <Input registration={register("licencia_numero")} />
                  </Field>
                  <BooleanField
                    label="¿Tiene asegurado su vehículo?"
                    value={values.vehiculo_asegurado}
                    onChange={(value) => {
                      setValue("vehiculo_asegurado", value, {
                        shouldDirty: true,
                      });
                      if (value !== true) {
                        setValue("vehiculo_seguro_monto", undefined, {
                          shouldDirty: true,
                        });
                      }
                    }}
                  />
                  {values.vehiculo_asegurado === true && (
                    <Field label="Monto del seguro *">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        registration={register("vehiculo_seguro_monto", {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  )}
                </>
              )}
              {booleanLimpia(
                "ingresos_adicionales",
                "¿Tiene ingresos adicionales al sueldo?",
                {
                  ingresos_adicionales_monto: undefined,
                  ingresos_adicionales_motivo: "",
                },
              )}
              {values.ingresos_adicionales === true && (
                <>
                  <Field label="Monto">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      registration={register("ingresos_adicionales_monto", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field label="Motivo">
                    <Input
                      registration={register("ingresos_adicionales_motivo")}
                    />
                  </Field>
                </>
              )}
              {booleanLimpia(
                "tiene_cuenta_bancaria",
                "¿Tiene cuenta bancaria?",
                {
                  banco: "",
                  tipo_cuenta_bancaria: "",
                  numero_cuenta_bancaria: "",
                },
              )}
              {values.tiene_cuenta_bancaria === true && (
                <>
                  <Field label="Tipo de cuenta">
                    <Select
                      registration={register("tipo_cuenta_bancaria")}
                    >
                      <option value="">Seleccione</option>
                      <option value="Ahorro">Ahorro</option>
                      <option value="Monetaria">Monetaria</option>
                      <option value="Tarjeta prepago">Tarjeta prepago</option>
                      <option value="Otro">Otro</option>
                    </Select>
                  </Field>
                  <Field label="Banco">
                    <Input
                      registration={register("banco")}
                      placeholder="Nombre del banco"
                    />
                  </Field>
                  <Field label="No. de cuenta">
                    <Input
                      registration={register("numero_cuenta_bancaria")}
                      placeholder="Número de cuenta"
                    />
                  </Field>
                </>
              )}
              {boolean("deudas_pendientes", "¿Tiene deudas pendientes?")}
              {values.deudas_pendientes === true && (
                <>
                  <Field label="Monto de deudas">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      registration={register("deudas_monto", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field label="Institución">
                    <Input registration={register("deudas_institucion")} />
                  </Field>
                  <Field label="Motivo">
                    <Input registration={register("deudas_motivo")} />
                  </Field>
                </>
              )}
              {booleanLimpia("tiene_hipotecas", "¿Tiene hipotecas?", {
                hipoteca_motivo: "",
                hipoteca_monto: undefined,
                hipoteca_institucion: "",
              })}
              {values.tiene_hipotecas === true && (
                <>
                  <Field label="Motivo">
                    <Input registration={register("hipoteca_motivo")} />
                  </Field>
                  <Field label="Monto">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      registration={register("hipoteca_monto", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field label="Institución o persona">
                    <Input registration={register("hipoteca_institucion")} />
                  </Field>
                </>
              )}
              {booleanLimpia("otras_deudas", "¿Tiene otras deudas por pagar?", {
                otra_deuda_motivo: "",
                otra_deuda_monto: undefined,
                otra_deuda_institucion: "",
              })}
              {values.otras_deudas === true && (
                <>
                  <Field label="Motivo">
                    <Input registration={register("otra_deuda_motivo")} />
                  </Field>
                  <Field label="Monto">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      registration={register("otra_deuda_monto", {
                        valueAsNumber: true,
                      })}
                    />
                  </Field>
                  <Field label="Institución o persona">
                    <Input registration={register("otra_deuda_institucion")} />
                  </Field>
                </>
              )}
              {booleanLimpia(
                "detenido_policia",
                "¿Ha sido detenido por la policía?",
                { detenido_motivo: "" },
              )}
              {values.detenido_policia === true && (
                <Field label="Motivo">
                  <Input registration={register("detenido_motivo")} />
                </Field>
              )}
              {booleanLimpia(
                "procesado_legalmente",
                "¿Ha sido procesado legalmente?",
                { procesado_motivo: "" },
              )}
              {values.procesado_legalmente === true && (
                <Field label="Motivo">
                  <Input registration={register("procesado_motivo")} />
                </Field>
              )}
              {booleanLimpia(
                "conoce_detenido_entorno",
                "¿Conoce a alguna persona de su entorno que haya estado presa en algún momento?",
                { conoce_detenido_motivo: "" },
              )}
              {values.conoce_detenido_entorno === true && (
                <Field label="Motivo">
                  <Input registration={register("conoce_detenido_motivo")} />
                </Field>
              )}
            </div>
          </section>
        )}
        {step === 4 && (
          <section>
            <Title
              title="Sección 4: Datos familiares"
              description="Agregue familiares directos o contactos relevantes."
            />
            <div className="space-y-4">
              {family.fields.map((item, index) => (
                <ItemRepetible
                  key={item.id}
                  title={`Familiar ${index + 1}`}
                  onRemove={() => family.remove(index)}
                >
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Parentesco *">
                      <Select
                        registration={register(
                          `datosFamiliares.${index}.parentesco`,
                        )}
                      >
                        {relationships.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                      <ErrorText
                        error={errors.datosFamiliares?.[index]?.parentesco}
                      />
                    </Field>
                    <Field label="Nombres y apellidos *">
                      <Input
                        registration={register(
                          `datosFamiliares.${index}.nombres_apellidos`,
                        )}
                        error={
                          errors.datosFamiliares?.[index]?.nombres_apellidos
                            ?.message
                        }
                      />
                    </Field>
                    <Field label="Edad">
                      <Input
                        type="number"
                        min="0"
                        registration={register(
                          `datosFamiliares.${index}.edad`,
                          { valueAsNumber: true },
                        )}
                      />
                    </Field>
                    <Field label="Dirección">
                      <Input
                        registration={register(
                          `datosFamiliares.${index}.direccion`,
                        )}
                      />
                    </Field>
                    <Field label="Ocupación">
                      <Input
                        registration={register(
                          `datosFamiliares.${index}.ocupacion`,
                        )}
                      />
                    </Field>
                    <Field label="Teléfono">
                      <Input
                        registration={register(
                          `datosFamiliares.${index}.telefono`,
                        )}
                      />
                    </Field>
                  </div>
                </ItemRepetible>
              ))}
            </div>
            <div className="mt-5">
              <AddButton onClick={() => family.append(emptyFamily)}>
                Agregar familiar
              </AddButton>
              {errors.datosFamiliares?._errors?.length > 0 && (
                <p className="mt-2 text-sm font-semibold text-red-500">
                  {errors.datosFamiliares._errors[0]}
                </p>
              )}
            </div>
          </section>
        )}
        {step === 5 && (
          <section>
            <Title
              title="Sección 5: Educación, idiomas y capacitaciones"
              description="Agregue únicamente los registros que correspondan al postulante."
            />
            <DynamicEducation
              education={education}
              languages={languages}
              courses={courses}
              register={register}
              errors={errors}
              values={values}
              setValue={setValue}
            />
          </section>
        )}
        {step === 6 && (
          <section>
            <Title
              title="Sección 6: Experiencia laboral"
              description="Registre los empleos anteriores del postulante."
            />
            <div className="space-y-4">
              {experience.fields.map((item, index) => (
                <ItemRepetible
                  key={item.id}
                  title={`Experiencia ${index + 1}`}
                  onRemove={() => experience.remove(index)}
                >
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Empresa *">
                      <Input
                        registration={register(
                          `experienciaLaboral.${index}.empresa`,
                        )}
                        error={
                          errors.experienciaLaboral?.[index]?.empresa?.message
                        }
                      />
                    </Field>
                    <Field label="Puesto *">
                      <Input
                        registration={register(
                          `experienciaLaboral.${index}.puesto`,
                        )}
                        error={
                          errors.experienciaLaboral?.[index]?.puesto?.message
                        }
                      />
                    </Field>
                    <Field label="Teléfono">
                      <Input
                        registration={register(
                          `experienciaLaboral.${index}.telefono`,
                        )}
                      />
                    </Field>
                    <Field label="Jefe inmediato">
                      <Input
                        registration={register(
                          `experienciaLaboral.${index}.jefe_inmediato`,
                        )}
                      />
                    </Field>
                    <Field label="Fecha ingreso">
                      <Input
                        type="date"
                        registration={register(
                          `experienciaLaboral.${index}.fecha_ingreso`,
                        )}
                      />
                    </Field>
                    <Field label="Fecha retiro">
                      <Input
                        type="date"
                        registration={register(
                          `experienciaLaboral.${index}.fecha_retiro`,
                        )}
                      />
                    </Field>
                    <Field label="Salario inicial">
                      <Input
                        type="number"
                        min="0"
                        registration={register(
                          `experienciaLaboral.${index}.salario_inicial`,
                          { valueAsNumber: true },
                        )}
                      />
                    </Field>
                    <Field label="Salario final">
                      <Input
                        type="number"
                        min="0"
                        registration={register(
                          `experienciaLaboral.${index}.salario_final`,
                          { valueAsNumber: true },
                        )}
                      />
                    </Field>
                    <Field label="Motivo de retiro">
                      <Select
                        registration={register(
                          `experienciaLaboral.${index}.motivo_retiro`,
                        )}
                      >
                        <option value="">Seleccione</option>
                        <option value="RENUNCIA">Renuncia</option>
                        <option value="DESPIDO">Despido</option>
                        <option value="REORGANIZACION">Reorganización</option>
                        <option value="OTRO">Otro</option>
                      </Select>
                    </Field>
                    {values.experienciaLaboral?.[index]?.motivo_retiro ===
                      "OTRO" && (
                      <Field label="Especifique motivo *">
                        <Input
                          registration={register(
                            `experienciaLaboral.${index}.motivo_retiro_otro`,
                          )}
                          error={
                            errors.experienciaLaboral?.[index]
                              ?.motivo_retiro_otro?.message
                          }
                        />
                      </Field>
                    )}
                    <Field label="Dirección" className="md:col-span-2">
                      <Input
                        registration={register(
                          `experienciaLaboral.${index}.direccion`,
                        )}
                      />
                    </Field>
                    <Field
                      label="Tareas realizadas"
                      className="md:col-span-2 lg:col-span-3"
                    >
                      <Textarea
                        registration={register(
                          `experienciaLaboral.${index}.tareas_realizadas`,
                        )}
                      />
                    </Field>
                  </div>
                </ItemRepetible>
              ))}
            </div>
            <div className="mt-5">
              <AddButton onClick={() => experience.append(emptyExperience)}>
                Agregar experiencia laboral
              </AddButton>
            </div>
          </section>
        )}
        {step === 7 && (
          <section>
            <Title
              title="Sección 7: Referencias personales"
              description="Agregue las referencias personales del postulante."
            />
            <div className="space-y-4">
              {references.fields.map((item, index) => (
                <ItemRepetible
                  key={item.id}
                  title={`Referencia ${index + 1}`}
                  onRemove={() => references.remove(index)}
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Nombre *">
                      <Input
                        registration={register(
                          `referenciasPersonales.${index}.nombre`,
                        )}
                        error={
                          errors.referenciasPersonales?.[index]?.nombre?.message
                        }
                      />
                    </Field>
                    <Field label="Teléfono *">
                      <Input
                        registration={register(
                          `referenciasPersonales.${index}.telefono`,
                        )}
                        error={
                          errors.referenciasPersonales?.[index]?.telefono
                            ?.message
                        }
                      />
                    </Field>
                    <Field label="Dirección">
                      <Input
                        registration={register(
                          `referenciasPersonales.${index}.direccion`,
                        )}
                      />
                    </Field>
                  </div>
                </ItemRepetible>
              ))}
            </div>
            <div className="mt-5">
              <AddButton onClick={() => references.append(emptyReference)}>
                Agregar referencia
              </AddButton>
            </div>
          </section>
        )}
        {step === 8 && (
          <section>
            <Title
              title="Sección 8: Documentos (opcional)"
              description="Adjunte los documentos requeridos. Solo se aceptan PDF (máx. 5 MB) para documentos e imágenes para la foto."
            />
            <div className="space-y-4">
              {TIPOS_DOCUMENTO.map((tipo) => {
                const existente = documentosExistentes.find(
                  (d) => d.tipo === tipo,
                );
                const archivoNuevo = values.documentos?.[tipo];
                return (
                  <div
                    key={tipo}
                    className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-[#071b3b]">
                        {etiquetasTipoDocumento[tipo]}
                      </span>
                      <span className="text-xs text-[#5b6e8b]">
                        {tipo === "FOTO"
                          ? "JPG, PNG, WebP (máx. 5 MB)"
                          : "PDF (máx. 5 MB)"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {existente && !archivoNuevo && (
                        <span className="text-xs text-[#087947] font-medium truncate max-w-[200px]">
                          {existente.nombre_archivo}
                        </span>
                      )}
                      {archivoNuevo && (
                        <span className="text-xs text-[#3162e9] font-medium truncate max-w-[200px]">
                          Nuevo: {archivoNuevo.name}
                        </span>
                      )}
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#3162e9] bg-[#f4f7ff] px-4 text-sm font-bold text-[#1e3a8a] transition hover:bg-[#e8efff]">
                        <Upload className="h-4 w-4" />
                        {archivoNuevo
                          ? "Cambiar archivo"
                          : "Seleccionar archivo"}
                        <input
                          type="file"
                          accept={acceptPorTipo[tipo]}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert(
                                  "El archivo excede el tamaño máximo de 5 MB",
                                );
                                e.target.value = "";
                                return;
                              }
                              setValue(`documentos.${tipo}`, file, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        <div className="mt-9 flex flex-col-reverse gap-4 border-t border-[#dfe5ee] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step === 1 ? (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="rounded-xl border border-[#dce3ee] px-5 py-3 cursor-pointer font-semibold text-[#071b3b] transition hover:bg-[#f6f8fc]"
              >
                {esEdicion ? "Cancelar edición" : "Cancelar registro"}
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dce3ee] px-5 py-3 cursor-pointer font-semibold text-[#071b3b] transition hover:bg-[#f6f8fc]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Paso anterior
                </button>
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-xl border border-[#f0b8bc] px-5 py-3 cursor-pointer font-semibold text-[#b4232a] transition hover:bg-[#fff1f2]"
                >
                  Cancelar formulario
                </button>
              </div>
            )}
          </div>
          {step < 8 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-3 cursor-pointer font-bold text-white transition hover:bg-[#142d70]"
            >
              Guardar y continuar (Paso {step + 1})
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3162e9] px-5 py-3 cursor-pointer font-bold text-white transition hover:bg-[#183fca] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSubmitting
                ? "Guardando…"
                : esEdicion
                  ? "Guardar cambios"
                  : "Registrar postulante"}
            </button>
          )}
        </div>
      </form>
    </DashboardLayout>
  );
}

function Title({ title, description }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b]">
        {title}
      </h2>
      <p className="mt-1 text-[#5b6e8b]">{description}</p>
    </div>
  );
}
function TextGroup({ title, names, register }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[#071b3b]">{title}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {names.map((name, index) => (
          <Input
            key={name}
            registration={register(name)}
            placeholder={`${title.slice(0, -1)} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function DynamicEducation({
  education,
  languages,
  courses,
  register,
  errors,
  values,
  setValue,
}) {
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader
          title="Historial académico"
          onAdd={() => education.append(emptyEducation)}
          label="Agregar estudio"
        />
        <div className="space-y-4">
          {education.fields.map((item, index) => (
            <ItemRepetible
              key={item.id}
              title={`Estudio ${index + 1}`}
              onRemove={() => education.remove(index)}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Field label="Nivel *">
                  <Select
                    registration={register(`educacionHistorial.${index}.nivel`)}
                  >
                    {educationLevels.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Estado *">
                  <Select
                    registration={register(`educacionHistorial.${index}.estado`)}
                  >
                    <option value="COMPLETA">Completa</option>
                    <option value="INCOMPLETA">Incompleta</option>
                  </Select>
                </Field>
                <Field label="Establecimiento">
                  <Input
                    registration={register(
                      `educacionHistorial.${index}.establecimiento`,
                    )}
                  />
                </Field>
                <Field label="Año inicial">
                  <Input
                    type="number"
                    registration={register(
                      `educacionHistorial.${index}.ano_inicial`,
                      { valueAsNumber: true },
                    )}
                  />
                </Field>
                <Field label="Año final">
                  <Input
                    type="number"
                    registration={register(
                      `educacionHistorial.${index}.ano_final`,
                      { valueAsNumber: true },
                    )}
                  />
                </Field>
              </div>
              <ErrorText error={errors.educacionHistorial?.[index]} />
            </ItemRepetible>
          ))}
        </div>
      </div>
      <div>
        <SectionHeader
          title="Idiomas"
          onAdd={() => languages.append(emptyLanguage)}
          label="Agregar idioma"
        />
        <div className="space-y-4">
          {languages.fields.map((item, index) => (
            <ItemRepetible
              key={item.id}
              title={`Idioma ${index + 1}`}
              onRemove={() => languages.remove(index)}
            >
              <div className="grid gap-5 md:grid-cols-4">
                <Field label="Idioma *">
                  <Input
                    registration={register(`idiomas.${index}.idioma`)}
                    error={errors.idiomas?.[index]?.idioma?.message}
                  />
                </Field>
                <BooleanField
                  label="Habla"
                  value={values.idiomas?.[index]?.habla}
                  onChange={(value) =>
                    setValue(`idiomas.${index}.habla`, value)
                  }
                />
                <BooleanField
                  label="Lee"
                  value={values.idiomas?.[index]?.lee}
                  onChange={(value) => setValue(`idiomas.${index}.lee`, value)}
                />
                <BooleanField
                  label="Escribe"
                  value={values.idiomas?.[index]?.escribe}
                  onChange={(value) =>
                    setValue(`idiomas.${index}.escribe`, value)
                  }
                />
              </div>
            </ItemRepetible>
          ))}
        </div>
      </div>
      <div>
        <SectionHeader
          title="Cursos y capacitaciones"
          onAdd={() => courses.append(emptyCourse)}
          label="Agregar curso"
        />
        <div className="space-y-4">
          {courses.fields.map((item, index) => (
            <ItemRepetible
              key={item.id}
              title={`Curso ${index + 1}`}
              onRemove={() => courses.remove(index)}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Field label="Curso o seminario *">
                  <Input
                    registration={register(
                      `capacitaciones.${index}.nombre_curso`,
                    )}
                    error={
                      errors.capacitaciones?.[index]?.nombre_curso?.message
                    }
                  />
                </Field>
                <Field label="Establecimiento / país">
                  <Input
                    registration={register(
                      `capacitaciones.${index}.establecimiento_pais`,
                    )}
                  />
                </Field>
                <Field label="Duración">
                  <Input
                    registration={register(
                      `capacitaciones.${index}.tiempo_duracion`,
                    )}
                  />
                </Field>
                <Field label="Fecha inicial">
                  <Input
                    type="date"
                    registration={register(
                      `capacitaciones.${index}.fecha_inicial`,
                    )}
                  />
                </Field>
                <Field label="Fecha final">
                  <Input
                    type="date"
                    registration={register(
                      `capacitaciones.${index}.fecha_final`,
                    )}
                  />
                </Field>
              </div>
            </ItemRepetible>
          ))}
        </div>
      </div>
      <div>
        <SectionHeader title="Estudios actuales" />
        <div className="space-y-4">
          <div className="max-w-md">
            <BooleanField
              label="¿Estudia en la actualidad?"
              value={values.estudia_actualidad}
              onChange={(value) =>
                setValue("estudia_actualidad", value, { shouldDirty: true })
              }
            />
          </div>
          {values.estudia_actualidad === true && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="¿Qué estudia? *">
                <Input registration={register("estudia_que")} />
              </Field>
              <Field label="Establecimiento *">
                <Input registration={register("estudia_establecimiento")} />
              </Field>
              <Field label="Horario *">
                <Input
                  registration={register("estudia_horario")}
                  placeholder="Ej: L-V 18:00-22:00"
                />
              </Field>
            </div>
          )}
        </div>
      </div>
      <div>
        <SectionHeader title="Conocimientos técnicos adicionales" />
        <div className="space-y-4">
          <div className="max-w-md">
            <BooleanField
              label="¿Posee otro tipo de conocimientos técnicos?"
              value={values.posee_conocimientos_tecnicos}
              onChange={(value) =>
                setValue("posee_conocimientos_tecnicos", value, {
                  shouldDirty: true,
                })
              }
            />
          </div>
          {values.posee_conocimientos_tecnicos === true && (
            <Field label="Especifique *">
              <Textarea
                registration={register("conocimientos_tecnicos_especificar")}
                rows={3}
              />
            </Field>
          )}
        </div>
      </div>
      <div>
        <SectionHeader title="Equipo o maquinaria que sabe operar" />
        <Field label="Especifique">
          <Textarea
            registration={register("equipo_maquinaria")}
            rows={3}
            placeholder="Ej: Montacargas, torno CNC, Excel avanzado…"
          />
        </Field>
      </div>
    </div>
  );
}
function SectionHeader({ title, onAdd, label }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-bold text-[#071b3b]">{title}</h3>
      <AddButton onClick={onAdd}>{label}</AddButton>
    </div>
  );
}

export default FormularioPostulante;
