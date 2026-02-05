import { ArquivoPdfEntity } from '@/src/skymed/entities/pdf.entity';
import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource, IsNull } from 'typeorm';

@Injectable()
export class SkymedOrmRepository {
  private readonly repo: Repository<ArquivoPdfEntity>;

  constructor(
    @Inject('PRIMARY_DATA_SOURCE') private readonly dataSource: DataSource,
  ) {
    this.repo = this.dataSource.getRepository(ArquivoPdfEntity);
  }

  async atualizarDadosPdf(nomeArquivo: string, buffer: Buffer): Promise<void> {
    const result = await this.repo.update(
      { nomeArquivo },
      {
        dadosPdf: buffer,
        tipoMime: 'application/pdf',
        txTipoArquivo: 'pdf',
      },
    );

    if (result.affected === 0) {
      throw new Error(
        `Registro do PDF ${nomeArquivo} não encontrado no banco.`,
      );
    }
  }

  async buscarNomesEsperados(): Promise<string[]> {
    const registros = await this.repo.find({
      where: { dadosPdf: IsNull() }, // Busca apenas os que ainda não têm o PDF
      select: ['nomeArquivo'],
    });
    return registros.map((r) => r.nomeArquivo);
  }
}
