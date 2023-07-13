<template>
  <div v-resize="onResize">
    <h5 class="rc-heading-5 mb-4">
      <template v-if="items.length > 0">
        {{ $t('registration.isRegistered.search_result', { length: items.length }) }}
      </template>
      <template v-else>
        {{ $t('registration.isRegistered.no_result') }}
      </template>
    </h5>
    <v-row no-gutters class="rc-body14 fw-bold border pa-4 border-radius-top">
      <v-col cols="4">
        {{ $t('household.move.results.name') }}
      </v-col>
      <v-col cols="4" class="email-phone-dob-item">
        {{ $t('household.move.results.phone_email_dob') }}
      </v-col>
      <v-col cols="4" class="status-registration-number-item">
        {{ $t('household.move.results.status_registration_number') }}
      </v-col>
    </v-row>

    <div :style="styleObject">
      <div v-for="(household, i) in formattedItems" :key="i" class="rc-body14 cell px-4 py-2">
        <v-row no-gutters class="mb-3">
          <v-col cols="4">
            <v-icon data-test="iconType" small class="icon success--text">
              mdi-account-box
            </v-icon>
            <span data-test="name" class="fw-bold">
              {{ household.primaryBeneficiary.firstName }} {{ household.primaryBeneficiary.lastName }}
            </span>
          </v-col>

          <v-col cols="4" class="email-phone-dob-item">
            <div data-test="emailAddress">
              {{ household.primaryBeneficiary.email || '-' }}
            </div>
            <div data-test="birthDate">
              {{ householdHelpers.getBirthDateDisplayWithAge(
                householdHelpers.convertBirthDateStringToObject(household.primaryBeneficiary.dateOfBirth)) }}
            </div>
            <div data-test="phoneNumber">
              {{ getPhone(household) }}
            </div>
          </v-col>

          <v-col cols="4">
            <div class="status-registration-number-item">
              <status-select
                data-test="household-profile-status-chip"
                :value="household.primaryBeneficiary.householdStatus"
                status-name="HouseholdStatus"
                disabled />
            </div>
            <span class="status-registration-number-item">
              {{ household.primaryBeneficiary.registrationNumber }}
            </span>
            <span class="status-registration-number-item">
              <v-btn
                class="ml-4"
                small
                color="primary"
                data-test="household_move_results_select"
                :disabled="household.primaryBeneficiary.householdStatus !== HouseholdStatus.Open"
                @click="select(household.id)">
                <v-icon left>
                  mdi-check
                </v-icon>
                {{ $t('household.move.results.select') }}
              </v-btn>
            </span>
          </v-col>
        </v-row>
        <v-row v-for="(member, j) in household.additionalMembers" :key="`${j}-add`" no-gutters class="mt-1">
          <v-col cols="4">
            <span class="ml-4 fw-bold">
              <v-icon data-test="iconType" small color="grey">
                mdi-account-supervisor
              </v-icon>
              {{ member.firstName }} {{ member.lastName }}
            </span>
          </v-col>
          <v-col cols="4" class="email-phone-dob-item">
            {{ householdHelpers.getBirthDateDisplayWithAge(householdHelpers.convertBirthDateStringToObject(member.dateOfBirth)) }}
          </v-col>
        </v-row>
      </div>
    </div>

    <div class="cell pa-4 border-radius-bottom">
      <v-btn data-test="reset" @click="reset()">
        <v-icon left>
          mdi-magnify
        </v-icon>
        {{ $t('registration.isRegistered.new_search') }}
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">

import mixins from 'vue-typed-mixins';
import { RcDataTable } from '@libs/component-lib/components';
import householdResults from '@/ui/mixins/householdResults';
import household from '@/ui/mixins/household';
import householdHelpers from '@/ui/helpers/household';
import StatusSelect from '@/ui/shared-components/StatusSelect.vue';

import { Resize } from 'vuetify/es5/directives';
import { HouseholdStatus } from '@libs/entities-lib/household';

export default mixins(householdResults, household).extend({
  name: 'HouseholdResults',

  directives: {
    Resize,
  },

  data() {
    return {
      householdHelpers,
      maxHeight: 0,
      HouseholdStatus,
    };
  },

  computed: {
    styleObject(): Record<string, string> {
      return {
        maxHeight: `${this.maxHeight}px`,
        overflow: 'auto',
      };
    },
  },

  components: {
    RcDataTable,
    StatusSelect,
  },

  mounted() {
    this.onResize();
  },

  methods: {
    reset() {
      this.$emit('reset');
    },

    select(id: string) {
      this.$emit('select', id);
    },

    onResize() {
      this.maxHeight = document.getElementById('scrollAnchor') ? document.getElementById('scrollAnchor').clientHeight - 220 : 600;
    },
  },
});
</script>

<style lang="scss" scoped>

.border {
  border: 1px solid var(--v-grey-lighten2);
}

.cell {
  border-bottom: 1px solid var(--v-grey-lighten2);
  border-left:  1px solid var(--v-grey-lighten2);
  border-right:  1px solid var(--v-grey-lighten2);
}

.border-top {
  border-top: 1px solid var(--v-grey-lighten2);
}

.status-registration-number-item {
  display: flex;
  flex-direction: column;
  align-items: end;
}

.email-phone-dob-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
