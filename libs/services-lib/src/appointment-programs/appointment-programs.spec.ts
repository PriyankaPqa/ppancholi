import { AppointmentProgram, mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/src/appointment';
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

  describe('delete', () => {
    it('should call the proper endpoint', async () => {
      const id = 'id';
      await service.delete(id);
      expect(http.delete).toHaveBeenCalledWith(`www.test.com/appointment/appointment-programs/${id}`);
    });
  });

  describe('createServiceOption', () => {
    it('should call the proper endpoint', async () => {
      const serviceOption = mockServiceOption();
      await service.createServiceOption('program-id', serviceOption);
      expect(http.patch).toHaveBeenCalledWith('appointment/program-id/service-options', serviceOption);
    });
  });

  describe('updateServiceOption', () => {
    it('should call the proper endpoint', async () => {
      const serviceOption = mockServiceOption();
      await service.updateServiceOption('program-id', serviceOption);
      expect(http.patch).toHaveBeenCalledWith(`appointment/program-id/service-options/${serviceOption.id}`, serviceOption);
    });
  });

  describe('assignStaffMembers', () => {
    it('should call the proper endpoint', async () => {
      const payload = { serviceOptions: [{ serviceOptionId: 'id', staffMembers: ['sm-id'] }] };
      await service.assignStaffMembers('program-id', payload);
      expect(http.patch).toHaveBeenCalledWith('appointment/program-id/staff-members', payload);
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
