import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContratoGeneral } from '../../contrato-general/entities/contrato-general.entity';

@Entity()
export class DocumentoContrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', nullable: true })
  tipoDocumentoId: number;

  @Column()
  activo: boolean;

  @ManyToOne(() => ContratoGeneral, (contrato) => contrato.documentosContrato)
  contrato_general_id: ContratoGeneral;
}
