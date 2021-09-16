<template>
  <mass-action-base-create
    :title="$t('massActions.financialAssistance.create.title')"
    :apply-to-label="$t('massActions.financialAssistance.upload.title')"
    :url="url"
    :form-data="formData"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)">
    <template #form>
      <financial-assistance-payment-details :form="form" @update="onUpdate($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';

import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity } from '@/entities/mass-action';
import { IEventEntity } from '@/entities/event';
import { IFinancialAssistanceTableEntity } from '@/entities/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@/entities/optionItem';
import FinancialAssistancePaymentDetails from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetails.vue';
import { EPaymentModalities } from '@/entities/program';

export interface PaymentDetailsForm {
  event: IEventEntity,
  table: IFinancialAssistanceTableEntity,
  item: IOptionItem,
  subItem: IOptionSubItem,
  paymentModality: EPaymentModalities,
  amount: number,
}
export default Vue.extend({
  name: 'FinancialAssistanceCreateFile',

  components: {
    MassActionBaseCreate,
    FinancialAssistancePaymentDetails,
  },

  data() {
    return {
      showConfirmation: false,
      url: 'case-file/mass-actions/financial-assistance',
      formData: new FormData(),
      form: {
        event: null,
        table: null,
        item: null,
        subItem: null,
        amount: null,
        paymentModality: null,
      } as PaymentDetailsForm,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.financialAssistance.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.$storage.massAction.mutations.setEntity(entity);
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.financialAssistance.details.name, params: { id } });
    },

    onUpdate(form: PaymentDetailsForm) {
      this.form = form;
    },

    onUploadStart() {
      this.formData.set('eventId', this.form.event.id);
      this.formData.set('tableId', this.form.table.id);
      this.formData.set('programId', this.form.table.programId);
      this.formData.set('mainCategoryId', this.form.item.id);
      this.formData.set('subCategoryId', this.form.subItem.id);
      this.formData.set('paymentModality', this.form.paymentModality.toString());
      this.formData.set('amount', this.form.amount.toString());
    },
  },
});
</script>
