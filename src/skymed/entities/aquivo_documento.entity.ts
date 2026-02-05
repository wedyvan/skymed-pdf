import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ schema: 'DBAMV', name: 'ARQUIVO_DOCUMENTO' })
export class ArquivoDocumentoEntity {
  @PrimaryColumn({ name: 'CD_ARQUIVO_DOCUMENTO', type: 'number' })
  cdArquivoDocumento: number;

  @Column({ name: 'LO_ARQUIVO_DOCUMENTO', type: 'blob' })
  loArquivoDocumento: Buffer;

  @Column({ name: 'TP_EXTENSAO', type: 'varchar2', length: 10 })
  tpExtensao: string;

  @Column({ name: 'DS_AUTOR', type: 'varchar2', length: 100 })
  dsAutor: string;

  @Column({ name: 'DS_ORIGEM', type: 'varchar2', length: 50 })
  dsOrigem: string;

  @Column({ name: 'DT_DOCUMENTO', type: 'timestamp' })
  dtDocumento: Date;

  @Column({ name: 'DS_NOME_ARQUIVO', type: 'varchar2', length: 500 })
  dsNomeArquivo: string;
}
