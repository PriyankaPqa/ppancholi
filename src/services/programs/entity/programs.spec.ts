/**
 * @group services
 */

import { mockProgramEntity } from '@/entities/program';
import { IHttpMock, mockHttp } from '@/services/httpClient.mock';
import { ProgramsService } from './programs';

describe('>>> Programs service', () => {
  let http: IHttpMock;
  let service: ProgramsService;

  beforeEach(() => {
    process.env.VUE_APP_API_BASE_URL = 'www.test.com';
    jest.clearAllMocks();
    http = mockHttp();
    service = new ProgramsService(http as never);
  });

  describe('createProgram', () => {
    it('is linked to the correct url', async () => {
      const entity = mockProgramEntity();
      await service.createProgram(entity);
      expect(http.post).toHaveBeenCalledWith(`www.test.com/event/events/${entity.eventId}/programs`, expect.anything(), { globalHandler: false });
    });
  });

  describe('updateProgram', () => {
    it('is linked to the correct url', async () => {
      const entity = mockProgramEntity();
      await service.updateProgram(entity);
      expect(http.patch)
        .toHaveBeenCalledWith(`www.test.com/event/events/${entity.eventId}/programs/${entity.id}`, expect.anything(), { globalHandler: false });
    });
  });
});
