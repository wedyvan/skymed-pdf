import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ schema: 'DBASGU', name: 'USUARIOS' })
export class UsuarioMvEntity {
  @PrimaryColumn({ name: 'CD_USUARIO' })
  cdUsuario: string;
  @Column({ name: 'NM_USUARIO' })
  nomeUsuario: string;
  @Column({ name: 'SN_ATIVO' })
  snAtivo: string;
}
