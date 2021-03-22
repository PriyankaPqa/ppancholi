<template>
  <div class="full-height grey lighten-4">
    <left-menu @jump="jump" />

    <ValidationObserver ref="form" v-slot="{ failed }" style="width: 100%" tag="div">
      <rc-page-content
        :title="$t(currentTab.titleKey)"
        :subtitle="$t('registration.type.individual')"
        :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
        outer-scroll>
        <template slot="default">
          <v-row justify="center" class="mt-12" no-gutters>
            <v-col cols="12" xl="8" lg="8" md="12" sm="12">
              <component :is="currentTab.componentName" :beneficiary="beneficiary" @update-entity="updateEntity" />
            </v-col>
          </v-row>
        </template>

        <template slot="actions">
          <div class="actions">
            <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
              <v-btn :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" @click="back()">
                <v-icon v-if="currentTab.id === 'confirmation'" size="20" color="grey darken-2" class="pr-2">
                  mdi-printer
                </v-icon>
                {{ $t(currentTab.backButtonTextKey) }}
              </v-btn>

              <span class="ml-2 d-sm-inline d-md-none">{{ previousTabName }}</span>
            </div>

            <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
              <span class="fw-bold d-sm-inline d-md-none">{{ nextTabName }}</span>
              <v-btn
                color="primary"
                data-test="nextButton"
                :aria-label="$t(currentTab.nextButtonTextKey)"
                :loading="requestOnGoing"
                :disabled="failed"
                @click="next()">
                {{ $t(currentTab.nextButtonTextKey) }}
              </v-btn>
            </div>
          </div>
        </template>
      </rc-page-content>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { RcPageContent } from '@crctech/component-library';
import { ILeftMenuItem } from '@/types/interfaces/ILeftMenuItem';
import { TranslateResult } from 'vue-i18n';
import { Beneficiary } from '@/entities/beneficiary';
import { IEntity, VForm } from '@/types';
import _pickBy from 'lodash/pickBy';
import helpers from '@/ui/helpers';
import routes from '@/constants/routes';
import LeftMenu from './LeftMenu.vue';
import PrivacyStatement from './PrivacyStatement.vue';
import PersonalInformation from './PersonalInformation.vue';
import Addresses from './Addresses.vue';
import HouseholdMembers from './HouseholdMembers.vue';
import ReviewRegistration from './ReviewRegistration.vue';
import ConfirmRegistration from './ConfirmRegistration.vue';

export default Vue.extend({
  name: 'Individual',

  components: {
    RcPageContent,
    LeftMenu,
    PrivacyStatement,
    PersonalInformation,
    Addresses,
    HouseholdMembers,
    ReviewRegistration,
    ConfirmRegistration,
  },

  data() {
    return {
      requestOnGoing: false,
      beneficiary: new Beneficiary(),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldsHavingErrors = _pickBy((this.$refs.form as any).errors, (value) => value.length > 0);
        return Object.keys(fieldsHavingErrors).length > 0;
      }
      return false;
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
      const isValid = await (this.$refs.form as VForm).validate();

      // TODO We should use the entity validation to stop at the first step containing an error. Then run vee validate to display errors
      this.mutateStateTab(isValid);

      if (toIndex > this.currentTabIndex && !isValid) {
        helpers.scrollToFirstError('app');
        return;
      }

      this.$storage.registration.mutations.jump(toIndex);
    },

    async back() {
      if (this.currentTabIndex === 0) {
        this.$router.push({ name: routes.landingPage.name });
        return;
      }

      await this.jump(this.currentTabIndex - 1);
    },
    async next() {
      await this.jump(this.currentTabIndex + 1);
    },
    print() {
      // TODO
    },
    updateEntity(propertyName: keyof Beneficiary, newValue: IEntity) {
      (this.beneficiary[propertyName] as IEntity) = newValue;
    },

    mutateStateTab(valid: boolean) {
      this.$storage.registration.mutations.mutateCurrentTab((tab: ILeftMenuItem) => {
        tab.isValid = valid;
        tab.isTouched = true;
      });
    },
  },
});
</script>

<style scoped lang="scss">

::v-deep .actions {
  .pageContent__actions {
    padding: 10px !important;
  }
}

.actions {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
  height: 100%;
  & > div:nth-child(1) {
    display: flex;
    align-items: center;
    &.half {
      width: 50%;
    }
    &.column {
      height: 100%;
      flex-direction: column;
      align-items: flex-start;
    }
  }
  & > div:nth-child(2) {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    justify-self: flex-end;

    &.half {
      width: 50%;
    }
    &.column {
      height: 100%;
      flex-direction: column-reverse;
      align-items: flex-end;
    }
  }
}
</style>
