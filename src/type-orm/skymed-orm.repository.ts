import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull, Not, Repository } from 'typeorm';
import { Inject } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

import pLimit from 'p-limit';

import { ArquivoPdfEntity } from '../entities/pdf.entity';

const readDirAsync = promisify(fs.readdir);
const renameAsync = promisify(fs.rename);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class SkymedOrmRepository {
  private readonly logger = new Logger(SkymedOrmRepository.name);
  private readonly _arquivoPdfService: Repository<ArquivoPdfEntity>;
  private readonly caminho: string;

  constructor(
    @Inject('PRIMARY_DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this._arquivoPdfService = this.dataSource.getRepository(ArquivoPdfEntity);

    this.caminho = this.configService.get<string>('CAMINHO_PDFS');
  }

  async buscarArquivos(): Promise<ArquivoPdfEntity[]> {
    return this._arquivoPdfService.find({
      where: { idIntegracao: IsNull() },
    });
  }

  // ===================================================================
  // CRON – PROCESSA TODOS OS PDFs
  // ===================================================================
  @Cron('*/1 * * * *')
  async processarTodosPdfsDaPasta(): Promise<object[]> {
    this.logger.log(`Iniciando varredura do diretório: ${this.caminho}`);

    let nomesDosArquivos: string[];

    try {
      nomesDosArquivos = await readDirAsync(this.caminho);
    } catch (error) {
      this.logger.error(`Falha ao ler diretório ${this.caminho}`, error.stack);
      throw new InternalServerErrorException(
        'Não foi possível ler o diretório de PDFs.',
      );
    }

    const nomesPdfs = nomesDosArquivos.filter(
      (nome) => path.extname(nome).toLowerCase() === '.pdf',
    );

    if (nomesPdfs.length === 0) {
      this.logger.warn('Nenhum PDF encontrado.');
      return [];
    }

    const pastaProcessados = path.join(this.caminho, 'processados');
    await mkdirAsync(pastaProcessados, { recursive: true });

    this.logger.log(
      `Encontrados ${nomesPdfs.length} PDFs. Iniciando processamento...`,
    );

    const limit = pLimit(3); // 🔒 limite de concorrência
    const relatorio: object[] = [];

    await Promise.all(
      nomesPdfs.map((nomeArquivo) =>
        limit(async () => {
          try {
            const resultado = await this.processarArquivo(
              nomeArquivo,
              pastaProcessados,
            );
            relatorio.push(resultado);
          } catch (error) {
            this.logger.error(`Erro ao processar ${nomeArquivo}`, error.stack);
            relatorio.push({
              nome: nomeArquivo,
              status: 'falha',
              erro: error.message,
            });
          }
        }),
      ),
    );

    this.logger.log('Processamento finalizado.');
    return relatorio;
  }

  // ===================================================================
  // PROCESSA UM ÚNICO ARQUIVO
  // ===================================================================
  private async processarArquivo(
    nomeArquivo: string,
    pastaProcessados: string,
  ) {
    const caminhoCompleto = path.join(this.caminho, nomeArquivo);

    const arquivoSalvo = await this.salvarPdfStream(
      caminhoCompleto,
      nomeArquivo,
      'application/pdf',
    );

    await renameAsync(
      caminhoCompleto,
      path.join(pastaProcessados, nomeArquivo),
    );

    this.logger.log(`Arquivo ${nomeArquivo} integrado com sucesso.`);

    return {
      nome: nomeArquivo,
      status: 'sucesso',
      arquivo: arquivoSalvo,
    };
  }

  // ===================================================================
  // SALVA PDF VIA STREAM (ORACLE BLOB)
  // ===================================================================
  private async salvarPdfStream(
    caminhoCompleto: string,
    nomeArquivo: string,
    tipoMime: string,
  ): Promise<ArquivoPdfEntity> {
    // Lê o PDF inteiro em memória
    const fileBuffer = await readFile(caminhoCompleto);

    const result = await this._arquivoPdfService.update(
      {
        nomeArquivo,
      },
      {
        tipoMime,
        txTipoArquivo: 'pdf',
        dadosPdf: fileBuffer,
      },
    );
    if (result.affected === 0) {
      throw new BadRequestException(
        `Não existe um PDF com o nome ${nomeArquivo} no banco.`,
      );
    }

    return this._arquivoPdfService.findOne({
      where: { nomeArquivo },
      select: ['nomeArquivo', 'tipoMime', 'txTipoArquivo'],
    });
  }
}
