<template>
  <div>
    <v-sheet rounded class="pa-4 mb-5 background d-flex flex-row">
      <v-icon
        class="mr-2"
        color="secondary">
        $rctech-duplicate
      </v-icon>
      <div class="d-flex align-center" data-test="householdDetails.manageDuplicates.actionDialog.flagAs">
        <span class="fw-bold mr-1">{{ $t('householdDetails.manageDuplicates.flagAs') }}:</span>
        {{ $t(`householdDetails.manageDuplicates.potentialDuplicate`) }}
      </div>
    </v-sheet>

    <validation-observer ref="form" v-slot="{ failed }" slim>
      <v-autocomplete-with-validation
        v-model="selectedHousehold"
        :rules="rules.registrationNumber"
        :label="$t('householdDetails.manageDuplicates.flagNew.registrationNumber') + '*'"
        data-test="flag-new-household-registration-number"
        :search-input.sync="searchTerm"
        :item-text="getRegistrationNumberText"
        :placeholder="`${$t('common.inputs.start_typing_to_search')}`"
        :items="households"
        :loading="loading"
        return-object
        async-mode
        clearable
        @update:search-input="inputRegistrationNumber($event)" />

      <v-autocomplete-with-validation
        v-model="selectedDuplicateReasons"
        data-test="duplicate-reasons"
        attach
        :label="`${$t('householdDetails.manageDuplicates.flagNew.duplicatedBy')} *`"
        :items="duplicateReasons"
        :rules="rules.duplicateReason"
        multiple />

      <v-select-with-validation
        v-if="selectedDuplicateReasons.includes(DuplicateReason.FullName)"
        v-model="member"
        :items="members"
        :rules="rules.member"
        :item-text="item => item && item.firstName + ' ' + item.lastName"
        return-object
        :label="`${$t('householdDetails.manageDuplicates.flagNew.member')} *`"
        data-test="payment_modalities" />

      <v-text-area-with-validation
        v-model="rationale"
        rows="3"
        data-test="householdDetails.manageDuplicates.actionDialog.rationale"
        :label=" `${$t('householdDetails.manageDuplicates.rationale')} *`"
        class="full-width"
        :rules="rules.rationale" />

      <div class="d-flex justify-end">
        <v-btn
          class="mr-4"
          @click="clearForm">
          {{ $t('common.clear') }}
        </v-btn>
        <v-btn
          :loading="submitting"
          color="primary"
          :disabled="failed || submitting"
          @click="submit">
          {{ $t('common.submit') }}
        </v-btn>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { VForm, IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import _debounce from 'lodash/debounce';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import { useHouseholdStore } from '@/pinia/household/household';
import { DuplicateReason, HouseholdStatus, IHouseholdCombined, IHouseholdEntity, IHouseholdMemberMetadata, IHouseholdMetadata } from '@libs/entities-lib/household';
import { Status } from '@libs/entities-lib/base';

const VISUAL_DELAY = 500;

export default Vue.extend({
  name: 'ManageDuplicatesFlagNew',
  components: {
  },

  props: {
    householdId: {
      type: String,
      required: true,
    },

    householdRegistrationNumber: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      DuplicateReason,
      registrationNumber: '',
      rationale: '',
      searchTerm: '',
      selectedDuplicateReasons: [] as DuplicateReason[],
      selectedHousehold: null as IHouseholdCombined,
      households: [] as IHouseholdCombined[],
      member: null as IHouseholdMemberMetadata,
      loading: false,
      submitting: false,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        registrationNumber: {
          required: true,
        },
        duplicateReason: {
          required: true,
        },
        rationale: {
          required: true,
          max: MAX_LENGTH_LG,
        },
        member: {
          required: true,
        },
      };
    },

    duplicateReasons(): Record<string, unknown>[] {
      return helpers.enumToTranslatedCollection(DuplicateReason, 'householdDetails.manageDuplicates.enum.duplicateReason', false, false);
    },

    members(): IHouseholdMemberMetadata[] {
      if (this.selectedHousehold?.metadata) {
        return this.selectedHousehold?.metadata.memberMetadata;
      }
      return [];
    },
  },

  watch: {
    selectedDuplicateReasons(newValue, oldValue) {
      if (oldValue?.includes(DuplicateReason.FullName) && !newValue?.includes(DuplicateReason.FullName)) {
        this.member = null;
      }
    },
  },

  methods: {
    // Mandatory to have it here instead of arrow function otherwise it does not work. Known bug in vuetify
    getRegistrationNumberText(item: IHouseholdCombined): string {
      if (item?.entity?.registrationNumber) {
        return item.entity.registrationNumber;
      }
      return '';
    },

    async fetchHouseholds(query: string) {
      if (!query) {
        return;
      }

      this.loading = true;
      this.households = [];
      const filterForArchivedStatus = {
        not: {
          Entity: {
            HouseholdStatus: HouseholdStatus.Archived,
          },
        },
      };

      const params = {
        search: `Entity/RegistrationNumber: ${helpers.toQuickSearch(query)}`,
        filter: {
          and: [
            {
              Entity: {
                Status: Status.Active,
              },
            },
            filterForArchivedStatus,
          ],
        },
        queryType: 'full',
        searchMode: 'all',
        orderBy: 'Entity/RegistrationNumber',
      };

    try {
      const res = await this.$services.households.search(params) as IAzureCombinedSearchResult<IHouseholdEntity, IHouseholdMetadata>;
      await helpers.timeout(VISUAL_DELAY);

      if (res?.value) {
          this.households = res.value.filter((h) => h.entity.registrationNumber !== this.householdRegistrationNumber);
        }
    } finally {
      this.loading = false;
    }
    },

    inputRegistrationNumber(registrationNumber: string) {
      if (registrationNumber && registrationNumber !== this.selectedHousehold?.entity.registrationNumber) {
        this.clearForm();
        this.debounceSearch(registrationNumber);
      } else {
        this.clearForm(false);
      }
    },

    clearForm(clearHousehold = true) {
      this.selectedDuplicateReasons = [];
      this.member = null;
      this.rationale = '';

      if (clearHousehold) {
        this.selectedHousehold = null;
        (this.$refs.form as VForm).reset();
      }
    },

    debounceSearch: _debounce(function func(this: any, query: string) {
      if (query?.length > 1) {
      this.fetchHouseholds(query);
      }
    }, 500),

    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.submitting = true;

        try {
          const res = await useHouseholdStore().flagNewDuplicate(
            this.householdId,
            {
              duplicateHouseholdId: this.selectedHousehold.entity.id,
              duplicateReasons: this.selectedDuplicateReasons,
              memberFirstName: this.member?.firstName,
              memberLastName: this.member?.lastName,
              rationale: this.rationale,
            },
          );
          if (res) {
            this.$toasted.global.success(this.$t('householdDetails.manageDuplicates.message.success'));
            this.$emit('fetchDuplicates');
            this.$emit('goToFirstTab');
          }
        } finally {
          this.submitting = false;
        }
      }
    },
  },

});

</script>

<style lang="scss">
  .background {
    background-color: var(--v-grey-lighten5) !important;
  }

</style>
