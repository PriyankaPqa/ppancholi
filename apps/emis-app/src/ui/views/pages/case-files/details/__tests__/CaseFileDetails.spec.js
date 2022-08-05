import _cloneDeep from 'lodash/cloneDeep';
import { mockCombinedHousehold } from '@libs/entities-lib/household';
import { ECanadaProvinces } from '@libs/core-lib/types';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { mockStorage } from '@/store/storage';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { mockUserStateLevel } from '@/test/helpers';
import { mockCombinedCaseFile } from '@libs/entities-lib/case-file';
import { mockCombinedEvent, EEventStatus } from '@libs/entities-lib/event';

import Component from '../CaseFileDetails.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const mockCaseFile = mockCombinedCaseFile();
const mockEvent = mockCombinedEvent();
mockEvent.entity.schedule.status = EEventStatus.Open;

describe('CaseFileDetails.vue', () => {
  let wrapper;

  storage.caseFile.getters.get = jest.fn(() => mockCaseFile);
  storage.household.actions.fetch = jest.fn(() => mockCombinedHousehold());
  storage.caseFile.actions.fetch = jest.fn(() => [mockCaseFile]);

  const doMount = async () => {
    const params = {
      localVue,
      propsData: {
        id: mockCaseFile.entity.id,
      },
      computed: {
        caseFile() {
          return mockCaseFile;
        },
        event() {
          return mockEvent;
        },
        primaryBeneficiaryFullName() {
          return 'mock-full-name';
        },
        hasPhoneNumbers() {
          return true;
        },
        addressFirstLine() {
          return '100 Right ave';
        },
        addressSecondLine() {
          return 'Montreal, QC H2H 2H2';
        },
        primaryBeneficiary() {
          return {
            email: 'Jane.doe@email.com',
            mobilePhoneNumber: {
              number: '(514) 123 4444',
              extension: '',
            },
            homePhoneNumber: {
              number: '(514) 123 2222',
              extension: '123',
            },
            alternatePhoneNumber: {
              number: '(514) 123 1111',
              extension: '',
            },
          };
        },
      },
      mocks: {
        $storage: storage,
      },
    };

    wrapper = mount(Component, params);
    await wrapper.setRole('level1');
  };

  describe('Template', () => {
    beforeEach(async () => {
      await doMount();
    });

    describe('page template left menu title', () => {
      it('displays the beneficiary name', () => {
        const pageTemplate = wrapper.findComponent(PageTemplate);
        expect(pageTemplate.props('leftMenuTitle')).toEqual('mock-full-name');
      });
    });

    describe('caseFileNumber', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-caseFileNumber');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(mockCaseFile.entity.caseFileNumber);
      });
    });

    describe('event', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-event');
      });
      it('is rendered', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(mockCaseFile.metadata.event.name.translation.en);
      });
    });

    describe('verify-identity', () => {
      let element;
      it('is rendered when level 1+', async () => {
        await wrapper.setRole('level1');
        element = wrapper.findDataTest('caseFileDetails-verify-identity-icon');
        expect(element.exists()).toBeTruthy();
      });

      it('is not rendered when level is not 1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
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
              caseFile: {
                getters: { get: jest.fn(() => mockCaseFile) },
                actions: { fetch: jest.fn(() => [mockCaseFile]) },
              },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        element = wrapper.findDataTest('caseFileDetails-verify-identity-icon');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('verify-impact', () => {
      let element;
      it('is rendered when level 1+', async () => {
        await wrapper.setRole('level1');
        element = wrapper.findDataTest('caseFileDetails-verify-impact-icon');
        expect(element.exists()).toBeTruthy();
      });

      it('is not rendered when level is not 1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
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
              caseFile: {
                getters: { get: jest.fn(() => mockCaseFile) },
                actions: { fetch: jest.fn(() => [mockCaseFile]) },
              },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        element = wrapper.findDataTest('caseFileDetails-verify-impact-icon');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('email', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-email');
      });
      it('is rendered if the beneficiary has an email', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toEqual(wrapper.vm.primaryBeneficiary.email);
      });

      it('is NOT rendered if the beneficiary does not have an email', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            event() {
              return mockEvent;
            },
            primaryBeneficiary() {
              return { email: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-email');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('home phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-home-phone-number');
      });
      it('is rendered if the beneficiary has a home phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.homePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a home phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            event() {
              return mockEvent;
            },
            primaryBeneficiary() {
              return { homePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-home-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('mobile phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-mobile-phone-number');
      });
      it('is rendered if the beneficiary has a mobile phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.mobilePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a mobile number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            event() {
              return mockEvent;
            },
            primaryBeneficiary() {
              return { mobilePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-mobile-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('alternate phone number', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-alternate-phone-number');
      });
      it('is rendered if the beneficiary has an alternate phone number', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.props('phoneNumber')).toEqual(wrapper.vm.primaryBeneficiary.alternatePhoneNumber);
      });

      it('is NOT rendered if the beneficiary does not have a alternate number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            caseFile() {
              return mockCaseFile;
            },
            event() {
              return mockEvent;
            },
            primaryBeneficiary() {
              return { alternatePhoneNumber: null };
            },
          },
        });
        element = wrapper.findDataTest('caseFileDetails-alternate-phone-number');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('home address', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-home-address');
      });
      it('is rendered if the beneficiary has an address', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('displays the correct data', () => {
        expect(element.text()).toContain(wrapper.vm.addressFirstLine);
        expect(element.text()).toContain(wrapper.vm.addressSecondLine);
      });
    });

    describe('household member count', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('caseFileDetails-household-member-count');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('beneficiary profile button', () => {
      let element;
      beforeEach(() => {
        element = wrapper.findDataTest('household-profile-btn');
      });
      it('is renders', () => {
        expect(element.exists()).toBeTruthy();
      });

      it('calls goToHouseholdProfile when clicked', async () => {
        jest.spyOn(wrapper.vm, 'goToHouseholdProfile').mockImplementation(() => {});

        await element.vm.$emit('click');
        expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      storage.caseFile.getters.get = jest.fn(() => mockCaseFile);
      storage.household.actions.fetch.mockReturnValueOnce(mockCombinedHousehold());
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.entity.id,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('addressFirstLine', () => {
      it('return the right address information when there is a suite number', async () => {
        const altHousehold = _cloneDeep(mockCombinedHousehold());
        altHousehold.entity.address.address.unitSuite = '100';
        altHousehold.entity.address.address.streetAddress = '200 Left ave';

        await wrapper.setData({
          household: altHousehold,
        });

        expect(wrapper.vm.addressFirstLine).toEqual('100-200 Left ave');
      });

      it('return the right address information when there is no suite number', async () => {
        const altHousehold = _cloneDeep(mockCombinedHousehold());
        altHousehold.entity.address.address.unitSuite = '';
        altHousehold.entity.address.address.streetAddress = '200 Main ave';

        await wrapper.setData({
          household: altHousehold,
        });
        expect(wrapper.vm.addressFirstLine).toEqual('200 Main ave');
      });
    });

    describe('addressSecondLine', () => {
      it('return the right address information', async () => {
        const altHousehold = _cloneDeep(mockCombinedHousehold());
        altHousehold.entity.address.address.postalCode = 'H2H 2H2';
        altHousehold.entity.address.address.city = 'Montreal';
        altHousehold.entity.address.address.province = ECanadaProvinces.QC;

        await wrapper.setData({
          household: altHousehold,
        });

        expect(wrapper.vm.addressSecondLine).toEqual('Montreal, QC, H2H 2H2');
      });
    });

    describe('caseFile', () => {
      it('return the case file by id from the storage', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.caseFile).toEqual(mockCaseFile);
      });
    });

    describe('primaryBeneficiary', () => {
      it('sets the right beneficiary from the household metadata', async () => {
        const altHousehold = {
          entity: { primaryBeneficiary: 'mock-beneficiary-id' },
          metadata: {
            memberMetadata: [
              { id: 'mock-beneficiary-id', firstName: 'Jane', lastName: 'Doe' },
              { id: 'foo', firstName: 'Joe', lastName: 'Dane' },
            ],
          },
        };
        await wrapper.setData({ household: altHousehold });
        expect(wrapper.vm.primaryBeneficiary).toEqual({ id: 'mock-beneficiary-id', firstName: 'Jane', lastName: 'Doe' });
      });
    });

    describe('primaryBeneficiaryFullName', () => {
      it('return the beneficiary first and last name', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            primaryBeneficiary() {
              return { firstName: 'Jack', lastName: 'White' };
            },
          },
        });
        expect(wrapper.vm.primaryBeneficiaryFullName).toEqual('Jack White');
      });
    });

    describe('hasPhoneNumbers', () => {
      it('return true if the beneficiary has a home phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            primaryBeneficiary() {
              return {
                homePhoneNumber: {
                  number: '514-555-5555',
                  extension: '',
                },
                mobilePhoneNumber: null,
                alternatePhoneNumber: null,
              };
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return true if the beneficiary has a mobile phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            primaryBeneficiary() {
              return {
                mobilePhoneNumber: {
                  number: '514-555-5555',
                  extension: '',
                },
                homePhoneNumber: null,
                alternatePhoneNumber: null,
              };
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return true if the beneficiary has an alternate phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            primaryBeneficiary() {
              return {
                alternatePhoneNumber: {
                  number: '514-555-5555',
                  extension: '',
                },
                mobilePhoneNumber: null,
                homePhoneNumber: null,
              };
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeTruthy();
      });

      it('return false if the beneficiary has no phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          mocks: {
            $storage: storage,
          },
          computed: {
            primaryBeneficiary() {
              return {
                alternatePhoneNumber: null,
                mobilePhoneNumber: null,
                homePhoneNumber: null,
              };
            },
          },
        });

        expect(wrapper.vm.hasPhoneNumbers).toBeFalsy();
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
          },
          store: {
            ...mockUserStateLevel(1),
            caseFile: {
              searchLoading: false,
            },
          },
          mocks: {
            $storage: {
              caseFile: {
                getters: { get: jest.fn(() => mockCaseFile) },
                actions: {
                  fetch: jest.fn(() => [mockCaseFile]),
                },
              },
              event: {
                getters: { get: jest.fn(() => mockEvent) },
                actions: {
                  fetch: jest.fn(() => [mockEvent]),
                },
              },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            id: mockCaseFile.entity.id,
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
              caseFile: {
                getters: { get: jest.fn(() => mockCaseFile) },
                actions: {
                  fetch: jest.fn(() => [mockCaseFile]),
                },
              },
              event: {
                getters: { get: jest.fn(() => mockEvent) },
                actions: {
                  fetch: jest.fn(() => [mockEvent]),
                },
              },
              household: { actions: { fetch: jest.fn(() => mockCombinedHousehold()) } },
            },
          },
        });

        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetch = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.entity.id,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    it('should call fetch', () => {
      expect(wrapper.vm.$storage.caseFile.actions.fetch).toHaveBeenCalledWith(wrapper.vm.id);
    });

    it('should call getHouseholdInfo', async () => {
      jest.spyOn(wrapper.vm, 'getHouseholdInfo').mockImplementation(() => {});
      jest.clearAllMocks();
      const hook = wrapper.vm.$options.created[0];
      await hook.call(wrapper.vm);

      expect(wrapper.vm.getHouseholdInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      storage.caseFile.actions.fetch = jest.fn(() => {});

      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          id: mockCaseFile.entity.id,
        },
        computed: {
          caseFile() {
            return mockCaseFile;
          },
          event() {
            return mockEvent;
          },
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('getHouseholdInfo', () => {
      it('calls household storage action', () => {
        jest.clearAllMocks();
        wrapper.vm.getHouseholdInfo();
        expect(storage.household.actions.fetch).toBeCalledWith(mockCaseFile.entity.householdId);
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to the household profile page', async () => {
        wrapper.vm.goToHouseholdProfile();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id: wrapper.vm.caseFile.entity.householdId,
          },
        });
      });
    });
  });
});
