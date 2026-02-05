import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'ARQUIVOS_PDF', schema: 'WSANTANA' })
export class ArquivoPdfEntity {
  @PrimaryColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'NOME_ARQUIVO', length: 255 })
  nomeArquivo: string;

  @Column({ name: 'TIPO_MIME', length: 100 })
  tipoMime: string;

  @Column({
    name: 'DADOS_PDF',
    type: 'blob', // Mapeia para o BLOB do Oracle
  })
  dadosPdf: Buffer; // No Node.js, binários são tratados como Buffer

  @Column({ name: 'CD_ATENDIMENTO', type: 'number' })
  cdAtendimento: number;

  @Column({ name: 'NR_CPF', type: 'varchar', length: 20 })
  nrCpf: string;

  @Column({ name: 'TX_TIPO_ARQUIVO', type: 'varchar', length: 3 })
  txTipoArquivo: string;

  @Column({ name: 'ID_INTEGRACAO', type: 'number' })
  idIntegracao: number;

  @CreateDateColumn({ name: 'DATA_UPLOAD', type: 'timestamp' })
  dataUpload: Date;
}
