import helpers from '@libs/entities-lib/src/helpers';
import { mockEventSummary } from '@libs/entities-lib/src/event/event.mock';
import { mockTabs } from '@libs/stores-lib/src/registration/tabs.mock';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/src/household';
import { TabId } from '@libs/registration-lib/types/interfaces/IRegistrationMenuItem';
import { createLocalVue, shallowMount } from '../../test/testSetup';

import individual from './individual';

const localVue = createLocalVue();

window.scrollTo = jest.fn();

const Component = {
  render() {},
  mixins: [individual],
};
let wrapper;
const doMount = ({ errorCode } = { errorCode: null }) => {
  wrapper = shallowMount(Component, {
    localVue,
    computed: {
      submitErrors: () => ({ response: { data: { errors: [{ code: errorCode }] } } }),
      containsErrorCode: () => !!errorCode,
    },
  });
  wrapper.vm.submitRegistration = jest.fn();
  wrapper.vm.handleErrors = jest.fn();
};

describe('Individual.vue', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
      });
    });

    describe('currentTab', () => {
      it('returns current tab from store', async () => {
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => mockTabs()[0]);
        expect(wrapper.vm.currentTab).toEqual(mockTabs()[0]);
      });
    });

    describe('currentTabIndex', () => {
      it('returns current tab index from store', async () => {
        const index = 1;

        wrapper.vm.$registrationStore.currentTabIndex = index;

        expect(wrapper.vm.currentTabIndex).toEqual(index);
      });
    });

    describe('allTabs', () => {
      it('returns all tabs from store', async () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();
        expect(wrapper.vm.allTabs).toEqual(mockTabs());
      });
    });

    describe('previousTab', () => {
      it('returns title of previous tab', async () => {
        wrapper.vm.$registrationStore.getPreviousTabName.mockReturnValueOnce('test');

        expect(wrapper.vm.previousTabName).toEqual('test');
      });
    });

    describe('nextTab', () => {
      it('returns title of next tab', async () => {
        wrapper.vm.$registrationStore.getNextTabName.mockReturnValueOnce('test');

        expect(wrapper.vm.nextTabName).toEqual('test');
      });
    });

    describe('submitLoading', () => {
      it('returns proper data', () => {
        expect(wrapper.vm.submitLoading).toBe(wrapper.vm.$registrationStore.submitLoading);
      });
    });

    describe('inlineEdit', () => {
      it('returns proper data', () => {
        expect(wrapper.vm.inlineEdit).toBe(false);
      });
    });

    describe('registrationSuccess', () => {
      it('returns true if no error', () => {
        wrapper.vm.$registrationStore.registrationErrors = null;
        expect(wrapper.vm.registrationSuccess).toBe(true);
      });

      it('returns false if has error', () => {
        wrapper.vm.$registrationStore.registrationErrors = [{ detail: 'error' }];
        expect(wrapper.vm.registrationSuccess).toBe(false);
      });

      it('returns false if response is undefined', () => {
        wrapper.vm.$registrationStore.registrationErrors = [];
        wrapper.vm.$registrationStore.registrationResponse = undefined;
        expect(wrapper.vm.registrationSuccess).toBe(false);
      });
    });

    describe('submitErrors', () => {
      it('returns errors from the store', async () => {
        expect(wrapper.vm.submitErrors).toEqual(wrapper.vm.$registrationStore.registrationErrors);
      });
    });

    describe('event', () => {
      it('return the event by id from the store', () => {
        expect(wrapper.vm.event).toEqual(wrapper.vm.$registrationStore.getEvent());
      });
    });

    describe('phoneAssistance', () => {
      it('returns the proper data', async () => {
        wrapper.vm.$registrationStore.getEvent = jest.fn(() => mockEventSummary());
        expect(wrapper.vm.phoneAssistance).toEqual(mockEventSummary().responseDetails.assistanceNumber);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      window.scrollTo = jest.fn();
      wrapper = shallowMount(Component, {
        localVue,
      });
      wrapper.vm.submitRegistration = jest.fn();
      wrapper.vm.handleErrors = jest.fn();
    });

    describe('openAssessmentIfAvailable', () => {
      it('should open new tab to editor page', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        wrapper.vm.$registrationStore.registrationResponse = mockDetailedRegistrationResponse();
        window.open = jest.fn();
        const assessment = mockDetailedRegistrationResponse().assessmentResponses[0];

        wrapper.vm.openAssessmentIfAvailable();

        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: 'events.assessments.complete',
          params: {
            assessmentTemplateId: assessment.assessmentFormId,
            id: wrapper.vm.event.id,
            assessmentResponseId: assessment.id,
          },
        });
        expect(window.open).toHaveBeenCalledWith(wrapper.vm.$router.resolve().href, '_blank');

        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);

        wrapper.vm.openAssessmentIfAvailable();

        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: 'assessmentRunner',
          params: {
            assessmentTemplateId: assessment.assessmentFormId,
            eventId: wrapper.vm.event.id,
            assessmentResponseId: assessment.id,
          },
        });
      });
    });

    describe('next', () => {
      describe('Assessment page', () => {
        it('opens assessment', async () => {
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
            id: TabId.Assessment,
          }));
          window.open = jest.fn();
          wrapper.vm.closeRegistration = jest.fn();
          wrapper.vm.jump = jest.fn();
          wrapper.vm.openAssessmentIfAvailable = jest.fn();

          await wrapper.vm.next();
          expect(wrapper.vm.openAssessmentIfAvailable).toHaveBeenCalled();
        });
      });
      describe('Confirmation page', () => {
        it('calls closeRegistration', async () => {
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
            id: TabId.Confirmation,
          }));
          wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
          wrapper.vm.closeRegistration = jest.fn();
          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();

          expect(wrapper.vm.$registrationStore.isCRCRegistration).toHaveBeenCalled();
          expect(wrapper.vm.closeRegistration).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.jump).toHaveBeenCalledTimes(0);
        });
      });

      describe('Review page', () => {
        it('should call submit registration', async () => {
          wrapper.vm.$registrationStore.submitRegistration = jest.fn();
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
            id: 'review',
          }));
          wrapper.vm.jump = jest.fn();
          await wrapper.vm.next();

          expect(wrapper.vm.submitRegistration).toHaveBeenCalledTimes(1);
        });
        it('calls handleErrors if there are submit errors with no errors code', async () => {
          doMount({ errorCode: '' });
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
            id: 'review',
          }));

          wrapper.vm.handleErrors = jest.fn();

          await wrapper.vm.next();
          expect(wrapper.vm.handleErrors).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.handleErrors).toHaveBeenCalledWith(wrapper.vm.submitRegistration);
        });
        it('calls jump if there are submit errors with error code', async () => {
          doMount({ errorCode: 'errors.example' });
          wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
            id: 'review',
          }));

          wrapper.vm.jump = jest.fn();

          await wrapper.vm.next();
          expect(wrapper.vm.jump).toHaveBeenCalledTimes(1);
        });
      });

      it('calls jump otherwise', async () => {
        wrapper.vm.$registrationStore.getCurrentTab = jest.fn(() => ({
          id: 'other',
        }));
        wrapper.vm.jump = jest.fn();

        await wrapper.vm.next();

        expect(wrapper.vm.jump).toHaveBeenCalledWith(wrapper.vm.currentTabIndex + 1);
      });
    });

    describe('jump', () => {
      it('makes correct uninterrupted jump', async () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.$registrationStore.mutateTabAtIndex = jest.fn();
        wrapper.vm.$registrationStore.findEffectiveJumpIndex = jest.fn(() => 4);
        wrapper.vm.$registrationStore.currentTabIndex = 2;

        const toIndex = 4;
        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.$registrationStore.mutateTabAtIndex).toHaveBeenCalledTimes(2);
        expect(wrapper.vm.$registrationStore.jump).toHaveBeenCalledWith(toIndex);
      });

      it('disables other tabs when going to tier 2', async () => {
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };
        wrapper.vm.disableOtherTabs = jest.fn();

        await wrapper.vm.jump(3);
        expect(wrapper.vm.disableOtherTabs).not.toHaveBeenCalled();

        wrapper.vm.allTabs[3].id = TabId.Tier2auth;
        await wrapper.vm.jump(3);
        expect(wrapper.vm.disableOtherTabs).toHaveBeenCalledWith(3, false);
      });

      it('make correct interrupted jump', async () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();
        wrapper.vm.$refs.form = {
          validate: jest.fn(() => true),
        };

        wrapper.vm.$registrationStore.findEffectiveJumpIndex = jest.fn(() => 2);
        wrapper.vm.$registrationStore.currentTabIndex = 2;

        const toIndex = 4;
        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.$registrationStore.mutateTabAtIndex).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.$registrationStore.jump).toHaveBeenCalledWith(2);
      });

      it('call handleConfirmationScreen if it is confirmation', async () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();

        const toIndex = 5;
        wrapper.vm.handleConfirmationScreen = jest.fn();

        await wrapper.vm.jump(toIndex);
        expect(wrapper.vm.handleConfirmationScreen).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleConfirmationScreen', () => {
      it('call disableOtherTabs and jump', () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();
        const toIndex = 5;
        wrapper.vm.disableOtherTabs = jest.fn();

        wrapper.vm.handleConfirmationScreen(toIndex);
        expect(wrapper.vm.disableOtherTabs).toHaveBeenCalledWith(toIndex, false);
        expect(wrapper.vm.$registrationStore.isCRCRegistration).toHaveBeenCalled();
        expect(wrapper.vm.$registrationStore.jump).toHaveBeenCalledWith(toIndex);
      });
    });

    describe('handleErrors', () => {
      it('calls a timer and the passed function for the amount of times equal to retryMax if there are still submit errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
          },
        });
        helpers.timeout = jest.fn();
        wrapper.vm.submitRegistration = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 0, retryInterval: 2000 });
        await wrapper.vm.handleErrors(wrapper.vm.submitRegistration);

        expect(wrapper.vm.submitRegistration).toBeCalledTimes(5);
        expect(helpers.timeout).toBeCalledTimes(5);
        expect(helpers.timeout).toBeCalledWith(2000);
      });

      it('opens the errorDialog if it called submit for the maximum number of times and there are still errors - not duplication errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
            isDuplicateError: () => false,
          },
        });

        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.showErrorDialog).toEqual(true);
      });

      it('calls jump if it called submit for the maximum number of times and there are no errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => null,
          },
        });

        wrapper.vm.$registrationStore.currentTabIndex = 2;
        wrapper.vm.jump = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });

      it('calls jump if it called submit for the maximum number of times and there are duplication errors', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            submitErrors: () => ({ response: { data: {} } }),
            isDuplicateError: () => true,

          },
        });

        wrapper.vm.$registrationStore.currentTabIndex = 2;
        wrapper.vm.jump = jest.fn();
        await wrapper.setData({ retryMax: 5, retryCount: 5, showErrorDialog: false });
        await wrapper.vm.handleErrors();
        expect(wrapper.vm.jump).toHaveBeenCalledWith(3);
      });
    });

    describe('closeRegistration', () => {
      it('redirects to case file if it is CRC registration', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => true);
        wrapper.vm.$router = {
          replace: jest.fn(),
        };

        await wrapper.vm.closeRegistration();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({ name: 'casefile.home' });
      });

      it('redirects to red cross if it is not CRC regitration', async () => {
        wrapper.vm.$registrationStore.isCRCRegistration = jest.fn(() => false);
        wrapper.vm.$router = {
          replace: jest.fn(),
        };

        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
          value: {
            assign: jest.fn(),
          },
        });

        await wrapper.vm.closeRegistration();

        expect(wrapper.vm.$router.replace).toHaveBeenCalledTimes(0);
        expect(window.location.assign).toHaveBeenCalledWith('registration.redirection_link');
      });
    });

    describe('mutateStateTab', () => {
      it('calls mutation', async () => {
        wrapper.vm.$registrationStore.tabs = mockTabs();

        wrapper.vm.mutateStateTab(true);

        expect(wrapper.vm.$registrationStore.mutateCurrentTab).toHaveBeenCalledTimes(1);
      });
    });
  });
});
