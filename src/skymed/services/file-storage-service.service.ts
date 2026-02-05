import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  async listarPdfs(diretorio: string): Promise<string[]> {
    try {
      // Verifica se o diretório existe antes de tentar ler
      await fs.access(diretorio);

      const arquivos = await fs.readdir(diretorio);
      return arquivos.filter((f) => path.extname(f).toLowerCase() === '.pdf');
    } catch (error) {
      this.logger.error(
        `Diretório não encontrado ou inacessível: ${diretorio}`,
      );
      return []; // Retorna lista vazia em vez de estourar um erro fatal
    }
  }

  async lerArquivo(caminho: string): Promise<Buffer> {
    return fs.readFile(caminho);
  }

  async moverParaProcessados(
    caminhoOrigem: string,
    nomeArquivo: string,
  ): Promise<void> {
    const diretorioRaiz = path.dirname(caminhoOrigem);
    const pastaProcessados = path.join(diretorioRaiz, 'processados');

    await fs.mkdir(pastaProcessados, { recursive: true });
    await fs.rename(caminhoOrigem, path.join(pastaProcessados, nomeArquivo));
  }

  async existe(caminho: string): Promise<boolean> {
    try {
      await fs.access(caminho);
      return true;
    } catch {
      return false;
    }
  }
}
