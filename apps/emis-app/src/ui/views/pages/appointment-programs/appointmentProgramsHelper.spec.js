import { mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';
import { validateCanDeleteServiceOptionPolicy, validateMustHaveServiceOptionsPolicy, validateHasStaffMembersPolicy,
  validateCanSetActiveStatus } from './appointmentProgramsHelper';

describe('appointmentProgramsHelper', () => {
  describe('validateMustHaveServiceOptionsPolicy', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(validateMustHaveServiceOptionsPolicy(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(validateMustHaveServiceOptionsPolicy(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(validateMustHaveServiceOptionsPolicy(program)).toBeFalsy();
    });
  });

  describe('validateCanDeleteServiceOptionPolicy', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(validateCanDeleteServiceOptionPolicy(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has multiple service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption(), mockServiceOption()] });
      expect(validateCanDeleteServiceOptionPolicy(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has only one service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(validateCanDeleteServiceOptionPolicy(program)).toBeFalsy();
    });
  });

  describe('validateCanDeleteServivalidateHasStaffMembersPolicyceOptionPolicy', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(validateHasStaffMembersPolicy(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option with a staff member', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: ['1'] })] });
      expect(validateHasStaffMembersPolicy(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has service options without staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: [] })] });
      expect(validateHasStaffMembersPolicy(program)).toBeFalsy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(validateHasStaffMembersPolicy(program)).toBeFalsy();
    });
  });

  describe('validateCanSetActiveStatus', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(validateCanSetActiveStatus(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option with staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: ['1'] })] });
      expect(validateCanSetActiveStatus(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(validateCanSetActiveStatus(program)).toBeFalsy();
    });
    it('returns false if the status is active and the program has  service options without staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: [] })] });
      expect(validateCanSetActiveStatus(program)).toBeFalsy();
    });
  });
});
