import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ schema: 'DBAMV', name: 'ARQUIVO_ATENDIMENTO' })
export class ArquivoAtendimentoEntity {
  @PrimaryColumn({ name: 'CD_ARQUIVO_ATENDIMENTO', type: 'number' })
  cdArquivoAtendimento: number;

  @Column({ name: 'CD_ARQUIVO_DOCUMENTO', type: 'number' })
  cdArquivoDocumento: number;

  @Column({ name: 'CD_ATENDIMENTO', type: 'number' })
  cdAtendimento: number;

  @Column({ name: 'DH_CRIACAO', type: 'timestamp' })
  dhCriacao: Date;

  @Column({ name: 'NM_USUARIO', type: 'varchar2', length: 30 })
  nmUsuario: string;

  @Column({ name: 'CD_PACIENTE', type: 'number', nullable: false })
  cdPaciente: number;

  @Column({ name: 'CD_PW_TIPO_DOCUMENTO', type: 'number', nullable: true })
  cdPwTipoDocumento: number;

  @Column({ name: 'CD_DOCUMENTO_CLINICO', type: 'number' })
  cdDocumentoClinico: number;

  @Column({ name: 'CD_STATUS_ARQUIVO_ATENDIMENTO', type: 'number' })
  cdStatusArquivoAtendimento: number;

  @Column({ name: 'CD_OBJETO_SELECIONADO', type: 'number', nullable: true })
  cdObjetoSelecionado: number;
}
