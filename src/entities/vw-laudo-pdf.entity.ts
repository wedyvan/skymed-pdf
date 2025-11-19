import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'RS_VW_EXAME_PEDIDO', schema: 'IDCE' })
export class RsVwExamePedidoEntity {
  @PrimaryColumn({ name: 'ID_EXAME_PEDIDO', type: 'number' })
  idExamePedido: number;

  @Column({ name: 'CD_PACIENTE_HIS', type: 'varchar2' })
  cdPacienteHis: string;

  @Column({ name: 'CD_ITEM_PEDIDO_HIS', type: 'varchar2' })
  cdItemPedidoHis: string;

  @Column({ name: 'DT_LAUDADO', type: 'date', nullable: true })
  dtLaudado: Date;

  @Column({ name: 'ID_UNIDADE', type: 'number' })
  idUnidade: number;
}
