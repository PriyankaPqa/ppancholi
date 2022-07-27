import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCaseFileReferralEntity, mockCombinedCaseFileReferral, ReferralMethod } from '@/entities/case-file-referral';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import routes from '@/constants/routes';
import { mockUserStateLevel } from '@/test/helpers';

import { mockCombinedCaseFile } from '@/entities/case-file';
import { mockCombinedEvent, EEventStatus } from '@/entities/event';
import Component from './CaseFileReferralDetails.vue';

const storage = mockStorage();
const localVue = createLocalVue();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('CaseFileReferralDetails', () => {
  let wrapper;
  const combinedReferral = mockCombinedCaseFileReferral();
  const referral = combinedReferral.entity;

  storage.caseFileReferral.actions.fetchTypes = jest.fn(() => mockOptionItemData());
  storage.caseFileReferral.actions.fetchOutcomeStatuses = jest.fn(() => mockOptionItemData());
  storage.caseFileReferral.getters.types = jest.fn(() => mockOptionItemData());
  storage.caseFileReferral.getters.outcomeStatuses = jest.fn(() => mockOptionItemData());
  storage.caseFileReferral.getters.get = jest.fn(() => combinedReferral);
  storage.caseFileReferral.actions.fetch = jest.fn(() => mockCombinedCaseFileReferral());

  describe('Computed', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
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
      it('returns true if user has level 1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            caseFile: () => mockCombinedCaseFile(),
            event() {
              return mockEvent;
            },
          },
          store: {
            ...mockUserStateLevel(1),
            caseFile: {
              searchLoading: false,
            },
          },
          mocks: {
            $storage: {
              caseFileReferral: {
                actions: {
                  fetchTypes: jest.fn(() => mockOptionItemData()),
                  fetchOutcomeStatuses: jest.fn(() => mockOptionItemData()),
                  fetch: jest.fn(() => mockCombinedCaseFileReferral()),
                },
                getters: {
                  types: jest.fn(() => mockOptionItemData()),
                  outcomeStatuses: jest.fn(() => mockOptionItemData()),
                  get: jest.fn(() => combinedReferral),
                },
              },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: 'mock-caseFile-id',
            referralId: 'mock-referral-id',
          },
          computed: {
            event() {
              return mockEvent;
            },
          },
          store: {
            modules: {
              caseFile: {
                searchLoading: false,
              },
              user: {
                state:
                  {
                    oid: '7',
                    email: 'test@test.ca',
                    family_name: 'Joe',
                    given_name: 'Pink',
                    roles: ['contributorIM'],
                  },
              },
            },
          },
          mocks: {
            $storage: {
              caseFileReferral: {
                actions: {
                  fetchTypes: jest.fn(() => mockOptionItemData()),
                  fetchOutcomeStatuses: jest.fn(() => mockOptionItemData()),
                  fetch: jest.fn(() => mockCombinedCaseFileReferral()),
                },
                getters: {
                  types: jest.fn(() => mockOptionItemData()),
                  outcomeStatuses: jest.fn(() => mockOptionItemData()),
                  get: jest.fn(() => combinedReferral),
                },
              },
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
    });

    describe('referral', () => {
      it('calls the referral getter', () => {
        expect(storage.caseFileReferral.getters.get).toHaveBeenCalledTimes(1);
      });
      it('sets the right data', () => {
        expect(wrapper.vm.referral).toEqual(referral);
      });
    });

    describe('typeName', () => {
      it('calls the getter types', () => {
        expect(storage.caseFileReferral.getters.types).toHaveBeenCalledTimes(1);
      });

      it('returns the right type', () => {
        wrapper = shallowMount(Component, {
          localVue,
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
        expect(storage.caseFileReferral.getters.outcomeStatuses).toHaveBeenCalledTimes(1);
      });

      it('returns the right status', () => {
        wrapper = shallowMount(Component, {
          localVue,
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
      expect(wrapper.vm.$storage.caseFileReferral.actions.fetchTypes).toHaveBeenCalledTimes(1);
    });

    it('should call fetchOutcomeStatuses', () => {
      expect(wrapper.vm.$storage.caseFileReferral.actions.fetchOutcomeStatuses).toHaveBeenCalledTimes(1);
    });

    it('should call fetch', () => {
      expect(wrapper.vm.$storage.caseFileReferral.actions.fetch).toHaveBeenCalledWith(
        { caseFileId: 'mock-caseFile-id', id: 'mock-referral-id' },
        { useEntityGlobalHandler: true, useMetadataGlobalHandler: false },
      );
    });
  });

  describe('Template', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
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
