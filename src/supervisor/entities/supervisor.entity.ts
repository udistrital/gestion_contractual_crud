import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ContratoGeneral } from '../../contrato-general/entities/contrato-general.entity';

@Entity('supervisor_contrato')
export class SupervisorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'supervisor_id', type: 'integer' })
  supervisor_id: number;

  @Column({ name: 'sede_legado', type: 'varchar', nullable: true })
  sede_legado: string;

  @Column({ name: 'dependencia_legado', type: 'varchar', nullable: true })
  dependencia_legado: string;

  @Column({ name: 'cargo_legado', type: 'varchar', nullable: true })
  cargo_legado: string;

  @Column({ name: 'cargo_id', type: 'integer', nullable: true })
  cargo_id: number;

  @Column({ name: 'documento', type: 'integer', nullable: true })
  documento: number;

  @Column({ name: 'digito_verificacion', type: 'integer', nullable: true })
  digito_verificacion: number;

  @Column({ name: 'sede_id', type: 'integer', nullable: true })
  sede_id: number;

  @Column({ name: 'dependencia_id', type: 'integer', nullable: true })
  dependencia_id: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_modificacion: Date | null;

  @ManyToOne(
    () => ContratoGeneral,
    (contratoGeneral) => contratoGeneral.supervisores,
  )
  @JoinColumn({ name: 'contrato_general_id' })
  contrato_general: ContratoGeneral;

  @Column()
  contrato_general_id: number;
}
