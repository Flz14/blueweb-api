import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JoiValidationPipe } from 'src/utils/JoiValidationPipe';
import { getPagination } from 'src/utils/paginationService';
import { ClientsService } from './clients.service';
import { createClientDto } from './dto/create-client.dto';
import { clientSchema } from './validator/clients.validator';

@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) { }

  @Post()
  @UsePipes(new JoiValidationPipe(clientSchema, false))
  async create(@Body() createClient: createClientDto) {
    return this.clientsService.createClient(createClient);
  }

  @Get()
  async getAll(@Query() query) {
    const { page, size } = query;
    const condition = null;

    let { limit, offset } = getPagination(page, size);

    return this.clientsService.getAllClients(condition, limit, offset, page);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getSelfClient(
    @Request() req) {
    const { clientId } = req.user;
    return this.clientsService.getClientById(clientId);
  }

  @Get(':clientId')
  async getClientById(
    @Param() params) {
    const { clientId } = params;
    return this.clientsService.getClientById(clientId);
  }

  @Put(':clientId')
  async updateClient(
    @Param() params,
    @Body(new JoiValidationPipe(clientSchema, true)) updateClient: createClientDto) {

    const { clientId } = params;
    return this.clientsService.updateClient(
      {
        names: updateClient.names,
        lastNames: updateClient.lastNames,
        address: updateClient.address,
        city: updateClient.city,
        dni: updateClient.dni,
        state: updateClient.state,
        phone: updateClient.phone,
        isEnterprise: updateClient.isEnterprise,
        municipality: updateClient.municipality,
        identification: updateClient.identification,
        email: updateClient.email
      },
      clientId
    );
  };
}
