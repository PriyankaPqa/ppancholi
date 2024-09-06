import { mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';
import { canDeleteServiceOption, mustHaveServiceOptions, mustHaveStaffMembers,
  canSetActiveStatus } from './appointmentProgramsHelper';

describe('appointmentProgramsHelper', () => {
  describe('mustHaveServiceOptions', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(mustHaveServiceOptions(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(mustHaveServiceOptions(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(mustHaveServiceOptions(program)).toBeFalsy();
    });
  });

  describe('canDeleteServiceOption', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(canDeleteServiceOption(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has multiple service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption(), mockServiceOption()] });
      expect(canDeleteServiceOption(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has only one service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(canDeleteServiceOption(program)).toBeFalsy();
    });
  });

  describe('validateCanDeleteServivalidateHasStaffMembersPolicyceOptionPolicy', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(mustHaveStaffMembers(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option with a staff member', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: ['1'] })] });
      expect(mustHaveStaffMembers(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has service options without staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: [] })] });
      expect(mustHaveStaffMembers(program)).toBeFalsy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(mustHaveStaffMembers(program)).toBeFalsy();
    });
  });

  describe('canSetActiveStatus', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(canSetActiveStatus(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option with staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: ['1'] })] });
      expect(canSetActiveStatus(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(canSetActiveStatus(program)).toBeFalsy();
    });
    it('returns false if the status is active and the program has  service options without staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: [] })] });
      expect(canSetActiveStatus(program)).toBeFalsy();
    });
  });
});
