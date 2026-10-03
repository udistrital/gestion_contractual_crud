import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratoGeneral } from '../contrato-general/entities/contrato-general.entity';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { SupervisorEntity } from './entities/supervisor.entity';

@Injectable()
export class SupervisorService {
  constructor(
    @InjectRepository(SupervisorEntity)
    private supervisorEntityRepository: Repository<SupervisorEntity>,
    @InjectRepository(ContratoGeneral)
    private contratoGeneralRepository: Repository<ContratoGeneral>,
  ) {}

  async create(
    createSupervisorDto: CreateSupervisorDto,
  ): Promise<SupervisorEntity> {
    const { contrato_general_id, ...supervisorData } = createSupervisorDto;

    const currentSupervisor = await this.supervisorEntityRepository.findOne({
      where: {
        contrato_general_id: contrato_general_id,
      },
    });

    if (currentSupervisor) {
      throw new ConflictException(
        'Ya existe ese supervisor con este contrato_general_id',
      );
    }

    const contratoGeneral = await this.contratoGeneralRepository.findOne({
      where: { id: contrato_general_id },
    });

    if (!contratoGeneral) {
      throw new NotFoundException(
        `ContratoGeneral con ID ${contrato_general_id} no encontrado`,
      );
    }

    const solicitante = this.supervisorEntityRepository.create(supervisorData);
    solicitante.contrato_general = contratoGeneral;
    solicitante.activo = true;
    solicitante.fecha_creacion = new Date();
    solicitante.fecha_modificacion = new Date();

    return await this.supervisorEntityRepository.save(solicitante);
  }

  async findAll(): Promise<SupervisorEntity[]> {
    return await this.supervisorEntityRepository.find({});
  }

  async findOne(id: number): Promise<SupervisorEntity> {
    const supervisor = await this.supervisorEntityRepository.findOne({
      where: { id },
    });
    if (!supervisor) {
      throw new Error(`Supervisor con ID ${id} no encontrado`);
    }
    return supervisor;
  }

  async update(
    id: number,
    updateSupervisorDto: UpdateSupervisorDto,
  ): Promise<SupervisorEntity> {
    const supervisor = await this.findOne(id);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor con ID ${id} no encontrado`);
    }

    if (updateSupervisorDto.contrato_general_id) {
      const contratoGeneral = await this.contratoGeneralRepository.findOne({
        where: { id: updateSupervisorDto.contrato_general_id },
      });
      if (!contratoGeneral) {
        throw new NotFoundException(
          `ContratoGeneral con ID ${updateSupervisorDto.contrato_general_id} no encontrado`,
        );
      }
      supervisor.contrato_general = contratoGeneral;
      delete updateSupervisorDto.contrato_general_id;
    }

    Object.assign(supervisor, updateSupervisorDto);

    return await this.supervisorEntityRepository.save(supervisor);
  }

  async remove(id: number): Promise<void> {
    const result = await this.supervisorEntityRepository.delete(id);
    if (result.affected === 0) {
      throw new Error(`Supervisor con ID ${id} no encontrado`);
    }
  }

  async findByContratoGeneralId(
    contratoGeneralId: number,
  ): Promise<SupervisorEntity[]> {
    const supervisor = await this.supervisorEntityRepository.find({
      where: { contrato_general: { id: contratoGeneralId } },
    });

    if (!supervisor) {
      throw new Error(
        `No se encontró ningún Supervisor para el contrato con id ${contratoGeneralId}`,
      );
    }

    return supervisor;
  }
}
