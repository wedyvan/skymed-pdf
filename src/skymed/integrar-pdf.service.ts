import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { SkymedOrmRepository } from '../type-orm/skymed-orm.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArquivoPdfEntity } from '../entities/pdf.entity';
import { ArquivoAtendimentoEntity } from '../entities/aquivo_atendimentos.entity';
import { PwDocumentoClinicoEntity } from '../entities/pw_documento_clinico.entity';
import { ArquivoDocumentoEntity } from '../entities/aquivo_documento.entity';
import { ConfigService } from '@nestjs/config';

export class JobSkymedDto {
  codAtendimento_p?: number;
  nr_cpf_p?: string;
  ds_arquivo_p: string;
}

@Injectable()
export class SkymedService {
  private readonly logger = new Logger(SkymedService.name);
  private readonly codigoPrestador: number;
  private readonly codigoObjeto: number;
  private readonly codigoTipoDocumento: number;
  private readonly codigoStatusArquivoAtendimento: number;
  private readonly codigoUsuario: string;

  constructor(
    @Inject('PRIMARY_DATA_SOURCE')
    private dataSource: DataSource,
    private readonly skymedOrmRepository: SkymedOrmRepository,
    private readonly configService: ConfigService,
  ) {
    this.codigoPrestador = this.configService.get<number>(
      'CODIGO_PRESTADOR_INTEGRACAO',
    );
    this.codigoObjeto = this.configService.get<number>(
      'CODIGO_OBJETO_INTEGRACAO',
    );
    this.codigoUsuario = this.configService.get<string>(
      'CD_USUARIO_INTEGRACAO',
    );
    this.codigoTipoDocumento = this.configService.get<number>(
      'CODIGO_TIPO_DOCUMENTO_INTEGRACAO',
    );
    this.codigoStatusArquivoAtendimento = this.configService.get<number>(
      'CODIGO_STATUS_ARQUIVO_ATENDIMENTO',
    );
  }

  async integrarGed(dto: JobSkymedDto) {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        let pcdAtendimento = dto.codAtendimento_p;
        let vCdPaciente: number | null = null;
        let vAtendime: any;

        // 1. Buscar arquivo na tabela ARQUIVOS_PDF
        const skymedArquivo = await manager
          .getRepository(ArquivoPdfEntity)
          .createQueryBuilder('a')
          .where('a.nomeArquivo = :nome', { nome: dto.ds_arquivo_p })
          .getOne();

        if (!skymedArquivo) {
          throw new BadRequestException(
            `Arquivo não encontrado: ${dto.ds_arquivo_p}`,
          );
        }

        // 2. Determinar atendimento
        if (!pcdAtendimento && dto.nr_cpf_p) {
          const paciente = await manager.query(
            `SELECT cd_paciente FROM DBAMV.paciente WHERE nr_cpf = :1 FETCH FIRST 1 ROWS ONLY`,
            [dto.nr_cpf_p],
          );

          if (!paciente[0]) {
            throw new BadRequestException(
              `Paciente não encontrado com CPF: ${dto.nr_cpf_p}`,
            );
          }

          vCdPaciente = paciente[0].CD_PACIENTE;

          const ultimoAtend = await manager.query(
            `SELECT MAX(cd_atendimento) as MAX_ATEND FROM DBAMV.Atendime WHERE cd_paciente = :1`,
            [vCdPaciente],
          );
          pcdAtendimento = ultimoAtend[0]?.MAX_ATEND;

          if (!pcdAtendimento) {
            throw new BadRequestException(
              `Não foi possível encontrar atendimento para o paciente ${vCdPaciente}`,
            );
          }
        }

        // Buscar dados do atendimento
        vAtendime = (
          await manager.query(
            `SELECT * FROM DBAMV.Atendime WHERE cd_atendimento = :1`,
            [pcdAtendimento],
          )
        )[0];

        if (!vAtendime) {
          throw new BadRequestException(
            `Atendimento não encontrado: ${pcdAtendimento}`,
          );
        }

        // 3. Variáveis de negócio
        const vDsNomeArquivo = `SKYMED_${skymedArquivo.txTipoArquivo?.toUpperCase()}`;

        // 4. Sequências
        const [{ NEXT_DOC }] = await manager.query(
          `SELECT DBAMV.Seq_Pw_Documento_Clinico.Nextval as NEXT_DOC FROM DUAL`,
        );
        const [{ NEXT_ARQ }] = await manager.query(
          `SELECT DBAMV.Seq_Arquivo_Documento.Nextval as NEXT_ARQ FROM DUAL`,
        );
        const [{ NEXT_ARQ_ATEND }] = await manager.query(
          `SELECT DBAMV.Seq_Arquivo_Atendimento.Nextval as NEXT_ARQ_ATEND FROM DUAL`,
        );

        // 5. Ler PDF como Buffer (ou usar LOB streaming)

        // 6. Inserts em paralelo
        await Promise.all([
          manager.save(PwDocumentoClinicoEntity, {
            cdDocumentoClinico: NEXT_DOC,
            cdTipoDocumento: this.codigoTipoDocumento,
            cdPaciente: vAtendime.CD_PACIENTE,
            cdAtendimento: vAtendime.CD_ATENDIMENTO,
            cdUsuario: this.codigoUsuario,
            cdPrestador: this.codigoPrestador,
            tpStatus: 'FECHADO',
            dhReferencia: new Date(),
            dhCriacao: new Date(),
            dhFechamento: new Date(),
            tpExtensao: 'PDF_ANEXO',
            cdObjeto: this.codigoObjeto,
            nmDocumento: vDsNomeArquivo,
            dhDocumento: new Date(),
          }),
          manager.save(ArquivoDocumentoEntity, {
            cdArquivoDocumento: NEXT_ARQ,
            loArquivoDocumento: skymedArquivo.dadosPdf,
            tpExtensao: 'pdf',
            dsAutor: 'Skymed Integracao',
            dsOrigem: 'EXTERNO',
            dtDocumento: new Date(),
            dsNomeArquivo: vDsNomeArquivo,
          }),
          manager.save(ArquivoAtendimentoEntity, {
            cdArquivoAtendimento: NEXT_ARQ_ATEND,
            cdArquivoDocumento: NEXT_ARQ,
            cdAtendimento: vAtendime.CD_ATENDIMENTO,
            dhCriacao: new Date(),
            nmUsuario: this.codigoUsuario,
            cdPaciente: vAtendime.CD_PACIENTE,
            cdPwTipoDocumento: this.codigoTipoDocumento,
            cdDocumentoClinico: NEXT_DOC,
            cdStatusArquivoAtendimento: this.codigoStatusArquivoAtendimento,
            cdObjetoSelecionado: this.codigoObjeto,
          }),
          manager
            .getRepository(ArquivoPdfEntity)
            .update(
              { nomeArquivo: dto.ds_arquivo_p },
              { idIntegracao: NEXT_ARQ },
            ),
        ]);

        return { success: true, documentoId: NEXT_DOC };
      } catch (error) {
        this.logger.error('Erro na integração Skymed:', error);
        throw new InternalServerErrorException(
          `Falha na integração: ${error.message}`,
        );
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processarPdfs() {
    const skymedArquivos = await this.skymedOrmRepository.buscarArquivos();

    for (const skymedArquivo of skymedArquivos) {
      await this.integrarGed({
        codAtendimento_p: skymedArquivo.cdAtendimento,
        nr_cpf_p: skymedArquivo.nrCpf,
        ds_arquivo_p: skymedArquivo.nomeArquivo,
      });
    }
  }
}
