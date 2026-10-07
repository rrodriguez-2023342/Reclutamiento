import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { createPlaza } from "../../services/plazas.service.js";
import PlazaForm from "./PlazaForm.jsx";

function NuevaPlaza() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const submit = async (values) => {
    setServerError("");
    try {
      await createPlaza(values);
      navigate("/plazas", {
        state: { mensaje: "Plaza creada correctamente." },
        replace: true,
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message || "No fue posible crear la plaza.",
      );
    }
  };

  return (
    <DashboardLayout title="Nueva Plaza">
      <PlazaForm
        title="Nueva Plaza"
        submitLabel="Guardar plaza"
        serverError={serverError}
        onSubmit={submit}
      />
    </DashboardLayout>
  );
}

export default NuevaPlaza;
