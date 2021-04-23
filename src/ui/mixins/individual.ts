// Mixin used for Individual.vue and RegistrationIndividual.vue
import { TranslateResult } from 'vue-i18n';
import _pickBy from 'lodash/pickBy';
import Vue from 'vue';
import { ILeftMenuItem, VForm } from '../../types';
import { Beneficiary } from '../../entities/beneficiary';

import helpers from '../../helpers';

export default Vue.extend({
  data() {
    return {
      requestOnGoing: false,
      isFormReady: false,
    };
  },

  computed: {
    xSmallOrSmallMenu(): boolean {
      return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm;
    },

    currentTab(): ILeftMenuItem {
      return this.$storage.registration.getters.currentTab();
    },

    currentTabIndex(): number {
      return this.$storage.registration.getters.currentTabIndex();
    },

    allTabs(): ILeftMenuItem[] {
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
        const fieldsHavingErrors = _pickBy((this.$refs.form as VForm).errors, (value) => value.length > 0);
        return Object.keys(fieldsHavingErrors).length > 0;
      }
      return false;
    },

    beneficiary(): Beneficiary {
      return this.$storage.beneficiary.getters.beneficiary();
    },
  },

  watch: {
    currentStepHasError(hasError) {
      this.mutateStateTab(!hasError);
    },
  },

  mounted() {
    // Wait for the form to be mounted before doing live validation
    this.isFormReady = true;
  },

  methods: {
    async jump(toIndex: number) {
      const effectiveToIndex = this.$storage.registration.getters.findEffectiveJumpIndex(toIndex);
      this.setSkippedStepsToValid(this.currentTabIndex, effectiveToIndex - 1);
      await (this.$refs.form as VForm).validate();
      this.$storage.registration.mutations.jump(effectiveToIndex);

      // If we stop on a validation error and a user has seen it previously, highlight errors
      if (effectiveToIndex !== toIndex && this.allTabs[effectiveToIndex].isTouched) {
        this.mutateStateTab(false);
        await (this.$refs.form as VForm).validate();
        helpers.scrollToFirstError('app');
      }
    },
    async next() {
      await this.jump(this.currentTabIndex + 1);
    },

    print() {
      return false;
    },

    mutateStateTab(valid: boolean) {
      this.$storage.registration.mutations.mutateCurrentTab((tab: ILeftMenuItem) => {
        tab.isValid = valid;
        tab.isTouched = true;
      });
    },

    setSkippedStepsToValid(indexStart: number, indexEnd: number) {
      if (indexStart <= indexEnd) {
        for (let i = indexStart + 1; i <= indexEnd; i += 1) {
          this.$storage.registration.mutations.mutateTabAtIndex(i,
            (tab: ILeftMenuItem) => {
              tab.isValid = true;
              tab.isTouched = true;
            });
        }
      }
    },
  },
});
