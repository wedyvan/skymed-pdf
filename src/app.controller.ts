import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmRepository } from './type-orm/type-orm.repository';
import { Response } from 'express';
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly typeOrmService: TypeOrmRepository) {}

  @Get('insert-worklist')
  async insertWorklist() {
    return this.typeOrmService.insertWttWorklist();
  }

  @Get('postgres')
  async testePostgres() {
    return this.typeOrmService.getWorkListRequest();
  }

  @Get('users')
  async getUsers() {
    return this.typeOrmService.getUsers();
  }

  @Get('laudos-data')
  async getLaudosPorData(@Query('data') data: string) {
    const parsedDate = new Date(data);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Data inválida. Use o formato YYYY-MM-DD.');
    }

    return this.typeOrmService.getLaudosPorData(parsedDate);
  }

  @Get('lote')
  async baixarPdfLote(@Query('data') data: string, @Res() res: Response) {
    try {
      if (!data) {
        throw new HttpException('Parâmetros inválidos', HttpStatus.BAD_REQUEST);
      }

      const dataConvertida = new Date(data);

      if (isNaN(dataConvertida.getTime())) {
        throw new HttpException('Data inválida', HttpStatus.BAD_REQUEST);
      }

      const arquivosSalvos =
        await this.typeOrmService.salvarLaudosPorDataEmLote(dataConvertida);

      return res.status(200).json({
        mensagem: `${arquivosSalvos.length} arquivos processados.`,
        arquivos: arquivosSalvos,
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/salvar-pdf')
  async salvarPdf(@Param('id') id: number): Promise<{ caminho: string }> {
    const caminho = await this.typeOrmService.salvarPdfNoDisco(id);
    return { caminho };
  }

  @Get(':id/pdf')
  async getPdf(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.typeOrmService.getPdfById(Number(id));
    console.log('🚀 ~ AppController ~ getPdf ~ pdfBuffer:', pdfBuffer);

    if (!pdfBuffer) {
      // ainda não começou a resposta, então pode lançar exceção
      throw new NotFoundException('PDF não encontrado');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=laudo-${id}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(HttpStatus.OK).send(pdfBuffer);
    return res.send(pdfBuffer); // ou res.send(pdfBuffer)
  }

  @Get()
  async getMedicosPlantao(): Promise<any> {
    const resultado = await this.typeOrmService.getMedicosPlantao();
    return resultado;
  }
  @Get('/solicitacao-compra/:cdSolCom')
  async getSolicitacaoCompra(
    @Param('cdSolCom') cdSolCom: number,
  ): Promise<any> {
    const resultado = await this.typeOrmService.getSolicitacaoCompra(
      Number(cdSolCom),
    );
    return resultado;
  }
}
