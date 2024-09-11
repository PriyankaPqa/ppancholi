import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';

export function getMockExtensionComponents() {
  const appointmentStaffMember = mockAppointmentStaffMember();

  return {
    updateStaffMembers: jest.fn(() => appointmentStaffMember),
  };
}
