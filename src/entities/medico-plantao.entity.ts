import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ schema: 'AUTOATENDIMENTO', name: 'V_MEDICO_PLANTAO' })
export class MedicoPlantaoEntity {
  @PrimaryColumn()
  CD_FILA_SENHA: number;

  @Column({ type: 'varchar' })
  DS_FILA: string;

  @Column({ type: 'int' })
  ID_TIPO_PLANTAO_PAGAMENTO: number;

  @Column({ type: 'varchar' })
  DS_TIPO_PLANTAO_PAGAMENTO: string;

  @Column({ type: 'varchar' })
  CODIGOMEDICO: string;

  @Column({ type: 'varchar' })
  NOMEMEDICO: string;

  @Column({ type: 'varchar' })
  NUMEROCONSELHOPROFISSIONAL: string;

  @Column({ type: 'varchar', length: 2 })
  UF: string;

  @Column({ type: 'varchar' })
  FL_CHEFE_PLANTAO: string;
}
