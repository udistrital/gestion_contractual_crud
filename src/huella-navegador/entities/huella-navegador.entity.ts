import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('huella_navegador')
@Index('idx_huella_navegador_huella', ['huella'])
@Index('idx_huella_navegador_usuario_id', ['usuario_id'])
export class HuellaNavegador {
  @PrimaryGeneratedColumn({ primaryKeyConstraintName: 'pk_huella_navegador' })
  id: number;

  @Column({ name: 'huella', type: 'varchar', length: 64 })
  huella: string;

  @Column({ name: 'libreria', type: 'varchar', length: 50 })
  libreria: string;

  @Column({ name: 'version_libreria', type: 'varchar', length: 20 })
  version_libreria: string;

  @Column({
    name: 'confianza',
    type: 'numeric',
    precision: 5,
    scale: 4,
    nullable: true,
    transformer: {
      from: (value) => (value === null ? null : Number(value)),
      to: (value) => value,
    },
  })
  confianza: number;

  @Column({ name: 'componentes', type: 'jsonb', nullable: true })
  componentes: Record<string, unknown>;

  @Column({ name: 'direccion_ip', type: 'varchar', length: 45, nullable: true })
  direccion_ip: string;

  @Column({
    name: 'direccion_ip_servidor',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  direccion_ip_servidor: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 512 })
  user_agent: string;

  @Column({ name: 'usuario_id', type: 'integer', nullable: true })
  usuario_id: number;

  @Column({ name: 'usuario_rol', type: 'varchar', length: 40, nullable: true })
  usuario_rol: string;

  @Column({ name: 'microcliente', type: 'varchar', length: 100 })
  microcliente: string;

  @Column({ name: 'ruta', type: 'varchar', length: 255, nullable: true })
  ruta: string;

  @Column({ name: 'fecha_captura', type: 'timestamp' })
  fecha_captura: Date;

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
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  fecha_modificacion: Date;
}
