import {
    Field,
    Input,
    Select,
} from "../postulantes/formControls.jsx";

function CamposAltaUsuario({ register, errors }) {
    return (
        <>
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Estado civil" error={errors.estado_civil?.message}>
                    <Select registration={register("estado_civil")}>
                        <option value="">Seleccionar...</option>
                        <option value="SOLTERO">Soltero(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="UNIDO">Unido(a)</option>
                        <option value="VIUDO">Viudo(a)</option>
                        <option value="DIVORCIADO">Divorciado(a)</option>
                    </Select>
                </Field>
                <Field label="Nacionalidad" error={errors.nacionalidad?.message}>
                    <Input
                        registration={register("nacionalidad")}
                        placeholder="Ej. Guatemalteca"
                    />
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Teléfono" error={errors.telefono?.message}>
                    <Input
                        type="tel"
                        registration={register("telefono")}
                        placeholder="Número de teléfono"
                    />
                </Field>
                <Field
                    label="Último grado cursado"
                    error={errors.ultimo_grado_cursado?.message}
                >
                    <Select registration={register("ultimo_grado_cursado")}>
                        <option value="">Seleccionar...</option>
                        <option value="PRIMARIA">Primaria</option>
                        <option value="BASICOS">Básicos</option>
                        <option value="DIVERSIFICADO">Diversificado</option>
                        <option value="TECNICO">Técnico</option>
                        <option value="LICENCIATURA">Licenciatura</option>
                        <option value="MAESTRIA">Maestría</option>
                        <option value="OTRO">Otro</option>
                    </Select>
                </Field>
            </div>

            <section className="space-y-5">
                <h2 className="text-lg font-bold text-[#071b3b]">
                    Información bancaria
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Banco" error={errors.banco?.message}>
                        <Input
                            registration={register("banco")}
                            placeholder="Nombre del banco"
                        />
                    </Field>
                    <Field
                        label="Tipo de cuenta"
                        error={errors.tipo_cuenta_bancaria?.message}
                    >
                        <Input
                            registration={register("tipo_cuenta_bancaria")}
                            placeholder="Ej. Monetaria o de ahorro"
                        />
                    </Field>
                    <Field
                        label="No. de cuenta bancaria"
                        error={errors.numero_cuenta_bancaria?.message}
                    >
                        <Input
                            registration={register("numero_cuenta_bancaria")}
                            placeholder="Número de cuenta"
                        />
                    </Field>
                </div>
            </section>

            <section className="space-y-5">
                <h2 className="text-lg font-bold text-[#071b3b]">
                    Contacto de emergencia
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                        label="Nombre del contacto"
                        error={errors.contacto_emergencia_nombre?.message}
                    >
                        <Input
                            registration={register("contacto_emergencia_nombre")}
                            placeholder="Nombre completo"
                        />
                    </Field>
                    <Field
                        label="Teléfono de emergencia"
                        error={errors.contacto_emergencia_telefono?.message}
                    >
                        <Input
                            type="tel"
                            registration={register("contacto_emergencia_telefono")}
                            placeholder="Número de teléfono"
                        />
                    </Field>
                </div>
            </section>
        </>
    );
}

export default CamposAltaUsuario;