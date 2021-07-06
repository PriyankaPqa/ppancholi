import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/store/storage';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import Component from './RegistrationIndividual.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('back', () => {
      it('should return to search household page if user is seeing results', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'isRegistered' }),
          },
          store: {
            modules: {
              registration: {
                state: {
                  householdResultsShown: true,
                },
              },
            },
          },
          mocks: {
            $storage: storage,
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(false);
      });

      it('should return to household results if user is seeing review of the registration in association mode', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
            associationMode: () => true,
          },
        });
        wrapper.vm.backToHouseholdResults = jest.fn();
        await wrapper.vm.back();
        expect(wrapper.vm.backToHouseholdResults).toHaveBeenCalled();
      });

      it('should return to registration home page if user is at the first page of registration', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 0,
          },
        });
        await wrapper.vm.back();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.registration.home.name });
      });

      test('back calls jump', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTabIndex: () => 1,
          },
        });
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.back();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(0);
      });
    });

    describe('backToHouseholdResults', () => {
      it('should call setHouseholdAssociationMode with false', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdAssociationMode).toHaveBeenCalledWith(false);
      });

      it('should set current tab to isRegistered', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentTabIndex).toHaveBeenCalledWith(tabs().findIndex((t) => t.id === 'isRegistered'));
      });
    });

    describe('next', () => {
      it('calls jump', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'personalInfo' }));
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();
        wrapper.vm.goToHouseholdProfile = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump)
          .toHaveBeenCalledWith(3);
      });

      it('calls closeRegistration if it is confirmation', async () => {
        wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({
          id: 'confirmation',
        }));
        wrapper.vm.closeRegistration = jest.fn();
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.closeRegistration)
          .toHaveBeenCalledTimes(1);
        expect(wrapper.vm.jump)
          .toHaveBeenCalledTimes(0);
      });

      describe('Review', () => {
        it('should call goToHouseholdProfile if household is already registered', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            computed: {
              householdAlreadyRegistered: () => true,
              associationMode: () => true,
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'review' }));
          wrapper.vm.goToHouseholdProfile = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
        });

        it('should validate the form if association mode', async () => {
          wrapper = shallowMount(Component, {
            localVue,
            computed: {
              householdAlreadyRegistered: () => false,
              associationMode: () => true,
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'review' }));
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$refs.form.validate).toBeCalled();
        });

        it('should call submit registration otherwise', async () => {
          wrapper.vm.$storage.registration.getters.currentTab = jest.fn(() => ({ id: 'review' }));
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$storage.registration.actions.submitRegistration)
            .toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to household profile page', async () => {
        const id = '1';
        await wrapper.vm.goToHouseholdProfile(id);
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.caseFile.householdProfile.name,
          params: {
            id,
          },
        });
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('eventName', () => {
      it('should return the even name', () => {
        const event = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.eventName).toEqual(wrapper.vm.$m(event.name));
      });
    });

    describe('submitLoading', () => {
      it('should return false', () => {
        expect(wrapper.vm.submitLoading).toEqual(false);
      });
    });

    describe('titleLeave', () => {
      it('should return proper text', () => {
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('should return proper text', () => {
        expect(wrapper.vm.messagesLeave).toEqual([
          'confirmLeaveDialog.message_1',
          'confirmLeaveDialog.message_2',
        ]);
      });
    });

    describe('getTitle', () => {
      it('should return proper text if reviewing an association', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
        });
        expect(wrapper.vm.getTitle).toEqual('registration.details.associateBeneficiaryButton.label');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => false,
          },
        });
        expect(wrapper.vm.getTitle).toEqual(wrapper.vm.currentTab.titleKey);
      });
    });

    describe('getNextButtonLabel', () => {
      it('should return proper text if reviewing an association', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual('registration.details.associateBeneficiaryButton.label');
      });

      it('should return proper text if household is already registered', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
            householdAlreadyRegistered: () => true,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual('registration.associate.confirmation.next.label');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => false,
          },
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual(wrapper.vm.currentTab.nextButtonTextKey);
      });
    });
  });
});
