import api from "./api.js";

export const getDivisiones = async (params = {}) => {
  const { data } = await api.get("/empresas/divisiones", { params });
  return data.data;
};

export const getDivisionById = async (id) => {
  console.log("DEBUG getDivisionById - id:", id, typeof id);
  const { data } = await api.get(`/empresas/divisiones/${id}`);
  return data.data;
};

export const createDivision = async (division) => {
  const { data } = await api.post("/empresas/divisiones", division);
  return data.data;
};

export const updateDivision = async (id, division) => {
  const { data } = await api.put(`/empresas/divisiones/${id}`, division);
  return data.data;
};

export const desactivarDivision = async (id) => {
  const { data } = await api.patch(`/empresas/divisiones/${id}/desactivar`);
  return data.data;
};

export const activarDivision = async (id) => {
  const { data } = await api.patch(`/empresas/divisiones/${id}/activar`);
  return data.data;
};
