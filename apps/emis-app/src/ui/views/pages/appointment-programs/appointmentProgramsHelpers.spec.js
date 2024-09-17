import { mockAppointmentProgram, mockServiceOption, mockAppointmentStaffMember } from '@libs/entities-lib/appointment';
import { Status } from '@libs/shared-lib/types';
import { useMockAppointmentStaffMemberStore } from '@/pinia/appointment-staff-member/appointment-staff-member.mock';
import { useMockAppointmentProgramStore } from '@/pinia/appointment-program/appointment-program.mock';
import helpers from './appointmentProgramsHelpers';

const { appointmentStaffMemberStore, pinia } = useMockAppointmentStaffMemberStore();
const { appointmentProgramStore } = useMockAppointmentProgramStore(pinia);

describe('appointmentProgramsHelper', () => {
  describe('mustHaveServiceOptions', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(helpers.mustHaveServiceOptions(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(helpers.mustHaveServiceOptions(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(helpers.mustHaveServiceOptions(program)).toBeFalsy();
    });
  });

  describe('canDeleteServiceOption', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(helpers.canDeleteServiceOption(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has multiple service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption(), mockServiceOption()] });
      expect(helpers.canDeleteServiceOption(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has only one service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption()] });
      expect(helpers.canDeleteServiceOption(program)).toBeFalsy();
    });
  });

  describe('canSetActiveStatus', () => {
    it('returns true if the status is inactive', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Inactive });
      expect(helpers.canSetActiveStatus(program)).toBeTruthy();
    });
    it('returns true if the status is active and the program has a service option with staff members', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [mockServiceOption({ staffMembers: ['1'] })] });
      expect(helpers.canSetActiveStatus(program)).toBeTruthy();
    });
    it('returns false if the status is active and the program has no service options', () => {
      const program = mockAppointmentProgram({ appointmentProgramStatus: Status.Active, serviceOptions: [] });
      expect(helpers.canSetActiveStatus(program)).toBeFalsy();
    });
  });

  describe('updateStaffMembers', () => {
    it('calls store method', async () => {
      const staffMembers = [mockAppointmentStaffMember({ userAccountId: 'u-1', serviceOptionIds: ['so-1'] })];
      const vue = { $toasted: { global: { success: jest.fn() } }, $t: jest.fn((x) => x) };
      await helpers.updateStaffMembers('appt-program-id', staffMembers, vue);
      expect(appointmentStaffMemberStore.assignStaffMembers).toHaveBeenCalledWith('appt-program-id', staffMembers);
      expect(vue.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.staffMember.updated.success');
    });

    it('shows error message if store call fails', async () => {
      const staffMembers = [mockAppointmentStaffMember({ userAccountId: 'u-1', serviceOptionIds: ['so-1'] })];
      appointmentStaffMemberStore.assignStaffMembers = jest.fn();
      const vue = { $toasted: { global: { error: jest.fn() } }, $t: jest.fn((x) => x) };
      await helpers.updateStaffMembers('id', staffMembers, vue);
      expect(vue.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.staffMember.updated.failed');
    });
  });

  describe('deleteServiceOption', () => {
    it(' shows an error when deleting the last service option', async () => {
      helpers.canDeleteServiceOption = jest.fn(() => false);
      const vue = { $t: jest.fn((x) => x), $message: jest.fn(), $confirm: jest.fn(() => true) };
      const so1 = mockServiceOption({ id: '1' });
      const program = mockAppointmentProgram();

      await helpers.deleteServiceOption(so1.id, program, vue);
      expect(vue.$message).toHaveBeenCalledWith({ title: 'common.error', message: 'appointmentProgram.serviceOption.deleteUniqueServiceOption.error' });
    });

    it('calls confirm and calls store delete and a success message is displayed', async () => {
      helpers.canDeleteServiceOption = jest.fn(() => true);
      const vue = { $toasted: { global: { success: jest.fn() } }, $t: jest.fn((x) => x), $message: jest.fn(), $confirm: jest.fn(() => true) };
      const so1 = mockServiceOption({ id: '1' });
      const program = mockAppointmentProgram();

      await helpers.deleteServiceOption(so1.id, program, vue);

      expect(vue.$confirm).toHaveBeenCalledWith({ title: 'appointmentProgram.serviceOption.confirm.delete.title',
        messages: 'appointmentProgram.serviceOption.confirm.delete.message' });
      expect(appointmentProgramStore.deleteServiceOption).toHaveBeenCalledWith(program.id, so1.id);
      expect(vue.$toasted.global.success).toHaveBeenCalledWith('appointmentProgram.serviceOption.delete.success');
    });

    it('displays an error message on store call error', async () => {
      helpers.canDeleteServiceOption = jest.fn(() => true);
      const vue = { $toasted: { global: { error: jest.fn() } }, $t: jest.fn((x) => x), $message: jest.fn(), $confirm: jest.fn(() => true) };
      const so1 = mockServiceOption({ id: '1' });
      const program = mockAppointmentProgram();
      appointmentProgramStore.deleteServiceOption = jest.fn();
      await helpers.deleteServiceOption(so1.id, program, vue);
      expect(vue.$toasted.global.error).toHaveBeenCalledWith('appointmentProgram.serviceOption.delete.error');
    });
  });
});
