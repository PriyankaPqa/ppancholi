import { createLocalVue, shallowMount, mount } from '@/test/testSetup';
import { mockEventEntity } from '@libs/entities-lib/event';
import { getPiniaForUser } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { EEventSummarySections } from '@/types';
import { useMockTenantSettingsStore } from '@libs/stores-lib/tenant-settings/tenant-settings.mock';
import Component from '../components/EventConsentSelectionDialog.vue';

const localVue = createLocalVue();

const mockEvent = mockEventEntity();

const pinia = getPiniaForUser(UserRoles.level6);
const eventStore = useMockEventStore(pinia).eventStore;
const tenantSettingsStore = useMockTenantSettingsStore(pinia).tenantSettingsStore;

describe('EventConsentSelectionDialog.vue', () => {
  let wrapper;

  const mountWrapper = (fullMount = false, otherOptions = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        event: mockEvent,
        id: '1',
      },
      mocks: { $t: (k) => k },
      ...otherOptions,
    });
  };

  describe('Template', () => {
    beforeEach(() => {
      mountWrapper(true);
    });

    describe('selected-statement', () => {
      it('renders', () => {
        const element = wrapper.findDataTest('selected-consent-statement');
        expect(element.exists()).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      mountWrapper();
    });
    describe('selectedStatementText', () => {
      it('returns correct value if website placeholder is found', async () => {
        await wrapper.vm.selectedStatementText;
        wrapper.vm.selectedStatement.statement.translation.en = '{website} more';
        const url = wrapper.vm.$t('registration.privacy_statement.website', 'en');
        expect(wrapper.vm.selectedStatementText).toEqual(
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a> more`,
        );
      });

      it('returns correct value if email placeholder is found', async () => {
        await wrapper.vm.selectedStatementText;
        wrapper.vm.selectedStatement.statement.translation.en = '{email} more';
        expect(wrapper.vm.selectedStatementText).toEqual(
          `<a href="mailto:${wrapper.vm.$t('registration.privacy_statement.email', 'en')}">${wrapper.vm.$t('registration.privacy_statement.email', 'en')}</a> more`,
        );
      });

      it('returns correct value if either website nor email placeholder is found', async () => {
        await wrapper.vm.selectedStatementText;
        wrapper.vm.selectedStatement.statement.translation.en = 'statement';
        expect(wrapper.vm.selectedStatementText).toEqual(
          'statement',
        );
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      mountWrapper();
    });
    describe('created', () => {
      it('Should initialize consent statements', async () => {
        expect(wrapper.vm.selectedStatement.name.translation.en).toEqual('eventSummary.defaultConsentName');
      });
      it('Should get the statement in tenant settings if it exists', async () => {
        const event = mockEventEntity();
        event.consentStatementId = 'def';
        tenantSettingsStore.currentTenantSettings.consentStatements = [{ id: 'abc', name: { translation: { en: 'hello' } }, statement: { translation: { en: 'hello' } } },
          { id: 'def', name: { translation: { en: 'second' } }, statement: { translation: { en: 'second' } } }];
        jest.clearAllMocks();
        mountWrapper(
          false,
          { propsData: {
            event,
            id: '1',
          } },
        );
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.selectedStatement).toEqual(tenantSettingsStore.currentTenantSettings.consentStatements[1]);
        expect(wrapper.vm.statements.length).toBe(3);
        expect(wrapper.vm.statements[0].name.translation.en).toBe('eventSummary.defaultConsentName');
        expect(wrapper.vm.statements[1].name.translation.en).toBe('hello');
        expect(wrapper.vm.statements[2].name.translation.en).toBe('second');
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      mountWrapper();
    });
    describe('onSubmit', () => {
      it('Submit calls validate method', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.vm.$refs.form.validate).toHaveBeenCalledTimes(1);
      });

      it('calls updateEventConsent with the right payload', async () => {
        wrapper.vm.event.id = 'id-1';
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(eventStore.updateEventConsent).toHaveBeenCalledWith({
          eventId: 'id-1',
          consentStatementId: wrapper.vm.selectedStatement.id,
          section: EEventSummarySections.EventConsent,
        });
      });

      it('emits close if form is valid', async () => {
        wrapper.vm.$refs.form.validate = jest.fn(() => true);
        await wrapper.vm.onSubmit();
        expect(wrapper.emitted('close')).toBeTruthy();
      });
    });

    describe('setLanguageMode', () => {
      it('sets the languageMode to the argument passed', async () => {
        await wrapper.vm.setLanguageMode('en');
        expect('en').toEqual('en');
      });
    });
  });
});
