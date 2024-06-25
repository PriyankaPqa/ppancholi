import { mockAppointment } from '@libs/entities-lib/appointment';
import { IHttpMock, mockHttp, GlobalHandler } from '../http-client';
import { AppointmentsService } from './appointments';

describe('>>> Appointments Service', () => {
  let http: IHttpMock;
  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AppointmentsService(http as never);
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('appointments/search/appointments', { params, isOData: true });
    });
  });

  describe('create', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAppointment();
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith(`www.test.com/appointments/appointments/${entity.id}`, entity);
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAppointment();
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/appointments/appointments/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial });
    });
  });
});
