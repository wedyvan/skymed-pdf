import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pLimit from 'p-limit';
import * as path from 'path';
import { SkymedOrmRepository } from '../repositories/skymed-repository';
import { FileStorageService } from './file-storage-service.service';

@Injectable()
export class PdfProcessingService {
  private readonly logger = new Logger(PdfProcessingService.name);
  private isProcessing = false; // Previne execução sobreposta do Cron

  constructor(
    private readonly fileService: FileStorageService,
    private readonly repository: SkymedOrmRepository,
    private readonly configService: ConfigService,
  ) {}

  async processarPasta() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      const caminhoRaiz = this.configService.get<string>('CAMINHO_PDFS');

      // 1. Busca o que tem na pasta e o que o banco espera
      const [nomesNaPasta, nomesNoBanco] = await Promise.all([
        this.fileService.listarPdfs(caminhoRaiz),
        this.repository.buscarNomesEsperados(),
      ]);

      // 2. FILTRO: Só processa o que existe nos dois lugares
      const paraProcessar = nomesNaPasta.filter((nome) =>
        nomesNoBanco.includes(nome),
      );

      if (paraProcessar.length === 0) {
        this.logger.debug('Nenhum PDF pendente para integração.');
        return;
      }

      this.logger.log(
        `Iniciando integração de ${paraProcessar.length} arquivos.`,
      );

      // 3. Orquestra o processamento limitado
      const limit = pLimit(3);
      await Promise.all(
        paraProcessar.map((nome) =>
          limit(() => this.processarArquivoUnico(caminhoRaiz, nome)),
        ),
      );
    } catch (error) {
      this.logger.error('Falha na orquestração da pasta', error.stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processarArquivoUnico(diretorio: string, nome: string) {
    const caminhoCompleto = path.join(diretorio, nome);

    try {
      // 1. Lê o arquivo
      const buffer = await this.fileService.lerArquivo(caminhoCompleto);

      // 2. Salva no Oracle (Blob)
      await this.repository.atualizarDadosPdf(nome, buffer);

      // 3. Move para pasta de sucesso
      await this.fileService.moverParaProcessados(caminhoCompleto, nome);

      this.logger.log(`[SUCESSO] ${nome} processado.`);
    } catch (error) {
      this.logger.error(`[ERRO] ${nome}: ${error.message}`);
    }
  }
}
