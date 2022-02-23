/**
 * @group ui/components/case-file
 */

/* eslint-disable */
import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import
{
  mockFinancialAssistanceTableEntity,
  mockCombinedFinancialAssistance,
  mockItems,
} from '@/entities/financial-assistance';
import
{
  FinancialAssistancePaymentEntity,
  mockCaseFinancialAssistanceEntity,
  mockCaseFinancialAssistancePaymentGroups,
  ApprovalStatus,
} from '@/entities/financial-assistance-payment';
import {
  mockCombinedCaseFile,
  IdentityAuthenticationStatus,
  ValidationOfImpactStatus,
  mockCombinedCaseFiles,
} from '@/entities/case-file';
import { mockProgramEntity, mockCombinedPrograms } from '@/entities/program';
import { mockOptionItemData } from '@/entities/optionItem';
import Component from '../CreateEditFinancialAssistance.vue';
import routes from '@/constants/routes';
import flushPromises from 'flush-promises';
import { Status } from '@/entities/base/index';

const localVue = createLocalVue();
const storage = mockStorage();
const financialAssistance = mockFinancialAssistanceTableEntity();
const combinedFinancialAssistance = mockCombinedFinancialAssistance();
const caseFileFinancialAssistance = mockCaseFinancialAssistanceEntity();
const program = mockProgramEntity();
const caseFileCombined = mockCombinedCaseFile();
const items = mockItems();
const optionItems = mockOptionItemData();
const caseFileFinancialAssistanceGroups = mockCaseFinancialAssistancePaymentGroups();

