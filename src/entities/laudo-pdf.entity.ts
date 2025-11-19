import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { RsVwExamePedidoEntity } from './vw-laudo-pdf.entity';

@Entity({ name: 'RS_LAU_EXAME_PEDIDO_PDF', schema: 'IDCE' })
export class LaudoExamePedidoPdfEntity {
  @PrimaryColumn({ name: 'ID_EXAME_PEDIDO', type: 'number' })
  idExamePedido: number;

  @Column({ name: 'DS_LAUDO_PDF', type: 'blob', nullable: true })
  dsLaudoPdf: Buffer;

  @Column({ name: 'DS_LAUDO_PDF_MARCADAGUA', type: 'blob', nullable: true })
  dsLaudoPdfMarcadagua: Buffer;

  @Column({ name: 'LAYOUT_NOVO_EDITOR', type: 'blob', nullable: true })
  layoutNovoEditor: Buffer;

  @OneToOne(() => RsVwExamePedidoEntity)
  @JoinColumn({ name: 'ID_EXAME_PEDIDO' })
  examePedido: RsVwExamePedidoEntity;
}
