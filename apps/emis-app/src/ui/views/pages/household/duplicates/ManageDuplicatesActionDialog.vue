<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="title"
      :show.sync="show"
      :data-test="`householdDetails.manageDuplicates.actionDialog.${newStatus}`"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.save')"
      :submit-button-disabled="failed"
      :persistent="true"
      :show-help="false"
      :max-width="750"
      @cancel="$emit('cancelAction')"
      @close="$emit('cancelAction')"
      @submit="onSubmit">
      <v-sheet rounded class="pa-4 mb-5 background d-flex flex-row">
        <v-icon
          class="mr-2"
          :color="newStatus === DuplicateStatus.Potential ? 'secondary' : 'green'">
          {{ newStatus === DuplicateStatus.Potential ? '$rctech-duplicate' : '$rctech-resolved' }}
        </v-icon>
        <div class="d-flex align-center" data-test="householdDetails.manageDuplicates.actionDialog.flagAs">
          <span class="fw-bold mr-1">{{ $t('householdDetails.manageDuplicates.flagAs') }}:</span>
          {{ newStatus === DuplicateStatus.Potential ? $t('householdDetails.manageDuplicates.potentialDuplicate')
            : $t('householdDetails.manageDuplicates.resolvedDuplicate') }}
        </div>
      </v-sheet>

      <v-text-area-with-validation
        v-model="rationale"
        rows="3"
        data-test="householdDetails.manageDuplicates.actionDialog.rationale"
        :label="`${newStatus === DuplicateStatus.Potential
          ? $t('householdDetails.manageDuplicates.rationale') : $t('householdDetails.manageDuplicates.actionTakenToResolve')}*`"
        class="full-width"
        :rules="rules.rationale" />
    </rc-dialog>
  </validation-observer>
</template>

<script lang='ts'>
import Vue from 'vue';
import { RcDialog, VTextAreaWithValidation } from '@libs/component-lib/components';
import { VForm } from '@libs/shared-lib/types';
import { MAX_LENGTH_MD } from '@libs/shared-lib/constants/validations';
import { DuplicateStatus } from '@libs/entities-lib/household';
import { TranslateResult } from 'vue-i18n';

export default Vue.extend({
  name: 'ManageDuplicatesActionDialog',

  components: {
    RcDialog,
    VTextAreaWithValidation,
  },

  props: {
    initialStatus: {
      type: Number,
      required: true,
    },

    show: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      rationale: null,
      DuplicateStatus,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        rationale: {
          required: true,
          max: MAX_LENGTH_MD,
        },
      };
    },

    newStatus() : DuplicateStatus {
      return this.initialStatus === DuplicateStatus.Potential ? DuplicateStatus.Resolved : DuplicateStatus.Potential;
    },

    title(): TranslateResult {
      return this.newStatus === DuplicateStatus.Resolved
        ? this.$t('householdDetails.manageDuplicates.title.flagCaseFileResolved')
        : this.$t('householdDetails.manageDuplicates.title.flagCaseFilePotential');
    },
  },

  methods: {
    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submitAction', { rationale: this.rationale, status: this.newStatus });
        this.$emit('update:show', false);
      }
    },
  },

});

</script>

<style scoped lang="scss">
  .background {
    background: var(--v-grey-lighten5);
  }
</style>
