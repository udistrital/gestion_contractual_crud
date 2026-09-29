import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ActualizarPolizaDto } from './actualizar-poliza.dto';

describe('ActualizarPolizaDto', () => {
  it('debería aceptar un objeto vacío (todos los campos son opcionales en la actualización)', async () => {
    const dto = plainToInstance(ActualizarPolizaDto, {});
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería aceptar una actualización parcial válida', async () => {
    const dto = plainToInstance(ActualizarPolizaDto, {
      fecha_fin: '2027-01-15',
    });
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería rechazar contrato_general_id no numérico si viene incluido', async () => {
    const dto = plainToInstance(ActualizarPolizaDto, {
      contrato_general_id: 'abc',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'contrato_general_id')).toBe(
      true,
    );
  });

  it('debería rechazar fecha_fin que no es una fecha ISO', async () => {
    const dto = plainToInstance(ActualizarPolizaDto, {
      fecha_fin: 'no-es-una-fecha',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'fecha_fin')).toBe(true);
  });
});
