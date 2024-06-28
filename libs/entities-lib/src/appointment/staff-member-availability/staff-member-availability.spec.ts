import { StaffMemberAvailability } from './staff-member-availability';
import { mockStaffMemberAvailability } from './staff-member-availability.mock';

const mockData = mockStaffMemberAvailability();

  describe('>>> StaffMemberAvailability', () => {
    describe('>> constructor', () => {
      describe('instantiate when data is passed', () => {
        it('should instantiate info', () => {
          const item = new StaffMemberAvailability(mockData);

          expect(item.staffMemberId).toEqual(mockData.staffMemberId);
          expect(item.appointmentProgramId).toEqual(mockData.appointmentProgramId);
          expect(item.useBusinessHours).toEqual(mockData.useBusinessHours);
          expect(item.serviceOptionIds).toEqual(mockData.serviceOptionIds);
          expect(item.defaultbusinessHours).toEqual(mockData.defaultbusinessHours);
          expect(item.customDateRanges).toEqual(mockData.customDateRanges);
        });

        it('should instantiate on empty', () => {
          const item = new StaffMemberAvailability();

          expect(item.staffMemberId).toEqual(null);
          expect(item.appointmentProgramId).toEqual(null);
          expect(item.useBusinessHours).toEqual(null);
          expect(item.serviceOptionIds).toEqual([]);
          expect(item.defaultbusinessHours).toEqual([]);
          expect(item.customDateRanges).toEqual([]);
        });
      });
    });
});
