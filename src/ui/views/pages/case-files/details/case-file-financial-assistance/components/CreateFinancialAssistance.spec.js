import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/store/storage';
import
{
  mockFinancialAssistanceTableEntity,
  mockCombinedFinancialAssistance,
} from '@/entities/financial-assistance';
import
{
  CaseFinancialAssistanceEntity,
  mockCaseFinancialAssistanceEntity,
} from '@/entities/case-file-financial-assistance';
import { mockCombinedCaseFile, IdentityAuthenticationStatus, ValidationOfImpactStatus } from '@/entities/case-file';
import { mockProgramCaseFinancialAssistance } from '@/entities/program';
import Component from './CreateFinancialAssistance.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const financialAssistance = mockFinancialAssistanceTableEntity();
const combinedFinancialAssistance = mockCombinedFinancialAssistance();
const caseFileFinancialAssistance = mockCaseFinancialAssistanceEntity();
const program = mockProgramCaseFinancialAssistance();
const caseFileCombined = mockCombinedCaseFile();

describe('CreateFinancialAssistance.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    storage.financialAssistance.actions.addFinancialAssistance = jest.fn(() => combinedFinancialAssistance);
    storage.program.actions.fetchProgram = jest.fn(() => program);
    storage.caseFile.getters.get = jest.fn(() => caseFileCombined);
    storage.caseFile.actions.fetch = jest.fn(() => caseFileCombined);

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

  describe('Lifecycle', () => {
    describe('created', () => {
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
        wrapper.vm.financialAssistance = new CaseFinancialAssistanceEntity(caseFileFinancialAssistance);

        wrapper.vm.financialAssistance.validate = jest.fn(() => false);
        expect(wrapper.vm.isDisabled).toBe(true);
      });

      it('returns true or false if the create should be disabled', () => {
        wrapper.vm.financialAssistance = new CaseFinancialAssistanceEntity(caseFileFinancialAssistance);
        wrapper.vm.financialAssistance.validate = jest.fn(() => true);

        expect(wrapper.vm.isDisabled).toBe(false);
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

    describe('updateSelectedProgram', () => {
      it('should call storage actions with proper parameters', async () => {
        await wrapper.vm.updateSelectedProgram(financialAssistance);
        expect(storage.program.actions.fetchProgram).toHaveBeenCalledWith(financialAssistance.programId);
      });

      it('should set selected program', async () => {
        await wrapper.vm.updateSelectedProgram(financialAssistance);

        expect(wrapper.vm.selectedProgram?.id).toEqual(financialAssistance.programId);
      });
    });

    describe('verifyAuthenticated', () => {
      it('verify if the caseFile identityAuthentication matches with the program requirement', async () => {

      });
    });
  });
});
