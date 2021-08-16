<template>
  <ValidationObserver ref="form" v-slot="{ failed }" slim>
    <rc-dialog
      :title="$t('caseFile.financialAssistance.addNewPaymentLine')"
      :show.sync="show"
      :cancel-action-label="$t('common.buttons.cancel')"
      :submit-action-label="$t('common.apply')"
      :submit-button-disabled="failed"

      :persistent="true"
      data-test="payment_title"
      :tooltip-label="$t('common.tooltip_label')"
      fullscreen
      @cancel="$emit('cancelChange')"
      @close="$emit('cancelChange')"
      @submit="onSubmit">
      <v-row justify="center" class="pa-0">
        <v-col cols="8">
          <v-row>
            <span class="rc-body16 fw-bold pa-3">
              {{ $t('caseFile.financialAssistance.paymentLineDetails.title') }}
            </span>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-autocomplete-with-validation
                :label="`${$t('financialAssistance.nestedTable.headers.item')} *`"
                :items="fakeItem"
                :rules="rules.item"
                data-test="payement_item" />
            </v-col>
            <v-col cols="6">
              <v-autocomplete-with-validation
                :label="`${$t('financialAssistance.nestedTable.headers.subItem')} *`"
                :items="fakeItem"
                :rules="rules.subitem"
                data-test="payment_subItem" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select-with-validation
                v-model="paymentLine.modality"
                :items="paymentModalities"
                :rules="rules.modalities"
                :label="`${$t('caseFile.financialAssistance.paymentModality')} *`"
                data-test="payment_modalities"
                @change="updateForm" />
            </v-col>
            <v-col cols="6">
              <v-checkbox-with-validation
                data-test="checkbox_consent"
                class="rc-body12"
                label="Supporting documents received" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <v-text-field-with-validation
                data-test="reason_specified_other"
                autocomplete="nope"
                :rules="rules.amount"
                label="Amount *" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </rc-dialog>
  </ValidationObserver>
</template>

<script lang='ts'>
import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import {
  RcDialog,
  VAutocompleteWithValidation,
  VCheckboxWithValidation,
  VTextFieldWithValidation,
  // VTextAreaWithValidation,
  VSelectWithValidation,
} from '@crctech/component-library';
import { EPaymentModalities, IProgram } from '@/entities/program';
import helpers from '@/ui/helpers';
import { VForm } from '@/types';
// import { VForm } from '@/types';

export default Vue.extend({
  name: 'CaseFileFinancialAssistancePaymentLineDialog',

  components: {
    RcDialog,
    VAutocompleteWithValidation,
    VCheckboxWithValidation,
    VTextFieldWithValidation,
    VSelectWithValidation,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },

    program: {
      type: Object as () => IProgram,
      required: true,
    },
  },

  data() {
    return {
      paymentLine: null,
      emptyPaymentLine: {
        modality: null,
        payeeType: null,
        payeeName: null,
        lines: null,
      },
      fakeItem: [],
      modality: null,
      rules: {
        item: {
          required: true,
        },
        subitem: {
          required: true,
        },
        modalities: {
          required: true,
        },
        amount: {
          required: true,
        },
      },
    };
  },

  computed: {
    paymentModalities(): Array<{ text: string, value: unknown }> {
      const paymentModalities = helpers.enumToTranslatedCollection(EPaymentModalities, 'event.programManagement.paymentModalities')
        .filter((p) => this.program.paymentModalities.find((payment : EPaymentModalities) => payment === p.value));
      return _orderBy(paymentModalities, 'text');
    },
  },

  created() {
    // This will be implemented on story 597, for now we only create
    // if (this.isEditMode) {
    //   this.initEditMode();
    // } else {
    //   this.initCreateMode();
    // }
    this.initCreateMode();
  },

  methods: {
    initCreateMode() {
      this.paymentLine = this.emptyPaymentLine;
    },

    async onSubmit() {
      const isValid = await (this.$refs.form as VForm).validate();
      if (isValid) {
        this.$emit('submit');
      }
    },

    updateForm() {
      // ToDO : Adapt form depending on the payment modalities
    },
  },
});
</script>

<style>

</style>
