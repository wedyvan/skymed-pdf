import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'wttevents', schema: 'public' })
export class WttEventsEntity {
  @PrimaryGeneratedColumn()
  cmdnum: number;

  @Column({ length: 10 })
  direction: string;

  @Column({ length: 5 })
  operation: string;

  @Column({ length: 20 })
  cmdtype: string;

  @Column({ length: 5 })
  operationstatus: string;

  @Column({ length: 14 })
  creationdate: string; // YYYYMMDDhhmmss como string

  @Column({ length: 20 })
  accessionnumber: string;

  @Column({ length: 100 })
  referphysician: string;

  @Column({ length: 20 })
  patientid: string;

  @Column({ length: 100 })
  patientname: string;

  @Column({ length: 8 })
  patientbirthdate: string; // YYYYMMDD

  @Column({ length: 10 })
  patientage: string; // Ex: 35Y

  @Column({ length: 1 })
  patientsex: string;

  @Column({ length: 10, nullable: true })
  patientweight: string;

  @Column({ length: 100 })
  reqprocdescription: string;

  @Column({ length: 5 })
  modality: string;

  @Column({ length: 8 })
  startdate: string; // YYYYMMDD

  @Column({ length: 6 })
  starttime: string; // hhmmss

  @Column({ length: 20 })
  rfphycrm: string;
  @Column({ length: 16 })
  networkid: string;
  @Column({ length: 16 })
  npin: string;
}
