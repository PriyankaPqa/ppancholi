import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockApprovalTableEntity } from '@libs/entities-lib/approvals/approvals-table';
import { mockRoles } from '@libs/entities-lib/optionItem';
import { mockStorage } from '@/storage';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import routes from '@/constants/routes';
import { mockProgramEntities, mockProgramEntity } from '@libs/entities-lib/program';
import _sortBy from 'lodash/sortBy';
import { Status } from '@libs/entities-lib/base';
import { mockApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
import helpers from '@/ui/helpers/helpers';
import { mockServerError } from '@libs/services-lib/http-client';
import Component from './CreateEditApprovals.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const doMount = (tableMode = true, editMode = false) => {
  const options = {
    localVue,
    data: () => ({
      roles: mockRoles(),
      programs: mockProgramEntities(),
    }),
    computed: {
      isTableMode: () => tableMode,
      isEditMode: () => editMode,
    },
    mocks: {
      $storage: storage,
    },
  };
  wrapper = shallowMount(Component, options);
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
      it('should return correct in table mode', () => {
        doMount(true);
        expect(wrapper.vm.title).toEqual('approvals.create_table');
      });

      it('should return correct in template mode', () => {
        doMount(false);
        expect(wrapper.vm.title).toEqual('approvals.create_template');
      });
    });

    describe('supportedLanguages', () => {
      it('should return correct languages', () => {
        doMount();
        expect(wrapper.vm.supportedLanguages).toEqual([{ key: 'en', name: 'English' }, { key: 'fr', name: 'Français' }]);
      });
    });

    describe('isTableMode', () => {
      it('should return true if table mode in events', () => {
        const options = {
          localVue,
          data: () => ({
            roles: mockRoles(),
          }),
          mocks: {
            $storage: storage,
            $route: {
              name: routes.events.approvals.create.name,
            },
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
      it('should return programs listed alphabetically not already used in an approval table', async () => {
        doMount();
        await wrapper.setData({
          tablesForCurrentEvent: [{ programId: '10' }],
          programs: [
            mockProgramEntity({ id: '1' }),
            mockProgramEntity({ id: '2' }),
            mockProgramEntity({ id: '10' }),
          ],
        });

        const expectedPrograms = [
          mockProgramEntity({ id: '1' }),
          mockProgramEntity({ id: '2' }),
        ];

        expect(wrapper.vm.availablePrograms).toEqual([_sortBy(expectedPrograms, (program) => wrapper.vm.$m(program.name))]);
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

    describe('currentlyEditing', () => {
      it('should return true if a group is being edited', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [mockApprovalGroup({ editMode: true })] }) });
      });
      it('should return false otherwise', async () => {
        doMount();
        await wrapper.setData({ approval: mockApprovalTableEntity({ groups: [mockApprovalGroup({ editMode: false })] }) });
      });
    });
  });

  describe('Methods', () => {
    describe('loadEventPrograms', () => {
      it('should set programs with active programs for current event', async () => {
        doMount();
        wrapper.vm.$services.programs.getAll = jest.fn(() => ['1']);
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
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        helpers.scrollToFirstError = jest.fn();
        await wrapper.vm.submit();
        expect(helpers.scrollToFirstError).toHaveBeenCalledWith('scrollAnchor');
      });
      describe('Create mode', () => {
        it('should call createTable if valid and isTableMode', async () => {
          doMount();
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.createTable = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.createTable).toBeCalled();
        });

        it('should call createTemplate if valid and not isTableMode', async () => {
          doMount(false);
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.createTemplate = jest.fn();
          await wrapper.vm.submit();
          expect(wrapper.vm.createTemplate).toBeCalled();
        });
      });
      // describe('Edit mode', () => {
      //   it('should call editTable if valid and isTableMode', async () => {
      //     doMount(true, true);
      //     wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //     wrapper.vm.editTable = jest.fn();
      //     await wrapper.vm.submit();
      //     expect(wrapper.vm.editTable).toBeCalled();
      //   });
      //
      //   it('should call editTemplate if valid and not isTableMode', async () => {
      //     doMount(false, true);
      //     wrapper.vm.$refs.form.validate = jest.fn(() => true);
      //     wrapper.vm.editTemplate = jest.fn();
      //     await wrapper.vm.submit();
      //     expect(wrapper.vm.editTemplate).toBeCalled();
      //   });
      // });
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
        expect(wrapper.vm.$storage.approvalTable.actions.createApprovalTable).toHaveBeenCalledWith(wrapper.vm.approval);
      });

      it('should redirect to event approvals home page', async () => {
        doMount();
        await wrapper.vm.createTable();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.events.approvals.home.name });
      });

      it('should call handleSubmitError in case of error', async () => {
        doMount();
        wrapper.vm.handleSubmitError = jest.fn();
        wrapper.vm.$storage.approvalTable.actions.createApprovalTable = jest.fn(() => Promise.reject(mockServerError()));
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
      it('should set status to active is param is true', () => {
        doMount();
        wrapper.vm.setApprovalStatus(true);
        expect(wrapper.vm.approval.status).toEqual(Status.Active);
      });

      it('should set status to inactive is param is false', () => {
        doMount();
        wrapper.vm.setApprovalStatus(false);
        expect(wrapper.vm.approval.status).toEqual(Status.Inactive);
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
});
