import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
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
} from '@/entities/financial-assistance-payment';
import {
  mockCombinedCaseFile,
  IdentityAuthenticationStatus,
  ValidationOfImpactStatus,
  mockCombinedCaseFiles,
} from '@/entities/case-file';
import { mockProgramEntity, mockCombinedPrograms } from '@/entities/program';
import { mockOptionItemData } from '@/entities/optionItem';
import Component from '../CreateFinancialAssistance.vue';

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

describe('CreateFinancialAssistance.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.financialAssistance.actions.addFinancialAssistance = jest.fn(() => combinedFinancialAssistance);
    storage.program.actions.fetchProgram = jest.fn(() => program);
    storage.caseFile.getters.get = jest.fn(() => caseFileCombined);
    storage.caseFile.actions.fetch = jest.fn(() => caseFileCombined);
    storage.financialAssistance.getters.items = jest.fn(() => items);
    storage.financialAssistanceCategory.getters.getAll = jest.fn(() => optionItems);

    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
      computed: {
        caseFile() {
          return caseFileCombined.entity;
        },
      },
    });
  });

  describe('Template', () => {
    beforeEach(async () => {
      jest.clearAllMocks();

      wrapper = mount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
        computed: {
          caseFile() {
            return caseFileCombined.entity;
          },
        },
      });
    });

    describe('page-title', () => {
      it('is rendered', async () => {
        expect(wrapper.findDataTest('page-title').exists()).toBeTruthy();
      });
    });

    describe('Add new payment line btn', () => {
      let element;
      beforeEach(() => {
        element = wrapper.find('[data-test="financial-addPaymentLineBtn"]');
      });
      it('renders', async () => {
        expect(element.exists()).toBeTruthy();
      });
      it('is disabled', async () => {
        wrapper.vm.selectedProgram = null;
        await wrapper.vm.$nextTick();
        expect(element.element.disabled).toBe(true);
      });
      it('is enabled', async () => {
        wrapper.vm.selectedProgram = program;
        await wrapper.vm.$nextTick();
        expect(element.element.disabled).toBe(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call storage to fetch categories', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {},
        });
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(storage.financialAssistanceCategory.actions.fetchAll).toHaveBeenCalled();
      });

      it('call searchTables', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {},
        });
        jest.spyOn(wrapper.vm, 'searchTables').mockImplementation(() => financialAssistance);

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.searchTables).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('submitLabel', () => {
      it('returns the key for submitLabel', () => {
        expect(wrapper.vm.submitLabel).toBe('common.buttons.create');
      });
    });

    describe('showWarning', () => {
      it('return true if any condition is not meet', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return caseFileCombined.entity;
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

      it('return true if any condition is not meet', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return caseFileCombined.entity;
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

      it('return true if both condition is not meet', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return caseFileCombined.entity;
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

      it('return false if both conditions are meet', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return caseFileCombined.entity;
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

      it('should return true if program requires to be impacted and user is impacted', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined.entity;
              caseFile2.impactStatusValidation.status = ValidationOfImpactStatus.Impacted;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.impacted = true;

        expect(wrapper.vm.isImpacted).toBe(true);
      });

      it('should return false if program requires to be impacted and user isnt impacted', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined.entity;
              caseFile2.impactStatusValidation.status = ValidationOfImpactStatus.NotImpacted;

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

      it('should return true if program requires to be authenticated and user is authenticated', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined.entity;
              caseFile2.identityAuthentication.status = IdentityAuthenticationStatus.Passed;

              return caseFile2;
            },
          },
        });

        wrapper.vm.selectedProgram = program;
        wrapper.vm.selectedProgram.eligibilityCriteria.authenticated = true;

        expect(wrapper.vm.isAuthenticated).toBe(true);
      });

      it('should return false if program requires to be authenticated and user isnt authenticated', () => {
        wrapper = shallowMount(Component, {
          localVue,
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              const caseFile2 = caseFileCombined.entity;
              caseFile2.identityAuthentication.status = IdentityAuthenticationStatus.Failed;

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
        wrapper.vm.financialAssistance.validate = jest.fn(() => false);

        expect(wrapper.vm.isDisabled).toBe(true);
      });

      it('returns true or false if the create should be disabled', () => {
        wrapper.vm.financialAssistance = new FinancialAssistancePaymentEntity(caseFileFinancialAssistance);
        wrapper.vm.financialAssistance.validate = jest.fn(() => true);

        expect(wrapper.vm.isDisabled).toBe(false);
      });
    });

    describe('caseFile', () => {
      it('should return the associated caseFile', () => {
        expect(wrapper.vm.caseFile).toEqual(caseFileCombined.entity);
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

    describe('onSubmitPaymentLine', () => {
      it('should add the new PaymentLine', async () => {
        wrapper.vm.financialAssistance = financialAssistance;
        wrapper.vm.financialAssistance.groups = [];
        await wrapper.vm.onSubmitPaymentLine(caseFileFinancialAssistanceGroups[0]);
        expect(wrapper.vm.financialAssistance.groups[0].groupingInformation).toBe(caseFileFinancialAssistanceGroups[0].groupingInformation);
        expect(wrapper.vm.financialAssistance.groups[0].lines).toBe(caseFileFinancialAssistanceGroups[0].lines);
        expect(wrapper.vm.financialAssistance.groups[0].paymentStatus).toBe(caseFileFinancialAssistanceGroups[0].paymentStatus);
      });
    });
  });
});
