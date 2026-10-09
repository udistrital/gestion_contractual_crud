import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearPolizaDto } from './crear-poliza.dto';

describe('CrearPolizaDto', () => {
  const payloadValido = {
    numero_poliza: 'POL-2026-0001',
    entidad_aseguradora_id: 3,
    contrato_general_id: 1,
    descripcion: 'Póliza de cumplimiento',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
  };

  it('debería aceptar un payload válido', async () => {
    const dto = plainToInstance(CrearPolizaDto, payloadValido);
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería aceptar el payload mínimo (solo contrato_general_id)', async () => {
    const dto = plainToInstance(CrearPolizaDto, { contrato_general_id: 1 });
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería rechazar si falta contrato_general_id', async () => {
    const { contrato_general_id, ...sinContrato } = payloadValido;
    const dto = plainToInstance(CrearPolizaDto, sinContrato);
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'contrato_general_id')).toBe(
      true,
    );
  });

  it('debería rechazar contrato_general_id no numérico', async () => {
    const dto = plainToInstance(CrearPolizaDto, {
      ...payloadValido,
      contrato_general_id: 'abc',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'contrato_general_id')).toBe(
      true,
    );
  });

  it('debería rechazar numero_poliza que excede el largo máximo (50)', async () => {
    const dto = plainToInstance(CrearPolizaDto, {
      ...payloadValido,
      numero_poliza: 'X'.repeat(51),
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'numero_poliza')).toBe(true);
  });

  it('debería rechazar descripcion que excede el largo máximo (255)', async () => {
    const dto = plainToInstance(CrearPolizaDto, {
      ...payloadValido,
      descripcion: 'X'.repeat(256),
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'descripcion')).toBe(true);
  });

  it('debería rechazar fecha_inicio que no es una fecha ISO', async () => {
    const dto = plainToInstance(CrearPolizaDto, {
      ...payloadValido,
      fecha_inicio: 'no-es-una-fecha',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'fecha_inicio')).toBe(true);
  });
});
