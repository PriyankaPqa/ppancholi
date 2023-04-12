import {
  createLocalVue, shallowMount, mount,
} from '@/test/testSetup';
import {
  mockEventMainInfo, mockEventEntityData,
} from '@libs/entities-lib/event';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import { mockProvider } from '@/services/provider';
import { mockUserData, User } from '@libs/entities-lib/user';
import Component from './SplitHouseholdEvent.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, registrationStore } = useMockRegistrationStore();
const tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;
describe('SplitHouseholdEvent', () => {
  let wrapper;

  describe('Template', () => {
    beforeEach(() => {
      wrapper = mount(Component, {
        localVue,
        pinia,
        mocks: {
          $services: services,
        },
      });
    });

    describe('event select', () => {
      it('renders the component', () => {
        const element = wrapper.findDataTest('household_profile_split_event_select');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('consentStatements', () => {
      it('Should return the right value', async () => {
        tenantSettingsStore.currentTenantSettings.consentStatements = [{ id: 'abc', name: { translation: { en: 'hello' } }, statement: { translation: { en: 'hello' } } },
          { id: 'def', name: { translation: { en: 'second' } }, statement: { translation: { en: 'second' } } }];
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          mocks: {
            $services: services,
          },
        });
        expect(wrapper.vm.consentStatements).toEqual(tenantSettingsStore.currentTenantSettings.consentStatements);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should set event to the value in the store', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,

        });
        registrationStore.event = mockEventMainInfo().entity;
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.event).toEqual(mockEventMainInfo().entity);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        computed: {
          user: () => new User(mockUserData()),
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('setEvent', () => {
      it('calls the storage mutation setEvent, should call resetConsent when select a different event', async () => {
        jest.clearAllMocks();
        wrapper.vm.resetConsent = jest.fn();
        const event = mockEventEntityData()[0];
        const newEvent = mockEventEntityData()[1];
        await wrapper.vm.setEvent(event);
        expect(registrationStore.event).toEqual(event);

        await wrapper.vm.setEvent(newEvent);
        expect(wrapper.vm.resetConsent).toHaveBeenCalled();
      });

      it('should call setAssessmentToComplete mutations with proper params', async () => {
        const event = mockEventEntityData()[0];
        await wrapper.vm.setEvent(event);
        expect(wrapper.vm.$services.assessmentForms.get).toHaveBeenCalledWith({ id: event.registrationAssessments[0].assessmentId });
        expect(registrationStore.setAssessmentToComplete).toHaveBeenCalledWith({
          assessmentForm: wrapper.vm.$services.assessmentForms.get(),
          registrationAssessment: event.registrationAssessments[0],
        });
      });
    });

    describe('resetConsent', () => {
      it('should reset consent', async () => {
        registrationStore.isPrivacyAgreed = true;
        registrationStore.householdCreate.consentInformation = {
          crcUserName: 'John White',
          registrationMethod: 1,
          registrationLocationId: 'mock-test-id',
          privacyDateTimeConsent: new Date(),
        };

        wrapper.vm.resetConsent();
        expect(registrationStore.isPrivacyAgreed).toEqual(false);
        expect(registrationStore.householdCreate.consentInformation.crcUserName).toEqual('John White');
        expect(registrationStore.householdCreate.consentInformation.registrationMethod).toEqual(null);
        expect(registrationStore.householdCreate.consentInformation.registrationLocationId).toEqual(null);
        expect(registrationStore.householdCreate.consentInformation.privacyDateTimeConsent).toEqual(null);
      });
    });
  });
});
