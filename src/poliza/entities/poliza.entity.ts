import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ContratoGeneral } from '../../contrato-general/entities/contrato-general.entity';
import { AmparoPoliza } from '../../amparo-poliza/entities/amparo-poliza.entity';

@Entity('poliza')
export class Poliza {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'numero_poliza',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  numero_poliza: string;

  @Column({ name: 'entidad_aseguradora_id', nullable: true })
  entidad_aseguradora_id: number;

  @Column({ name: 'contrato_general_id' })
  contrato_general_id: number;

  @ManyToOne(() => ContratoGeneral)
  @JoinColumn({ name: 'contrato_general_id' })
  contrato_general: ContratoGeneral;

  @Column({ name: 'descripcion', type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fecha_inicio: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fecha_fin: Date;

  @Column({ name: 'fecha_expedicion', type: 'date', nullable: true })
  fecha_expedicion: Date;

  @Column({ name: 'fecha_aprobacion', type: 'date', nullable: true })
  fecha_aprobacion: Date;

  @Column({ name: 'usuario_id', nullable: true })
  usuario_id: number;

  @Column({
    name: 'usuario_legado',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  usuario_legado: string;

  @OneToMany(() => AmparoPoliza, (amparoPoliza) => amparoPoliza.poliza)
  amparos: AmparoPoliza[];

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
