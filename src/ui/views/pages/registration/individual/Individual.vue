<template>
  <div class="full-height grey lighten-4">
    <left-menu @jump="jump" />

    <ValidationObserver ref="form" v-slot="{ failed }" slim>
      <rc-page-content
        :show-help="false && currentTab.helpLink !== '' "
        :help-link="$t(currentTab.helpLink)"
        :title="$t(currentTab.titleKey)"
        :subtitle="$t('registration.type.individual')"
        :class="`${xSmallOrSmallMenu ? 'actions' : ''}`"
        outer-scroll>
        <template slot="default">
          <v-row justify="center" class="mt-12 full-height" no-gutters>
            <v-col cols="12" xl="8" lg="8" md="11" sm="11" xs="12">
              <component :is="currentTab.componentName" />
            </v-col>
          </v-row>
        </template>

        <template slot="actions">
          <div class="actions">
            <div :class="{half: $vuetify.breakpoint.smAndDown, column: $vuetify.breakpoint.xsOnly}">
              <v-btn
                v-if="currentTab.id === 'confirmation'"
                class="printButton"
                :aria-label="$t(currentTab.backButtonTextKey)"
                data-test="printButton"
                @click="print()">
                <v-icon size="20" color="grey darken-2" class="pr-2">
                  mdi-printer
                </v-icon>
                {{ $t(currentTab.backButtonTextKey) }}
              </v-btn>
              <v-btn v-else :aria-label="$t(currentTab.backButtonTextKey)" data-test="backButton" :disabled="submitLoading" @click="back()">
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
                :loading="submitLoading"
                :disabled="failed || inlineEdit"
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
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@crctech/component-library';
import routes from '@/constants/routes';
import individual from '@crctech/registration-lib/src/ui/mixins/individual';
import LeftMenu from '../../../components/layout/LeftMenu.vue';
import PrivacyStatement from '../privacy-statement/PrivacyStatement.vue';
import PersonalInformation from '../personal-information/PersonalInformation.vue';
import Addresses from '../addresses/Addresses.vue';
import AdditionalMembers from '../additional-members/AdditionalMembers.vue';
import ReviewRegistration from '../review/ReviewRegistration.vue';
import ConfirmRegistration from '../confirmation/ConfirmRegistration.vue';

export default mixins(individual).extend({
  name: 'Individual',

  components: {
    RcPageContent,
    LeftMenu,
    PrivacyStatement,
    PersonalInformation,
    Addresses,
    AdditionalMembers,
    ReviewRegistration,
    ConfirmRegistration,
  },

  mixins: [individual],

  methods: {
    async back() {
      if (this.currentTabIndex === 0) {
        await this.$router.push({ name: routes.landingPage.name });
        return;
      }
      await this.jump(this.currentTabIndex - 1);
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

.printButton {
  position: absolute;
  left: 10px;
}
</style>
