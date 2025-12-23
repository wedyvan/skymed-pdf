import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MedicoPlantaoEntity } from '../entities/medico-plantao.entity';
import { DataSource, In, Repository } from 'typeorm';
import { SolComEntity } from '../entities/sol-com.entity';
import { LaudoExamePedidoPdfEntity } from '../entities/laudo-pdf.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import { AuxLaudosEntity } from '../entities/aux-laudos.entity';
import { file } from 'tmp-promise';
import { execFile } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { WttEventsEntity } from '../postgresql/entities/wtt-events.entity';
import { WorklistRequestEntity } from '../entities/worklist-request.entity';
import { ViewWorklistRequestEntity } from '../entities/view-worklist.entity';

const execFileAsync = promisify(execFile);
const writeFileAsync = promisify(fs.writeFile);
const readDirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const renameAsync = promisify(fs.rename);
const mkdirAsync = promisify(fs.mkdir);
const accessAsync = promisify(fs.access);
@Injectable()
export class TypeOrmRepository {
  private _medicoPlantaoService: Repository<MedicoPlantaoEntity>;
  private _solicitacaoCompraService: Repository<SolComEntity>;
  private _laudoPdfService: Repository<LaudoExamePedidoPdfEntity>;
  private _auxLaudoService: Repository<AuxLaudosEntity>;
  private _wttEvents: Repository<WttEventsEntity>;
  private _mvWorklist: Repository<WorklistRequestEntity>;
  private _viewMvWorklist: Repository<ViewWorklistRequestEntity>;
  private caminho: string;
  private logger = new Logger(TypeOrmRepository.name);
  constructor(
    @Inject('PRIMARY_DATA_SOURCE')
    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {
    this.caminho = this.configService.get<string>('CAMINHO_PDFS');
    this._medicoPlantaoService =
      this.dataSource.getRepository(MedicoPlantaoEntity);
    this._solicitacaoCompraService =
      this.dataSource.getRepository(SolComEntity);
    this._laudoPdfService = this.dataSource.getRepository(
      LaudoExamePedidoPdfEntity,
    );
    this._auxLaudoService = this.dataSource.getRepository(AuxLaudosEntity);
    this._mvWorklist = this.dataSource.getRepository(WorklistRequestEntity);
    this._viewMvWorklist = this.dataSource.getRepository(
      ViewWorklistRequestEntity,
    );
  }
  async testePostgres() {
    const result = await this._mvWorklist.find({
      take: 10,
    });
    // const result = await this._wttEvents.find({
    //   take: 10,
    // });
    return result;
  }

  // @Cron('*/2 * * * *')
  async insertWttWorklist() {
    // Busca os dados da tabela origem (com snProcessado = 'P')
    const wttEvents = await this.getWorkListRequest();

    if (!wttEvents.length) return [];

    // Insere os dados na tabela destino
    const result = await this._wttEvents.save(wttEvents);

    // Atualiza a tabela origem marcando como processado
    const ids = wttEvents.map((event) => event.accessionnumber); // Substitua pela sua chave primária real
    await this._mvWorklist.update(
      { accessionnumber: In(ids) }, // Filtro com IN
      { snProcessado: 'S' }, // Campo a ser atualizado
    );

    return result;
  }

  // @Cron('*/1 * * * *')
  async insertMvWorklist() {
    const mvWorklist = await this.getWorklistMv();
    if (!mvWorklist.length) return [];
    const result = await this._mvWorklist.save(mvWorklist);
    this.logger.debug(`Worklist salvas: ${result.length}`);
    return result;
  }

  async getWorkListRequest() {
    return await this._mvWorklist.find({
      where: {
        snProcessado: 'P',
      },
      take: 500,
    });
  } // ViewWorklistRequest

  async getWorklistMv() {
    return await this._viewMvWorklist.find({
      take: 500,
    });
  }

  async comprimirPdfBuffer(inputBuffer: Buffer): Promise<Buffer> {
    // A criação de arquivos temporários está perfeita, mantemos como está.
    const inputTmp = await file({ postfix: '.pdf' });
    const outputTmp = await file({ postfix: '.pdf' });

    try {
      await writeFile(inputTmp.path, inputBuffer);

      // 1. Detecta o SO para escolher o executável correto (gswin64c ou gs)
      const executable = process.platform === 'win32' ? 'gswin64c' : 'gs';

      // 2. Transforma a string de comando em um array de argumentos
      //    Isso é mais seguro e não abre um shell.
      const args = [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${outputTmp.path}`, // Passa o caminho de saída
        inputTmp.path, // Passa o caminho de entrada
      ];

      // 3. Executa o comando silenciosamente com execFileAsync
      await execFileAsync(executable, args);

      // O resto da sua lógica está perfeito.
      const compressedBuffer = await readFile(outputTmp.path);
      return compressedBuffer;
    } catch (error) {
      // Mantemos seu tratamento de erro, que é o padrão do NestJS.
      throw new HttpException(
        `Erro ao comprimir PDF: ${error.message}`, // Usamos error.message para uma msg mais limpa
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      // Mantemos a limpeza dos arquivos temporários, que é uma ótima prática.
      await inputTmp.cleanup();
      await outputTmp.cleanup();
    }
  }
  async setAuxLaudos(laudos: AuxLaudosEntity) {
    await this._auxLaudoService.save(laudos);
  }

  async getUsers() {
    const users = await this.dataSource.query(
      'select * from dbasgu.usuarios fetch first 10 rows only',
    );
    return users;
  }

  async getLaudosPorData(data: Date): Promise<any[]> {
    const dataFormatada = data.toISOString().split('T')[0]; // '2025-01-01'
    this.logger.debug(dataFormatada);

    const laudos = await this.dataSource.query(
      `
      select pdf.id_exame_pedido, ped.CD_PACIENTE_HIS, ped.CD_ITEM_PEDIDO_HIS, pdf.layout_novo_editor from idce.rs_lau_exame_pedido_pdf pdf
      join idce.rs_vw_exame_pedido ped on pdf.id_exame_pedido = ped.ID_EXAME_PEDIDO
      and (ped.id_unidade = 3 and trunc(ped.dt_assinado) >= TO_DATE(:data, 'YYYY-MM-DD'))
      and LAYOUT_NOVO_EDITOR is not null
      left join wttdserver.aux_laudos wtt on wtt.id_exame_pedido = pdf.id_exame_pedido
      where (wtt.sn_processado IS NULL OR wtt.sn_processado <> 'S')
      `,
      [dataFormatada],
    );
    this.logger.debug(`Laudos encontrados: ${laudos.length}`);
    return laudos;
  }
  //// @Cron('0 */2 * * * *')
  // async cronSalvarLaudosPorData(): Promise<string[]> {
  //   const hoje = new Date();
  //   const cron = await this.salvarLaudosPorDataEmLote(hoje);
  //   return cron;
  // }

  async salvarLaudosPorDataEmLote(data: Date): Promise<string[]> {
    const pLimit = (await import('p-limit')).default;
    const pastaDestino = path.join(this.caminho);
    const laudos = await this.getLaudosPorData(data);

    await this.validarOuCriarDiretorio(pastaDestino);

    const caminhosSalvos = await this.processarLaudosEmBlocos(
      laudos,
      pastaDestino,
      pLimit,
    );
    this.logger.log(
      `Processamento em lote finalizado. Total de arquivos salvos: ${caminhosSalvos.length}`,
    );
    return caminhosSalvos;
  }

  private async validarOuCriarDiretorio(pasta: string): Promise<void> {
    try {
      await accessAsync(pasta, fs.constants.W_OK);
    } catch {
      this.logger.warn(`Diretório não acessível, tentando criar: ${pasta}`);
      try {
        await mkdirAsync(pasta, { recursive: true });
        this.logger.log(`Diretório criado: ${pasta}`);
      } catch (error) {
        this.logger.error(`Erro ao criar diretório: ${pasta}`, error.stack);
        throw new Error(`Falha ao criar diretório: ${pasta}`);
      }
    }
  }

  private async processarLaudosEmBlocos(
    laudos: any[],
    pastaDestino: string,
    pLimit: any,
  ): Promise<string[]> {
    const concurrencyLimit = Math.max(2, Math.floor(os.cpus().length / 2));
    const limit = pLimit(concurrencyLimit);
    const chunkSize = 10;
    const caminhosSalvos: string[] = [];

    for (let i = 0; i < laudos.length; i += chunkSize) {
      const chunk = laudos.slice(i, i + chunkSize);
      const chunkPromises = chunk.map((laudo) =>
        limit(() => this.processarLaudo(laudo, pastaDestino)),
      );

      const resultadosChunk = await Promise.all(chunkPromises);
      const caminhosValidos = resultadosChunk.filter(
        (c): c is string => c !== null,
      );
      caminhosSalvos.push(...caminhosValidos);

      const mem = process.memoryUsage().heapUsed / 1024 / 1024;
      this.logger.log(`Chunk processado. Memória atual: ${mem.toFixed(2)} MB`);
    }

    return caminhosSalvos;
  }

  private async processarLaudo(
    laudo: any,
    pastaDestino: string,
  ): Promise<string | null> {
    try {
      const nomeArquivo = `${laudo.CD_PACIENTE_HIS}_${laudo.CD_ITEM_PEDIDO_HIS}.pdf`;
      const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

      if (fs.existsSync(caminhoCompleto)) return caminhoCompleto;
      if (!laudo.LAYOUT_NOVO_EDITOR) {
        this.logger.warn(`PDF não encontrado para ID ${laudo.ID_EXAME_PEDIDO}`);
        return null;
      }

      let pdfBuffer = await this.comprimirPdfBuffer(laudo.LAYOUT_NOVO_EDITOR);
      await writeFileAsync(caminhoCompleto, pdfBuffer);
      pdfBuffer = null;

      const binds: AuxLaudosEntity = {
        idExamePedido: laudo.ID_EXAME_PEDIDO,
        cdItemPedidoHis: laudo.CD_ITEM_PEDIDO_HIS,
        cdPacienteHis: laudo.CD_PACIENTE_HIS,
        snProcessado: 'S',
      };
      await this.setAuxLaudos(binds);

      this.logger.log(`Arquivo salvo: ${caminhoCompleto}`);
      return caminhoCompleto;
    } catch (error) {
      this.logger.error(
        `Erro ao salvar arquivo para ID ${laudo.ID_EXAME_PEDIDO}`,
        error.stack,
      );
      return null;
    }
  }

  async getLaudoPdf(): Promise<LaudoExamePedidoPdfEntity[]> {
    return await this._laudoPdfService.find();
  }
  async salvarPdfNoDisco(id: number, nomeArquivo?: string): Promise<string> {
    const nomeFinal = nomeArquivo ?? `laudo-${id}.pdf`;
    const pastaDestino = path.resolve(__dirname, '..', '..', 'pdfs');

    if (!fs.existsSync(pastaDestino)) {
      fs.mkdirSync(pastaDestino, { recursive: true });
    }

    const caminhoCompleto = path.join(nomeFinal);

    // Verifica se o arquivo já existe
    if (fs.existsSync(caminhoCompleto)) {
      return caminhoCompleto; // Retorna o caminho existente
    }

    const temp = await this.getPdfById(id);
    console.log('🚀 ~ AppController ~ salvarPdfNoDisco ~ temp:', temp);
    const buffer = await this.comprimirPdfBuffer(temp);
    if (!buffer) {
      throw new NotFoundException(`Laudo PDF com ID ${id} não encontrado.`);
    }

    fs.writeFileSync(nomeFinal, buffer); // Cria o arquivo
    return nomeFinal;
  }

  async getPdfById(id: number): Promise<Buffer> {
    const laudo = await this._laudoPdfService.findOneBy({ idExamePedido: id });
    if (!laudo || !laudo.layoutNovoEditor) {
      throw new NotFoundException('PDF não encontrado');
    }
    return laudo.layoutNovoEditor;
  }

  async getMedicosPlantao(): Promise<MedicoPlantaoEntity[]> {
    return await this._medicoPlantaoService.find();
  }
  async getSolicitacaoCompra(cdSolCom: number): Promise<SolComEntity[]> {
    return await this._solicitacaoCompraService.find({
      select: {
        cdSolCom: true,
        cdCotador: true,
        cdMotPed: true,
        cdSetor: true,
        cdEstoque: true,
        nmSolicitante: true,
        tpSituacao: true,
        dtSolCom: true,
        dtMaxima: true,
        dsObservacao: true,
        itsolComs: {
          cdProduto: true,
          cdSolCom: true,
          qtSolic: true,
          qtComprada: true,
          qtAtendida: true,
        },
      },
      where: {
        cdSolCom,
      },
      relations: ['itsolComs'],
    });
  }
}
