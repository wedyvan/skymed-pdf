import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
export type TipoDestino = 'processados' | 'erros';
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

  async moverArquivo(
    caminhoOrigem: string,
    nomeArquivo: string,
    tipo: TipoDestino,
  ): Promise<void> {
    const diretorioRaiz = path.dirname(caminhoOrigem);
    const pasta = path.join(diretorioRaiz, tipo);

    await fs.mkdir(pasta, { recursive: true });
    await fs.rename(caminhoOrigem, path.join(pasta, nomeArquivo));
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
