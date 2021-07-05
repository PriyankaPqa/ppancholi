import { createLocalVue, shallowMount } from '../../test/testSetup';
import { mockStorage } from '../../store/storage';
import { ERegistrationMethod } from '../../types';
import { mockRegistrationLocations } from '../../entities/event';
import Component from './CrcPrivacyStatement.vue';
import { i18n } from '../../ui/plugins/i18n';

const localVue = createLocalVue();
const storage = mockStorage();

const mockUserL6 = () => ({
  id: '',
  email: '',
  lastName: '',
  firstName: '',
  roles: [''],
  getFullName: () => '',
});

describe('CrcPrivacyStatement.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        user() {
          return mockUserL6();
        },
      },
      propsData: {
        i18n,
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      test('privacyCRCUsername', () => {
        expect(wrapper.vm.rules.privacyCRCUsername).toEqual('required');
      });

      test('privacyRegistrationMethod', () => {
        expect(wrapper.vm.rules.privacyRegistrationMethod).toEqual('required');
      });

      test('privacyRegistrationLocation', () => {
        expect(wrapper.vm.rules.privacyRegistrationLocation).toEqual('required');
      });
    });

    describe('privacyCRCUsername', () => {
      it('is linked to privacyCRCUsername in the store', () => {
        expect(wrapper.vm.privacyCRCUsername).toEqual(wrapper.vm.$store.state.registration.householdCreate.consentInformation.crcUserName);
      });

      it('calls setPrivacyCRCUsername with value', () => {
        wrapper.vm.privacyCRCUsername = 'name';
        expect(wrapper.vm.$storage.registration.mutations.setPrivacyCRCUsername).toHaveBeenCalledWith('name');
      });
    });

    describe('privacyRegistrationMethod', () => {
      it('is linked to privacyRegistrationMethod in the store', () => {
        expect(wrapper.vm.privacyRegistrationMethod).toEqual(
          wrapper.vm.$store.state.registration.householdCreate.consentInformation.registrationMethod,
        );
      });

      it('calls setPrivacyRegistrationMethod with value', () => {
        wrapper.vm.privacyRegistrationMethod = ERegistrationMethod.Phone;
        expect(wrapper.vm.$storage.registration.mutations.setPrivacyRegistrationMethod).toHaveBeenCalledWith(ERegistrationMethod.Phone);
      });
    });

    describe('activeRegistrationLocations', () => {
      it('should return the registration location from the current event', () => {
        expect(wrapper.vm.activeRegistrationLocations).toEqual(mockRegistrationLocations());
      });
    });

    describe('isRegistrationMethodInPerson', () => {
      it('should return true if registration method is in person', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return mockUserL6();
            },
            privacyRegistrationMethod() {
              return ERegistrationMethod.InPerson;
            },
          },
          propsData: {
            i18n,
          },
        });
        expect(wrapper.vm.isRegistrationMethodInPerson).toEqual(true);
      });

      it('should return false if registration method is not in person', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user() {
              return mockUserL6();
            },
            privacyRegistrationMethod() {
              return ERegistrationMethod.Phone;
            },
          },
          propsData: {
            i18n,
          },
        });
        expect(wrapper.vm.isRegistrationMethodInPerson).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('resetPrivacyRegistrationLocation', () => {
      it('should reset privacyRegistrationLocationName ', () => {
        wrapper.vm.resetPrivacyRegistrationLocation();
        expect(wrapper.vm.$storage.registration.mutations.setPrivacyRegistrationLocationId).toHaveBeenCalledWith(null);
      });

      it('should be called when registration method changes', async () => {
        jest.spyOn(wrapper.vm, 'resetPrivacyRegistrationLocation');
        const component = wrapper.findDataTest('privacyRegistrationMethod');
        await component.vm.$emit('change');
        expect(wrapper.vm.resetPrivacyRegistrationLocation).toHaveBeenCalledTimes(1);
      });
    });

    describe('autoFillUserName', () => {
      it('should prefill the privacyCRCUsername if empty ', () => {
        wrapper.vm.resetPrivacyRegistrationLocation();
        expect(wrapper.vm.$storage.registration.mutations.setPrivacyCRCUsername).toHaveBeenCalledWith(wrapper.vm.user.getFullName());
      });
    });

    describe('setRegistrationLocation', () => {
      it('should set privacyRegistrationLocationName locally ', () => {
        const location = mockRegistrationLocations()[0];
        expect(wrapper.vm.privacyRegistrationLocation).toBe(null);
        wrapper.vm.setRegistrationLocation(location);
        expect(wrapper.vm.privacyRegistrationLocation).toBe(location);
      });

      it('should call setPrivacyRegistrationLocationId mutation with the id', () => {
        const location = mockRegistrationLocations()[0];
        wrapper.vm.setRegistrationLocation(location);
        expect(wrapper.vm.$storage.registration.mutations.setPrivacyRegistrationLocationId).toHaveBeenCalledWith(location.id);
      });

      it('should be called when registration location changes', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            user: () => mockUserL6(),
            isRegistrationMethodInPerson: () => true,
          },
          mocks: {
            $storage: storage,
          },
          propsData: {
            i18n,
          },
        });
        jest.spyOn(wrapper.vm, 'setRegistrationLocation').mockImplementation(() => {});
        const component = wrapper.findDataTest('privacyRegistrationLocation');
        await component.vm.$emit('change');
        expect(wrapper.vm.setRegistrationLocation).toHaveBeenCalledTimes(1);
      });
    });

    describe('loadRegistrationLocation', () => {
      it('should load registration from the store', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            i18n,
          },
          computed: {
            user() {
              return mockUserL6();
            },
            activeRegistrationLocations() {
              return [{
                id: 'location_id',
              }];
            },
          },
          store: {
            modules: {
              registration: {
                state: {
                  householdCreate: {
                    consentInformation: {
                      registrationLocationId: 'location_id',
                    },
                  },
                },
              },
            },
          },
        });
        wrapper.vm.loadRegistrationLocation();
        expect(wrapper.vm.privacyRegistrationLocation).toEqual({ id: 'location_id' });
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls autoFillUserName', () => {
        wrapper.vm.autoFillUserName = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.autoFillUserName).toHaveBeenCalledTimes(1);
      });

      it('calls loadRegistrationLocation', () => {
        wrapper.vm.loadRegistrationLocation = jest.fn();

        wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(wrapper.vm.loadRegistrationLocation).toHaveBeenCalledTimes(1);
      });
    });
  });
});
