import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SkymedOrmRepository } from '../repositories/skymed-repository';

export class IntegracaoGedDto {
  codAtendimento_p?: number;
  nr_cpf_p?: string;
  ds_arquivo_p: string;
}

@Injectable()
export class SkymedService {
  private readonly logger = new Logger(SkymedService.name);

  constructor(
    @Inject('PRIMARY_DATA_SOURCE')
    private dataSource: DataSource,
    private readonly skymedOrmRepository: SkymedOrmRepository,
  ) {}

  async integrarGed(dto: IntegracaoGedDto) {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // 1. Delega a busca de dados ao repositório
      let pcdAtendimento = dto.codAtendimento_p;

      if (!pcdAtendimento && dto.nr_cpf_p) {
        const busca =
          await this.skymedOrmRepository.buscarUltimoAtendimentoPorCpf(
            manager,
            dto.nr_cpf_p,
          );
        if (!busca?.cdAtendimento)
          throw new BadRequestException(
            `Atendimento não encontrado para o CPF.`,
          );
        pcdAtendimento = busca.cdAtendimento;
      }

      const dadosAtendimento =
        await this.skymedOrmRepository.buscarDadosAtendimento(
          manager,
          pcdAtendimento,
        );
      console.log(
        '🚀 ~ SkymedService ~ integrarGed ~ dadosAtendimento:',
        dadosAtendimento,
      );
      if (!dadosAtendimento)
        throw new NotFoundException(
          `Atendimento ${pcdAtendimento} não encontrado.`,
        );

      if (!dadosAtendimento.cdPaciente)
        throw new NotFoundException(
          `Paciente do atendimento ${pcdAtendimento} não encontrado.`,
        );

      // 2. Busca sequências
      const nextIds =
        await this.skymedOrmRepository.getIntegracaoSequences(manager);

      // 3. Persistência (Pode continuar aqui ou ser enviada para métodos específicos do repo)
      await this.skymedOrmRepository.salvarPacoteGed(
        manager,
        dadosAtendimento,
        nextIds,
        dto.ds_arquivo_p,
      );

      return { success: true, documentoId: nextIds.NEXT_DOC };
    });
  }
}
