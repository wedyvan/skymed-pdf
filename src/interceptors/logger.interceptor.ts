import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { Observable, catchError, tap, throwError } from 'rxjs';
import * as dns from 'dns';
import { promisify } from 'util';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);
  private readonly reverseDns = promisify(dns.reverse);
  private readonly dnsCache = new Map<string, string>();

  private sanitizeBody(body: any): any {
    const sanitizedBody = { ...body };
    delete sanitizedBody.password;
    delete sanitizedBody.email;
    return sanitizedBody;
  }

  private removeSufixo(hostname: string): string {
    return hostname.replace(/\.mundo\.unimedvitoria\.com\.br$/, '');
  }

  private async getHostname(ip: string): Promise<string> {
    if (this.dnsCache.has(ip)) {
      return this.dnsCache.get(ip);
    }

    try {
      const hostnames = await this.reverseDns(ip);
      if (hostnames && hostnames.length > 0) {
        const hostname = this.removeSufixo(hostnames[0]);
        this.dnsCache.set(ip, hostname);
        return hostname;
      }
    } catch (err) {
      this.logger.warn(
        `Erro ao resolver o hostname para o IP ${ip}: ${err.message}`,
      );
    }

    return 'Hostname não resolvido';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    this.logRequest(req);

    return next.handle().pipe(
      tap((data) => {
        const executionTime = Date.now() - startTime;
        this.logger.debug({
          message: 'Resposta enviada pelo controlador',
          timestamp: new Date().toISOString(),
          method: req.method,
          route: req.route?.path || 'Rota não definida',
          status: res.statusCode,
          executionTime: `${executionTime}ms`,
          //result: data,
        });
      }),
      catchError((error) => {
        const executionTime = Date.now() - startTime;
        this.logger.error({
          message: 'Erro na requisição',
          timestamp: new Date().toISOString(),
          method: req.method,
          route: req.route?.path || 'Rota não definida',
          status: res.statusCode,
          executionTime: `${executionTime}ms`,
          error: error.message,
        });

        // Capturar e registrar erros de validação do Zod
        if (error instanceof ZodValidationException) {
          this.logger.error('Erro de validação:', error.getZodError().format());
        }

        return throwError(() => error);
      }),
    );
  }

  private async logRequest(req: Request): Promise<void> {
    const { query, params, method, ip, body, route } = req;
    const cleanedIp = ip.replace(/^::ffff:/, '');
    const sanitizedBody = this.sanitizeBody(body);
    const hostname = await this.getHostname(cleanedIp);

    this.logger.log({
      message: 'Requisição HTTP recebida',
      timestamp: new Date().toISOString(),
      method,
      route: route?.path || 'Rota não definida',
      data: {
        body: sanitizedBody,
        query,
        params,
      },
      from: {
        ip: cleanedIp,
        hostname,
      },
    });
  }
}
