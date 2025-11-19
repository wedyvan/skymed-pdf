import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'AUX_LAUDOS', schema: 'WTTDSERVER' })
export class AuxLaudosEntity {
  @PrimaryColumn({ name: 'ID_EXAME_PEDIDO', type: 'number' })
  idExamePedido: number;

  @Column({ name: 'CD_PACIENTE_HIS', type: 'varchar2' })
  cdPacienteHis: string;

  @Column({ name: 'CD_ITEM_PEDIDO_HIS', type: 'varchar2' })
  cdItemPedidoHis: string;

  @Column({ name: 'SN_PROCESSADO', type: 'varchar2' })
  snProcessado: string;
}
