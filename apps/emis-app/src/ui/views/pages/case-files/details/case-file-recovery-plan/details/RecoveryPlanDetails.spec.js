import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import routes from '@/constants/routes';
import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { createTestingPinia } from '@pinia/testing';
import Component from './RecoveryPlanDetails.vue';

const localVue = createLocalVue();

let wrapper;

describe('RecoveryPlanDetails', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({ stubActions: false });
    useMockCaseFileStore(pinia);
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      propsData: {
        id: 'mock-id-1',
      },
    });
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('should return true for l6 user', async () => {
        const pinia = getPiniaForUser(UserRoles.level6);
        const caseFileStore = useMockCaseFileStore(pinia);
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));

        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }),
          },
          mocks: {
            $hasLevel: (lvl) => lvl <= 'level6',
          },
        });
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should return true for l5 user and case file is open', async () => {
        const pinia = getPiniaForUser(UserRoles.level5);
        const caseFileStore = useMockCaseFileStore(pinia);
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open }),
          },
          mocks: {
            $hasLevel: (lvl) => lvl <= 'level5',
          },
        });
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should return false for l5 user and case file is not open', async () => {
        const pinia = getPiniaForUser(UserRoles.level5);
        const caseFileStore = useMockCaseFileStore(pinia);
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));
        const wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }),
          },
          mocks: {
            $hasLevel: (lvl) => lvl <= 'level5',
          },
        });
        expect(wrapper.vm.canEdit).toEqual(false);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should fetch the casefile', async () => {
        const { caseFileStore, pinia } = useMockCaseFileStore();
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
          },
        });

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(caseFileStore.fetch).toHaveBeenCalledWith(wrapper.vm.caseFileId);
      });
    });
  });

  describe('Methods', () => {
    describe('getCaseFileDocumentRoute', () => {
      it('should redirect to case file documents', () => {
        wrapper.vm.getCaseFileDocumentRoute();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.documents.home.name,
          params: {
            id: 'mock-id-1',
          },
        });
      });
    });

    describe('getEditRecoveryPlanRoute', () => {
      it('should redirect to case file recovery plan details', () => {
        wrapper.vm.getEditRecoveryPlanRoute();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.recoveryPlan.edit.name,
          params: {
            id: 'mock-id-1',
          },
        });
      });
    });
  });
});
