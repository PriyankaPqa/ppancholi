import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { IHttpMock, mockHttp, GlobalHandler } from '../http-client';
import { AppointmentStaffMembersService } from './appointment-staff-members';

describe('>>> AppointmentStaffMembers Service', () => {
  let http: IHttpMock;
  let service: AppointmentStaffMembersService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new AppointmentStaffMembersService(http as never);
  });

  describe('search', () => {
    it('should call the proper endpoint', async () => {
      const params = { filter: { Foo: 'foo' } };
      await service.search(params);
      expect(http.get).toHaveBeenCalledWith('appointment/search/AppointmentStaffMembers', { params, isOData: true });
    });
  });

  describe('update', () => {
    it('should call the proper endpoint', async () => {
      const entity = mockAppointmentStaffMember();
      await service.updateStaffMembers(entity);
      expect(http.patch).toHaveBeenCalledWith(`www.test.com/appointment/AppointmentStaffMembers/${entity.id}`, entity, {
        globalHandler: GlobalHandler.Partial });
    });
  });
});
