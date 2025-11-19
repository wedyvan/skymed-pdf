import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ItsolComEntity } from './itsol-com.entity';

@Entity({ schema: 'DBAMV', name: 'SOL_COM' })
export class SolComEntity {
  @PrimaryColumn({ name: 'CD_SOL_COM', type: 'number' })
  cdSolCom: number;

  @Column({ name: 'CD_COTADOR', type: 'number', nullable: true })
  cdCotador: number | null;

  @Column({ name: 'CD_MOT_PED', type: 'number' })
  cdMotPed: number;

  @Column({ name: 'CD_SETOR', type: 'number' })
  cdSetor: number;

  @Column({ name: 'CD_ESTOQUE', type: 'number' })
  cdEstoque: number;

  @Column({ name: 'NM_SOLICITANTE', type: 'varchar', length: 20 })
  nmSolicitante: string;

  @Column({ name: 'TP_SITUACAO', type: 'varchar', length: 1 })
  tpSituacao: string;

  @Column({ name: 'DT_SOL_COM', type: 'date' })
  dtSolCom: Date;

  @Column({ name: 'DT_MAXIMA', type: 'date' })
  dtMaxima: Date;

  @Column({
    name: 'DS_OBSERVACAO',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  dsObservacao: string | null;

  @Column({
    name: 'DS_MOT_N_ATEND',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  dsMotNAtend: string | null;

  @Column({ name: 'CD_PSOL_COM', type: 'number', nullable: true })
  cdPsolCom: number | null;

  @Column({ name: 'DT_IMPRESSAO', type: 'date', nullable: true })
  dtImpressao: Date | null;

  @Column({ name: 'CD_USUARIO', type: 'varchar', length: 50, nullable: true })
  cdUsuario: string | null;

  @Column({ name: 'CD_SOL_COM_TEM', type: 'number', nullable: true })
  cdSolComTem: number | null;

  @Column({
    name: 'DS_OBS_COTACAO',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  dsObsCotacao: string | null;

  @Column({ name: 'CD_MOT_CANCEL', type: 'number', nullable: true })
  cdMotCancel: number | null;

  @Column({ name: 'DT_CANCELAMENTO', type: 'date', nullable: true })
  dtCancelamento: Date | null;

  @Column({ name: 'DT_MAX_RESPOSTA_COTACAO', type: 'date', nullable: true })
  dtMaxRespostaCotacao: Date | null;

  @Column({ name: 'DT_MAX_RESPOSTA_ORD_COMPRA', type: 'date', nullable: true })
  dtMaxRespostaOrdCompra: Date | null;

  @Column({ name: 'CD_SOL_COM_GERADA', type: 'number', nullable: true })
  cdSolComGerada: number | null;

  @Column({ name: 'TP_SOL_COM', type: 'varchar', length: 1, default: 'P' })
  tpSolCom: string;

  @Column({ name: 'IDENTIFICADOR', type: 'varchar', length: 2, nullable: true })
  identificador: string | null;

  @Column({ name: 'LOTE_MVSC', type: 'number', nullable: true })
  loteMvsc: number | null;

  @Column({
    name: 'CD_SOL_COM_INTEGRA',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cdSolComIntegra: string | null;

  @Column({ name: 'DT_INTEGRA', type: 'date', nullable: true })
  dtIntegra: Date | null;

  @Column({ name: 'CD_SEQ_INTEGRA', type: 'number', nullable: true })
  cdSeqIntegra: number | null;

  @Column({ name: 'SN_URGENTE', type: 'varchar', length: 1, default: 'N' })
  snUrgente: string;

  @Column({ name: 'CD_ESTOQUE_CENTRAL', type: 'number', nullable: true })
  cdEstoqueCentral: number | null;

  @Column({
    name: 'DS_ARQUIVO_TEXTO',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  dsArquivoTexto: string | null;

  @Column({
    name: 'SN_ENVIO_ORDCOM',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  snEnvioOrdcom: string | null;

  @Column({ name: 'CD_CONTA', type: 'number', nullable: true })
  cdConta: number | null;

  @Column({ name: 'CD_RUBRICA', type: 'number', nullable: true })
  cdRubrica: number | null;

  @Column({ name: 'CD_FONTE_RECURSO', type: 'number', nullable: true })
  cdFonteRecurso: number | null;

  @Column({
    name: 'SN_APROVADA',
    type: 'varchar',
    length: 1,
    default: 'N',
    nullable: true,
  })
  snAprovada: string | null;

  @Column({ name: 'CD_SOL_COM_ORIGEM', type: 'number', nullable: true })
  cdSolComOrigem: number | null;

  @Column({ name: 'SN_OPME', type: 'varchar', length: 1, default: 'N' })
  snOpme: string;

  @Column({ name: 'CD_ATENDIME', type: 'number', nullable: true })
  cdAtendime: number | null;

  @Column({ name: 'CD_RES_LEI', type: 'number', nullable: true })
  cdResLei: number | null;

  @Column({ name: 'CD_AVISO_CIRURGIA', type: 'number', nullable: true })
  cdAvisoCirurgia: number | null;

  @Column({ name: 'CD_GUIA', type: 'number', nullable: true })
  cdGuia: number | null;

  @Column({
    name: 'TP_STATUS_OPME',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  tpStatusOpme: string | null;

  @Column({ name: 'NR_INSTITUICAO', type: 'number', nullable: true })
  nrInstituicao: number | null;

  @Column({ name: 'DT_MAXIMA_BIONEXO', type: 'date', nullable: true })
  dtMaximaBionexo: Date | null;

  @Column({
    name: 'DS_OBSERVACAO_COMPRADOR',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  dsObservacaoComprador: string | null;

  @Column({
    name: 'VL_TOTAL',
    type: 'number',
    precision: 22,
    scale: 4,
    nullable: true,
  })
  vlTotal: number | null;

  @Column({
    name: 'SN_INT_MERCADO_ELETRONICO',
    type: 'varchar',
    length: 1,
    default: 'N',
  })
  snIntMercadoEletronico: string;

  @Column({ name: 'SN_LANC_EST_AUT', type: 'varchar', length: 1, default: 'N' })
  snLancEstAut: string;

  @Column({ name: 'SN_RENEGOCIACAO', type: 'varchar', length: 1, default: 'N' })
  snRenegociacao: string;

  @Column({
    name: 'VL_LIM_RENEGOCIACAO',
    type: 'number',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  vlLimRenegociacao: number | null;

  @Column({ name: 'SN_COMPRAS', type: 'varchar', length: 1, nullable: true })
  snCompras: string | null;

  @OneToMany(() => ItsolComEntity, (itsolCom) => itsolCom.solCom)
  itsolComs: ItsolComEntity[]; // Aqui deve ser "itsolComs" no plural
}
