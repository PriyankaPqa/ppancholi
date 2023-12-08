import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import Component from './CreateEditRecoveryPlan.vue';

const localVue = createLocalVue();
const { pinia, caseFileStore } = useMockCaseFileStore();
const services = mockProvider();

const mockRecoveryPlan = {
  hasRecoveryPlan: true,
  crcProvided: true,
  startDate: '2023-11-26',
};

describe('CreateEditRecoveryPlan', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}, level = 5) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        id: 'mock-id-1',
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    describe('recoveryPlan_crcProvidedSection', () => {
      it('should be not rendered when hasRecoveryPlan is false', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: false,
                crcProvided: null,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_crcProvidedSection');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered when hasRecoveryPlan is true', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: true,
                crcProvided: null,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_crcProvidedSection');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('recoveryPlan_startDateSection', () => {
      it('should be not rendered when crcProvided is false', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: true,
                crcProvided: false,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_startDateSection');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered when crcProvided is true', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: true,
                crcProvided: true,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_startDateSection');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('recoveryPlan_actionSection', () => {
      it('should be not rendered when hasRecoveryPlan is null', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: null,
                crcProvided: null,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_actionSection');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered when hasRecoveryPlan is not null', async () => {
        await doMount(true, {
          data() {
            return {
              recoveryPlanLocal: {
                hasRecoveryPlan: false,
                crcProvided: null,
                startDate: null,
              },
            };
          },
        });
        const element = wrapper.findDataTest('recoveryPlan_actionSection');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('recoveryPlan_hasRecoveryPlan_radioGroup', () => {
      it('should trigger resetCrcProvidedAndStartDate when change', async () => {
        wrapper.vm.resetCrcProvidedAndStartDate = jest.fn();
        const element = wrapper.findDataTest('recoveryPlan_hasRecoveryPlan_radioGroup');
        await element.vm.$emit('change');
        expect(wrapper.vm.resetCrcProvidedAndStartDate).toHaveBeenCalled();
      });
    });
  });

  describe('Computed', () => {
    describe('canEdit', () => {
      it('should return true for l6 user', async () => {
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level6),
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }),
          },
        }, 6);
        await flushPromises();
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should return true for l5 user and case file is open', async () => {
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level5),
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open }),
          },
        });
        await flushPromises();
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should return false for l5 user and case file is not open', async () => {
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }));
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level5),
          computed: {
            caseFile: () => mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed }),
          },
        });
        await flushPromises();
        expect(wrapper.vm.canEdit).toEqual(false);
      });
    });

    describe('isDirty', () => {
      it('should return false when originalData and local data are same', async () => {
        await wrapper.setData({
          originalData: mockRecoveryPlan,
          recoveryPlanLocal: mockRecoveryPlan,
        });
        expect(wrapper.vm.isDirty).toEqual(false);
      });

      it('should return true when originalData and local data are different', async () => {
        await wrapper.setData({
          originalData: mockRecoveryPlan,
          recoveryPlanLocal: {
            hasRecoveryPlan: true,
            crcProvided: false,
            startDate: null,
          },
        });
        expect(wrapper.vm.isDirty).toEqual(true);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should set local data and store original data when is edit mode', async () => {
        await doMount(true, {
          computed: {
            recoveryPlan: () => mockRecoveryPlan,
            isEditMode: () => true,
          },
        });
        wrapper.vm.setOriginalData = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.recoveryPlanLocal).toEqual(mockRecoveryPlan);
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledWith(mockRecoveryPlan);
      });
    });
  });

  describe('Methods', () => {
    describe('submit', () => {
      it('does not call editRecoveryPlan unless form validation succeeds', async () => {
        wrapper.vm.$services.caseFiles.editRecoveryPlan = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => false);

        await wrapper.vm.submit();
        expect(wrapper.vm.$services.caseFiles.editRecoveryPlan).toHaveBeenCalledTimes(0);
      });

      it('should call editRecoveryPlan with recoveryPlanLocal', async () => {
        await wrapper.setData({
          recoveryPlanLocal: mockRecoveryPlan,
        });
        wrapper.vm.$services.caseFiles.editRecoveryPlan = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(wrapper.vm.$services.caseFiles.editRecoveryPlan).toHaveBeenCalledWith('mock-id-1', mockRecoveryPlan);
      });

      it('should call setOriginalData with the data from server and redirect to recovery plan details page', async () => {
        await wrapper.setData({
          recoveryPlanLocal: mockRecoveryPlan,
        });
        wrapper.vm.setOriginalData = jest.fn();
        wrapper.vm.$services.caseFiles.editRecoveryPlan = jest.fn(() => mockCaseFileEntity({
          recoveryPlan: mockRecoveryPlan,
        }));
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.submit();
        expect(wrapper.vm.setOriginalData).toHaveBeenCalledWith(mockRecoveryPlan);
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.caseFile.recoveryPlan.details.name, params: { id: 'mock-id-1' } });
      });
    });

    describe('cancel', () => {
      it('should call resetLocalData', () => {
        wrapper.vm.resetLocalData = jest.fn();
        wrapper.vm.cancel();
        expect(wrapper.vm.resetLocalData).toHaveBeenCalled();
      });

      it('should reset local data with original data and redirect to Details page', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          computed: {
            isEditMode: () => true,
          },
        });
        await wrapper.setData({
          originalData: {
            hasRecoveryPlan: true,
            crcProvided: false,
            startDate: null,
          },
          recoveryPlanLocal: mockRecoveryPlan,
        });
        await flushPromises();
        wrapper.vm.$router.replace = jest.fn();
        wrapper.vm.cancel();
        expect(wrapper.vm.recoveryPlanLocal).toEqual({
          hasRecoveryPlan: true,
          crcProvided: false,
          startDate: null,
        });
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: routes.caseFile.recoveryPlan.details.name, params: { id: 'mock-id-1' } });
      });
    });

    describe('setOriginalData', () => {
      it('should set original data properly', async () => {
        await wrapper.setData({
          originalData: {
            hasRecoveryPlan: null,
            crcProvided: null,
            startDate: null,
          },
        });
        wrapper.vm.setOriginalData(mockRecoveryPlan);
        expect(wrapper.vm.originalData).toEqual(mockRecoveryPlan);
      });
    });

    describe('resetLocalData', () => {
      it('should reset local data properly', async () => {
        wrapper.setData({
          recoveryPlanLocal: mockRecoveryPlan,
        });
        wrapper.vm.resetLocalData();
        expect(wrapper.vm.recoveryPlanLocal).toEqual({
          hasRecoveryPlan: null,
          crcProvided: null,
          startDate: null,
        });
      });
    });

    describe('resetCrcProvidedAndStartDate', () => {
      it('should reset local crcProvided and startDate data properly', async () => {
        wrapper.setData({
          recoveryPlanLocal: mockRecoveryPlan,
        });
        wrapper.vm.resetCrcProvidedAndStartDate();
        expect(wrapper.vm.recoveryPlanLocal).toEqual({
          hasRecoveryPlan: true,
          crcProvided: null,
          startDate: null,
        });
      });
    });
  });
});
