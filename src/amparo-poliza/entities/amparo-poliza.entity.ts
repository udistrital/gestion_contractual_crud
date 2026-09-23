import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContratoGeneral } from '../../contrato-general/entities/contrato-general.entity';
import { Poliza } from '../../poliza/entities/poliza.entity';

@Entity('amparo_poliza')
export class AmparoPoliza {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'contrato_general_id' })
  contrato_general_id: number;

  @ManyToOne(() => ContratoGeneral)
  @JoinColumn({ name: 'contrato_general_id' })
  contrato_general: ContratoGeneral;

  // Nulo hasta que la póliza es expedida y se asocia al amparo
  @Column({ name: 'poliza_id', nullable: true })
  poliza_id: number;

  @ManyToOne(() => Poliza, (poliza) => poliza.amparos, { nullable: true })
  @JoinColumn({ name: 'poliza_id' })
  poliza: Poliza;

  @Column({ name: 'amparo_id' })
  amparo_id: number;

  @Column({ name: 'tipo_valor_amparo_id', nullable: true })
  tipo_valor_amparo_id: number;

  @Column({
    name: 'suficiencia',
    type: 'numeric',
    precision: 20,
    scale: 7,
    nullable: true,
  })
  suficiencia: number;

  @Column({
    name: 'valor',
    type: 'numeric',
    precision: 20,
    scale: 7,
    nullable: true,
  })
  valor: number;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ name: 'activo', type: 'boolean', default: true })
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
  })
  fecha_modificacion: Date;
}
