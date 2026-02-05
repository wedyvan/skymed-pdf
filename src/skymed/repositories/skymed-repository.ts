import { ArquivoPdfEntity } from '@/src/skymed/entities/pdf.entity';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository, DataSource, IsNull, EntityManager } from 'typeorm';
import { PwDocumentoClinicoEntity } from '../entities/pw_documento_clinico.entity';
import { ArquivoDocumentoEntity } from '../entities/aquivo_documento.entity';
import { ArquivoAtendimentoEntity } from '../entities/aquivo_atendimentos.entity';
export interface AtendimentoMv {
  cdPaciente: number;
  cdAtendimento: number;
}
@Injectable()
export class SkymedOrmRepository {
  private readonly repo: Repository<ArquivoPdfEntity>;
  private readonly codigoPrestador: number;
  private readonly codigoObjeto: number;
  private readonly codigoTipoDocumento: number;
  private readonly codigoStatusArquivoAtendimento: number;
  private readonly codigoUsuario: string;
  private readonly config: {
    prestador: number;
    objeto: number;
    tipoDoc: number;
    statusAtend: number;
    usuario: string;
  };
  private readonly logger = new Logger(SkymedOrmRepository.name);

  constructor(
    @Inject('PRIMARY_DATA_SOURCE') private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.repo = this.dataSource.getRepository(ArquivoPdfEntity);
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
      'CODIGO_TIPO_DOCUMENTO',
    );
    this.codigoStatusArquivoAtendimento = this.configService.get<number>(
      'CODIGO_STATUS_ARQUIVO_ATENDIMENTO',
    );
    this.config = {
      prestador: this.codigoPrestador,
      objeto: this.codigoObjeto,
      tipoDoc: this.codigoTipoDocumento,
      statusAtend: this.codigoStatusArquivoAtendimento,
      usuario: this.codigoUsuario,
    };
  }

  async getIntegracaoSequences(manager: EntityManager) {
    const sql = (seq: string) => `SELECT DBAMV.${seq}.Nextval as ID FROM DUAL`;

    const [doc, arq, atend] = await Promise.all([
      manager.query(sql('Seq_Pw_Documento_Clinico')),
      manager.query(sql('Seq_Arquivo_Documento')),
      manager.query(sql('Seq_Arquivo_Atendimento')),
    ]);

    return {
      NEXT_DOC: doc[0].ID,
      NEXT_ARQ: arq[0].ID,
      NEXT_ARQ_ATEND: atend[0].ID,
    };
  }

  async buscarUltimoAtendimentoPorCpf(
    manager: EntityManager,
    cpf: string,
  ): Promise<any> {
    const paciente = await manager.query(
      `SELECT cd_paciente FROM DBAMV.paciente WHERE nr_cpf = :1 FETCH FIRST 1 ROWS ONLY`,
      [cpf],
    );
    if (!paciente[0]) return null;

    const atend = await manager.query(
      `SELECT MAX(cd_atendimento) as MAX_ATEND FROM DBAMV.Atendime WHERE cd_paciente = :1`,
      [paciente[0].CD_PACIENTE],
    );

    return {
      cdPaciente: paciente[0].CD_PACIENTE,
      cdAtendimento: atend[0]?.MAX_ATEND,
    };
  }

  async buscarDadosAtendimento(
    manager: EntityManager,
    id: number,
  ): Promise<AtendimentoMv | undefined> {
    const res = await manager.query(
      `SELECT cd_paciente, cd_atendimento FROM DBAMV.Atendime WHERE cd_atendimento = :1`,
      [id],
    );
    this.logger.log(res);

    return {
      cdPaciente: res[0]?.CD_PACIENTE,
      cdAtendimento: res[0]?.CD_ATENDIMENTO,
    }; // O TypeScript agora sabe que res[0] é do tipo AtendimentoMv ou undefined
  }

  async salvarPacoteGed(
    manager: EntityManager,
    dadosAtendimento: AtendimentoMv, // Retorno do repository (cdPaciente, cdAtendimento)
    nextIds: any, // Retorno das sequências (NEXT_DOC, NEXT_ARQ, NEXT_ARQ_ATEND)
    nomeArquivo: string,
  ) {
    // 1. Buscar o PDF completo (incluindo o BLOB) para salvar no GED
    const skymedArquivo = await manager.findOne(ArquivoPdfEntity, {
      where: { nomeArquivo },
    });

    if (!skymedArquivo || !skymedArquivo.dadosPdf) {
      throw new Error(
        `Conteúdo binário não encontrado para o arquivo: ${nomeArquivo}`,
      );
    }

    const vDsNomeArquivo = `SKYMED_${skymedArquivo.txTipoArquivo?.toUpperCase()}`;

    // 2. Executar os inserts/updates necessários
    await Promise.all([
      // Registro do Documento Clínico
      manager.save(PwDocumentoClinicoEntity, {
        cdDocumentoClinico: nextIds.NEXT_DOC,
        cdTipoDocumento: this.config.tipoDoc,
        cdPaciente: dadosAtendimento.cdPaciente,
        cdAtendimento: dadosAtendimento.cdAtendimento,
        cdUsuario: this.config.usuario,
        cdPrestador: this.config.prestador,
        tpStatus: 'FECHADO',
        dhReferencia: new Date(),
        dhCriacao: new Date(),
        dhFechamento: new Date(),
        tpExtensao: 'PDF_ANEXO',
        cdObjeto: this.config.objeto,
        nmDocumento: vDsNomeArquivo,
        dhDocumento: new Date(),
      }),

      // O arquivo físico no banco (BLOB)
      manager.save(ArquivoDocumentoEntity, {
        cdArquivoDocumento: nextIds.NEXT_ARQ,
        loArquivoDocumento: skymedArquivo.dadosPdf,
        tpExtensao: 'pdf',
        dsAutor: 'Skymed Integracao',
        dsOrigem: 'EXTERNO',
        dtDocumento: new Date(),
        dsNomeArquivo: vDsNomeArquivo,
      }),

      // Vínculo entre Arquivo e Atendimento
      manager.save(ArquivoAtendimentoEntity, {
        cdArquivoAtendimento: nextIds.NEXT_ARQ_ATEND,
        cdArquivoDocumento: nextIds.NEXT_ARQ,
        cdAtendimento: dadosAtendimento.cdAtendimento,
        dhCriacao: new Date(),
        nmUsuario: this.config.usuario,
        cdPaciente: dadosAtendimento.cdPaciente,
        cdPwTipoDocumento: this.config.tipoDoc,
        cdDocumentoClinico: nextIds.NEXT_DOC,
        cdStatusArquivoAtendimento: this.config.statusAtend,
        cdObjetoSelecionado: this.config.objeto,
      }),

      // Atualização do status na sua tabela de controle
      manager.update(
        ArquivoPdfEntity,
        { nomeArquivo },
        { idIntegracao: nextIds.NEXT_ARQ },
      ),
    ]);
  }

  async atualizarBlob(nomeArquivo: string, buffer: Buffer): Promise<void> {
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
        `Registro para o arquivo ${nomeArquivo} não encontrado no banco.`,
      );
    }
  }

  async buscarArquivosPendentes(): Promise<ArquivoPdfEntity[]> {
    return this.repo.find({
      where: { idIntegracao: IsNull() },
    });
  }
}
