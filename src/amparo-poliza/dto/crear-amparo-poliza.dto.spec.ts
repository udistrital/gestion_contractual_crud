import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearAmparoPolizaDto } from './crear-amparo-poliza.dto';

describe('CrearAmparoPolizaDto', () => {
  const payloadValido = {
    contrato_general_id: 1,
    amparo_id: 1181,
    tipo_valor_amparo_id: 1,
    suficiencia: 20,
    valor: 17000000,
    descripcion: 'Amparo de cumplimiento',
    fecha_inicio: '2026-01-15',
    fecha_fin: '2026-12-15',
  };

  it('debería aceptar un payload válido', async () => {
    const dto = plainToInstance(CrearAmparoPolizaDto, payloadValido);
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería aceptar un amparo sin poliza_id (se asocia después de expedida la póliza)', async () => {
    const dto = plainToInstance(CrearAmparoPolizaDto, payloadValido);
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
    expect(dto.poliza_id).toBeUndefined();
  });

  it('debería aceptar poliza_id: null explícito (regla de negocio central del módulo)', async () => {
    const dto = plainToInstance(CrearAmparoPolizaDto, {
      ...payloadValido,
      poliza_id: null,
    });
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería rechazar si falta contrato_general_id', async () => {
    const { contrato_general_id, ...sinContrato } = payloadValido;
    const dto = plainToInstance(CrearAmparoPolizaDto, sinContrato);
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'contrato_general_id')).toBe(
      true,
    );
  });

  it('debería rechazar si falta amparo_id', async () => {
    const { amparo_id, ...sinAmparo } = payloadValido;
    const dto = plainToInstance(CrearAmparoPolizaDto, sinAmparo);
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'amparo_id')).toBe(true);
  });

  it('debería rechazar descripcion que excede el largo máximo (255)', async () => {
    const dto = plainToInstance(CrearAmparoPolizaDto, {
      ...payloadValido,
      descripcion: 'X'.repeat(256),
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'descripcion')).toBe(true);
  });

  it('debería rechazar fecha_fin que no es una fecha ISO', async () => {
    const dto = plainToInstance(CrearAmparoPolizaDto, {
      ...payloadValido,
      fecha_fin: 'no-es-una-fecha',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'fecha_fin')).toBe(true);
  });
});
