import { shallowMount, createLocalVue } from '@/test/testSetup';
import {
  ApprovalTableEntity, mockApprovalTableData, mockApprovalTableEntity,
} from '@libs/entities-lib/approvals/approvals-table';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import routes from '@/constants/routes';
import { mockProgramEntities, mockProgramEntity } from '@libs/entities-lib/program';
import _sortBy from 'lodash/sortBy';
import { Status } from '@libs/entities-lib/base';
import { mockApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import helpers from '@/ui/helpers/helpers';
import { mockServerError } from '@libs/services-lib/http-client';
import { mockProvider } from '@/services/provider';
import { useMockApprovalTableStore } from '@/pinia/approval-table/approval-table.mock';
import Component from './CreateEditApprovals.vue';

const localVue = createLocalVue();
const services = mockProvider();
let wrapper;
const { pinia, approvalTableStore } = useMockApprovalTableStore();

const doMount = async (tableMode = true, editMode = false, availablePrograms = null) => {
  const options = {
    localVue,
    pinia,
    data: () => ({
      roles: mockRoles(),
      programs: mockProgramEntities(),
    }),
    computed: {
      isTableMode: () => tableMode,
      isEditMode: () => editMode,
      eventId: () => 'eventId',
    },
    mocks: {
      $services: services,
    },
  };

  if (availablePrograms) {
    options.computed = {
      ...options.computed,
      availablePrograms: () => availablePrograms,
    };
  }
  wrapper = shallowMount(Component, options);
  await wrapper.vm.$nextTick();
};

describe('CreateEditApprovals', () => {
  describe('Computed', () => {
    describe('rules', () => {
      it('should return correct rules', () => {
        doMount();
        expect(wrapper.vm.rules).toEqual({
          name: {
            required: true,
            max: MAX_LENGTH_MD,
            customValidator: { isValid: wrapper.vm.isNameUnique, messageKey: 'validations.alreadyExists' },
          },
          program: {
            required: true,
          },
          aggregatedBy: {
            required: true,
          },
        });
      });
    });

    describe('title', () => {
      it('should return correct in create table mode', () => {
        doMount(true, false);
        expect(wrapper.vm.title).toEqual('approvals.create_table');
      });

      it('should return correct in edit table mode', () => {
        doMount(true, true);
        expect(wrapper.vm.title).toEqual('approvals.edit_table');
      });

      it('should return correct in create template mode', () => {
        doMount(false, false);
        expect(wrapper.vm.title).toEqual('approvals.create_template');
      });

      it('should return correct in edit template mode', () => {
        doMount(false, true);
        expect(wrapper.vm.title).toEqual('approvals.edit_template');
      });
    });

    describe('supportedLanguages', () => {
      it('should return correct languages', () => {
        doMount();
        expect(wrapper.vm.supportedLanguages).toEqual([{ key: 'en', name: 'English' }, { key: 'fr', name: 'Français' }]);
      });
    });

    describe('isTableMode', () => {
      it('should return true if route is create table', () => {
        const options = {
          localVue,
          data: () => ({
            roles: mockRoles(),
          }),
          mocks: {
            $route: {
              name: routes.events.approvals.create.name,
            },
            $services: services,
          },
        };
        wrapper = shallowMount(Component, options);
        expect(wrapper.vm.isTableMode).toBe(true);
      });

      it('should return true if route is edit table', () => {
        const options = {
          localVue,
          data: () => ({
            roles: mockRoles(),
          }),
          mocks: {
            $route: {
              name: routes.events.approvals.edit.name,
            },
            $services: services,
          },
        };
        wrapper = shallowMount(Component, options);
        expect(wrapper.vm.isTableMode).toBe(true);
      });
    });

    describe('getStatusClasses', () => {
      it('should return correct class for status active', async () => {
        doMount();
        await wrapper.setData({
          isActive: true,
        });
        expect(wrapper.vm.getStatusClasses).toEqual('status_success white--text');
      });

      it('should return correct class for status inactive', async () => {
        doMount();
        await wrapper.setData({
          isActive: false,
        });
        expect(wrapper.vm.getStatusClasses).toEqual('grey lighten-3 black--text');
      });
    });

    describe('availablePrograms', () => {
      describe('Create mode', () => {
        it('should return active programs listed alphabetically not already used in an approval table', async () => {
          services.programs.getAllIncludingInactive = jest.fn();
          const options = {
            localVue,
            data: () => ({
              roles: mockRoles(),
              tablesForCurrentEvent: [{ programId: '10' }],
              programs: [
                mockProgramEntity({ id: '10' }),
                mockProgramEntity({ id: '11' }),
                mockProgramEntity({ id: '12' }),
              ],
            }),
            computed: {
              isTableMode: () => true,
              isEditMode: () => false,
            },
            mocks: {
              $services: services,
            },
          };
          wrapper = shallowMount(Component, options);

          const expectedPrograms = [
            mockProgramEntity({ id: '11' }),
            mockProgramEntity({ id: '12' }),
          ];

          expect(wrapper.vm.availablePrograms).toEqual(_sortBy(expectedPrograms, (program) => wrapper.vm.$m(program.name)));
        });

        it('should return active programs listed alphabetically if no used programs', async () => {
          services.programs.getAllIncludingInactive = jest.fn();
          const options = {
            localVue,
            data: () => ({
              roles: mockRoles(),
              tablesForCurrentEvent: [],
              programs: [
                mockProgramEntity({ id: '10', status: Status.Inactive }),
                mockProgramEntity({ id: '11' }),
                mockProgramEntity({ id: '12' }),
              ],
            }),
            computed: {
              isTableMode: () => true,
              isEditMode: () => false,
            },
            mocks: {
              $services: services,
            },
          };
          wrapper = shallowMount(Component, options);

          const expectedPrograms = [
            mockProgramEntity({ id: '11' }),
            mockProgramEntity({ id: '12' }),
          ];

          expect(wrapper.vm.availablePrograms).toEqual(_sortBy(expectedPrograms, (program) => wrapper.vm.$m(program.name)));
        });
      });

      describe('Edit Mode', () => {
        it('should return active programs listed alphabetically not already used or the current one even if inactive', async () => {
          services.programs.getAllIncludingInactive = jest.fn();
          const options = {
            localVue,
            data: () => ({
              backupUpperForm: {
                programId: '11',
              },
              roles: mockRoles(),
              tablesForCurrentEvent: [{ programId: '10' }],
              programs: [
                mockProgramEntity({ id: '10' }),
                mockProgramEntity({ id: '11', status: Status.Inactive }),
                mockProgramEntity({ id: '12' }),
              ],
            }),
            computed: {
              isTableMode: () => true,
              isEditMode: () => true,
            },
            mocks: {
              $services: services,
            },
          };
          wrapper = shallowMount(Component, options);

          const expectedPrograms = [
            mockProgramEntity({ id: '11', status: Status.Inactive }),
            mockProgramEntity({ id: '12' }),
          ];

          expect(wrapper.vm.availablePrograms).toEqual(_sortBy(expectedPrograms, (program) => wrapper.vm.$m(program.name)));
        });
      });
    });

    describe('disabledStatus', () => {
      it('should false if no program selected', async () => {
        doMount();
        await wrapper.setData({
          selectedProgram: null,
        });
        expect(wrapper.vm.disabledStatus).toEqual(false);
      });

      it('should false if active program selected ', async () => {
        doMount();
        await wrapper.setData({
          selectedProgram: mockProgramEntity({ status: Status.Active }),
        });
        expect(wrapper.vm.disabledStatus).toEqual(false);
      });

      it('should true if inactive program selected ', async () => {
        doMount();
        await wrapper.setData({
          selectedProgram: mockProgramEntity({ status: Status.Inactive }),
        });
        expect(wrapper.vm.disabledStatus).toEqual(true);
      });
    });

    describe('approvalHasGroups', () => {
      it('should return true if approval has groups', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity() });
        expect(wrapper.vm.approvalHasGroups).toEqual(true);
      });
      it('should return false if approval does not have groups', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [] }) });
        expect(wrapper.vm.approvalHasGroups).toEqual(false);
      });
    });

    describe('currentlyEditingGroup', () => {
      it('should return true if a group is being edited', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [mockApprovalGroup({ editMode: true })] }) });
        expect(wrapper.vm.currentlyEditingGroup).toEqual(true);
      });
      it('should return false otherwise', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [mockApprovalGroup({ editMode: false })] }) });
        expect(wrapper.vm.currentlyEditingGroup).toEqual(false);
      });
    });

    describe('changesInEdit', () => {
      it('should return true if current approval differs from the backup', async () => {
        doMount(true, true);
        const approval = mockApprovalTableData();
        wrapper.vm.createBackupApproval(approval);
        await wrapper.setData({ approval });
        wrapper.vm.approval.name.translation.en = 'Change';
        expect(wrapper.vm.changesInEdit).toEqual(true);
      });
    });

    it('should return false if not in table mode', async () => {
      doMount(false, true);
      expect(wrapper.vm.changesInEdit).toEqual(false);
    });
  });

  describe('Methods', () => {
    describe('loadEventPrograms', () => {
      it('should set programs with active programs for current event', async () => {
        doMount();
        wrapper.vm.$services.programs.getAllIncludingInactive = jest.fn(() => ['1']);
        await wrapper.vm.loadEventPrograms('1');
        expect(wrapper.vm.programs).toEqual(['1']);
      });
    });

    describe('loadEventTables', () => {
      it('should set tablesForCurrentEvent with tables linked to current event', async () => {
        doMount();
        wrapper.vm.$services.approvalTables.getApprovalsTableByEventId = jest.fn(() => ['1']);
        await wrapper.vm.loadEventTables('1');
        expect(wrapper.vm.tablesForCurrentEvent).toEqual(['1']);
      });
    });

    describe('submit', () => {
      it('should scroll to first error if not valid', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity() });
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        helpers.scrollToFirstError = jest.fn();
        await wrapper.vm.submit();
        expect(helpers.scrollToFirstError).toHaveBeenCalledWith('scrollAnchor');
      });
      describe('Create mode', () => {
        it('should call createTable if valid and isTableMode', async () => {
          doMount();
          await wrapper.setData({ approval: mockApprovalTableEntity() });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.createTable = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.createTable).toBeCalled();
        });

        it('should call createTemplate if valid and not isTableMode', async () => {
          doMount(false);
          await wrapper.setData({ approval: mockApprovalTableEntity() });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.createTemplate = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.createTemplate).toBeCalled();
        });

        it('should set showNoGroupErr to true when there is no group', async () => {
          doMount(true);
          await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [] }) });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          await wrapper.vm.submit();
          expect(wrapper.vm.showNoGroupErr).toEqual(true);
        });
      });

      describe('Edit mode', () => {
        it('should call editTable if valid and isTableMode', async () => {
          doMount(true, true);
          await wrapper.setData({ approval: mockApprovalTableEntity() });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.editTable = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.editTable).toBeCalled();
        });

        it('should call editTemplate if valid and not isTableMode', async () => {
          doMount(false, true);
          await wrapper.setData({ approval: mockApprovalTableEntity() });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.editTemplate = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.editTemplate).toBeCalled();
        });
      });
    });

    describe('createTable', () => {
      it('should fill empty multilingual values', async () => {
        doMount();
        wrapper.vm.approval.fillEmptyMultilingualAttributes = jest.fn();
        await wrapper.vm.createTable();
        expect(wrapper.vm.approval.fillEmptyMultilingualAttributes).toBeCalled();
      });

      it('should create the approval table', async () => {
        doMount();
        await wrapper.vm.createTable();
        expect(approvalTableStore.createApprovalTable).toHaveBeenCalledWith(wrapper.vm.approval);
      });

      it('should redirect to event approvals home page', async () => {
        doMount();
        await wrapper.vm.createTable();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.approvals.home.name });
      });

      it('should call handleSubmitError in case of error', async () => {
        doMount();
        wrapper.vm.handleSubmitError = jest.fn();
        approvalTableStore.createApprovalTable = jest.fn(() => Promise.reject(mockServerError()));
        await wrapper.vm.createTable();
        expect(wrapper.vm.handleSubmitError).toBeCalled();
      });
    });

    describe('setLanguageMode', () => {
      it('should set languageMode', () => {
        doMount();
        wrapper.vm.fillEmptyMultilingualAttributes = jest.fn();
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.languageMode).toEqual('fr');
      });

      it('should call fillEmptyMultilingualAttributes', () => {
        doMount();
        wrapper.vm.approval.fillEmptyMultilingualAttributes = jest.fn();
        wrapper.vm.setLanguageMode('fr');
        expect(wrapper.vm.approval.fillEmptyMultilingualAttributes).toBeCalled();
      });
    });

    describe('cancel', () => {
      it('should redirect to event approvals home page if table mode', () => {
        doMount(true);
        wrapper.vm.cancel();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.approvals.home.name });
      });
    });

    describe('setApprovalStatus', () => {
      it('should set approvalBaseStatus to active is param is true', () => {
        doMount();
        wrapper.vm.setApprovalStatus(true);
        expect(wrapper.vm.approval.approvalBaseStatus).toEqual(Status.Active);
      });

      it('should set approvalBaseStatus to inactive is param is false', () => {
        doMount();
        wrapper.vm.setApprovalStatus(false);
        expect(wrapper.vm.approval.approvalBaseStatus).toEqual(Status.Inactive);
      });
    });

    describe('setProgram', () => {
      it('should set selectedProgram', () => {
        doMount();
        wrapper.vm.setProgram(mockProgramEntity());
        expect(wrapper.vm.selectedProgram).toEqual(mockProgramEntity());
      });

      it('should call setProgramId with program id', () => {
        doMount();
        wrapper.vm.approval.setProgramId = jest.fn();
        wrapper.vm.setProgram(mockProgramEntity());
        expect(wrapper.vm.approval.setProgramId).toBeCalledWith(mockProgramEntity().id);
      });
    });

    describe('loadProgramsAndEventTables', () => {
      it('should call loadEventPrograms', async () => {
        doMount();
        wrapper.vm.loadEventPrograms = jest.fn();
        await wrapper.vm.loadProgramsAndEventTables();
        expect(wrapper.vm.loadEventPrograms).toBeCalled();
      });

      it('should call loadEventTables', async () => {
        doMount();
        wrapper.vm.loadEventTables = jest.fn();
        await wrapper.vm.loadProgramsAndEventTables();
        expect(wrapper.vm.loadEventTables).toBeCalled();
      });
    });

    describe('initTableDataCreate', () => {
      it('should init empty approval with eventId', async () => {
        doMount(true, false);
        await wrapper.vm.initTableDataCreate();
        const approval = new ApprovalTableEntity();
        approval.eventId = 'eventId';
        expect(wrapper.vm.approval).toEqual(approval);
      });

      it('should call loadProgramsAndEventTables', async () => {
        doMount(true, false);
        wrapper.vm.loadProgramsAndEventTables = jest.fn();
        await wrapper.vm.initTableDataCreate();
        expect(wrapper.vm.loadProgramsAndEventTables).toBeCalled();
      });
    });

    describe('initTableDataEdit', () => {
      it('should init approval with approval being edited', async () => {
        doMount(true, true);
        await wrapper.vm.initTableDataEdit();
        const approval = mockApprovalTableEntity(); // return by fetch by default
        approval.eventId = 'eventId';
        expect(wrapper.vm.approval).toEqual(approval);
      });

      it('should call loadProgramsAndEventTables', async () => {
        doMount(true, true);
        wrapper.vm.loadProgramsAndEventTables = jest.fn();
        await wrapper.vm.initTableDataEdit();
        expect(wrapper.vm.loadProgramsAndEventTables).toBeCalled();
      });

      it('should create a backup of the form to know the state of editing', async () => {
        doMount(true, true);
        const approval = mockApprovalTableEntity(); // return by fetch by default
        await wrapper.vm.initTableDataEdit();
        expect(wrapper.vm.backupUpperForm).toMatchObject({
          name: approval.name,
          programId: approval.programId,
          aggregatedByType: approval.aggregatedByType,
          approvalBaseStatus: approval.approvalBaseStatus,
        });
      });

      it('should set selectedProgram', async () => {
        const fakeProgram = { id: mockApprovalTableEntity().programId };
        doMount(true, true, [fakeProgram]);
        await wrapper.vm.initTableDataEdit();
        expect(wrapper.vm.selectedProgram).toEqual(fakeProgram);
      });

      it('should set isActive depending on approvalBaseStatus', async () => {
        const combinedApproval = { entity: mockApprovalTableEntity({ approvalBaseStatus: Status.Inactive }), metadata: {}, pinned: false };
        await doMount(true, true, []);
        wrapper.vm.combinedApprovalTableStore.fetch = jest.fn(() => combinedApproval);
        await wrapper.vm.initTableDataEdit();
        expect(wrapper.vm.isActive).toEqual(false);
      });
    });

    describe('editTable', () => {
      it('should edit the table', async () => {
        doMount();
        await wrapper.vm.editTable();
        expect(approvalTableStore.editApprovalTable).toBeCalledWith(wrapper.vm.approval);
      });
    });

    describe('createBackupApproval', () => {
      it('should set backupUpperForm', () => {
        doMount();
        const approval = mockApprovalTableData();
        expect(wrapper.vm.backupUpperForm).toBe(null);
        wrapper.vm.createBackupApproval(approval);
        expect(wrapper.vm.backupUpperForm).toEqual({
          name: approval.name,
          programId: approval.programId,
          aggregatedByType: approval.aggregatedByType,
          approvalBaseStatus: approval.approvalBaseStatus,
        });
      });
    });

    describe('refreshApproval', () => {
      it('should update the approval with a new entity after the edit', () => {
        doMount(true, true);
        const approval = mockApprovalTableData({ id: '1234' });
        wrapper.vm.refreshApproval(approval);
        expect(wrapper.vm.approval).toMatchObject(approval);
      });
    });
  });

  describe('Watcher', () => {
    describe('status', () => {
      it('should call setApprovalStatus', async () => {
        doMount();
        wrapper.vm.setApprovalStatus = jest.fn();
        await wrapper.setData({
          isActive: false,
        });
        expect(wrapper.vm.setApprovalStatus).toBeCalledWith(false);
      });
    });
  });

  describe('Created', () => {
    describe('Table Mode', () => {
      it('should call initTableDataEdit in edit mode', async () => {
        doMount(true, true);
        wrapper.vm.initTableDataEdit = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initTableDataEdit).toBeCalled();
      });

      it('should call initTableDataCreate in create mode', async () => {
        doMount(true, false);
        wrapper.vm.initTableDataCreate = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.initTableDataCreate).toBeCalled();
      });
    });
  });
});
