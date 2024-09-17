import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { IHttpMock, mockHttp } from '../http-client';
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
      expect(http.get).toHaveBeenCalledWith('appointment/search/appointment-staff-members', { params, isOData: true });
    });
  });

  describe('assignStaffMembers', () => {
    it('should call the proper endpoint with the right payload', async () => {
      const staffMembers = [{ userAccountId: mockAppointmentStaffMember().userAccountId,
        serviceOptionIds: mockAppointmentStaffMember().serviceOptionIds,
        appointmentProgramId: mockAppointmentStaffMember().appointmentProgramId }];
      await service.assignStaffMembers('id', staffMembers);
      expect(http.patch).toHaveBeenCalledWith('www.test.com/appointment/appointment-staff-members/assign-staff-members', {
        appointmentProgramId: 'id',
        staffMembers: [{ userAccountId: mockAppointmentStaffMember().userAccountId, serviceOptionIds: mockAppointmentStaffMember().serviceOptionIds }],
      });
    });
  });
});
