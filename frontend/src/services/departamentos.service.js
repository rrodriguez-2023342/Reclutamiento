import api from "./api.js";

export const getDepartamentos = async (params = {}) => {
  const { data } = await api.get("/empresas/departamentos", { params });
  return data.data;
};

export const getDepartamentoById = async (id) => {
  console.log("DEBUG getDepartamentoById - id:", id, typeof id);
  const { data } = await api.get(`/empresas/departamentos/${id}`);
  return data.data;
};

export const createDepartamento = async (departamento) => {
  const { data } = await api.post("/empresas/departamentos", departamento);
  return data.data;
};

export const updateDepartamento = async (id, departamento) => {
  const { data } = await api.put(`/empresas/departamentos/${id}`, departamento);
  return data.data;
};

export const desactivarDepartamento = async (id) => {
  const { data } = await api.patch(`/empresas/departamentos/${id}/desactivar`);
  return data.data;
};

export const activarDepartamento = async (id) => {
  const { data } = await api.patch(`/empresas/departamentos/${id}/activar`);
  return data.data;
};
