import { mockAppointmentStaffMember } from '@libs/entities-lib/appointment';

export function getMockExtensionComponents() {
  const appointmentStaffMember = mockAppointmentStaffMember();

  return {
    assignStaffMembers: jest.fn(() => [appointmentStaffMember]),
  };
}
