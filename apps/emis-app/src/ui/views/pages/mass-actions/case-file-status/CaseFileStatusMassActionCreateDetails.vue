<template>
  <div>
    <div class="rc-body16 fw-bold mb-6">
      {{ $t('massAction.caseFileStatus.create.details') }}
    </div>
    <div class="grey-container pa-6">
      <v-row>
        <v-col cols="12">
          <events-selector
            v-model="formCopy.event"
            async-mode
            return-object
            data-test="case_file_status_details_event_name"
            :fetch-all-events="$hasLevel(UserRoles.level6)"
            :label="`${$t('massAction.caseFileStatus.create.event.label')} *`"
            :rules="rules.event" />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <validation-provider
            v-slot="{ errors, classes }"
            :name="$attrs.name"
            :rules="rules.status"
            tag="div">
            <v-select
              v-model="formCopy.status"
              :class="[$attrs.class, classes]"
              outlined
              :error-messages="errors"
              background-color="white"
              :attach="true"
              data-test="case_file_status_details_case_file_status"
              :label="`${$t('massAction.caseFileStatus.create.status.label')} *`"
              :items="statuses"
              @change="resetReason()">
              <template #selection>
                {{ $t(`caseFile.status.${CaseFileStatus[formCopy.status]}`) }}
              </template>
              <template #item="{ item }">
                <status-chip
                  class="pointer"
                  :status="item"
                  status-name="CaseFileStatus" />
              </template>
            </v-select>
          </validation-provider>
        </v-col>
      </v-row>

      <v-row v-if="showReason">
        <v-col cols="12">
          <v-select-with-validation
            v-model="selectedReason"
            background-color="white"
            data-test="case_file_status_details_reason"
            :label="`${formCopy.status == CaseFileStatus.Closed ? $t('caseFileDetails.reason.Closed') : $t('caseFileDetails.reason.Inactive') } *`"
            :items="reasons"
            :item-text="(item) => $m(item.name)"
            return-object
            :rules="rules.reason"
            @change="resetSpecifiedOther()" />
        </v-col>
      </v-row>
      <v-row v-if="selectedReason && selectedReason.isOther && formCopy.reason">
        <v-col cols="12">
          <v-text-field-with-validation
            v-model="formCopy.reason.specifiedOther"
            data-test="reason-specified-other"
            autocomplete="nope"
            background-color="white"
            :label="`${$t('common.pleaseSpecify')} *`"
            :rules="rules.specifiedOther" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-text-area-with-validation
            v-model="formCopy.rationale"
            background-color="white"
            data-test="case_file_status_details_rationale"
            :label="`${$t('caseFile.changeStatusConfirm.Rationale')} ${rationaleRequired ? '*' : '' } `"
            class="full-width"
            :rules="rules.rationale" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationProvider } from 'vee-validate';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import EventsSelector from '@/ui/shared-components/EventsSelector.vue';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { VTextFieldWithValidation, VTextAreaWithValidation, VSelectWithValidation,
} from '@libs/component-lib/components';
import { UserRoles } from '@libs/entities-lib/user';
import { MassActionCaseFileStatusForm } from './CaseFileStatusMassActionCreate.vue';

export default Vue.extend({
  name: 'CaseFileStatusMassActionCreateDetails',

  components: {
    EventsSelector,
    StatusChip,
    ValidationProvider,
    VSelectWithValidation,
    VTextFieldWithValidation,
    VTextAreaWithValidation,
  },

  props: {
    form: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      isEmpty,
      CaseFileStatus,
      UserRoles,
      formCopy: {} as MassActionCaseFileStatusForm,
      statuses: [CaseFileStatus.Open, CaseFileStatus.Archived, CaseFileStatus.Inactive, CaseFileStatus.Closed],
      selectedReason: null as IOptionItem,
    };
  },

  computed: {
    rules(): Record<string, unknown> {
      return {
        event: {
          required: true,
        },
        status: {
          required: true,
        },
        reason: {
          required: true,
        },
        rationale: {
          required: this.rationaleRequired,
        },
        specifiedOther: {
          required: true,
        },
      };
    },

    showReason(): boolean {
      return this.formCopy.status === CaseFileStatus.Closed || this.formCopy.status === CaseFileStatus.Inactive;
    },

    reasons(): Array<IOptionItem> {
      if (this.formCopy.status === CaseFileStatus.Inactive) {
        return useCaseFileStore().getInactiveReasons();
      }

      if (this.formCopy.status === CaseFileStatus.Closed) {
        return useCaseFileStore().getCloseReasons();
      }

      return [];
    },

    rationaleRequired() : boolean {
      return this.formCopy.status === CaseFileStatus.Closed || this.formCopy.status === CaseFileStatus.Open;
    },

  },

  watch: {
    formCopy: {
      deep: true,
      handler(newVal) {
        this.$emit('update:form', newVal);
      },
    },

    selectedReason(newVal) {
      this.formCopy.reason.optionItemId = newVal?.id;
    },
  },

  async created() {
    this.formCopy = cloneDeep(this.form);
    await Promise.all([useCaseFileStore().fetchInactiveReasons(), useCaseFileStore().fetchCloseReasons()]);
  },

  methods: {
    resetReason() {
      this.selectedReason = null;
      this.resetSpecifiedOther();
    },

    resetSpecifiedOther() {
      this.formCopy.reason.specifiedOther = null;
    },
  },
});
</script>
