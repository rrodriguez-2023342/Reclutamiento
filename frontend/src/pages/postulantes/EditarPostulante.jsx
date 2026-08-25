import { useParams } from "react-router-dom";
import FormularioPostulante from "../../components/postulantes/FormularioPostulante.jsx";

function EditarPostulante() {
  const { id } = useParams();

  return <FormularioPostulante postulanteId={Number(id)} />;
}

export default EditarPostulante;
