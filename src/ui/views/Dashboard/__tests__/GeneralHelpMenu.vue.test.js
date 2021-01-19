import { createLocalVue, mount } from '@/test/testSetup';
import Vuetify from 'vuetify';
import { i18n } from '@/ui/plugins/i18n';
import Component from '../Layout/GeneralHelpMenu.vue';

const localVue = createLocalVue();

describe('GeneralHelpMenu.vue', () => {
  let wrapper;

  beforeEach(async () => {
    const vuetify = new Vuetify();

    wrapper = mount(Component, {
      localVue,
      vuetify,
      store: {
        modules: {
          dashboard: {
            state: {
              generalHelpMenuVisible: true,
            },
          },
        },
      },
      propsData: {
        isRegistrationHelpMenu: false,
        menuLinks: [],
      },
    });
  });

  test('Close button closes the General Help Menu', async () => {
    expect(wrapper.vm.$store.state.dashboard.generalHelpMenuVisible).toBe(true);

    const button = wrapper.find('[data-test="close-button"]');

    await button.trigger('click');

    expect(wrapper.vm.$store.state.dashboard.generalHelpMenuVisible).toBe(false);
  });

  test('Help Center button has a link to the Zendesk Help Center page', async () => {
    const helpCenterButton = wrapper.find('[data-test="help-center-button"]');
    expect(helpCenterButton.exists()).toBe(true);
    expect(helpCenterButton.element.disabled).toBe(undefined);

    expect(helpCenterButton.attributes('href')).toBe('zendesk.help_centre');
  });

  describe('Tests related to the menu for General Help', () => {
    beforeEach(async () => {
      wrapper.setProps({
        menuLinks: [{
          to: i18n.t('zendesk.help_link.forgot_password').toString(),
          text: i18n.t('zendesk.question.forgot_password'),
          test: 'zendesk-forgot-password',
        },
        {
          to: i18n.t('zendesk.help_link.select_language_preferences').toString(),
          text: i18n.t('zendesk.question.select_language_preferences'),
          test: 'zendesk-select-language-preferences',
        },
        {
          to: i18n.t('zendesk.help_link.register_a_beneficiary').toString(),
          text: i18n.t('zendesk.question.register_a_beneficiary'),
          test: 'zendesk-register-a-beneficiary',
        },
        {
          to: i18n.t('zendesk.help_link.create_case_note').toString(),
          text: i18n.t('zendesk.question.create_case_note'),
          test: 'zendesk-create-case-note',
        }],
      });
    });

    test('Test that the list items for the General Help Menu (dashboard) show the correct links', async () => {
      const generalHelpItem = '[data-test="general-help-item-zendesk';

      const forgotPasswordLink = wrapper.find(`${generalHelpItem}-forgot-password"]`);
      expect(forgotPasswordLink.attributes('href')).toBe(i18n.t('zendesk.help_link.forgot_password'));

      const selectLanguagePreferencesLink = wrapper.find(`${generalHelpItem}-select-language-preferences"]`);
      expect(selectLanguagePreferencesLink.attributes('href')).toBe(i18n.t('zendesk.help_link.select_language_preferences'));

      const registerBeneficiaryLink = wrapper.find(`${generalHelpItem}-register-a-beneficiary"]`);
      expect(registerBeneficiaryLink.attributes('href')).toBe(i18n.t('zendesk.help_link.register_a_beneficiary'));

      const createCaseNoteLink = wrapper.find(`${generalHelpItem}-create-case-note"]`);
      expect(createCaseNoteLink.attributes('href')).toBe(i18n.t('zendesk.help_link.create_case_note'));
    });
  });
});
