import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientsService } from 'src/clients/clients.service';
import { ReportCategory } from './categories/reportCategory.model';
import { Report } from './report.model';
import { ReportStatus } from './statuses/reportStatus.model';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    @Inject('REPORTS_REPOSITORY') private reportsRepository: typeof Report,
    @Inject('REPORTS_STATUS_REPOSITORY') private reportStatusRepository: typeof ReportStatus,
    @Inject('REPORTS_CATEGORY_REPOSITORY') private reportCategoryRepository: typeof ReportCategory,
    private clientsService: ClientsService,
  ) { }

  async createReport(averieDto, clientId: number) {
    try {
      this.logger.debug("Creando nuevo reporte de averia");
      const client = await this.clientsService.getClientById(clientId);
      if (!client) {
        throw new HttpException("Hay un problema con la cédula ingresada", HttpStatus.BAD_REQUEST);
      }

      const category: ReportCategory = await this.reportCategoryRepository.findByPk(averieDto.categoryId);
      if (!category) {
        throw new HttpException("La categoria seleccionada no existe", HttpStatus.NOT_FOUND);
      }

      const newReport: Report = await this.reportsRepository.create({
        message: averieDto.message,
        priorityLevel: category.defaultPriorityLevel,
      });
      await newReport.$set('client', client)
      await newReport.$set('category', category);
      await newReport.$set('status', 1);

      return newReport;
    } catch (err) {
      throw err;
    }
  };


  async updateReport(reportId: number, reportDto) {
    Logger.debug("Searching report by Id");
    const report = await this.reportsRepository.findByPk(reportId);
    if (!report) {
      throw new HttpException('No se ha encontrado el reporte que desea actualizar', HttpStatus.NOT_FOUND)
    }
    Logger.debug("Assigning values to found report");

    report.supportMessageInner = reportDto.supportMessageInner;
    report.supportMessageForClient = reportDto.supportMessageForClient;
    report.statusId = reportDto.categoryId;
    report.priorityLevel = reportDto.priorityLevel;
    report.categoryId = reportDto.statusId;
    Logger.debug("Asignando updatedBy");

    await report.save();

    return report;

  };


}
