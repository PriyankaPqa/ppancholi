import { createLocalVue, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import
{
  mockFinancialAssistanceTableEntity,
  mockCombinedFinancialAssistance,
  mockItems,
} from '@libs/entities-lib/financial-assistance';
import
{
  FinancialAssistancePaymentEntity,
  mockCaseFinancialAssistanceEntity,
  mockCaseFinancialAssistancePaymentGroups,
  ApprovalStatus, mockCaseFinancialAssistanceEntities,
} from '@libs/entities-lib/financial-assistance-payment';
import {
  mockCombinedCaseFile,
  IdentityAuthenticationStatus,
  ValidationOfImpactStatus,
  mockCombinedCaseFiles,
} from '@libs/entities-lib/case-file';
import {
  mockAssessmentFormEntity,
  mockAssessmentResponseEntity,
  AssociationType,
  CompletionStatus,
} from '@libs/entities-lib/assessment-template';

import { format } from 'date-fns';

import { Status } from '@libs/entities-lib/base';

import { mockProgramEntity, mockCombinedPrograms } from '@libs/entities-lib/program';

import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import flushPromises from 'flush-promises';
import routes from '@/constants/routes';
import { useMockProgramStore } from '@/pinia/program/program.mock';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response.mock';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import Component from '../CreateEditFinancialAssistanceCaseFile.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const financialAssistance = mockFinancialAssistanceTableEntity();
const combinedFinancialAssistance = mockCombinedFinancialAssistance();
const caseFileFinancialAssistance = mockCaseFinancialAssistanceEntity();
const program = mockProgramEntity();
const caseFileCombined = mockCombinedCaseFile();
const items = mockItems();
const caseFileFinancialAssistanceGroups = mockCaseFinancialAssistancePaymentGroups();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

describe('CreateEditFinancialAssistanceCaseFile.vue', () => {
  let wrapper;
  let pinia;
  let programStore;
  let assessmentResponseStore;
  let financialAssistancePaymentStore;

  // eslint-disable-next-line no-unused-vars,max-params,@typescript-eslint/no-unused-vars
  const mountWrapper = async (_fullMount = false, mode = 'edit', currentPinia = getPiniaForUser('level6'), additionalOverwrites = {}) => {
    pinia = currentPinia;
    programStore = useMockProgramStore(pinia).programStore;
    assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
    financialAssistancePaymentStore = useMockFinancialAssistancePaymentStore(pinia).financialAssistancePaymentStore;
    wrapper = (mount)(Component, {
      shallow: true,
      pinia,
      localVue,
      propsData: {
        id: caseFileCombined.entity.id,
      },
      data() {
        return {
          financialAssistance: { name: null },
        };
      },
      computed: {
        event() {
          return mockEvent;
        },
      },
      mocks: {
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
    storage.caseFile.getters.get = jest.fn(() => caseFileCombined);
    storage.caseFile.actions.fetch = jest.fn(() => caseFileCombined);
    storage.financialAssistance.getters.items = jest.fn(() => items);
    await mountWrapper(false, 'edit', pinia);
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            nbPaymentLines() {
              return 2;
            },
          },
        });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeTruthy();

        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            nbPaymentLines() {
              return 1;
            },
          },
        });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeTruthy();

        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            nbPaymentLines() {
              return 0;
            },
          },
        });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.exists()).toBeFalsy();
      });

      it('passes disabledDeleteButton when nbPaymentLines = 1', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            nbPaymentLines() {
              return 2;
            },
          },
        });
        element = wrapper.find('[data-test="paymentGroupList"]');
        expect(element.props('disableDeleteButton')).toBeFalsy();

        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            nbPaymentLines() {
              return 1;
            },
          },
        });
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            canAddNewLines() {
              return true;
            },
          },
        });

        element = wrapper.find('[data-test="financial-addPaymentLineBtn"]');
        expect(element.exists()).toBeTruthy();
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            canAddNewLines() {
              return false;
            },
          },
        });
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

        expect(financialAssistancePaymentStore.fetchFinancialAssistanceCategories).toHaveBeenCalled();
      });

      it('call searchTables if it is add mode', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.isAddMode = true;
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.searchTables).toHaveBeenCalledTimes(1);
      });

      it('call searchTables if it is edit mode', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.isAddMode = false;
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.searchTables).toHaveBeenCalledTimes(1);
      });

      it('call fetchTable if it is read mode', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.isAddMode = false;
        jest.spyOn(wrapper.vm, 'fetchTable').mockImplementation(() => financialAssistance);

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.fetchTable).toHaveBeenCalledTimes(1);
      });

      it('inits financialAssistance from storage when id is passed', async () => {
        expect(financialAssistancePaymentStore.fetch).toHaveBeenCalledWith('myId');
        expect(wrapper.vm.financialAssistance.id).toBe(mockCaseFinancialAssistanceEntities()[0].id);
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
        await mountWrapper(false, 'edit', getPiniaForUser('level1'));
        expect(wrapper.vm.canAddNewLines).toBeTruthy();
        await mountWrapper(false, 'edit', getPiniaForUser('readonly'));
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
        await mountWrapper(false, 'edit', getPiniaForUser('contributor3'));
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
        await mountWrapper(false, 'edit', getPiniaForUser('contributorFinance'));
        expect(wrapper.vm.canAddNewLines).toBeFalsy();

        await mountWrapper(
          false,
          'edit',
          getPiniaForUser('level1'),
          {
            computed: {
              readonly() {
                return true;
              },
            },
          },
        );
        expect(wrapper.vm.canAddNewLines).toBeFalsy();
      });

      it('returns false when status > new', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level1'));
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
            hasCompletedAssessments() {
              return true;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return true if any condition is not meet', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
            hasCompletedAssessments() {
              return true;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return true if any condition is not meet', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
            hasCompletedAssessments() {
              return false;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return true if all conditions are not meet', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
            hasCompletedAssessments() {
              return false;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });

      it('return false if all conditions are meet', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
            hasCompletedAssessments() {
              return true;
            },
          },
        });

        expect(wrapper.vm.showWarning).toBe(false);
      });

      it('return false if any conditions is not met but financialAssistance is approved', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            isAuthenticated() {
              return false;
            },
            isImpacted() {
              return true;
            },
            hasCompletedAssessments() {
              return true;
            },
          },
        });

        await wrapper.setData({
          financialAssistance: {
            approvalStatus: ApprovalStatus.Approved,
          },
        });

        expect(wrapper.vm.showWarning).toBe(false);
      });

      it('return true if any conditions is not met and financialAssistance is not approved', async () => {
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            isAuthenticated() {
              return false;
            },
            isImpacted() {
              return true;
            },
            hasCompletedAssessments() {
              return true;
            },
          },
        });

        await wrapper.setData({
          financialAssistance: {
            approvalStatus: ApprovalStatus.New,
          },
        });

        expect(wrapper.vm.showWarning).toBe(true);
      });
    });

    describe('activePaymentGroups', () => {
      it('filters the active groups', async () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.activePaymentGroups.length).toBe(1);
        await wrapper.setData({
          financialAssistance: {
            groups: [
              { status: Status.Active, lines: [{ status: Status.Active }, { status: Status.Active }] },
              { status: Status.Inactive, lines: [{ status: Status.Active }, { status: Status.Active }] },
              { status: Status.Active, lines: [{ status: Status.Inactive }, { status: Status.Active }] },
            ],
          },
        });
        expect(wrapper.vm.activePaymentGroups.length).toBe(2);
      });
    });

    describe('nbPaymentLines', () => {
      it('counts the number of active lines in active groups', async () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.nbPaymentLines).toBe(1);
        await wrapper.setData({
          financialAssistance: {
            groups: [
              { status: Status.Active, lines: [{ status: Status.Active }, { status: Status.Active }] },
              { status: Status.Inactive, lines: [{ status: Status.Active }, { status: Status.Active }] },
              { status: Status.Active, lines: [{ status: Status.Inactive }, { status: Status.Active }] },
            ],
          },
        });
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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
        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
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

    describe('hasCompletedAssessments', () => {
      it('should return true if there is no selectedProgram selected', () => {
        wrapper.vm.selectedProgram = null;
        expect(wrapper.vm.hasCompletedAssessments).toBe(true);
      });

      it('should return true if the program doesnt require to have completed assessments', () => {
        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.completedAssessments = false;
        expect(wrapper.vm.hasCompletedAssessments).toBe(true);
      });

      it('should return true if program requires to have completed assessments and user has completed the required assessments', async () => {
        await wrapper.setData({
          programAssessmentForms: [
            {
              ...mockAssessmentFormEntity,
              id: 'assessmentId1',
            },
            {
              ...mockAssessmentFormEntity,
              id: 'assessmentId2',
            },
          ],
          caseFileAssessmentResponses: [
            {
              ...mockAssessmentResponseEntity,
              assessmentFormId: 'assessmentId1',
              completionStatus: CompletionStatus.Completed,
            },
            {
              ...mockAssessmentResponseEntity,
              assessmentFormId: 'assessmentId2',
              completionStatus: CompletionStatus.Completed,
            },
          ],
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.completedAssessments = true;
        wrapper.vm.selectedProgram.eligibilityCriteria.completedAssessmentIds = ['assessmentId1', 'assessmentId2'];

        expect(wrapper.vm.hasCompletedAssessments).toBe(true);
      });

      it('should return false if program requires to have completed assessments and user has not completed the required assessments', async () => {
        await wrapper.setData({
          programAssessmentForms: [
            {
              ...mockAssessmentFormEntity,
              id: 'assessmentId1',
            },
            {
              ...mockAssessmentFormEntity,
              id: 'assessmentId2',
            },
          ],
          caseFileAssessmentResponses: [
            {
              ...mockAssessmentResponseEntity,
              assessmentFormId: 'assessmentId1',
              completionStatus: CompletionStatus.Completed,
            },
            {
              ...mockAssessmentResponseEntity,
              assessmentFormId: 'assessmentId2',
              completionStatus: CompletionStatus.Partial,
            },
          ],
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.completedAssessments = true;
        wrapper.vm.selectedProgram.eligibilityCriteria.completedAssessmentIds = ['assessmentId1', 'assessmentId2'];

        expect(wrapper.vm.hasCompletedAssessments).toBe(false);
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
  });

  describe('Methods', () => {
    describe('searchTables', () => {
      it('sets financial tables', async () => {
        await wrapper.vm.searchTables();
        expect(wrapper.vm.financialTables).toEqual([financialAssistance]);
      });
    });

    describe('fetchTable', () => {
      it('fetches financial table by id', async () => {
        await wrapper.vm.fetchTable();
        expect(storage.financialAssistance.actions.fetch).toHaveBeenCalledWith(caseFileFinancialAssistance.financialAssistanceTableId);
      });
    });

    describe('fetchProgram', () => {
      it('fetches program program by id', async () => {
        await wrapper.vm.fetchProgram('programId', 'eventId');
        expect(programStore.fetch).toHaveBeenCalledWith({ id: 'programId', eventId: 'eventId' });
      });
    });

    describe('fetchAssessmentFormByProgramId', () => {
      it('fetches assessment forms by program id', async () => {
        const assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
        await wrapper.vm.fetchAssessmentFormByProgramId('programId');
        expect(assessmentFormStore.fetchByProgramId).toHaveBeenCalledWith('programId');
      });
    });

    describe('fetchAssessmentResponseByCaseFileId', () => {
      it('searches storage', async () => {
        await mountWrapper();
        await wrapper.vm.fetchAssessmentResponseByCaseFileId('caseFileId');
        expect(assessmentResponseStore.search).toHaveBeenCalledWith({
          params: {
            filter: {
              'Entity/Association/Id': 'caseFileId',
              'Entity/Association/Type': AssociationType.CaseFile,
            },
            top: 999,
            queryType: 'full',
            searchMode: 'all',
          },
          searchEndpoint: null,
        });
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
        expect(programStore.fetch).toHaveBeenCalledWith({
          id: financialAssistance.programId,
          eventId: mockCombinedCaseFiles()[0].entity.eventId,
        });
      });

      it('should set selected program', async () => {
        await wrapper.vm.updateSelectedProgram(financialAssistance);

        expect(wrapper.vm.selectedProgram?.id).toEqual(mockCombinedPrograms()[0].entity.id);
      });

      it('calls makePaymentName if feature branch is on and there was an initial program', async () => {
        wrapper.vm.$hasFeature = jest.fn(() => true);
        wrapper.vm.makePaymentName = jest.fn();
        await wrapper.setData({ selectedProgram: program });
        await wrapper.vm.updateSelectedProgram(financialAssistance);
        expect(wrapper.vm.makePaymentName).toBeCalledTimes(1);
      });

      it('calls fetchAssessmentResponseByCaseFileId if completedAssessments eligibility criteria is needed', async () => {
        programStore.fetch = jest.fn(() => program);
        program.eligibilityCriteria.completedAssessments = true;
        wrapper.vm.fetchAssessmentResponseByCaseFileId = jest.fn();

        await wrapper.vm.updateSelectedProgram(financialAssistance);

        expect(wrapper.vm.fetchAssessmentResponseByCaseFileId).toBeCalledTimes(1);
        expect(wrapper.vm.fetchAssessmentResponseByCaseFileId).toHaveBeenCalledWith(wrapper.vm.caseFileId);
      });

      it('calls fetchAssessmentFormByProgramId if completedAssessments eligibility criteria is needed', async () => {
        program.eligibilityCriteria.completedAssessments = true;
        programStore.fetch = jest.fn(() => program);
        wrapper.vm.fetchAssessmentFormByProgramId = jest.fn();
        wrapper.vm.fetchAssessmentResponseByCaseFileId = jest.fn();
        await wrapper.vm.updateSelectedProgram(financialAssistance);

        expect(wrapper.vm.fetchAssessmentFormByProgramId).toBeCalledTimes(1);
        expect(wrapper.vm.fetchAssessmentFormByProgramId).toHaveBeenCalledWith(wrapper.vm.selectedProgram.id);
      });
    });

    describe('updateSelectedTable', () => {
      it('should call storage to get table', async () => {
        await wrapper.vm.updateSelectedTable(financialAssistance);
        expect(storage.financialAssistance.getters.get).toHaveBeenCalledWith(financialAssistance.id);
      });

      it('should call storage to get categories', async () => {
        await wrapper.vm.updateSelectedTable(financialAssistance);
        expect(financialAssistancePaymentStore.getFinancialAssistanceCategories).toHaveBeenCalled();
      });
    });

    describe('saveFinancialAssistance', () => {
      it('should call the storage depending when adding', async () => {
        await mountWrapper(false, 'create');
        wrapper.vm.financialAssistance = caseFileFinancialAssistance;
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.saveFinancialAssistance();
        expect(financialAssistancePaymentStore.addFinancialAssistancePayment).toHaveBeenCalledWith(caseFileFinancialAssistance);
      });

      it('should call the storage depending when editing', async () => {
        wrapper.vm.financialAssistance = caseFileFinancialAssistance;
        wrapper.vm.$refs.form.reset = jest.fn();
        await wrapper.vm.saveFinancialAssistance();
        expect(financialAssistancePaymentStore.editFinancialAssistancePayment).toHaveBeenCalledWith(caseFileFinancialAssistance);
      });
    });

    describe('onSubmitPaymentLine', () => {
      it('should add the new PaymentLine when isEditMode is false', async () => {
        await mountWrapper(false, 'create');
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        // mock data already has id - here we are creating
        caseFileFinancialAssistanceGroups[0].lines.forEach((l) => {
          l.id = null;
        });

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
        caseFileFinancialAssistanceGroups[0].lines.forEach((l) => {
          l.id = null;
        });

        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.savePaymentLine).not.toHaveBeenCalled();

        await wrapper.setData({ isEditMode: true, isAddMode: false });
        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.savePaymentLine).toHaveBeenCalled();
      });

      it('calls makePaymentName if it is on add mode and feature branch is on', async () => {
        wrapper.vm.$hasFeature = jest.fn(() => true);
        wrapper.vm.makePaymentName = jest.fn();
        await wrapper.setData({ isEditMode: false, isAddMode: true });
        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.makePaymentName).toBeCalledTimes(1);
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
      beforeEach(() => {
        wrapper.vm.financialAssistance = caseFileFinancialAssistance;
      });

      it('should call the add service when new line is received', async () => {
        wrapper.vm.financialAssistance.groups = [];
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we are creating
        newGroup[0].lines.forEach((l) => {
          l.id = null;
        });

        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(financialAssistancePaymentStore.addFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0]);
        expect(wrapper.vm.financialAssistance.groups).toEqual(financialAssistancePaymentStore.addFinancialAssistancePaymentLine().groups);
      });

      it('should call the edit service when existing line is received', async () => {
        wrapper.vm.financialAssistance.groups = [];
        const newGroup = mockCaseFinancialAssistancePaymentGroups();

        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(financialAssistancePaymentStore.editFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0]);
        expect(wrapper.vm.financialAssistance.groups).toEqual(financialAssistancePaymentStore.editFinancialAssistancePaymentLine().groups);
      });

      it('calls submitPaymentNameUpdate if  feature branch is on', async () => {
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        wrapper.vm.$hasFeature = jest.fn(() => true);
        wrapper.vm.submitPaymentNameUpdate = jest.fn();
        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(wrapper.vm.submitPaymentNameUpdate).toBeCalledTimes(1);
      });

      test.each([
        [ApprovalStatus.New, 1],
        [ApprovalStatus.Pending, 0],
        [ApprovalStatus.Approved, 0],
        [ApprovalStatus.Declined, 0],
      ])('if approvalStatus is %i, calls submitPaymentNameUpdate %i times)', async (approvalStatus, expectedCalls) => {
        wrapper.vm.financialAssistance.approvalStatus = approvalStatus;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        wrapper.vm.submitPaymentNameUpdate = jest.fn();

        await wrapper.vm.savePaymentLine(newGroup[0]);
        expect(wrapper.vm.submitPaymentNameUpdate).toBeCalledTimes(expectedCalls);
      });
    });

    describe('deletePaymentLine', () => {
      it('should simply remove the line when line that hadnt been saved yet is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we want to remove unsaved
        const lineKept = { ...newGroup[0].lines[0] };
        newGroup[0].lines[0].id = null;
        newGroup[0].lines[1] = lineKept;
        lineKept.id = 'abc';
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({ line: newGroup[0].lines[0], group: newGroup[0] });
        expect(financialAssistancePaymentStore.deleteFinancialAssistancePaymentLine).not.toHaveBeenCalled();
        expect(wrapper.vm.financialAssistance.groups[0].lines).toEqual([lineKept]);
      });

      it('should remove a group if it becomes empty', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        // mock data already has id - here we want to remove unsaved
        newGroup[0].lines[0].id = null;
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({ line: newGroup[0].lines[0], group: newGroup[0] });
        expect(financialAssistancePaymentStore.deleteFinancialAssistancePaymentLine).not.toHaveBeenCalled();
        expect(wrapper.vm.financialAssistance.groups).toEqual([]);
      });

      it('should call the delete service when existing line is received', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        wrapper.vm.financialAssistance.groups = [newGroup[0]];

        await wrapper.vm.deletePaymentLine({ line: newGroup[0].lines[0], group: newGroup[0] });
        expect(financialAssistancePaymentStore.deleteFinancialAssistancePaymentLine).toHaveBeenCalledWith(financialAssistance.id, newGroup[0].lines[0].id);
        expect(wrapper.vm.financialAssistance.groups).toEqual(financialAssistancePaymentStore.deleteFinancialAssistancePaymentLine().groups);
      });

      it('calls submitPaymentNameUpdate if  feature branch is on', async () => {
        const newGroup = mockCaseFinancialAssistancePaymentGroups();
        wrapper.vm.$hasFeature = jest.fn(() => true);
        wrapper.vm.submitPaymentNameUpdate = jest.fn();
        await wrapper.vm.deletePaymentLine({ line: newGroup[0].lines[0], group: newGroup[0] });
        expect(wrapper.vm.submitPaymentNameUpdate).toBeCalledTimes(1);
      });
    });

    describe('updatePaymentStatus', () => {
      it('calls service', async () => {
        const newGroup = mockCaseFinancialAssistancePaymentGroups()[0];
        newGroup.id = 'abc-id';
        wrapper.vm.$refs.form.reset = jest.fn();
        const entityId = wrapper.vm.financialAssistance.id;
        await wrapper.vm.updatePaymentStatus({ status: 3, group: newGroup, cancellationReason: 5 });
        expect(financialAssistancePaymentStore.updatePaymentStatus).toHaveBeenCalledWith({
          entityId,
          paymentGroupId: newGroup.id,
          status: 3,
          cancellationReason: 5,
        });
        expect(wrapper.vm.financialAssistance).toEqual(new FinancialAssistancePaymentEntity(financialAssistancePaymentStore.updatePaymentStatus()));
      });
    });

    describe('onClickSubmitPayment', () => {
      it('sets totalAmountToSubmit', async () => {
        const total = '$10.00';

        wrapper.vm.onClickSubmitPayment({ total });

        expect(wrapper.vm.totalAmountToSubmit).toBe(total);
      });

      it('sets showSubmitPaymentDialog', async () => {
        expect(wrapper.vm.showSubmitPaymentDialog).toBe(false);

        wrapper.vm.onClickSubmitPayment({ total: '$10.00' });

        expect(wrapper.vm.showSubmitPaymentDialog).toBe(true);
      });
    });

    describe('makePaymentName', () => {
      it('sets the right name to the financial assistance in edit mode', async () => {
        wrapper.vm.makePaymentLineNames = jest.fn(() => 'mock-payment-line');
        await wrapper.setData({ selectedProgram: program, financialAssistance: { ...financialAssistance, name: 'programName - lineName - 20220530 101010' } });
        wrapper.vm.makePaymentName();
        expect(wrapper.vm.financialAssistance.name).toEqual(`${program.name.translation.en} - mock-payment-line - 20220530 101010`);
      });

      it('sets the right name to the financial assistance when argument keepDate true is passed', async () => {
        wrapper.vm.makePaymentLineNames = jest.fn(() => 'mock-payment-line');
        await wrapper.setData({ isEditMode: false });
        await wrapper.setData({ selectedProgram: program, financialAssistance: { ...financialAssistance, name: 'programName - lineName - 20220530 101010' } });
        wrapper.vm.makePaymentName(true);
        expect(wrapper.vm.financialAssistance.name).toEqual(`${program.name.translation.en} - mock-payment-line - 20220530 101010`);
      });

      it('sets the right name to the financial assistance in create mode', async () => {
        wrapper.vm.makePaymentLineNames = jest.fn(() => 'mock-payment-line');
        const dateNow = format(new Date(), 'yyyyMMdd HH');
        await wrapper.setData({ isEditMode: false });
        await wrapper.setData({ selectedProgram: program });
        wrapper.vm.makePaymentName();
        // ignore mmss (minutes-seconds) as test sometimes fail...
        expect(wrapper.vm.financialAssistance.name.substr(0, wrapper.vm.financialAssistance.name.length - 4))
          .toEqual(`${program.name.translation.en} - mock-payment-line - ${dateNow}`);
      });
    });

    describe('makePaymentLineNames', () => {
      it('returns the unique names of payment lines', async () => {
        const items = [{ mainCategory: { id: 'id-1', name: { translation: { en: 'name-1' } } } },
          { mainCategory: { id: 'id-2', name: { translation: { en: 'name-2' } } } },
          { mainCategory: { id: 'id-3', name: { translation: { en: 'name-3' } } } },
          { mainCategory: { id: 'id-4', name: { translation: { en: 'name-4' } } } }];

        await mountWrapper(false, 'edit', getPiniaForUser('level6'), {
          computed: {
            items() {
              return items;
            },
          },
        });

        await wrapper.setData({
          financialAssistance: {
            ...financialAssistance,
            groups: [
              { lines: [{ status: Status.Active, mainCategoryId: 'id-1' }, { status: Status.Active, mainCategoryId: 'id-2' }] },
              { lines: [{ status: Status.Active, mainCategoryId: 'id-2' }, { status: Status.Active, mainCategoryId: 'id-3' }] },
            ],
          },
        });

        const result = wrapper.vm.makePaymentLineNames();
        expect(result).toEqual('name-1 - name-2 - name-3');
      });
    });

    describe('submitPaymentNameUpdate', () => {
      it('calls makePaymentName', async () => {
        wrapper.vm.makePaymentName = jest.fn();
        await wrapper.vm.submitPaymentNameUpdate();
        expect(wrapper.vm.makePaymentName).toHaveBeenCalledWith(true);
      });

      it('calls action editFinancialAssistancePayment if financial assistance name has changed', async () => {
        wrapper.vm.makePaymentLineNames = jest.fn(() => 'mock-payment-line');
        await wrapper.setData({ selectedProgram: program, financialAssistance: { ...financialAssistance, name: 'programName - lineName - 20220530 101010' } });

        await wrapper.vm.submitPaymentNameUpdate();
        const newFA = { ...wrapper.vm.financialAssistance, name: `${program.name.translation.en} - mock-payment-line - 20220530 101010` };
        expect(financialAssistancePaymentStore.editFinancialAssistancePayment).toHaveBeenCalledWith(newFA);
      });
    });

    describe('confirmBeforeLeavingWithoutSubmittingPayment', () => {
      let next;
      beforeEach(() => {
        next = jest.fn(() => {});
      });
      it('does not call next if the confirmation dialog returns false in DetailMode when approvalStatus is New', async () => {
        wrapper.vm.to = {
          name: 'mockRoute.name',
        };
        await wrapper.setData({
          isDetailsMode: true,
        });
        wrapper.vm.$confirm = jest.fn(() => false);
        await wrapper.vm.confirmBeforeLeavingWithoutSubmittingPayment(next, ApprovalStatus.New);
        expect(next).not.toBeCalled();
      });

      it('calls next if the confirmation dialog returns false in DetailMode when approvalStatus is New', async () => {
        wrapper.vm.to = {
          name: 'mockRoute.name',
        };
        await wrapper.setData({
          isDetailsMode: true,
        });
        wrapper.vm.$confirm = jest.fn(() => true);
        await wrapper.vm.confirmBeforeLeavingWithoutSubmittingPayment(next, ApprovalStatus.New);
        expect(next).toBeCalled();
      });

      it('displays correct message in confirmation dialog in DetailMode when approvalStatus is New', async () => {
        wrapper.vm.to = {
          name: 'mockRoute.name',
        };
        await wrapper.setData({
          isDetailsMode: true,
        });
        await wrapper.vm.confirmBeforeLeavingWithoutSubmittingPayment(next, ApprovalStatus.New);
        expect(wrapper.vm.$confirm).toBeCalledWith({
          title: wrapper.vm.$t('confirmLeaveDialog.title'),
          messages: [
            wrapper.vm.$t('confirmLeaveDialog.paymentUnSubmitted'),
          ],
        });
      });

      it('calls next in DetailMode when the approvalStatus is New and navigating to FinancialAssistance.Edit', async () => {
        wrapper.vm.to = {
          name: 'casefile.financialAssistance.edit',
        };
        await wrapper.setData({
          isDetailsMode: true,
        });
        await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, wrapper.vm.to, undefined, next);
        expect(next).toBeCalled();
      });

      it('displays correct message in confirmation dialog in EditMode when the approvalStatus is New and navigating away from the current page', async () => {
        wrapper.vm.to = {
          name: 'mockRoute.name',
        };
        await wrapper.setData({
          isEditMode: true,
        });
        wrapper.vm.$refs.form.flags = { dirty: false };
        await wrapper.vm.confirmBeforeLeavingWithoutSubmittingPayment(next, ApprovalStatus.New);
        expect(wrapper.vm.$confirm).toBeCalledWith({
          title: wrapper.vm.$t('confirmLeaveDialog.title'),
          messages: [
            wrapper.vm.$t('confirmLeaveDialog.paymentUnSubmitted'),
          ],
        });
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('calls next if the confirmation dialog returns true', async () => {
      wrapper.vm.to = {
        name: 'mockRoute.name',
      };
      wrapper.vm.$refs.form.flags = { dirty: true };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, wrapper.vm.to, undefined, next);
      expect(next).toBeCalled();
    });

    it('does not call next if the confirmation dialog returns false', async () => {
      wrapper.vm.to = {
        name: 'mockRoute.name',
      };
      wrapper.vm.$refs.form.flags = { dirty: true };
      wrapper.vm.$confirm = jest.fn(() => false);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, wrapper.vm.to, undefined, next);
      expect(next).not.toBeCalled();
    });

    it('calls next if dirty is false', async () => {
      wrapper.vm.to = {
        name: 'mockRoute.name',
      };
      wrapper.vm.$refs.form.flags = { dirty: false };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, wrapper.vm.to, undefined, next);
      expect(next).toBeCalled();
    });

    it('calls next in EditMode when the approvalStatus is New and navigating to Financial Assistance Details', async () => {
      wrapper.vm.to = {
        name: 'casefile.financialAssistance.details',
      };
      await wrapper.setData({
        isEditMode: true,
      });
      wrapper.vm.$refs.form.flags = { dirty: false };
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, wrapper.vm.to, undefined, next);
      expect(next).toBeCalled();
    });
  });
});