describe('CreateEditFinancialAssistance.vue', () => {
  let wrapper;

  const mountWrapper = async (_fullMount = false, mode = 'edit', level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (mount)(Component, {
      shallow: true,
      localVue,
      propsData: {
        id: caseFileCombined.entity.id,
      },
      data() {
        return {
          financialAssistance: { name: null },
        };
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}` && level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
        $route: {
          name: routes.caseFile.financialAssistance[mode].name,
          params: {
            financialAssistancePaymentId: mode !== 'create' ? 'myId' : null,
          },
        },
      },
      stubs: {
        ValidationObserver: false,
        PaymentLineGroup: true,
        ViewFinancialAssistanceDetails: true,
      },
      ...additionalOverwrites,
    });

    await flushPromises();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.financialAssistance.actions.addFinancialAssistance = jest.fn(() => combinedFinancialAssistance);
    storage.program.actions.fetchProgram = jest.fn(() => program);
    storage.caseFile.getters.get = jest.fn(() => caseFileCombined);
    storage.caseFile.actions.fetch = jest.fn(() => caseFileCombined);
    storage.financialAssistance.getters.items = jest.fn(() => items);
    storage.financialAssistanceCategory.getters.getAll = jest.fn(() => optionItems);

    await mountWrapper();
  });

  describe('Template', () => {
    describe('page-title', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('page-title').exists()).toBeTruthy();
      });
    });

    describe('financial-assistance-form and financial-assistance-details', () => {
      let element;
      it('switches render when isDetailsMode', async () => {
        element = wrapper.find('[data-test="financial-assistance-form"]');
        expect(element.exists()).toBeTruthy();
        element = wrapper.find('[data-test="financial-assistance-details"]');
        expect(element.exists()).toBeFalsy();
        await mountWrapper(false, 'details');
        element = wrapper.find('[data-test="financial-assistance-form"]');
        expect(element.exists()).toBeFalsy();
        element = wrapper.find('[data-test="financial-assistance-details"]');
        expect(element.exists()).toBeTruthy();
      });
    });


    describe('paymentGroupList', () => {
      let element;
      it('renders when nbPaymentLines > 0', async () => {
        await mountWrapper(false, 'edit', 6, null, { computed: { nbPaymentLines() { return 2; } } });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeTruthy();

        await mountWrapper(false, 'edit', 6, null, { computed: { nbPaymentLines() { return 1; } } });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeTruthy();

        await mountWrapper(false, 'edit', 6, null, { computed: { nbPaymentLines() { return 0; } } });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeFalsy();
      });

      it('passes disabledDeleteButton when nbPaymentLines = 1', async () => {
        await mountWrapper(false, 'edit', 6, null, { computed: { nbPaymentLines() { return 2; } } });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.props('disableDeleteButton')).toBeFalsy();

        await mountWrapper(false, 'edit', 6, null, { computed: { nbPaymentLines() { return 1; } } });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.props('disableDeleteButton')).toBeTruthy();
      });
    });

    describe('financial-assistance-form and financial-assistance-details', () => {
      let element;
      it('switches render when isDetailsMode', async () => {
        element = wrapper.find('[data-test="financial-assistance-form"]');
        expect(element.exists()).toBeTruthy();
        element = wrapper.find('[data-test="financial-assistance-details"]');
        expect(element.exists()).toBeFalsy();
        await mountWrapper(false, 'details');
        element = wrapper.find('[data-test="financial-assistance-form"]');
        expect(element.exists()).toBeFalsy();
        element = wrapper.find('[data-test="financial-assistance-details"]');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('Add new payment line btn', () => {
      let element;
      beforeEach(() => {
        element = wrapper.find('[data-test="financial-addPaymentLineBtn"]');
      });
      it('renders when canAddNewLines', async () => {
        await mountWrapper(false, 'edit', 6, null, { computed: { canAddNewLines() { return true; } } });

        element = wrapper.find('[data-test="financial-addPaymentLineBtn"]');
        expect(element.exists()).toBeTruthy();
        await mountWrapper(false, 'edit', 6, null, { computed: { canAddNewLines() { return false; } } });
        element = wrapper.find('[data-test="financial-addPaymentLineBtn"]');
        expect(element.exists()).toBeFalsy();
      });
      it('is disabled', async () => {
        wrapper.vm.selectedProgram = null;
        await wrapper.vm.$nextTick();
        expect(element.vm.$props.disabled).toBe(true);
      });
      it('is enabled', async () => {
        wrapper.vm.selectedProgram = program;
        await wrapper.vm.$nextTick();
        expect(element.vm.$props.disabled).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call storage to fetch categories - including inactives', async () => {
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(storage.financialAssistanceCategory.actions.fetchAllIncludingInactive).toHaveBeenCalled();
      });

      it('call searchTables', async () => {
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.searchTables).toHaveBeenCalledTimes(1);
      });

      it('inits financialAssistance from storage when id is passed', () => {
        expect(storage.financialAssistancePayment.actions.fetch).toHaveBeenCalledWith('myId',
          { useEntityGlobalHandler: true, useMetadataGlobalHandler: false });
        expect(wrapper.vm.financialAssistance.id).toBe(caseFileFinancialAssistance.id);
        expect(wrapper.vm.financialAssistance.name).toBe(caseFileFinancialAssistance.name);
      });

      it('calls warnIfInvalid', async () => {
        jest.spyOn(wrapper.vm, 'warnIfInvalid');

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.warnIfInvalid).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    describe('canAddNewLines', () => {
      it('returns true for level1+ if not readonly', async () => {
        await mountWrapper(false, 'edit', 1);
        expect(wrapper.vm.canAddNewLines).toBeTruthy();
        await mountWrapper(false, 'edit', null);
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
        await mountWrapper(false, 'edit', null, 'readonly');
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
        await mountWrapper(false, 'edit', null, 'contributor3');
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
        await mountWrapper(false, 'edit', null, 'contributorFinance');
        expect(wrapper.vm.canAddNewLines).toBeFalsy();

        await mountWrapper(false, 'edit', 1, null,
          {
            computed: {
              readonly() {
                return true;
              },
            },
          });
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 'edit', 1);
        expect(wrapper.vm.canAddNewLines).toBeTruthy();
        await wrapper.setData({ financialAssistance: { approvalStatus: ApprovalStatus.New } });
        expect(wrapper.vm.canAddNewLines).toBeTruthy();
        await wrapper.setData({ financialAssistance: { approvalStatus: ApprovalStatus.Approved } });
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
      });
    });

    describe('submitLabel', () => {
      it('returns the key for submitLabel depending on isEditMode', async () => {
        await mountWrapper(false, 'create');
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
        await mountWrapper(false, 'edit');
        expect(wrapper.vm.submitLabel).toBe('common.buttons.save');
      });
    });

    describe('showWarning', () => {
      it('return true if any condition is not meet', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              return caseFileCombined;
            },
            isAuthenticated() {
              return false;
            },
            isImpacted() {
              return true;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return true if any condition is not meet', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              return caseFileCombined;
            },
            isAuthenticated() {
              return true;
            },
            isImpacted() {
              return false;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return true if both condition is not meet', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              return caseFileCombined;
            },
            isAuthenticated() {
              return false;
            },
            isImpacted() {
              return false;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return false if both conditions are meet', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              return caseFileCombined;
            },
            isAuthenticated() {
              return true;
            },
            isImpacted() {
              return true;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(false);
      });
    });

    describe('activePaymentGroups', () => {
      it('filters the active groups', async () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.activePaymentGroups.length).toBe(1);
        await wrapper.setData({financialAssistance: { groups: [
          {status: Status.Active, lines: [{status: Status.Active}, {status: Status.Active}]},
          {status: Status.Inactive, lines: [{status: Status.Active}, {status: Status.Active}]},
          {status: Status.Active, lines: [{status: Status.Inactive}, {status: Status.Active}]},
        ] }});
        expect(wrapper.vm.activePaymentGroups.length).toBe(2);
      });
    });

    describe('nbPaymentLines', () => {
      it('counts the number of active lines in active groups', async () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.nbPaymentLines).toBe(1);
        await wrapper.setData({financialAssistance: { groups: [
          {status: Status.Active, lines: [{status: Status.Active}, {status: Status.Active}]},
          {status: Status.Inactive, lines: [{status: Status.Active}, {status: Status.Active}]},
          {status: Status.Active, lines: [{status: Status.Inactive}, {status: Status.Active}]},
        ] }});
        expect(wrapper.vm.nbPaymentLines).toBe(3);
      });
    });

    describe('isImpacted', () => {
      it('should return true if there is no selectedProgram selected', () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.isImpacted).toBe(true);
      });

      it('should return true if the program doesnt require to be impacted', () => {
        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.impacted = false;
        expect(wrapper.vm.isImpacted).toBe(true);
      });

      it('should return true if program requires to be impacted and user is impacted', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined;
              caseFile2.entity.impactStatusValidation.status = ValidationOfImpactStatus.Impacted;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.impacted = true;

        expect(wrapper.vm.isImpacted).toBe(true);
      });

      it('should return false if program requires to be impacted and user isnt impacted', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined;
              caseFile2.entity.impactStatusValidation.status = ValidationOfImpactStatus.NotImpacted;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.impacted = true;

        expect(wrapper.vm.isImpacted).toBe(false);
      });
    });

    describe('isAuthenticated', () => {
      it('should return true if there is no selectedProgram selected', () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.isAuthenticated).toBe(true);
      });

      it('should return true if the program doesnt require to be authenticated', () => {
        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.authenticated = false;
        expect(wrapper.vm.isAuthenticated).toBe(true);
      });

      it('should return true if program requires to be authenticated and user is authenticated', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined;
              caseFile2.entity.identityAuthentication.status = IdentityAuthenticationStatus.Passed;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.authenticated = true;

        expect(wrapper.vm.isAuthenticated).toBe(true);
      });

      it('should return false if program requires to be authenticated and user isnt authenticated', async () => {
        await mountWrapper(false, 'edit', 6, '', {
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined;
              caseFile2.entity.identityAuthentication.status = IdentityAuthenticationStatus.Failed;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.authenticated = true;

        expect(wrapper.vm.isAuthenticated).toBe(false);
      });
    });

    describe('isDisabled', () => {
      it('returns true or false if the create should be disabled', () => {
        wrapper.vm.financialAssistance = new FinancialAssistancePaymentEntity(caseFileFinancialAssistance);
        wrapper.vm.financialAssistance.name = null;

        expect(wrapper.vm.isDisabled).toBe(true);
      });

      it('returns true or false if the create should be disabled', () => {
        wrapper.vm.financialAssistance = new FinancialAssistancePaymentEntity(caseFileFinancialAssistance);
        expect(wrapper.vm.isDisabled).toBe(false);
      });
    });

    describe('caseFile', () => {
      it('should return the associated caseFile', () => {
        expect(wrapper.vm.caseFile).toEqual(caseFileCombined);
      });
    });

    describe('items', () => {
      it('should return the list of items', () => {
        expect(wrapper.vm.items).toEqual(items);
      });
    });

    describe('rules', () => {
      test('agree', async () => {
        expect(wrapper.vm.rules.agree).toEqual({
          required: { allowFalse: false },
        });
      });
    });
  });

  describe('Validation rules', () => {
    describe('agree', () => {
      it('is linked to proper rules', async () => {
        await wrapper.setData({
          showSubmitPaymentDialog: true,
        });

        const element = wrapper.findDataTest('checkbox_agreed');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.agree);
      });
    });
  });

  describe('Methods', () => {
    describe('searchTables', () => {
      it('sets financial tables', async () => {
        await wrapper.vm.searchTables();
        expect(wrapper.vm.financialTables).toEqual([financialAssistance]);
      });
    });

    describe('editPaymentLine', () => {
      it('sets variables and shows popup when editing', async () => {
        // to remove props warnings
        await wrapper.setData({ loading: true });
        expect(wrapper.vm.showAddPaymentLineForm).toBeFalsy();
        wrapper.vm.editPaymentLine({ line: 'myLine', group: 'myGroup' });
        expect(wrapper.vm.lineToEdit).toBe('myLine');
        expect(wrapper.vm.groupToEdit).toBe('myGroup');
        expect(wrapper.vm.showAddPaymentLineForm).toBeTruthy();
      });

      it('sets variables and shows popup when adding', async () => {
        // to remove props warnings
        await wrapper.setData({ loading: true });
        expect(wrapper.vm.showAddPaymentLineForm).toBeFalsy();
        wrapper.vm.editPaymentLine(null);
        expect(wrapper.vm.lineToEdit).toBeUndefined();
        expect(wrapper.vm.groupToEdit).toBeUndefined();
        expect(wrapper.vm.showAddPaymentLineForm).toBeTruthy();
      });
    });

    describe('updateSelectedData', () => {
      it('should call updateSelectedProgram', async () => {
        jest.spyOn(wrapper.vm, 'updateSelectedProgram').mockImplementation();
        jest.spyOn(wrapper.vm, 'updateSelectedTable').mockImplementation();

        await wrapper.vm.updateSelectedData(financialAssistance);

        expect(wrapper.vm.updateSelectedProgram).toHaveBeenCalled();
      });

      it('should call updateSelectedTable', async () => {
        jest.spyOn(wrapper.vm, 'updateSelectedProgram').mockImplementation();
        jest.spyOn(wrapper.vm, 'updateSelectedTable').mockImplementation();

        await wrapper.vm.updateSelectedData(financialAssistance);

        expect(wrapper.vm.updateSelectedTable).toHaveBeenCalled();
      });
    });

    describe('updateSelectedProgram', () => {
      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.updateSelectedProgram(financialAssistance);
        expect(storage.program.actions.fetch).toHaveBeenCalledWith({
          id: financialAssistance.programId,
          eventId: mockCombinedCaseFiles()[0].entity.eventId,
        });
      });

      it('should set selected program', async () => {
        await wrapper.vm.updateSelectedProgram(financialAssistance);

        expect(wrapper.vm.selectedProgram?.id).toEqual(mockCombinedPrograms()[0].entity.id);
      });
    });

    describe('updateSelectedTable', () => {
      it('should call storage to get table', async () => {
        await wrapper.vm.updateSelectedTable(financialAssistance);
        expect(storage.financialAssistance.getters.get).toHaveBeenCalledWith(financialAssistance.id);
      });

      it('should call storage to get categories', async () => {
        await wrapper.vm.updateSelectedTable(financialAssistance);
        expect(storage.financialAssistanceCategory.getters.getAll).toHaveBeenCalled();
      });
    });

    describe('saveFinancialAssistance', () => {
      it('should call the storage depending when adding', async () => {
        await mountWrapper(false, 'create');
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.saveFinancialAssistance();
        expect(storage.financialAssistancePayment.actions.addFinancialAssistancePayment).toHaveBeenCalledWith(financialAssistance);
      });

      it('should call the storage depending when editing', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.saveFinancialAssistance();
        expect(storage.financialAssistancePayment.actions.editFinancialAssistancePayment).toHaveBeenCalledWith(financialAssistance);
      });
    });

    describe('onSubmitPaymentLine', () => {
      it('should add the new PaymentLine when isEditMode is false', async () => {
        await mountWrapper(false, 'create');
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        // mock data already has id - here we are creating
        caseFileFinancialAssistanceGroups[0].lines.forEach((l) => { l.id = null; });

        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.financialAssistance.groups[0].groupingInformation).toEqual(caseFileFinancialAssistanceGroups[0].groupingInformation);
        expect(wrapper.vm.financialAssistance.groups[0].lines).toEqual(caseFileFinancialAssistanceGroups[0].lines);
        expect(wrapper.vm.financialAssistance.groups[0].paymentStatus).toEqual(caseFileFinancialAssistanceGroups[0].paymentStatus);
      });

      it('should call savePaymentLine only when isEditMode is true', async () => {
        await mountWrapper(false, 'create');
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        wrapper.vm.savePaymentLine = jest.fn();
        // mock data already has id - here we are creating
        caseFileFinancialAssistanceGroups[0].lines.forEach((l) => { l.id = null; });

        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.savePaymentLine).not.toHaveBeenCalled();

        await wrapper.setData({ isEditMode: true, isAddMode: false });
        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.savePaymentLine).toHaveBeenCalled();
      });
    });

    describe('warnIfInvalid', () => {
      it('should show a message if the user opens an existing unsubmitted payment that refers to an inactive table', async () => {
        const table = mockFinancialAssistanceTableEntity();
        jest.clearAllMocks();
        table.status = Status.Inactive;
        await wrapper.setData({ financialAssistance: { approvalStatus: ApprovalStatus.New } });
        await wrapper.setData({ selectedTable: { ...table } });
        wrapper.vm.warnIfInvalid();
        expect(wrapper.vm.$message).toHaveBeenCalled();

        jest.clearAllMocks();
        table.status = Status.Active;
        await wrapper.setData({ selectedTable: { ...table } });
        wrapper.vm.warnIfInvalid();
        expect(wrapper.vm.$message).not.toHaveBeenCalled();

        jest.clearAllMocks();
        table.status = Status.Inactive;
        await wrapper.setData({ financialAssistance: { approvalStatus: ApprovalStatus.Approved } });
        await wrapper.setData({ selectedTable: { ...table } });
        wrapper.vm.warnIfInvalid();
        expect(wrapper.vm.$message).not.toHaveBeenCalled();
      });
    });

    describe('savePaymentLine', () => {
      it('should call the add service when new line is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we are creating
        newGroup[0].lines.forEach((l) => { l.id = null; });

        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(storage.financialAssistancePayment.actions.addFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0]);
        expect(wrapper.vm.financialAssistance.groups).toEqual(storage.financialAssistancePayment.actions.addFinancialAssistancePaymentLine().groups);
      });

      it('should call the edit service when existing line is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        const newGroup = mockCaseFinancialAssistancePaymentGroups();

        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(storage.financialAssistancePayment.actions.editFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0]);
        expect(wrapper.vm.financialAssistance.groups).toEqual(storage.financialAssistancePayment.actions.editFinancialAssistancePaymentLine().groups);
      });
    });

    describe('deletePaymentLine', () => {
      it('should simply remove the line when line that hadnt been saved yet is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we want to remove unsaved
        const lineKept = {...newGroup[0].lines[0]};
        newGroup[0].lines[0].id = null;
        newGroup[0].lines[1] = lineKept;
        lineKept.id = 'abc';
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({line: newGroup[0].lines[0], group: newGroup[0]});
        expect(storage.financialAssistancePayment.actions.deleteFinancialAssistancePaymentLine).not.toHaveBeenCalled();
        expect(wrapper.vm.financialAssistance.groups[0].lines).toEqual([lineKept]);
      });

      it('should remove a group if it becomes empty', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we want to remove unsaved
        newGroup[0].lines[0].id = null;
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({line: newGroup[0].lines[0], group: newGroup[0]});
        expect(storage.financialAssistancePayment.actions.deleteFinancialAssistancePaymentLine).not.toHaveBeenCalled();
        expect(wrapper.vm.financialAssistance.groups).toEqual([]);
      });

      it('should call the delete service when existing line is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({line: newGroup[0].lines[0], group: newGroup[0]});
        expect(storage.financialAssistancePayment.actions.deleteFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0].lines[0].id);
        expect(wrapper.vm.financialAssistance.groups).toEqual(storage.financialAssistancePayment.actions.deleteFinancialAssistancePaymentLine().groups);
      });
    });

    describe('onSubmitPayment', () => {
      it('calls service if form is valid', async () => {
        wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => true);
        wrapper.vm.closeSubmitPaymentDialog = jest.fn();

        await wrapper.vm.onSubmitPayment();
        expect(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment).toHaveBeenCalledWith(financialAssistance.id);
        expect(wrapper.vm.financialAssistance).toEqual(new FinancialAssistancePaymentEntity(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment()));
      });

      it('does not call service if form is not valid', async () => {
        wrapper.vm.$refs.submitPaymentForm.validate = jest.fn(() => false);

        await wrapper.vm.onSubmitPayment();
        expect(storage.financialAssistancePayment.actions.submitFinancialAssistancePayment).not.toHaveBeenCalled();
      });
    });

    describe('updatePaymentStatus', () => {
      it('calls service', async () => {
        const newGroup = mockCaseFinancialAssistancePaymentGroups()[0];
        newGroup.id = 'abc-id';
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.updatePaymentStatus({ status: 3, group: newGroup, cancellationReason: 5});
        expect(storage.financialAssistancePayment.actions.updatePaymentStatus).toHaveBeenCalledWith(financialAssistance.id, newGroup.id, 3, 5);
        expect(wrapper.vm.financialAssistance).toEqual(new FinancialAssistancePaymentEntity(storage.financialAssistancePayment.actions.updatePaymentStatus()));
      });
    });

    describe('onClickSubmitPayment', () => {
      it('sets totalAmountToSubmit', async () => {
        const total = '$10.00';

        wrapper.vm.onClickSubmitPayment( { total });

        expect(wrapper.vm.totalAmountToSubmit).toBe(total);
      });

      it('sets showSubmitPaymentDialog', async () => {
        expect(wrapper.vm.showSubmitPaymentDialog).toBe(false);

        wrapper.vm.onClickSubmitPayment( { total: '$10.00' });

        expect(wrapper.vm.showSubmitPaymentDialog).toBe(true);
      });
    });

    describe('closeSubmitPaymentDialog', () => {
      it('clears totalAmountToSubmit', async () => {
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.totalAmountToSubmit = '$10.00';

        wrapper.vm.closeSubmitPaymentDialog();

        expect(wrapper.vm.totalAmountToSubmit).toBe('');
      });

      it('sets showSubmitPaymentDialog', async () => {
        wrapper.vm.$refs.submitPaymentForm.reset = jest.fn();
        wrapper.vm.showSubmitPaymentDialog = true;

        wrapper.vm.closeSubmitPaymentDialog();

        expect(wrapper.vm.showSubmitPaymentDialog).toBe(false);
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('calls next if the confirmation dialog returns true', async () => {
      wrapper.vm.$refs.form.flags = { dirty: true };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.$refs.form.flags = { dirty: true };
      wrapper.vm.$confirm = jest.fn(() => false);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if dirty is false', async () => {
      wrapper.vm.$refs.form.flags = { dirty: false };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(next).toBeCalled();
    });
  });
});
