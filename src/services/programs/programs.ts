import {
  ICreateProgramRequest, IProgram, IProgramData, IProgramSearchData,
} from '@/entities/program';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IHttpClient } from '../httpClient';
import { IProgramsService } from './programs.types';

export class ProgramsService implements IProgramsService {
  constructor(private readonly http: IHttpClient) {}

  async createProgram(program: IProgram): Promise<IProgramData> {
    program.fillEmptyMultilingualAttributes();
    const payload = this.programToCreateProgramRequestPayload(program);
    return this.http.post('/event/programs', payload, { globalHandler: false });
  }

  async searchPrograms(params: IAzureSearchParams): Promise<IAzureSearchResult<IProgramSearchData>> {
    return this.http.get('/search/program-projections', { params, isOData: true });
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
