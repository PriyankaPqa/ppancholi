<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.financialAssistance.create.title')"
    :apply-to-label="$t('massActions.financialAssistance.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)">
    <template #form>
      <financial-assistance-payment-details-create :form="form" @update="onUpdate($event)" />
    </template>
  </mass-action-base-create>
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import FinancialAssistancePaymentDetailsCreate from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetailsCreate.vue';
import { EPaymentModalities } from '@libs/entities-lib/program';
import { IMassActionFinancialAssistanceCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { buildQuery } from '@libs/services-lib/odata-query';

export interface PaymentDetailsForm {
  event: IEventEntity,
  table: IFinancialAssistanceTableEntity,
  item: IOptionItem,
  subItem: IOptionSubItem,
  paymentModality: EPaymentModalities,
  amount: number,
}
export default Vue.extend({
  name: 'FinancialAssistanceCreate',

  components: {
    MassActionBaseCreate,
    FinancialAssistancePaymentDetailsCreate,
  },

  data() {
    return {
      showConfirmation: false,
      formData: new FormData(),
      uploadUrl: 'case-file/mass-actions/financial-assistance',
      form: {
        event: null,
        table: null,
        item: null,
        subItem: null,
        amount: null,
        paymentModality: null,
      } as PaymentDetailsForm,
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.financialAssistance.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.financialAssistance.details.name, params: { id } });
    },

    onUpdate(form: PaymentDetailsForm) {
      this.form = form;
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost({ name, description }: {name: string; description: string}) {
      const azureSearchParams = JSON.parse(this.$route.query.azureSearchParams as string);

      const filter = buildQuery({ filter: azureSearchParams.filter }).replace('?$filter=', '');

      const payload = {
        name,
        description,
        eventId: this.form.event.id,
        tableId: this.form.table.id,
        programId: this.form.table.programId,
        mainCategoryId: this.form.item.id,
        subCategoryId: this.form.subItem.id,
        paymentModality: this.form.paymentModality,
        amount: this.form.amount,
        search: azureSearchParams.search,
        filter: `${filter} and Entity/Status eq 1`,
      } as IMassActionFinancialAssistanceCreatePayload;

      this.loading = true;
      const entity = await this.$storage.massAction.actions.create(MassActionType.FinancialAssistance, payload);
      this.loading = false;

      if (entity) {
        this.onSuccess(entity);
      }
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      this.formData.set('eventId', this.form.event.id);
      this.formData.set('tableId', this.form.table.id);
      this.formData.set('programId', this.form.table.programId);
      this.formData.set('mainCategoryId', this.form.item.id);
      this.formData.set('subCategoryId', this.form.subItem.id);
      this.formData.set('paymentModality', this.form.paymentModality.toString());
      this.formData.set('amount', this.form.amount.toString());

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },
  },
});
</script>
