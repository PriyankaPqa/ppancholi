import { AppointmentProgram, mockAppointmentProgram } from '@libs/entities-lib/src/appointment';
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
      expect(http.get).toHaveBeenCalledWith('appointment/search/appointment-programs', { params, isOData: true });
    });
  });

  describe('create', () => {
    it('should create the proper payload', async () => {
      const entity = new AppointmentProgram(mockAppointmentProgram({ name: { translation: { en: 'mock-en' } } }));
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith(
`www.test.com/appointment/appointment-programs/${entity.id}`,
         mockAppointmentProgram({ name: { translation: { en: 'mock-en', fr: 'mock-en' } } }),
{
        globalHandler: GlobalHandler.Partial },
);
    });

    it('should call the proper endpoint', async () => {
      const entity = new AppointmentProgram(mockAppointmentProgram());
      await service.create(entity);
      expect(http.post).toHaveBeenCalledWith(`www.test.com/appointment/appointment-programs/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial });
    });
  });

  describe('update', () => {
    it('should create the proper payload', async () => {
      const entity = new AppointmentProgram(mockAppointmentProgram({ name: { translation: { en: 'mock-en' } } }));
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(
`www.test.com/appointment/appointment-programs/${entity.id}`,
         mockAppointmentProgram({ name: { translation: { en: 'mock-en', fr: 'mock-en' } } }),
{
        globalHandler: GlobalHandler.Partial },
);
    });
    it('should call the proper endpoint', async () => {
      const entity = new AppointmentProgram(mockAppointmentProgram());
      await service.update(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/appointment/appointment-programs/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial });
    });
  });

  describe('setAppointmentProgramStatus', () => {
    it('should call the proper endpoint', async () => {
      const entity = new AppointmentProgram(mockAppointmentProgram());
      await service.setAppointmentProgramStatus(entity.id, entity.appointmentProgramStatus, 'rationale');
      expect(http.patch).toHaveBeenCalledWith(
`appointment/${entity.id}/appointment-program-status`,
        { appointmentProgramStatus: entity.appointmentProgramStatus, rationale: 'rationale' },
);
    });
  });
});
