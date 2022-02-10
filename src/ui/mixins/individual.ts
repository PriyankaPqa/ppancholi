// Mixin used for Individual.vue and RegistrationIndividual.vue
import { TranslateResult } from 'vue-i18n';
import _pickBy from 'lodash/pickBy';
import Vue from 'vue';
import { IRegistrationMenuItem, VForm } from '../../types';
import { HouseholdCreate, IHouseholdCreateData } from '../../entities/household-create';
import helpers from '../helpers/index';

export default Vue.extend({
  data() {
    return {
      isFormReady: false,
      recaptchaToken: null,
    };
  },

  computed: {
    xSmallOrSmallMenu(): boolean {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },

    currentTab(): IRegistrationMenuItem {
      return this.$storage.registration.getters.currentTab();
    },

    currentTabIndex(): number {
      return this.$storage.registration.getters.currentTabIndex();
    },

    allTabs(): IRegistrationMenuItem[] {
      return this.$storage.registration.getters.tabs();
    },

    previousTabName(): TranslateResult {
      return this.$t(this.$storage.registration.getters.previousTabName());
    },

    nextTabName(): TranslateResult {
      return this.$t(this.$storage.registration.getters.nextTabName());
    },

    currentStepHasError(): boolean {
      if (this.isFormReady) {
        if (this.$refs.form) {
          const fieldsHavingErrors = _pickBy((this.$refs.form as VForm).errors, (value) => value.length > 0);
          return Object.keys(fieldsHavingErrors).length > 0;
        }
      }
      return false;
    },

    household(): HouseholdCreate {
      return this.$storage.registration.getters.householdCreate();
    },

    redirectionLink(): string {
      return this.$t('registration.redirection_link') as string;
    },

    submitLoading(): boolean {
      return this.$store.state.registration.submitLoading;
    },

    inlineEdit(): boolean {
      return this.$store.state.registration.inlineEditCounter > 0;
    },

    event() {
      return this.$storage.registration.getters.event();
    },

    registrationNumber(): string {
      // eslint-disable-next-line no-nested-ternary
      return this.$store.state.registration.householdAssociationMode
        ? (this.household as IHouseholdCreateData).registrationNumber
        : this.$storage.registration.getters.registrationResponse()
          ? this.$storage.registration.getters.registrationResponse().registrationNumber
          : '';
    },
  },

  watch: {
    currentStepHasError(hasError) {
      this.mutateStateTab(!hasError);
    },

    async currentTab(tab) {
      if (!tab.isValid && tab.isTouched) {
        await this.$nextTick();
        await (this.$refs.form as VForm).validate();
        helpers.scrollToFirstError('app');
      }
    },
  },

  mounted() {
    // Wait for the form to be mounted before doing live validation
    this.isFormReady = true;
  },

  methods: {
    async jump(toIndex: number) {
      if (this.allTabs[toIndex].id === 'confirmation') {
        this.handleConfirmationScreen(toIndex);
        return;
      }

      const effectiveToIndex = this.$storage.registration.getters.findEffectiveJumpIndex(toIndex);
      this.setSkippedStepsToValid(this.currentTabIndex, effectiveToIndex - 1);
      // We validate before leaving, so we see error if we can't go next
      await (this.$refs.form as VForm).validate();
      this.$storage.registration.mutations.jump(effectiveToIndex);

      // If we stop on a step having errors, highlight errors
      if (effectiveToIndex !== toIndex) {
        this.mutateStateTab(false);
      }
    },

    async next() {
      if (this.currentTab.id === 'confirmation') {
        await this.closeRegistration();
        return;
      }

      if (this.currentTab.id === 'review') { // The recaptchaToken is set in Individual.vue (benef app), in the callback
        await this.$storage.registration.actions.submitRegistration(this.recaptchaToken);
      }

      await this.jump(this.currentTabIndex + 1);
    },

    async print() {
      let stylesHtml = '';
      const nodes = [...document.querySelectorAll('link[rel="stylesheet"], style')];
      nodes.forEach((node) => {
        stylesHtml += node.outerHTML;
      });

      const html = (this.$refs.printConfirm as Vue).$el.innerHTML;

      const WinPrint = window.open('', '_blank', 'left=0,top=0,width=1000,height=1000,toolbar=0,status=0');

      WinPrint.document.write(`<!DOCTYPE html>
        <html>
          <head>
              ${stylesHtml}
          </head>
          <body>
            <div>${html}</div>
          </body>
        </html>`);

      await helpers.timeout(1000);

      WinPrint.focus();
      WinPrint.print();
    },

    async closeRegistration() {
      if (this.$storage.registration.getters.isCRCRegistration()) {
        this.$router.replace({ name: 'casefile.home' });
        return;
      }
      window.location.assign(this.redirectionLink);
    },

    handleConfirmationScreen(confirmationScreenIndex: number) {
      this.disableOtherTabs(confirmationScreenIndex);

      this.$storage.registration.mutations.mutateTabAtIndex(confirmationScreenIndex, (tab: IRegistrationMenuItem) => {
        if (this.$store.state.registration.householdAssociationMode) tab.titleKey = 'registration.page.confirmation.association.title';

        tab.isTouched = true;
      });

      this.$storage.registration.mutations.jump(confirmationScreenIndex);
    },

    disableOtherTabs(toIndex: number) {
      for (let index = 0; index < this.allTabs.length; index += 1) {
        this.$storage.registration.mutations.mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = index !== toIndex;
        });
      }
    },

    mutateStateTab(valid: boolean) {
      this.$storage.registration.mutations.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.isValid = valid;
        tab.isTouched = true;
      });
    },

    setSkippedStepsToValid(indexStart: number, indexEnd: number) {
      if (indexStart <= indexEnd) {
        for (let i = indexStart + 1; i <= indexEnd; i += 1) {
          this.$storage.registration.mutations.mutateTabAtIndex(i, (tab: IRegistrationMenuItem) => {
            tab.isValid = true;
            tab.isTouched = true;
          });
        }
      }
    },
  },
});
