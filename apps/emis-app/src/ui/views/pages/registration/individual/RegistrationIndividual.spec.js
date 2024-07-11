import { mockHouseholdCreateData } from '@libs/entities-lib/household-create';
import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { EventHub } from '@libs/shared-lib/plugins/event-hub';
import helpers from '@/ui/helpers/helpers';
import { mockTabs } from '@libs/stores-lib/registration/tabs.mock';
import { tabs } from '@/pinia/registration/tabs';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';

import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';

import { MembershipStatus } from '@libs/entities-lib/case-file-individual';
import { CurrentAddress } from '@libs/entities-lib/value-objects/current-address';
import Component from './RegistrationIndividual.vue';

const localVue = createLocalVue();

const { pinia, caseFileStore } = useMockCaseFileStore();
const { registrationStore } = useMockRegistrationStore(pinia);
describe('Individual.vue', () => {
  let wrapper;
  const doMount = (shallow, otherComputed = {}, otherOptions = {}, featureList = []) => {
    const options = {
      localVue,
      pinia,
      featureList,
      computed: {
        allTabs() {
          return tabs();
        },
        ...otherComputed,
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
          currentTab: () => ({ id: TabId.Confirmation }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });
        expect(wrapper.findDataTest('printButton').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        doMount(false, {
          currentTab: () => ({ id: TabId.Confirmation }),
          registrationSuccess: () => false,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });

      it('is not rendered if is not on confirmation tab', () => {
        doMount(false, {
          currentTab: () => ({ id: TabId.Review }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });

        expect(wrapper.findDataTest('printButton').exists()).toBe(false);
      });
    });

    describe('new registration button', () => {
      it('is rendered if is on confirmation tab and no error', () => {
        doMount(false, {
          currentTab: () => ({ id: TabId.Confirmation }),
          registrationSuccess: () => true,
          getTitle: () => 'title',
        });
        expect(wrapper.findDataTest('new-registration-button').exists()).toBe(true);
      });

      it('is not rendered if is on confirmation tab but has error', () => {
        doMount(false, {
          currentTab: () => ({ id: TabId.Confirmation }),
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
            currentTab: () => ({ id: TabId.IsRegistered }),
          },
        );
        registrationStore.householdResultsShown = true;
        await wrapper.vm.back();
        expect(registrationStore.householdResultsShown).toEqual(false);
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
        'should set householdAlreadyRegistered to false if user is seeing the review page in association mode and household is already registered',
        async () => {
          doMount(true, {
            currentTab: () => ({ id: 'review' }),
            associationMode: () => true,
            householdAlreadyRegistered: () => true,
          });
          wrapper.vm.backToHouseholdResults = jest.fn();
          registrationStore.householdAlreadyRegistered = true;
          await wrapper.vm.back();
          expect(registrationStore.householdAlreadyRegistered).toEqual(false);
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
      it('should set householdAssociationMode to false', () => {
        registrationStore.resetHouseholdCreate = jest.fn();
        registrationStore.householdAssociationMode = true;
        wrapper.vm.backToHouseholdResults();
        expect(registrationStore.householdAssociationMode).toEqual(false);
      });

      it('should set householdAlreadyRegistered to false', () => {
        registrationStore.resetHouseholdCreate = jest.fn();
        registrationStore.householdAlreadyRegistered = true;
        wrapper.vm.backToHouseholdResults();
        expect(registrationStore.householdAlreadyRegistered).toEqual(false);
      });

      it('should set current tab to isRegistered', () => {
        wrapper.vm.backToHouseholdResults();
        expect(registrationStore.currentTabIndex).toEqual(wrapper.vm.allTabs.findIndex((t) => t.id === TabId.IsRegistered));
      });

      it('should call resetHouseholdCreate', () => {
        wrapper.vm.backToHouseholdResults();
        expect(registrationStore.resetHouseholdCreate).toHaveBeenCalledTimes(1);
      });
    });

    describe('next', () => {
      it('calls eventhub emit if current tab is personalInfo', async () => {
        doMount(true, {
          currentTab: () => ({ id: TabId.PersonalInfo }),
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
          currentTab: () => ({ id: TabId.Confirmation }),
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
        registrationStore.submitRegistration = jest.fn();

        await wrapper.vm.nextOnReview();

        expect(registrationStore.submitRegistration).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.nextDefault).toHaveBeenCalledTimes(1);
      });

      it('calls jump if there are submit errors that are not duplicate errors but contain errors code', async () => {
        doMount(true, {
          submitErrors: () => ({ response: { data: { errors: [{ code: 'error.code' }] } } }),
          associationMode: () => false,
          householdAlreadyRegistered: () => false,
          isDuplicateError: () => false,
          containsErrorCode: () => true,
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
          containsErrorCode: () => false,
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
        registrationStore.currentTabIndex = 2;
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
            wrapper.vm.$t('registration.associate.confirmation.message2.household'),
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
        registrationStore.currentTabIndex = 2;
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

        expect(caseFileStore.createCaseFile).toHaveBeenCalledWith({
          householdId: wrapper.vm.household.id,
          eventId: wrapper.vm.event.id,
          consentInformation: wrapper.vm.household.consentInformation,
          individuals: [wrapper.vm.household.primaryBeneficiary, ...wrapper.vm.household.additionalMembers].filter((m) => m).map((m) => ({
            personId: m.id,
            temporaryAddressHistory: [CurrentAddress.parseCurrentAddress(m.currentAddress)],
            receivingAssistanceDetails: [{ receivingAssistance: true }],
            membershipStatus: MembershipStatus.Active,
          })),
        });
      });
      it('should call setRegistrationErrors with an argument if there is no response', async () => {
        caseFileStore.createCaseFile = jest.fn(() => null);
        await wrapper.vm.createNewCaseFile();
        expect(registrationStore.registrationErrors)
          .toEqual({ name: 'case-file-create-error', message: 'Case file create error' });
      });

      it('should call setRegistrationErrors with null if there is a response', async () => {
        caseFileStore.createCaseFile = jest.fn(() => 'mock-response');
        await wrapper.vm.createNewCaseFile();
        expect(registrationStore.registrationErrors).toEqual(null);
      });
    });

    describe('resetPersonalInfoTab', () => {
      it('should reset personalInfo tab if it is touched, and then call nextDefault', async () => {
        registrationStore.tabs = mockTabs();
        doMount(true, {
          isPersonalInfoTouched: () => true,
        });
        registrationStore.mutateTabAtIndex = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.resetPersonalInfoTab();
        expect(registrationStore.mutateTabAtIndex).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.nextDefault).toBeCalledTimes(1);
      });
      it('should not reset personalInfo tab if it is not touched, and then call nextDefault', async () => {
        registrationStore.tabs = mockTabs();
        doMount(true, {
          isPersonalInfoTouched: () => false,
        });
        registrationStore.mutateTabAtIndex = jest.fn();
        wrapper.vm.nextDefault = jest.fn();
        wrapper.vm.$refs.form.validate = jest.fn(() => true);

        await wrapper.vm.resetPersonalInfoTab();
        expect(registrationStore.mutateTabAtIndex).toHaveBeenCalledTimes(0);
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
          currentTab: () => ({ id: TabId.Confirmation, titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });

        expect(wrapper.vm.showBackButton).toEqual(false);
      });
    });

    describe('eventName', () => {
      it('should return the even name', () => {
        const event = registrationStore.getEvent();
        expect(wrapper.vm.eventName).toEqual(wrapper.vm.$m(event.name));
      });
    });

    describe('registrationAssessment', () => {
      it('should return the registrationAssessment', () => {
        jest.clearAllMocks();
        registrationStore.getAssessmentToComplete = jest.fn(() => ({
          registrationAssessment: 'registrationAssessment',
        }));
        expect(wrapper.vm.registrationAssessment).toEqual('registrationAssessment');
      });
      it('shouldn\'t return the registrationAssessment when L0 and not enabled for L0', () => {
        wrapper.vm.$hasRole = (lvl) => (lvl === 'level0');

        const event = registrationStore.getEvent();
        registrationStore.getEvent = () => event;
        event.assessmentsForL0usersEnabled = false;
        jest.clearAllMocks();
        registrationStore.getAssessmentToComplete = jest.fn(() => ({
          registrationAssessment: 'registrationAssessment',
        }));
        expect(wrapper.vm.registrationAssessment).not.toEqual('registrationAssessment');

        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        wrapper.vm.$hasRole = (lvl) => (lvl === 'level0');
        event.assessmentsForL0usersEnabled = true;
        expect(wrapper.vm.registrationAssessment).toEqual('registrationAssessment');
      });
    });

    describe('getTitle', () => {
      it('should return proper text if reviewing an association', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        expect(wrapper.vm.getTitle).toEqual('registration.details.associateHouseholdButton.label');
      });

      it('should return proper text otherwise', () => {
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => false,
        });
        expect(wrapper.vm.getTitle).toEqual(wrapper.vm.allTabs[wrapper.vm.currentTabIndex].titleKey);
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
      it('return correct value', async () => {
        doMount(
          true,
          {
            currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
            associationMode: () => true,
          },
          {},
          [wrapper.vm.$featureKeys.AddressAutoFill],
        );
        expect(wrapper.vm.enableAutocomplete).toBe(true);
        doMount(true, {
          currentTab: () => ({ id: 'review', titleKey: 'titleKey', nextButtonTextKey: 'nextButtonTextKey' }),
          associationMode: () => true,
        });
        await wrapper.setFeature(wrapper.vm.$featureKeys.AddressAutoFill, false);
        expect(wrapper.vm.enableAutocomplete).toBe(false);
      });
    });

    describe('isPersonalInfoTouched', () => {
      it('should return isPersonalInfoTouched of personalInformation tab', () => {
        registrationStore.tabs = mockTabs();
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
        currentTab: () => ({ id: TabId.IsRegistered, titleKey: '', nextButtonTextKey: '' }),
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
