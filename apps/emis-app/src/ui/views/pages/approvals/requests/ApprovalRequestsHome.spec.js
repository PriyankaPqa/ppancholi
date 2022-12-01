import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import { mockCombinedCaseFinancialAssistance } from '@libs/entities-lib/financial-assistance-payment';
import Component, { SelectedTab } from './ApprovalRequestsHome.vue';

const localVue = createLocalVue();
const storage = mockStorage();
let wrapper;

const FAPayment = mockCombinedCaseFinancialAssistance();
storage.user.getters.userId = jest.fn(() => '1234');
storage.financialAssistancePayment.getters.getByIds = jest.fn(() => [FAPayment]);

const doMount = (otherOptions = {}) => {
  const options = {
    localVue,
    mocks: { $storage: storage },
    ...otherOptions,
  };
  wrapper = shallowMount(Component, options);
};

describe('ApprovalRequestsHome', () => {
  describe('Created', () => {
    beforeEach(() => doMount());

    it('should call fetchRoles', async () => {
      wrapper.vm.$storage.userAccount.actions.fetchRoles = jest.fn();
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.$storage.userAccount.actions.fetchRoles).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    beforeEach(() => doMount());

    describe('pending', () => {
      it('renders if selected tab is pending', async () => {
        await wrapper.setData({ selectedTab: SelectedTab.Pending });
        const table = wrapper.findDataTest('approval-requests-table-pending');
        expect(table.exists()).toBeTruthy();
      });
      it(' does not render if selected tab is approved', async () => {
        await wrapper.setData({ selectedTab: SelectedTab.Approved });
        const table = wrapper.findDataTest('approval-requests-table-pending');
        expect(table.exists()).toBeFalsy();
      });
    });

    describe('approved', () => {
      it('renders if selected tab is approved', async () => {
        await wrapper.setData({ selectedTab: SelectedTab.Approved });
        const table = wrapper.findDataTest('approval-requests-table-approved');
        expect(table.exists()).toBeTruthy();
      });
      it(' does not render if selected tab is pending', async () => {
        await wrapper.setData({ selectedTab: SelectedTab.Pending });
        const table = wrapper.findDataTest('approval-requests-table-approved');
        expect(table.exists()).toBeFalsy();
      });
    });
  });
});
