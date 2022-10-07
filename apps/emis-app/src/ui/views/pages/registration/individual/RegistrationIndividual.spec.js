import { mockHouseholdCreateData } from '@libs/entities-lib/household-create';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';

import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import helpers from '@/ui/helpers/helpers';
import Component from './RegistrationIndividual.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Individual.vue', () => {
  let wrapper;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('print button', () => {
      it('is rendered if is on confirmation tab and no error', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation' }),
            registrationSuccess: () => true,
            getTitle: () => 'title',
          },
        });
        expect(wrapper.findDataTest('printButton').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation' }),
            registrationSuccess: () => false,
            getTitle: () => 'title',
          },
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });

      it('is not rendered if is not on confirmation tab', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
            registrationSuccess: () => true,
            getTitle: () => 'title',
          },
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });
    });

    describe('new registration button', () => {
      it('is rendered if is on confirmation tab and no error', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation' }),
            registrationSuccess: () => true,
            getTitle: () => 'title',
          },
        });
        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation' }),
            registrationSuccess: () => false,
            getTitle: () => 'title',
          },
        });

        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(false);
      });

      it('is not rendered if is not on confirmation tab', () => {
        wrapper = mount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
            registrationSuccess: () => true,
            getTitle: () => 'title',
          },
        });

        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: '', titleKey: '', nextButtonTextKey: '' }),
        },
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

      it('should set setHouseholdAlreadyRegistered mutation to false if user is seeing the review page in association mode and household is already registered',
        async () => {
          wrapper = shallowMount(Component, {
            localVue,
            computed: {
              currentTab: () => ({ id: 'review' }),
              associationMode: () => true,
              householdAlreadyRegistered: () => true,
            },
            mocks: {
              $storage: storage,
            },
          });
          wrapper.vm.backToHouseholdResults = jest.fn();
          await wrapper.vm.back();
          expect(wrapper.vm.$storage.registration.mutations.setHouseholdAlreadyRegistered).toHaveBeenCalledWith(false);
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

      it('should call setHouseholdAlreadyRegistered with false', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdAlreadyRegistered).toHaveBeenCalledWith(false);
      });

      it('should set current tab to isRegistered', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.setCurrentTabIndex).toHaveBeenCalledWith(tabs().findIndex((t) => t.id === 'isRegistered'));
      });

      it('should call resetHouseholdCreate', () => {
        wrapper.vm.backToHouseholdResults();
        expect(wrapper.vm.$storage.registration.mutations.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('next', () => {
      it('calls eventhub emit if current tab is personalInfo', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'personalInfo' }),
          },
        });

        EventHub.$emit = jest.fn();

        await wrapper.vm.next();
        expect(EventHub.$emit).toBeCalledWith('checkEmailValidation', wrapper.vm.nextDefault);
      });

      it('calls nextOnReview if current tab is review', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
          },
        });
        wrapper.vm.nextOnReview = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextOnReview).toBeCalledTimes(1);
      });

      it('calls nextOnReview if current tab is review', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'review' }),
          },
        });
        wrapper.vm.nextOnReview = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextOnReview).toBeCalledTimes(1);
      });

      it('calls closeRegistration if current tab is confirmation', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation' }),
          },
        });
        wrapper.vm.closeRegistration = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.closeRegistration).toBeCalledTimes(1);
      });

      it('calls nextDefault by default', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: '' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.nextDefault = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });
    });

    describe('nextOnReview', () => {
      it('should call goToHouseholdProfile if household is already registered', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            householdAlreadyRegistered: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.goToHouseholdProfile = jest.fn();

        await wrapper.vm.nextOnReview();

        expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
      });

      describe('Association mode', () => {
        it('should validate the form', async () => {
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
          wrapper.vm.jump = jest.fn();
          wrapper.vm.associateHousehold = jest.fn();

          await wrapper.vm.nextOnReview();

          expect(wrapper.vm.$refs.form.validate).toBeCalled();
        });

        it('should call associateHousehold', async () => {
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
          wrapper.vm.associateHousehold = jest.fn();

          await wrapper.vm.nextOnReview();

          expect(wrapper.vm.associateHousehold).toHaveBeenCalledTimes(1);
        });
      });

      it('should call submit registration and nextDefault otherwise', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            householdAlreadyRegistered: () => false,
            associationMode: () => false,
          },
          mocks: {
            $storage: storage,
          },
        });
        wrapper.vm.jump = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.nextOnReview();

        expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.nextDefault).toHaveBeenCalledTimes(1);
      });

      it('calls jump if there are submit errors that are not duplicate errors but contain errors code', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: { errors: [{ code: 'error.code' }] } } }),
            associationMode: () => false,
            householdAlreadyRegistered: () => false,
            isDuplicateError: () => false,
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.handleErrors = jest.fn();
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextOnReview();
        expect(wrapper.vm.jump).toHaveBeenCalledTimes(1);
      });

      it('calls handleErrors if there are submit errors that are not duplicate errors or do not contain errors code', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
            associationMode: () => false,
            householdAlreadyRegistered: () => false,
            isDuplicateError: () => false,
          },
          mocks: {
            $storage: storage,
          },
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.handleErrors = jest.fn();

        await wrapper.vm.nextOnReview();
        expect(wrapper.vm.handleErrors).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.handleErrors).toHaveBeenCalledWith(wrapper.vm.submitRegistration);
      });
    });

    describe('nextDefault', () => {
      it('calls jump if it passes validation', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.jump = jest.fn();
        wrapper.vm.goToHouseholdProfile = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.nextDefault();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });

      it('calls scrollToFirstError if it does not pass validation', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => false);
        helpers.scrollToFirstError = jest.fn();
        await wrapper.vm.nextDefault();
        expect(helpers.scrollToFirstError).toHaveBeenCalledWith('app');
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to household profile page', async () => {
        const id = '1';
        await wrapper.vm.goToHouseholdProfile(id);
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id,
          },
        });
      });
    });

    describe('associateHousehold', () => {
      it('should display confirmation dialog ', async () => {
        wrapper.vm.$confirm = jest.fn(() => false);

        await wrapper.vm.associateHousehold();

        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({ title: wrapper.vm.titleLeave, messages: wrapper.vm.messagesLeave });
      });

      it('calls createNewCaseFile if user confirms', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.createNewCaseFile = jest.fn(() => mockHouseholdCreateData());
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.associateHousehold();
        expect(wrapper.vm.createNewCaseFile).toHaveBeenCalledTimes(1);
      });

      it('calls handleErrors if createNewCaseFile does not return success', async () => {
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.handleErrors = jest.fn();
        wrapper.vm.createNewCaseFile = jest.fn(() => null);
        await wrapper.vm.associateHousehold();
        expect(wrapper.vm.handleErrors).toHaveBeenCalledWith(wrapper.vm.createNewCaseFile);
      });

      it('calls jump if createNewCaseFile returns success', async () => {
        wrapper.vm.$storage.registration.getters.currentTabIndex = jest.fn(() => 2);
        wrapper.vm.$confirm = jest.fn(() => true);
        wrapper.vm.jump = jest.fn();
        wrapper.vm.createNewCaseFile = jest.fn(() => null);
        await wrapper.vm.associateHousehold();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });
    });

    describe('createNewCaseFile', () => {
      it('should call create case file action', async () => {
        await wrapper.vm.createNewCaseFile();

        expect(wrapper.vm.$storage.caseFile.actions.createCaseFile).toHaveBeenCalledWith({
          householdId: wrapper.vm.household.id,
          eventId: wrapper.vm.event.id,
          consentInformation: wrapper.vm.household.consentInformation,
        });
      });
      it('should call setRegistrationErrors with an argument if there is no response', async () => {
        wrapper.vm.$storage.caseFile.actions.createCaseFile = jest.fn(() => null);
        await wrapper.vm.createNewCaseFile();
        expect(wrapper.vm.$storage.registration.mutations.setRegistrationErrors)
          .toHaveBeenCalledWith({ name: 'case-file-create-error', message: 'Case file create error' });
      });

      it('should call setRegistrationErrors with null if there is a response', async () => {
        wrapper.vm.$storage.caseFile.actions.createCaseFile = jest.fn(() => 'mock-response');
        await wrapper.vm.createNewCaseFile();
        expect(wrapper.vm.$storage.registration.mutations.setRegistrationErrors).toHaveBeenCalledWith(null);
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

    describe('showBackButton', () => {
      it('should return the proper value', () => {
        expect(wrapper.vm.showBackButton).toEqual(true);

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            currentTab: () => ({ id: 'confirmation', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
          mocks: {
            $storage: storage,
          },
        });

        expect(wrapper.vm.showBackButton).toEqual(false);
      });
    });

    describe('eventName', () => {
      it('should return the even name', () => {
        const event = wrapper.vm.$storage.registration.getters.event();
        expect(wrapper.vm.eventName).toEqual(wrapper.vm.$m(event.name));
      });
    });

    describe('titleLeave', () => {
      it('should return proper text for association household', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.titleLeave).toEqual('registration.associate.confirmation.title');
      });

      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.titleLeave).toEqual('confirmLeaveDialog.title');
      });
    });

    describe('messagesLeave', () => {
      it('should return proper text for association household', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => true,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
        expect(wrapper.vm.messagesLeave).toEqual([
          'registration.associate.confirmation.message1',
          'registration.associate.confirmation.message2',
        ]);
      });
      it('should return proper text otherwise', () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            associationMode: () => false,
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          },
          mocks: {
            $storage: storage,
          },
        });
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

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(true);
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
        expect(wrapper.vm.enableAutocomplete).toBe(true);

        storage.tenantSettings.getters.isFeatureEnabled.mockReturnValueOnce(false);
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
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('opens the dialog if not on the confirmation page and then calls next', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: 'isRegistered', titleKey: '', nextButtonTextKey: '' }),
        },
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
      expect(next).toBeCalled();
    });

    it('opens the dialog if on the review page and not already registered and then calls next', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
          householdAlreadyRegistered: () => false,
        },
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
      expect(next).toBeCalled();
    });

    it('does not open the dialog if on the review page and  already registered', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
          householdAlreadyRegistered: () => true,
        },
        mocks: {
          $storage: storage,
        },
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
    });
  });
});
