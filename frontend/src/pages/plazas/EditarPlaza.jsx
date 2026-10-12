import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getPlazaById, updatePlaza } from "../../services/plazas.service.js";
import PlazaForm from "./PlazaForm.jsx";

function EditarPlaza() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plaza, setPlaza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    let active = true;
    getPlazaById(id)
      .then(
        (data) =>
          active &&
          setPlaza({
            ...data,
            salario_min:
              data.salario_min === null ? undefined : Number(data.salario_min),
            salario_max:
              data.salario_max === null ? undefined : Number(data.salario_max),
          }),
      )
      .catch(
        (error) =>
          active &&
          setServerError(
            error.response?.data?.message || "No fue posible cargar la plaza.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const submit = async (values) => {
    setServerError("");
    try {
      await updatePlaza(id, values);
      navigate("/plazas", {
        state: { mensaje: "Plaza actualizada correctamente." },
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "No fue posible actualizar la plaza.",
      );
    }
  };

  return (
    <DashboardLayout title="Editar Plaza">
      {loading ? (
        <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
          Cargando plaza...
        </div>
      ) : plaza ? (
        <PlazaForm
          title="Editar Plaza"
          submitLabel="Guardar cambios"
          initialValues={plaza}
          serverError={serverError}
          onSubmit={submit}
        />
      ) : (
        <div
          role="alert"
          className="rounded-[10px] border border-danger bg-danger-bg p-6 font-semibold text-danger"
        >
          {serverError}
          <button
            type="button"
            onClick={() => navigate("/plazas")}
            className="ml-3 cursor-pointer underline"
          >
            Volver a plazas
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}

export default EditarPlaza;
