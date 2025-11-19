import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TypeOrmRepository } from './type-orm/type-orm.repository';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly typeOrmService: TypeOrmRepository,
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  private readonly logger = new Logger(AppService.name);
  private readonly jobName = 'salvarLaudosJob';

  onModuleInit() {
    const enabledEnv = this.config.get<string>('CRON_ENABLED');
    const enabled = enabledEnv?.toLowerCase() === 'true';
    const schedule =
      this.config.get<string>('CRON_SCHEDULE') ?? '0 */5 * * * *';
    // padrão: a cada 2 minutos

    const job = new CronJob(schedule, async () => {
      console.log(enabled);
      if (!enabled) {
        this.logger.debug('CRON desabilitado via CRON_ENABLED=false');
        return;
      }
      this.logger.log(`CRON disparado (expressão="${schedule}")`);
      try {
        const hoje = new Date();
        const seteDiasAtras = new Date(hoje);
        seteDiasAtras.setDate(hoje.getDate() - 30);
        const caminhos =
          await this.typeOrmService.salvarLaudosPorDataEmLote(seteDiasAtras);
        this.logger.log(`Laudos salvos: ${caminhos.length}`);
      } catch (err) {
        this.logger.error('Erro ao executar CRON de laudos', err.stack);
      }
    });

    this.schedulerRegistry.addCronJob(this.jobName, job);
    job.start();
    this.logger.log(
      `CRON "${this.jobName}" iniciado (schedule="${schedule}", enabled=${enabled})`,
    );
  }
  // opcional: expor métodos para ativar/desativar em runtime
  enable() {
    const job = this.schedulerRegistry.getCronJob(this.jobName);
    job.start();
    this.logger.log(`CRON ${this.jobName} habilitado em runtime`);
  }
  disable() {
    const job = this.schedulerRegistry.getCronJob(this.jobName);
    job.stop();
    this.logger.log(`CRON ${this.jobName} desabilitado em runtime`);
  }
}
