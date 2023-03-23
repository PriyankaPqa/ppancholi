import { IServerError } from '@libs/shared-lib/types';
// Mixin used for Individual.vue and RegistrationIndividual.vue
import { TranslateResult } from 'vue-i18n';
import _pickBy from 'lodash/pickBy';
import Vue from 'vue';
import helpers from '@libs/entities-lib/helpers';
import { HouseholdCreate, IHouseholdCreateData } from '@libs/entities-lib/household-create';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { IRegistrationMenuItem, VForm } from '../../types';
import { keysForDuplicateErrors } from '../../components/confirm-registration/keysForDuplicateErrors';

export default Vue.extend({
  data() {
    return {
      isFormReady: false,
      recaptchaToken: null,
      showErrorDialog: false,
      retryCount: 0,
      retryMax: 5,
      retrying: false,
      retryInterval: 3000,
    };
  },

  computed: {
    xSmallOrSmallMenu(): boolean {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },

    currentTab(): IRegistrationMenuItem {
      return this.$registrationStore.getCurrentTab();
    },

    currentTabIndex(): number {
      return this.$registrationStore.currentTabIndex;
    },

    allTabs(): IRegistrationMenuItem[] {
      const allTabs = this.$registrationStore.tabs;
      // When feature flag is removed, the new translation keys need to be set in the files 'tabs'
      if (this.$hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)) {
        return allTabs.map((t) => {
          if (t.id === 'isRegistered') {
            return {
              ...t,
              labelKey: 'registration.menu.isIndividualRegistered',
              titleKey: 'registration.menu.isIndividualRegistered',
            };
          }
          return t;
        });
      }
      return allTabs;
    },

    previousTabName(): TranslateResult {
      return this.$t(this.$registrationStore.getPreviousTabName());
    },

    nextTabName(): TranslateResult {
      return this.$t(this.$registrationStore.getNextTabName());
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
      return this.$registrationStore.getHouseholdCreate();
    },

    redirectionLink(): string {
      return this.$t('registration.redirection_link') as string;
    },

    submitLoading(): boolean {
      return this.$registrationStore.submitLoading;
    },

    inlineEdit(): boolean {
      return this.$registrationStore.inlineEditCounter > 0;
    },

    event() {
      return this.$registrationStore.getEvent();
    },

    submitErrors(): IServerError {
      return this.$registrationStore.registrationErrors;
    },

    registrationNumber(): string {
      // eslint-disable-next-line no-nested-ternary
      return this.$registrationStore.householdAssociationMode
        ? (this.household as IHouseholdCreateData).registrationNumber
        : this.$registrationStore.registrationResponse?.household?.registrationNumber
          ? this.$registrationStore.registrationResponse.household.registrationNumber
          : '';
    },

    registrationSuccess(): boolean {
      return !this.submitErrors && this.$registrationStore.registrationResponse !== undefined;
    },

    phoneAssistance(): string {
      return this.event.responseDetails?.assistanceNumber || '';
    },

    isDuplicateError(): boolean {
      const errors = (this.submitErrors as IServerError)?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        return errors.some((e) => keysForDuplicateErrors.includes(e.code));
      }
      return false;
    },
    containsErrorCode(): boolean {
      const errors = (this.submitErrors as IServerError)?.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        return errors.some((e) => e.code.length !== 0);
      }
      return false;
    },
  },

  watch: {
    currentStepHasError(hasError) {
      this.mutateStateTab(!hasError);
    },

    async currentTab(tab) {
      if (tab && !tab.isValid && tab.isTouched) {
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
      // When going to another tab, consider the departure tab to be touched
      this.$registrationStore.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.isTouched = true;
      });

      if (this.allTabs[toIndex].id === 'confirmation') {
        this.handleConfirmationScreen(toIndex);
        return;
      }

      const effectiveToIndex = this.$registrationStore.findEffectiveJumpIndex(toIndex);
      this.setSkippedStepsToValid(this.currentTabIndex, effectiveToIndex - 1);
      // We validate before leaving, so we see error if we can't go next
      await (this.$refs.form as VForm).validate();

      // scroll top
      window.scrollTo(0, 0);

      this.$registrationStore.jump(effectiveToIndex);

      // If we stop on a step having errors, highlight errors
      if (effectiveToIndex !== toIndex) {
        // We validate before leaving, so we see error if we can't go next
        await (this.$refs.form as VForm).validate();
      }
    },

    async next() {
      if (this.currentTab.id === 'assessment') {
        this.openAssessmentIfAvailable();
      }

      // if this is the last page of the process, or if we dont go to the last page - assessment
      // (confirmation did not generate an assessment due to an error or crc where we never get to the last tab)
      if ((this.currentTab.id === 'confirmation' && (this.$registrationStore.isCRCRegistration() || !this.registrationSuccess))
        || this.currentTabIndex === this.allTabs.length - 1) {
        await this.closeRegistration();
        return;
      }

      if (this.currentTab.id === 'review') { // The recaptchaToken is set in Individual.vue (benef app), in the callback
        await this.submitRegistration();
        if (this.submitErrors && !this.isDuplicateError) {
          if (this.containsErrorCode) { // If no duplicate errors, but errors have a code
            await this.jump(this.currentTabIndex + 1);
            return;
          }
          await this.handleErrors(this.submitRegistration); // If we want to start the retry process
          return;
        }
      }

      await this.jump(this.currentTabIndex + 1);
    },

    openAssessmentIfAvailable() {
      const assessment = this.$registrationStore.registrationResponse?.assessmentResponses[0];
      if (assessment) {
        const routeParams = this.$registrationStore.isCRCRegistration() ? {
          name: 'events.assessments.complete',
          params: {
            assessmentTemplateId: assessment.assessmentFormId,
            id: this.event.id,
            assessmentResponseId: assessment.id,
          },
        } : {
          name: 'assessmentRunner',
          params: {
            assessmentTemplateId: assessment.assessmentFormId,
            eventId: this.event.id,
            assessmentResponseId: assessment.id,
          },
        };
        const routeData = this.$router.resolve(routeParams);
        window.open(routeData.href, '_blank');
      }
    },

    async submitRegistration() {
      await this.$registrationStore.submitRegistration(this.recaptchaToken);
    },

    async handleErrors(submitFunction: ()=> void) {
      this.retrying = true;
      while (this.retryCount < this.retryMax && this.submitErrors && !this.isDuplicateError) {
        // eslint-disable-next-line no-await-in-loop
        await helpers.timeout(this.retryInterval);
        // eslint-disable-next-line no-await-in-loop
        await submitFunction();
        this.retryCount += 1;
      }

      this.retryCount = 0;
      this.retrying = false;

      if (this.submitErrors && !this.isDuplicateError) {
        this.showErrorDialog = true;
      } else {
        await this.jump(this.currentTabIndex + 1);
      }
    },

    async createNewCaseFile() {
      return false;
    },

    print() {
      let stylesHtml = '';
      const nodes = [...document.querySelectorAll('link[rel="stylesheet"], style')];
      nodes.forEach((node) => {
        stylesHtml += node.outerHTML;
      });

      const html = (this.$refs.printConfirm as Vue).$el.innerHTML;

      const WinPrint = window.open('Print', '', 'left=0,top=0,width=1000,height=1000,toolbar=0,status=0');

      WinPrint.document.write(`<!DOCTYPE html>
        <html>
          <head>
              ${stylesHtml}
          </head>
          <body>
            <div>${html}</div>
          </body>
        </html>`);

      setTimeout(() => {
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
      }, 2000);
    },

    async closeRegistration() {
      if (this.$registrationStore.isCRCRegistration()) {
        this.$router.replace({ name: 'casefile.home' });
        return;
      }
      window.location.assign(this.redirectionLink);
    },

    handleConfirmationScreen(confirmationScreenIndex: number) {
      // for crc we show the assessment tab after but we keep it disabled as we never access it
      // it's only there to show that the event includes an assessment
      // the confirmation screen will include the assessment button
      this.disableOtherTabs(confirmationScreenIndex, !this.$registrationStore.isCRCRegistration() && this.registrationSuccess);

      this.$registrationStore.mutateTabAtIndex(confirmationScreenIndex, (tab: IRegistrationMenuItem) => {
        if (this.$registrationStore.householdAssociationMode) {
          tab.titleKey = this.$hasFeature(FeatureKeys.ReplaceBeneficiaryTerm)
            ? 'registration.page.confirmation.association.title.household'
            : 'registration.page.confirmation.association.title';
        }

        tab.isTouched = true;
      });

      this.$registrationStore.jump(confirmationScreenIndex);
    },

    disableOtherTabs(toIndex: number, activateFutureTabs: boolean) {
      for (let index = 0; index < this.allTabs.length; index += 1) {
        this.$registrationStore.mutateTabAtIndex(index, (tab: IRegistrationMenuItem) => {
          tab.disabled = activateFutureTabs ? index < toIndex : index !== toIndex;
        });
      }
    },

    mutateStateTab(valid: boolean) {
      this.$registrationStore.mutateCurrentTab((tab: IRegistrationMenuItem) => {
        tab.isValid = valid;
        tab.isTouched = true;
      });
    },

    setSkippedStepsToValid(indexStart: number, indexEnd: number) {
      if (indexStart <= indexEnd) {
        for (let i = indexStart + 1; i <= indexEnd; i += 1) {
          this.$registrationStore.mutateTabAtIndex(i, (tab: IRegistrationMenuItem) => {
            tab.isValid = true;
            tab.isTouched = true;
          });
        }
      }
    },
  },
});
