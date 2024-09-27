import { mockAppointmentProgram, mockServiceOption } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';
import { canDeleteServiceOption, validServiceOptionsCount, canSetActiveStatus } from './appointmentProgramsHelper';

describe('appointmentProgramsHelper', () => {
  describe('validServiceOptionsCount', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(validServiceOptionsCount(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(validServiceOptionsCount(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(validServiceOptionsCount(program)).toBeFalsy();
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
  });
});
