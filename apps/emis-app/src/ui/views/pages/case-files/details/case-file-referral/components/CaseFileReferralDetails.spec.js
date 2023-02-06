import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileReferralEntity, ReferralMethod } from '@libs/entities-lib/case-file-referral';
import { mockStorage } from '@/storage';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import routes from '@/constants/routes';
import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import Component from './CaseFileReferralDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;
const { pinia, caseFileReferralStore } = useMockCaseFileReferralStore();
describe('CaseFileReferralDetails', () => {
  let wrapper;
  const referral = mockCaseFileReferralEntity({ id: '1' });

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'mock-caseFile-id',
          referralId: 'mock-referral-id',
        },
        computed: {
          event() {
            return mockEvent;
          },
        },
        mocks: { $storage: storage },
      });
    });

    describe('canEdit', () => {
      it('returns false if user does not have level 1', async () => {
        const pinia = getPiniaForUser('contributorIM');
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
        });

        await wrapper.setData({
          caseFile: {
            ...wrapper.vm.caseFile,
            readonly: false,
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });

      it('returns true if user has level 1', async () => {
        const pinia = getPiniaForUser('level1');
        useMockCaseFileStore(pinia);
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });
    });

    describe('referral', () => {
      it('calls the referral getter', () => {
        expect(caseFileReferralStore.getById).toHaveBeenCalledTimes(1);
      });
      it('sets the right data', () => {
        expect(JSON.stringify(wrapper.vm.referral)).toEqual(JSON.stringify(referral));
      });
    });

    describe('typeName', () => {
      it('calls the getter types', () => {
        expect(caseFileReferralStore.getAllTypes).toHaveBeenCalledTimes(1);
      });

      it('returns the right type', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            referral() {
              return mockCaseFileReferralEntity({ type: { optionItemId: mockOptionItemData()[0].id } });
            },
            event() {
              return mockEvent;
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.typeName).toEqual(mockOptionItemData()[0].name.translation.en);
      });
    });

    describe('outcomeStatus', () => {
      it('calls the getter types', () => {
        expect(caseFileReferralStore.getAllOutcomeStatuses).toHaveBeenCalledTimes(1);
      });

      it('returns the right status', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            referral() {
              return mockCaseFileReferralEntity({ outcomeStatus: { optionItemId: mockOptionItemData()[0].id } });
            },
            event() {
              return mockEvent;
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.outcomeStatus).toEqual(mockOptionItemData()[0].name.translation.en);
      });
    });

    describe('referralData', () => {
      it('returns the right data', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            typeName() {
              return 'mock-type-name';
            },
            event() {
              return mockEvent;
            },
          },
          mocks: { $storage: storage },
        });

        expect(wrapper.vm.referralData).toEqual([
          {
            label: 'caseFile.referral.referralType',
            data: 'mock-type-name',
            test: 'type',
          },
          {
            label: 'caseFile.referral.notes',
            data: referral.note,
            test: 'notes',
          },
          {
            label: 'referral.method',
            data: ReferralMethod[referral.method],
            test: 'method',
          },
        ]);
      });
    });

    describe('referralEditRoute', () => {
      it('should redirect to the case referral edit page', () => {
        expect(wrapper.vm.referralEditRoute).toEqual({
          name: routes.caseFile.referrals.edit.name,
          params: {
            referralId: 'mock-referral-id',
          },
        });
      });
    });
  });

  describe('lifecycle - create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'mock-caseFile-id',
          referralId: 'mock-referral-id',
        },
        computed: {
          event() {
            return mockEvent;
          },
        },
        mocks: { $storage: storage },
      });
    });

    it('should call fetchTypes', () => {
      expect(caseFileReferralStore.fetchTypes).toHaveBeenCalledTimes(1);
    });

    it('should call fetchOutcomeStatuses', () => {
      expect(caseFileReferralStore.fetchOutcomeStatuses).toHaveBeenCalledTimes(1);
    });

    it('should call fetch', () => {
      expect(caseFileReferralStore.fetch).toHaveBeenCalledWith(
        { caseFileId: 'mock-caseFile-id', id: 'mock-referral-id' },
      );
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: 'mock-caseFile-id',
          referralId: 'mock-referral-id',
        },
        mocks: { $storage: storage },
        computed: {
          referralData() {
            return [{
              label: 'mock-label',
              data: 'mock-data',
              test: 'mock-test',
            }];
          },
          outcomeStatus() {
            return 'mock-outcome';
          },
          canEdit() {
            return true;
          },
          event() {
            return mockEvent;
          },
        },
      });
    });

    describe('referral data', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('referral_details_mock-test');
      });
      it('displays the right label', () => {
        expect(element.text()).toContain('mock-label');
      });
      it('contains the right data', () => {
        expect(element.text()).toContain('mock-data');
      });
    });

    describe('outcome status', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('referral_details_outcome');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });
      it('contains the right data', () => {
        expect(element.text()).toContain('mock-outcome');
      });
    });

    describe('back button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('referral_details_back_btn');
      });
      it('renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls goToReferrals when clicked', async () => {
        jest.spyOn(wrapper.vm, 'goToReferrals').mockImplementation(() => {});
        await element.vm.$emit('click');
        expect(wrapper.vm.goToReferrals).toHaveBeenCalledTimes(1);
      });
    });
  });
});
