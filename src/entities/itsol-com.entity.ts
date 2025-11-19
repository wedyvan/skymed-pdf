import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SolComEntity } from './sol-com.entity';

@Entity({ schema: 'DBAMV', name: 'ITSOL_COM' })
export class ItsolComEntity {
  @PrimaryColumn({ name: 'CD_SOL_COM', type: 'number' })
  cdSolCom: number;

  @PrimaryColumn({ name: 'CD_PRODUTO', type: 'number' })
  cdProduto: number;

  @Column({ name: 'CD_UNI_PRO', type: 'number', precision: 8 })
  cdUniPro: number;

  @Column({ name: 'QT_SOLIC', type: 'number', precision: 11, scale: 3 })
  qtSolic: number;

  @Column({
    name: 'DS_DICA_DA_COMPRA',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  dsDicaDaCompra: string | null;

  @Column({ name: 'SN_COMPRADO', type: 'varchar', length: 1, nullable: true })
  snComprado: string | null;

  @Column({
    name: 'QT_COMPRADA',
    type: 'number',
    precision: 11,
    scale: 3,
    nullable: true,
  })
  qtComprada: number | null;

  @Column({
    name: 'QT_ATENDIDA',
    type: 'number',
    precision: 11,
    scale: 3,
    nullable: true,
  })
  qtAtendida: number | null;

  @Column({ name: 'CD_COTA', type: 'number', precision: 8, nullable: true })
  cdCota: number | null;

  @Column({
    name: 'VL_MENOR_LEILAO',
    type: 'number',
    precision: 16,
    scale: 4,
    nullable: true,
  })
  vlMenorLeilao: number | null;

  @Column({
    name: 'CD_MOT_CANCEL',
    type: 'number',
    precision: 3,
    nullable: true,
  })
  cdMotCancel: number | null;

  @Column({ name: 'DT_CANCEL', type: 'date', nullable: true })
  dtCancel: Date | null;

  @Column({
    name: 'SEQUENCIA_MVSC',
    type: 'number',
    precision: 8,
    nullable: true,
  })
  sequenciaMvsc: number | null;

  @Column({ name: 'CD_COTADOR', type: 'number', precision: 2, nullable: true })
  cdCotador: number | null;

  @Column({
    name: 'CD_ITSOL_COM_INTEGRA',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cdItsolComIntegra: string | null;

  @Column({ name: 'DT_INTEGRA', type: 'date', nullable: true })
  dtIntegra: Date | null;

  @Column({
    name: 'CD_SEQ_INTEGRA',
    type: 'number',
    precision: 20,
    nullable: true,
  })
  cdSeqIntegra: number | null;

  @Column({
    name: 'CD_SEQUENCIAL',
    type: 'number',
    precision: 4,
    nullable: true,
  })
  cdSequencial: number | null;

  @Column({ name: 'CD_IT_GUIA', type: 'number', precision: 10, nullable: true })
  cdItGuia: number | null;

  @Column({
    name: 'QT_AUTORIZA_OPME',
    type: 'number',
    precision: 11,
    scale: 3,
    nullable: true,
  })
  qtAutorizaOpme: number | null;

  @Column({ name: 'NR_LOTE', type: 'varchar', length: 13, nullable: true })
  nrLote: string | null;

  @Column({
    name: 'QT_CONSUMO_MEDIO_MENSAL_PLANEJ',
    type: 'number',
    precision: 4,
    nullable: true,
  })
  qtConsumoMedioMensalPlanej: number | null;

  @Column({
    name: 'QT_CMM_PLANEJAMENTO',
    type: 'number',
    precision: 16,
    scale: 4,
    nullable: true,
  })
  qtCmmPlanejamento: number | null;

  @Column({
    name: 'CD_USUARIO_CANCELAMENTO',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  cdUsuarioCancelamento: string | null;

  @Column({
    name: 'NR_ITEM_PROCESSO_LICITATORIO',
    type: 'number',
    nullable: true,
  })
  nrItemProcessoLicitatorio: number | null;

  @Column({ name: 'DS_MARCA', type: 'varchar', length: 30, nullable: true })
  dsMarca: string | null;

  @Column({
    name: 'DS_INFORMA_ISO',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  dsInformaIso: string | null;

  @Column({
    name: 'QT_AGRUPADA',
    type: 'number',
    precision: 11,
    scale: 3,
    nullable: true,
  })
  qtAgrupada: number | null;

  @ManyToOne(() => SolComEntity, (solCom) => solCom.itsolComs)
  @JoinColumn({ name: 'CD_SOL_COM' })
  solCom: SolComEntity;
}
