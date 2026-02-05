import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import pLimit from 'p-limit';

import { ArquivoPdfEntity } from '../entities/pdf.entity';
import { SkymedOrmRepository } from '../repositories/skymed-repository';
import { FileStorageService } from './file-storage-service.service';
import { SkymedService } from './skymed.service';

@Injectable()
export class PdfProcessingService {
  private readonly logger = new Logger(PdfProcessingService.name);
  private isProcessing = false;

  constructor(
    private readonly fileService: FileStorageService,
    private readonly repository: SkymedOrmRepository,
    private readonly skymedService: SkymedService,
    private readonly configService: ConfigService,
  ) {}

  async processarPasta() {
    if (this.isProcessing) {
      this.logger.warn('Processamento em andamento, pulando execução...');
      return;
    }

    try {
      this.isProcessing = true;
      const caminhoRaiz = this.configService.get<string>('CAMINHO_PDFS');

      // 1. Busca sincronizada: O que tem na pasta e o que o banco diz que falta
      const [nomesNaPasta, arquivosPendentes] = await Promise.all([
        this.fileService.listarPdfs(caminhoRaiz),
        this.repository.buscarArquivosPendentes(),
      ]);

      // 2. Filtra: Apenas arquivos que estão fisicamente na pasta E pendentes no banco
      const paraProcessar = arquivosPendentes.filter((arq) =>
        nomesNaPasta.includes(arq.nomeArquivo),
      );

      if (paraProcessar.length === 0) {
        this.logger.debug('Nada para processar no momento.');
        return;
      }

      this.logger.log(
        `Iniciando integração de ${paraProcessar.length} arquivos...`,
      );

      // 3. Concorrência controlada (p-limit) para não estourar memória/banco
      const limit = pLimit(3);
      await Promise.all(
        paraProcessar.map((arquivo) =>
          limit(() => this.executarFluxoCompleto(caminhoRaiz, arquivo)),
        ),
      );
    } catch (error) {
      this.logger.error(
        'Falha crítica no processamento da pasta:',
        error.stack,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async executarFluxoCompleto(
    diretorio: string,
    arquivo: ArquivoPdfEntity,
  ) {
    const caminhoCompleto = path.join(diretorio, arquivo.nomeArquivo);

    try {
      // Passo A: Ler do disco
      const buffer = await this.fileService.lerArquivo(caminhoCompleto);

      // Passo B: Atualizar BLOB na tabela de controle (Oracle)
      await this.repository.atualizarBlob(arquivo.nomeArquivo, buffer);

      // Passo C: Executar a lógica pesada de integração GED (Inserts MV)
      await this.skymedService.integrarGed({
        codAtendimento_p: arquivo.cdAtendimento,
        nr_cpf_p: arquivo.nrCpf,
        ds_arquivo_p: arquivo.nomeArquivo,
      });

      // Passo D: Mover arquivo físico para a pasta 'processados'
      await this.fileService.moverArquivo(
        caminhoCompleto,
        arquivo.nomeArquivo,
        'processados',
      );

      this.logger.log(`[SUCESSO] ${arquivo.nomeArquivo} integrado e movido.`);
    } catch (error) {
      this.logger.error(`[FALHA] ${arquivo.nomeArquivo}: ${error.message}`);
      // Aqui você poderia implementar uma lógica de mover para uma pasta 'erro' se desejar
      // Verifica se o arquivo físico ainda existe na origem antes de mover para 'erros'
      const existe = await this.fileService.existe(caminhoCompleto);
      if (existe && !(error instanceof NotFoundException)) {
        await this.fileService.moverArquivo(
          caminhoCompleto,
          arquivo.nomeArquivo,
          'erros',
        );
        this.logger.warn(
          `[REMOVIDO] ${arquivo.nomeArquivo} movido para pasta de erros.`,
        );
      }
    }
  }
}
