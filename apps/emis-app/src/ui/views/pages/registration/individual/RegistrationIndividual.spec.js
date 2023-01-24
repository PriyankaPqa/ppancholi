import { mockHouseholdCreateData } from '@libs/entities-lib/household-create';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import { tabs } from '@/store/modules/registration/tabs';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import helpers from '@/ui/helpers/helpers';
import { mockTabs } from '@libs/registration-lib/store/modules/registration/tabs.mock';
import Component from './RegistrationIndividual.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('Individual.vue', () => {
  let wrapper;
  const doMount = (shallow, otherComputed = {}, otherOptions = {}) => {
    const options = {
      localVue,
      computed: {
        ...otherComputed,
      },
      mocks: {
        $storage: storage,
      },
      ...otherOptions,
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('print button', () => {
      it('is rendered if is on confirmation tab and no error', () => {
        doMount(false, {
          currentTab: () => ({ id: 'confirmation' }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });
        expect(wrapper.findDataTest('printButton').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        doMount(false, {
          currentTab: () => ({ id: 'confirmation' }),
          registrationSuccess: () => false,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });

      it('is not rendered if is not on confirmation tab', () => {
        doMount(false, {
          currentTab: () => ({ id: 'review' }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });
    });

    describe('new registration button', () => {
      it('is rendered if is on confirmation tab and no error', () => {
        doMount(false, {
          currentTab: () => ({ id: 'confirmation' }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });
        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        doMount(false, {
          currentTab: () => ({ id: 'confirmation' }),
          registrationSuccess: () => false,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(false);
      });

      it('is not rendered if is not on confirmation tab', () => {
        doMount(false, {
          currentTab: () => ({ id: 'review' }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true, {
        currentTab: () => ({ id: '', titleKey: '', nextButtonTextKey: '' }),
      });
    });

    describe('back', () => {
      it('should return to search household page if user is seeing results', async () => {
        doMount(
          true,
          {
            currentTab: () => ({ id: 'isRegistered' }),
          },
          {
            store: {
              modules: {
                registration: {
                  state: {
                    householdResultsShown: true,
                  },
                },
              },
            },
          },
        );
        await wrapper.vm.back();
        expect(wrapper.vm.$storage.registration.mutations.setHouseholdResultsShown).toHaveBeenCalledWith(false);
      });

      it('should return to household results if user is seeing review of the registration in association mode', async () => {
        doMount(true, {
          currentTab: () => ({ id: 'review' }),
          associationMode: () => true,
        });
        wrapper.vm.backToHouseholdResults = jest.fn();
        await wrapper.vm.back();
        expect(wrapper.vm.backToHouseholdResults).toHaveBeenCalled();
      });

      it(
        'should set setHouseholdAlreadyRegistered mutation to false if user is seeing the review page in association mode and household is already registered',
        async () => {
          doMount(true, {
            currentTab: () => ({ id: 'review' }),
            associationMode: () => true,
            householdAlreadyRegistered: () => true,
          });
          wrapper.vm.backToHouseholdResults = jest.fn();
          await wrapper.vm.back();
          expect(wrapper.vm.$storage.registration.mutations.setHouseholdAlreadyRegistered).toHaveBeenCalledWith(false);
        },
      );

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
        doMount(true, {
          currentTab: () => ({ id: 'personalInfo' }),
        });

        EventHub.$emit = jest.fn();

        await wrapper.vm.next();
        expect(EventHub.$emit).toBeCalledWith('checkEmailValidation', wrapper.vm.nextDefault);
      });

      it('calls nextOnReview if current tab is review', async () => {
        doMount(true, {
          currentTab: () => ({ id: 'review' }),
        });
        wrapper.vm.nextOnReview = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextOnReview).toBeCalledTimes(1);
      });

      it('calls nextOnReview if current tab is review', async () => {
        doMount(true, {
          currentTab: () => ({ id: 'review' }),
        });
        wrapper.vm.nextOnReview = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextOnReview).toBeCalledTimes(1);
      });

      it('calls closeRegistration if current tab is confirmation', async () => {
        doMount(true, {
          currentTab: () => ({ id: 'confirmation' }),
        });
        wrapper.vm.closeRegistration = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.closeRegistration).toBeCalledTimes(1);
      });

      it('calls nextDefault by default', async () => {
        doMount(true, {
          currentTab: () => ({ id: '' }),
        });
        wrapper.vm.nextDefault = jest.fn();
        await wrapper.vm.next();
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });
    });

    describe('nextOnReview', () => {
      it('should call goToHouseholdProfile if household is already registered', async () => {
        doMount(true, {
          householdAlreadyRegistered: () => true,
        });
        wrapper.vm.goToHouseholdProfile = jest.fn();

        await wrapper.vm.nextOnReview();

        expect(wrapper.vm.goToHouseholdProfile).toHaveBeenCalledTimes(1);
      });

      describe('Association mode', () => {
        it('should validate the form', async () => {
          doMount(true, {
            householdAlreadyRegistered: () => false,
            associationMode: () => true,
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.jump = jest.fn();
          wrapper.vm.associateHousehold = jest.fn();

          await wrapper.vm.nextOnReview();

          expect(wrapper.vm.$refs.form.validate).toBeCalled();
        });

        it('should call associateHousehold', async () => {
          doMount(true, {
            householdAlreadyRegistered: () => false,
            associationMode: () => true,
          });
          wrapper.vm.$refs.form.validate = jest.fn(() => true);
          wrapper.vm.associateHousehold = jest.fn();

          await wrapper.vm.nextOnReview();

          expect(wrapper.vm.associateHousehold).toHaveBeenCalledTimes(1);
        });
      });

      it('should call submit registration and nextDefault otherwise', async () => {
        doMount(true, {
          householdAlreadyRegistered: () => false,
          associationMode: () => false,
        });
        wrapper.vm.jump = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.nextOnReview();

        expect(wrapper.vm.$storage.registration.actions.submitRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.nextDefault).toHaveBeenCalledTimes(1);
      });

      it('calls jump if there are submit errors that are not duplicate errors but contain errors code', async () => {
        doMount(true, {
          submitErrors: () => ({ response: { data: { errors: [{ code: 'error.code' }] } } }),
          associationMode: () => false,
          householdAlreadyRegistered: () => false,
          isDuplicateError: () => false,
        });

        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        wrapper.vm.handleErrors = jest.fn();
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.nextOnReview();
        expect(wrapper.vm.jump).toHaveBeenCalledTimes(1);
      });

      it('calls handleErrors if there are submit errors that are not duplicate errors or do not contain errors code', async () => {
        doMount(true, {
          submitErrors: () => ({ response: { data: {} } }),
          associationMode: () => false,
          householdAlreadyRegistered: () => false,
          isDuplicateError: () => false,
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

        expect(wrapper.vm.$confirm).toHaveBeenCalledWith({
          title: wrapper.vm.$t('registration.associate.confirmation.title'),
          messages: [
            wrapper.vm.$t('registration.associate.confirmation.message1'),
            wrapper.vm.$t('registration.associate.confirmation.message2'),
          ],
        });
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

    describe('resetPersonalInfoTab', () => {
      it('should reset personalInfo tab if it is touched, and then call nextDefault', async () => {
        storage.registration.getters.tabs = jest.fn(() => mockTabs());
        doMount(true, {
          isPersonalInfoTouched: () => true,
        });
        wrapper.vm.$storage.registration.mutations.mutateTabAtIndex = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.resetPersonalInfoTab();
        expect(wrapper.vm.$storage.registration.mutations.mutateTabAtIndex).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });
      it('should not reset personalInfo tab if it is not touched, and then call nextDefault', async () => {
        storage.registration.getters.tabs = jest.fn(() => mockTabs());
        doMount(true, {
          isPersonalInfoTouched: () => false,
        });
        wrapper.vm.$storage.registration.mutations.mutateTabAtIndex = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.resetPersonalInfoTab();
        expect(wrapper.vm.$storage.registration.mutations.mutateTabAtIndex).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
        associationMode: () => true,
      });
    });

    describe('showBackButton', () => {
      it('should return the proper value', () => {
        expect(wrapper.vm.showBackButton).toEqual(true);
        doMount(true, {
          currentTab: () => ({ id: 'confirmation', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
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

    describe('registrationAssessment', () => {
      it('should return the registrationAssessment', () => {
        jest.clearAllMocks();
        const registrationAssessment = wrapper.vm.registrationAssessment;
        expect(wrapper.vm.$storage.registration.getters.assessmentToComplete).toHaveBeenCalled();
        expect(registrationAssessment).toEqual(wrapper.vm.$storage.registration.getters.assessmentToComplete().registrationAssessment);
      });
    });

    describe('getTitle', () => {
      it('should return proper text if reviewing an association', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        expect(wrapper.vm.getTitle).toEqual('registration.details.associateBeneficiaryButton.label');
      });

      it('should return proper text otherwise', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => false,
        });
        expect(wrapper.vm.getTitle).toEqual(wrapper.vm.currentTab.titleKey);
      });
    });

    describe('getNextButtonLabel', () => {
      it('should return proper text if household is already registered', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
          householdAlreadyRegistered: () => true,
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual('registration.associate.confirmation.next.label');
      });

      it('should return proper text otherwise', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => false,
        });
        expect(wrapper.vm.getNextButtonLabel).toEqual(wrapper.vm.currentTab.nextButtonTextKey);
      });
    });

    describe('enableAutocomplete', () => {
      it('return correct value', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        wrapper.vm.$hasFeature = jest.fn(() => true);
        expect(wrapper.vm.enableAutocomplete).toBe(true);
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        wrapper.vm.$hasFeature = jest.fn(() => false);
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });

    describe('isPersonalInfoTouched', () => {
      it('should return isPersonalInfoTouched of personalInformation tab', () => {
        storage.registration.getters.tabs = jest.fn(() => mockTabs());
        doMount(true);
        expect(wrapper.vm.isPersonalInfoTouched).toEqual(false);
      });
    });
  });

  describe('beforeRouteLeave', () => {
    let next;
    beforeEach(() => {
      next = jest.fn(() => {});
    });

    it('opens the dialog if not on the confirmation page and then calls next', async () => {
      doMount(true, {
        currentTab: () => ({ id: 'isRegistered', titleKey: '', nextButtonTextKey: '' }),
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
      expect(next).toBeCalled();
    });

    it('opens the dialog if on the review page and not already registered and then calls next', async () => {
      doMount(true, {
        currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
        householdAlreadyRegistered: () => false,
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).toHaveBeenCalled();
      expect(next).toBeCalled();
    });

    it('does not open the dialog if on the review page and  already registered', async () => {
      doMount(true, {
        currentTab: () => ({ id: 'review', titleKey: '', nextButtonTextKey: '' }),
        householdAlreadyRegistered: () => true,
      });

      wrapper.vm.$confirm = jest.fn(() => true);
      await wrapper.vm.$options.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next);
      expect(wrapper.vm.$confirm).not.toHaveBeenCalled();
    });
  });
});
