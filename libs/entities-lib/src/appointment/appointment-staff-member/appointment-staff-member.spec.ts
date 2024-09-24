import { AppointmentStaffMember } from './appointment-staff-member';
import { mockAppointmentStaffMember } from './appointment-staff-member.mock';

const mockData = mockAppointmentStaffMember();

  describe('>>> StaffMemberAvailability', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new AppointmentStaffMember(mockData);

          expect(item.userAccountId).toEqual(mockData.userAccountId);
          expect(item.appointmentProgramId).toEqual(mockData.appointmentProgramId);
          expect(item.useBusinessHours).toEqual(mockData.useBusinessHours);
          expect(item.serviceOptionIds).toEqual(mockData.serviceOptionIds);
          expect(item.defaultbusinessHours).toEqual(mockData.defaultbusinessHours);
          expect(item.customDateRanges).toEqual(mockData.customDateRanges);
        });

        it('should instantiate on empty', () => {
          const item = new AppointmentStaffMember();

          expect(item.userAccountId).toEqual(null);
          expect(item.appointmentProgramId).toEqual(null);
          expect(item.useBusinessHours).toEqual(null);
          expect(item.serviceOptionIds).toEqual([]);
          expect(item.defaultbusinessHours).toEqual([]);
          expect(item.customDateRanges).toEqual([]);
        });
      });
    });
});
