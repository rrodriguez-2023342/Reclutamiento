// Etiquetas para el estado civil
export const etiquetasEstadoCivil = {
  SOLTERO: "Soltero(a)",
  CASADO: "Casado(a)",
  UNIDO: "Unido(a)",
  VIUDO: "Viudo(a)",
  DIVORCIADO: "Divorciado(a)",
};
// Etiquetas para el parentesco
export const etiquetasParentesco = {
  PADRE: "Padre",
  MADRE: "Madre",
  ESPOSO_A: "Esposo(a)",
  HIJO_A: "Hijo(a)",
  HERMANO_A: "Hermano(a)",
  EMERGENCIA: "Emergencia",
};
// Etiquetas para el nivel educativo
export const etiquetasNivelEducativo = {
  PRIMARIA: "Primaria",
  BASICOS: "Básicos",
  DIVERSIFICADO: "Diversificado",
  TECNICO: "Técnico",
  LICENCIATURA: "Licenciatura",
  MAESTRIA: "Maestría",
  OTRO: "Otro",
};
// Etiquetas para motivo de retiro
export const etiquetasMotivoRetiro = {
  RENUNCIA: "Renuncia",
  DESPIDO: "Despido",
  REORGANIZACION: "Reorganización",
  OTRO: "Otro",
};
// Etiquetas para el tipo de vivienda
export const etiquetasVivienda = {
  PROPIA: "Propia",
  ALQUILADA: "Alquilada",
  FAMILIAR: "Familiar",
  OTRA: "Otra",
};
// Etiquetas para el medio por el cual se entero de la vacante
export const etiquetasMedioEnterado = {
  ANUNCIO: "Anuncio",
  REFERENCIA: "Referencia",
  OTRO: "Otro",
};
// Etiquetas para el estado del postulante
export const etiquetasEstadoPostulante = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  CONTRATADO: "Contratado",
  RECHAZADO: "Rechazado",
};
// Etiquetas para el estilo del estado del postulante
export const estilosEstadoPostulante = {
  PENDIENTE: "bg-[#fff0bd] text-[#a86b00]",
  EN_PROCESO: "bg-[#d9ebff] text-[#2765d9]",
  CONTRATADO: "bg-[#c9f3dd] text-[#087947]",
  RECHAZADO: "bg-[#ffe0e2] text-[#df353c]",
};

// Etiquetas para el tipo de documento
export const etiquetasTipoDocumento = {
  FOTO: "Foto",
  ANTECEDENTES_PENALES: "Antecedentes Penales y Policiacos",
  CARTA_RECOMENDACION: "Carta de Recomendación y Referencia Laboral",
  COPIA_DPI: "Copia de DPI",
  TARJETA_SALUD: "Tarjeta de Salud y Manipulación de Alimentos",
};

// Tipos de documento (orden del wizard)
export const TIPOS_DOCUMENTO = [
  "FOTO",
  "ANTECEDENTES_PENALES",
  "CARTA_RECOMENDACION",
  "COPIA_DPI",
  "TARJETA_SALUD",
];

// Accept attr por tipo de documento
export const acceptPorTipo = {
  FOTO: "image/jpeg,image/png,image/webp",
  ANTECEDENTES_PENALES: "application/pdf",
  CARTA_RECOMENDACION: "application/pdf",
  COPIA_DPI: "application/pdf",
  TARJETA_SALUD: "application/pdf",
};
