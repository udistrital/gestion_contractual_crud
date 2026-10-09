import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ActualizarAmparoPolizaDto } from './actualizar-amparo-poliza.dto';

describe('ActualizarAmparoPolizaDto', () => {
  it('debería aceptar un objeto vacío (todos los campos son opcionales en la actualización)', async () => {
    const dto = plainToInstance(ActualizarAmparoPolizaDto, {});
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería aceptar poliza_id: null explícito (desvincular la póliza)', async () => {
    const dto = plainToInstance(ActualizarAmparoPolizaDto, {
      poliza_id: null,
    });
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería aceptar poliza_id numérico (asociar la póliza)', async () => {
    const dto = plainToInstance(ActualizarAmparoPolizaDto, { poliza_id: 3 });
    const errores = await validate(dto);
    expect(errores).toHaveLength(0);
  });

  it('debería rechazar amparo_id no numérico si viene incluido', async () => {
    const dto = plainToInstance(ActualizarAmparoPolizaDto, {
      amparo_id: 'abc',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'amparo_id')).toBe(true);
  });

  it('debería rechazar fecha_inicio que no es una fecha ISO', async () => {
    const dto = plainToInstance(ActualizarAmparoPolizaDto, {
      fecha_inicio: 'no-es-una-fecha',
    });
    const errores = await validate(dto);

    expect(errores.some((e) => e.property === 'fecha_inicio')).toBe(true);
  });
});
