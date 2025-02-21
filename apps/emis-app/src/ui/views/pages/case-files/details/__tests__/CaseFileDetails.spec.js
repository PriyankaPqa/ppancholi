import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import PageTemplate from '@/ui/views/components/layout/PageTemplate.vue';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { UserRoles } from '@libs/entities-lib/user';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import { useMockEventStore } from '@/pinia/event/event.mock';
import Component from '../CaseFileDetails.vue';

const localVue = createLocalVue();
const services = mockProvider();

const mockCaseFile = mockCaseFileEntity({ id: '1' });
const mockEvent = mockEventEntity();
mockEvent.schedule.status = EEventStatus.Open;

const pinia = getPiniaForUser(UserRoles.level1);
const { caseFileStore } = useMockCaseFileStore(pinia);
const { caseFileIndividualStore } = useMockCaseFileIndividualStore(pinia);
const { householdStore } = useMockHouseholdStore(pinia);
const { userStore } = useMockUserStore(pinia);
const { personStore } = useMockPersonStore(pinia);
useMockEventStore(pinia);

function createWrapper(role, overrides = {}) {
  const pinia = getPiniaForUser(role);

  useMockCaseFileStore(pinia);
  useMockCaseFileIndividualStore(pinia);
  useMockHouseholdStore(pinia);
  useMockUserStore(pinia);
  useMockPersonStore(pinia);
  useMockEventStore(pinia);

  return shallowMount(Component, {
    localVue,
    pinia,
    propsData: {
      id: mockCaseFile.id,
      ...overrides.propsData,
    },
    computed: {
      primaryBeneficiary: () => mockMember(),
      ...overrides.computed,
    },
    mocks: {
      $services: services,
      ...overrides.mocks,
    },
    ...overrides.options,
  });
}

