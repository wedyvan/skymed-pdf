// src/entities/worklist-request.entity.ts
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'WORKLIST_REQUESTS',
  schema: 'WTTDSERVER',
  synchronize: false,
})
export class WorklistRequestEntity {
  @Column({ name: 'DIRECTION', length: 10 })
  direction: string;

  @Column({ name: 'OPERATION', length: 5 })
  operation: string;

  @Column({ name: 'CMDTYPE', length: 20 })
  cmdtype: string;

  @Column({ name: 'OPERATIONSTATUS', length: 5 })
  operationstatus: string;

  @Column({ name: 'CREATIONDATE', length: 14 })
  creationdate: string; // formato: YYYYMMDDhhmmss

  @PrimaryColumn({ name: 'ACCESSIONNUMBER', length: 20 })
  accessionnumber: string;

  @Column({ name: 'REFERPHYSICIAN', length: 100 })
  referphysician: string;

  @Column({ name: 'PATIENTID', length: 20 })
  patientid: string;

  @Column({ name: 'PATIENTNAME', length: 100 })
  patientname: string;

  @Column({ name: 'PATIENTBIRTHDATE', length: 8 })
  patientbirthdate: string;

  @Column({ name: 'PATIENTAGE', length: 10 })
  patientage: string;

  @Column({ name: 'PATIENTSEX', length: 1 })
  patientsex: string;

  @Column({ name: 'PATIENTWEIGHT', length: 10, nullable: true })
  patientweight: string;

  @Column({ name: 'REQPROCDESCRIPTION', length: 100 })
  reqprocdescription: string;

  @Column({ name: 'MODALITY', length: 5 })
  modality: string;

  @Column({ name: 'STARTDATE', length: 8 })
  startdate: string;

  @Column({ name: 'STARTTIME', length: 6 })
  starttime: string;

  @Column({ name: 'RFPHYCRM', length: 20 })
  rfphycrm: string;
  @Column({ name: 'NETWORKID', length: 16 })
  networkid: string;
  @Column({ name: 'SN_PROCESSADO', length: 1 })
  snProcessado: string;
  @Column({ name: 'NPIN', length: 16 })
  npin: string;
}
