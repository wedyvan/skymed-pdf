import { Column, Entity, PrimaryColumn } from 'typeorm';
@Entity({ schema: 'AUTOATENDIMENTO', name: 'V_MEDICO_AGENDA' })
export class MedicoAgendaEntity {
  @PrimaryColumn({ name: 'CD_IT_AGENDA_CENTRAL' })
  cd_it_agenda_central: number;

  @Column({ name: 'CD_AGENDA_CENTRAL' })
  cd_agenda_central: number;
  @Column({ name: 'CD_PRESTADOR' })
  cd_prestador: number;
  @Column({ name: 'NM_PRESTADOR' })
  nm_prestador: string;
  @Column({ name: 'DS_CODIGO_CONSELHO' })
  ds_codigo_conselho: string;
}
