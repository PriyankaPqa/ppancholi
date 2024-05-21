import { mockAppointmentProgram } from '@libs/entities-lib/src/appointment';
import { IHttpMock, mockHttp, GlobalHandler } from '../http-client';
import { AppointmentProgramsService } from './appointment-programs';

describe('>>> Appointment Programs Service', () => {
  let http: IHttpMock;
  let service: AppointmentProgramsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AppointmentProgramsService(http as never);
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('appointments/search/appointment-programs', { params, isODataSql: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAppointmentProgram();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith(`www.test.com/appointments/appointment-programs/${entity.id}`, entity);
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAppointmentProgram();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/appointments/appointment-programs/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial });
    });
  });
});
