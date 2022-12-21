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
      <v-col cols="4">
        {{ $t('household.move.results.phone_email_dob') }}
      </v-col>
      <v-col cols="4">
        {{ $t('household.move.results.registration_number') }}
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

          <v-col cols="4">
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
            <div>
              {{ household.primaryBeneficiary.registrationNumber }}
              <v-btn
                class="ml-4"
                small
                color="primary"
                data-test="household_move_results_select"
                @click="select(household.id)">
                <v-icon left>
                  mdi-check
                </v-icon>
                {{ $t('household.move.results.select') }}
              </v-btn>
            </div>
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
          <v-col cols="4">
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

import { Resize } from 'vuetify/es5/directives';

export default mixins(householdResults, household).extend({
  name: 'HouseholdResults',

  directives: {
    Resize,
  },

  data() {
    return {
      householdHelpers,
      maxHeight: 0,
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
</style>
