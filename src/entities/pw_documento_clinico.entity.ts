import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ schema: 'DBAMV', name: 'PW_DOCUMENTO_CLINICO' })
export class PwDocumentoClinicoEntity {
  @PrimaryColumn({ name: 'CD_DOCUMENTO_CLINICO', type: 'number' })
  cdDocumentoClinico: number;

  @Column({ name: 'CD_TIPO_DOCUMENTO', type: 'number', nullable: true })
  cdTipoDocumento: number;

  @Column({ name: 'CD_PACIENTE', type: 'number', nullable: true })
  cdPaciente: number;

  @Column({ name: 'CD_ATENDIMENTO', type: 'number', nullable: true })
  cdAtendimento: number;

  @Column({ name: 'CD_USUARIO', type: 'varchar2', length: 30 })
  cdUsuario: string;

  @Column({ name: 'CD_PRESTADOR', type: 'number', nullable: true })
  cdPrestador: number;

  @Column({ name: 'TP_STATUS', type: 'varchar2', length: 20 })
  tpStatus: string;

  @Column({ name: 'DH_REFERENCIA', type: 'timestamp' })
  dhReferencia: Date;

  @Column({ name: 'DH_CRIACAO', type: 'timestamp' })
  dhCriacao: Date;

  @Column({ name: 'DH_FECHAMENTO', type: 'timestamp' })
  dhFechamento: Date;

  @Column({ name: 'TP_EXTENSAO', type: 'varchar2', length: 20 })
  tpExtensao: string;

  @Column({ name: 'CD_OBJETO', type: 'number', nullable: true })
  cdObjeto: number;

  @Column({ name: 'NM_DOCUMENTO', type: 'varchar2', length: 500 })
  nmDocumento: string;

  @Column({ name: 'DH_DOCUMENTO', type: 'timestamp' })
  dhDocumento: Date;
}
