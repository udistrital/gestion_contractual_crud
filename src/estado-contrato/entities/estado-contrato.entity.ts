import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContratoGeneral } from '../../contrato-general/entities/contrato-general.entity';

@Entity('estado_contrato')
export class EstadoContrato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contrato_general_id' })
  contrato_general_id: number;

  @Column({ type: 'integer' })
  usuario_id: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  usuario_rol: string;

  @Column({ type: 'integer', nullable: true })
  estado_parametro_id: number;

  @Column({ type: 'integer', nullable: true })
  estado_interno_parametro_id: number;

  @Column({ type: 'varchar', length: 250, nullable: true })
  motivo: string;

  @Column({ type: 'boolean', nullable: true })
  actual: boolean;

  @Column({
    name: 'fecha_evento',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fecha_evento: Date;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fecha_creacion: Date;

  @Column({
    name: 'fecha_modificacion',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  fecha_modificacion: Date;

  @ManyToOne(
    () => ContratoGeneral,
    (contratoGeneral) => contratoGeneral.estados,
  )
  @JoinColumn({ name: 'contrato_general_id' })
  contrato_general: ContratoGeneral;
}
