import api from "./api.js";

export const getPuestos = async (params = {}) => {
  const { data } = await api.get("/empresas/puestos", { params });
  return data.data;
};

export const getPuestoById = async (id) => {
  console.log('DEBUG getPuestoById - id:', id, typeof id);
  const { data } = await api.get(`/empresas/puestos/${id}`);
  return data.data;
};

export const createPuesto = async (puesto) => {
  const { data } = await api.post("/empresas/puestos", puesto);
  return data.data;
};

export const updatePuesto = async (id, puesto) => {
  const { data } = await api.put(`/empresas/puestos/${id}`, puesto);
  return data.data;
};

export const desactivarPuesto = async (id) => {
  const { data } = await api.patch(`/empresas/puestos/${id}/desactivar`);
  return data.data;
};

export const activarPuesto = async (id) => {
  const { data } = await api.patch(`/empresas/puestos/${id}/activar`);
  return data.data;
};

export const getDepartamentosForSelect = async () => {
  const { data } = await api.get("/empresas/departamentos", { params: { limit: 100, activo: true } });
  return data.data?.data || data.data || [];
};