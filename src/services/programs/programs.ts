import { ICreateProgramRequest, IProgram, IProgramData } from '@/entities/program';
import { IHttpClient } from '../httpClient';
import { IProgramsService } from './programs.types';

export class ProgramsService implements IProgramsService {
  constructor(private readonly http: IHttpClient) {}

  async createProgram(program: IProgram): Promise<IProgramData> {
    program.fillEmptyMultilingualAttributes();
    const payload = this.programToCreateProgramRequestPayload(program);
    return this.http.post('/event/programs', payload, { globalHandler: false });
  }

  private programToCreateProgramRequestPayload(program: IProgram): ICreateProgramRequest {
    const payload: ICreateProgramRequest = {
      name: program.name,
      description: program.description,
      eventId: program.eventId,
      paymentModalities: program.paymentModalities,
      eligibilityCriteria: program.eligibilityCriteria,
      approvalRequired: program.approvalRequired,
      programStatus: program.programStatus,
    };

    return payload;
  }
}