describe('CaseFileDetails.vue', () => {
  let wrapper;
  const doMount = async (featureList = [], otherComputed = {}) => {
    const params = {
      localVue,
      pinia,
      featureList,
      propsData: {
        id: mockCaseFile.id,
      },
      computed: {
        caseFile() {
          return mockCaseFile;
        },
        event() {
          return mockEvent;
        },
        ...otherComputed,
      },
      mocks: {
        $services: services,
      },
    };
    wrapper = mount(Component, params);
    wrapper.vm.getPrimaryMemberFullName = jest.fn(() => 'mock-full-name');
    wrapper.vm.hasPhoneNumbers = jest.fn(() => true);
    wrapper.vm.getAddressFirstLine = jest.fn(() => '100 Right ave');
    wrapper.vm.getAddressSecondLine = jest.fn(() => 'Montreal, QC H2H 2H2');
    wrapper.vm.getPrimaryMember = jest.fn(() => ({
      contactInformation: {
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
      },
    }));

    await flushPromises();
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
        expect(element.text()).toEqual(mockCaseFile.caseFileNumber);
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
        expect(element.text()).toEqual(mockEvent.name.translation.en);
      });
    });

    describe('verify-identity', () => {
      let element;
      it('is rendered when level 1+', async () => {
        element = wrapper.findDataTest('caseFileDetails-verify-identity-icon');
        expect(element.exists()).toBeTruthy();
      });

      it('is not rendered when level is not 1', async () => {
        wrapper = createWrapper(UserRoles.contributorIM);
        element = wrapper.findDataTest('caseFileDetails-verify-identity-icon');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('verify-impact', () => {
      let element;
      it('is rendered when level 1+', async () => {
        element = wrapper.findDataTest('caseFileDetails-verify-impact-icon');
        expect(element.exists()).toBeTruthy();
      });

      it('is not rendered when level is not 1', async () => {
        wrapper = createWrapper(UserRoles.contributorIM);

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
        expect(element.text()).toEqual('Jane.doe@email.com');
      });

      it('is NOT rendered if the beneficiary does not have an email', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: mockCaseFile.id,
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
            $services: services,
            getPrimaryMember: () => ({
              email: null,
            }),
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
        expect(element.props('phoneNumber')).toEqual({ extension: '123', number: '(514) 123 2222' });
      });

      it('is NOT rendered if the beneficiary does not have a home phone number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: mockCaseFile.id,
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
            $services: services,
            getPrimaryMember: () => ({}),
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
        expect(element.props('phoneNumber')).toEqual({ extension: '', number: '(514) 123 4444' });
      });

      it('is NOT rendered if the beneficiary does not have a mobile number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: mockCaseFile.id,
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
            $services: services,
            getPrimaryMember: () => ({}),
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
        expect(element.props('phoneNumber')).toEqual({ extension: '', number: '(514) 123 1111' });
      });

      it('is NOT rendered if the beneficiary does not have a alternate number', () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: mockCaseFile.id,
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
            $services: services,
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
        expect(element.text()).toContain(wrapper.vm.getAddressFirstLine());
        expect(element.text()).toContain(wrapper.vm.getAddressSecondLine());
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

    describe('caseFileDetails-receiving-assistance-member-count', () => {
      it('should display', async () => {
        await doMount();
        await flushPromises();
        const element = wrapper.findDataTest('caseFileDetails-receiving-assistance-member-count');
        expect(element.exists()).toBeTruthy();
      });

      it('should display proper content', async () => {
        await doMount();
        await flushPromises();
        const element = wrapper.findDataTest('caseFileDetails-receiving-assistance-member-count');
        expect(element.text()).toEqual('caseFileDetail.totalImpacted  1');
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = createWrapper(UserRoles.level1);
    });

    describe('caseFile', () => {
      it('returns the case file by id from the storage', () => {
        expect(JSON.stringify(wrapper.vm.caseFile)).toEqual(JSON.stringify(mockCaseFile));
      });
    });

    describe('canEdit', () => {
      it('returns true if user has level 1', () => {
        wrapper = createWrapper(UserRoles.level1, {
          computed: {
            readonly: () => false,
          },
        });
        expect(wrapper.vm.canEdit).toBeTruthy();
      });

      it('returns false if user does not have level 1', () => {
        wrapper = createWrapper(UserRoles.contributorIM);
        expect(wrapper.vm.canEdit).toBeFalsy();
      });
    });

    describe('canL0AccessAssessment', () => {
      it('should return true when user has level 1+', () => {
        wrapper = createWrapper(UserRoles.level1, {
          computed: {
            primaryBeneficiary: () => ({ email: null }),
          },
        });
        expect(wrapper.vm.canL0AccessAssessment).toBe(true);
      });

      it('should return false when user has level 0 and event.assessmentsForL0usersEnabled is false', async () => {
        wrapper = createWrapper(UserRoles.level0, {
          computed: {
            event: () => mockEventEntity({ assessmentsForL0usersEnabled: false }),
            primaryBeneficiary: () => ({ email: null }),
          },
        });
        expect(wrapper.vm.canL0AccessAssessment).toBe(false);
      });
    });

    describe('receivingAssistanceMembersCount', () => {
      it('should return proper data', async () => {
        expect(wrapper.vm.receivingAssistanceMembersCount).toEqual(1);
        await doMount([wrapper.vm.$featureKeys.CaseFileIndividual]);
        expect(wrapper.vm.receivingAssistanceMembersCount).toEqual(2);
      });
    });

    describe('recoveryPlanInvisible', () => {
      it('should return true when user is L0', async () => {
        wrapper = createWrapper(UserRoles.level0);
        userStore.getUser().currentRole = jest.fn(() => 'level0');
        expect(wrapper.vm.recoveryPlanInvisible).toEqual(true);
      });

      it('should return true when user is readOnly', async () => {
        wrapper = createWrapper('readOnly');
        userStore.getUser().currentRole = jest.fn(() => 'readonly');
        expect(wrapper.vm.recoveryPlanInvisible).toEqual(true);
      });

      it('should return true when user is contributorIM', async () => {
        wrapper = createWrapper(UserRoles.contributorIM);
        userStore.getUser().currentRole = jest.fn(() => 'contributorIM');
        expect(wrapper.vm.recoveryPlanInvisible).toEqual(true);
      });

      it('should return true when user is contributorFinance', async () => {
        wrapper = createWrapper(UserRoles.contributorFinance);
        userStore.getUser().currentRole = jest.fn(() => 'contributorFinance');
        expect(wrapper.vm.recoveryPlanInvisible).toEqual(true);
      });

      it('should return false when user is level1', async () => {
        wrapper = createWrapper(UserRoles.level1);
        userStore.getUser().currentRole = jest.fn(() => 'level1');
        expect(wrapper.vm.recoveryPlanInvisible).toEqual(false);
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: mockCaseFile.id,
        },
        mocks: {
          $services: services,
        },
      });
    });

    it('should call fetch', () => {
      expect(caseFileStore.fetch).toHaveBeenCalledWith(wrapper.vm.id);

      expect(caseFileIndividualStore.fetchAll).toHaveBeenCalledWith({ caseFileId: '1' });
      expect(personStore.fetchByIds).toHaveBeenCalledWith(['pid-1', 'pid-2', 'pid-3'], true);
    });

    it('should call getHouseholdInfo', async () => {
      jest.spyOn(wrapper.vm, 'getHouseholdInfo').mockImplementation(() => {});
      jest.clearAllMocks();
      const hook = wrapper.vm.$options.created[0];
      await hook.call(wrapper.vm);

      expect(wrapper.vm.getHouseholdInfo).toHaveBeenCalledTimes(1);
    });

    it('should call addRecentlyViewed', async () => {
      jest.clearAllMocks();
      caseFileStore.addRecentlyViewed = jest.fn();
      const hook = wrapper.vm.$options.created[0];
      await hook.call(wrapper.vm);
      expect(caseFileStore.addRecentlyViewed).toHaveBeenCalledWith(wrapper.vm.caseFileId);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        propsData: {
          id: mockCaseFile.id,
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
          $services: services,
        },
      });
    });

    describe('getHouseholdInfo', () => {
      it('should fetch household ', async () => {
        jest.clearAllMocks();
        await wrapper.vm.getHouseholdInfo();
        expect(householdStore.fetch).toBeCalledWith(mockCaseFile.householdId);
        expect(caseFileIndividualStore.fetchAll).toBeCalledWith({ caseFileId: wrapper.vm.caseFileId });
        expect(personStore.fetchByIds).toBeCalledWith(householdStore.fetch().members, true);
        expect(personStore.fetchByIds).toBeCalledWith(caseFileIndividualStore.fetchAll().map((x) => x.personId), true);
        expect(services.potentialDuplicates.getPotentialDuplicatesCount).toBeCalledWith(householdStore.fetch().id);
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to the household profile page', async () => {
        wrapper.vm.goToHouseholdProfile();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id: wrapper.vm.caseFile.householdId,
          },
        });
      });
    });
  });

  describe('watcher', () => {
    describe('id', () => {
      it('should call fetchData when changed', async () => {
        await doMount();
        wrapper.vm.fetchData = jest.fn();
        expect(wrapper.vm.fetchData).not.toHaveBeenCalled();
        await wrapper.setProps({
          id: 'new-id-1',
        });
        expect(wrapper.vm.fetchData).toHaveBeenCalled();
      });
    });
  });
});
