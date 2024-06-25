<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massActions.financialAssistance.create.title')"
    :apply-to-label="$t('massActions.financialAssistance.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    :hide-name="true"
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
import { format } from 'date-fns';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity, MassActionType } from '@libs/entities-lib/mass-action';
import { IEventEntity } from '@libs/entities-lib/event';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IOptionItem, IOptionSubItem } from '@libs/entities-lib/optionItem';
import FinancialAssistancePaymentDetailsCreate from '@/ui/views/pages/mass-actions/financial-assistance/FinancialAssistancePaymentDetailsCreate.vue';
import { EPaymentModalities, IProgramEntity } from '@libs/entities-lib/program';
import { IMassActionFinancialAssistanceCreatePayload } from '@libs/services-lib/mass-actions/entity';
import { buildQuerySql } from '@libs/services-lib/odata-query-sql';
import { useMassActionStore } from '@/pinia/mass-action/mass-action';
import helpers from '@libs/shared-lib/helpers/helpers';

export interface PaymentDetailsForm {
  event: IEventEntity,
  table: IFinancialAssistanceTableEntity,
  item: IOptionItem,
  subItem: IOptionSubItem,
  paymentModality: EPaymentModalities,
  program: IProgramEntity,
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
        program: null,
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
    async onPost({ description }: { description: string }) {
      const searchParams = JSON.parse(this.$route.query.searchParams as string);
      helpers.convertDateStringToDateObject(searchParams);
      const filter = buildQuerySql(helpers.removeInactiveItemsFilterOdata({ filter: searchParams.filter }) as any);

      const payload = {
        name: this.makeFormName(),
        description,
        eventId: this.form.event.id,
        tableId: this.form.table.id,
        programId: this.form.table.programId,
        mainCategoryId: this.form.item.id,
        subCategoryId: this.form.subItem.id,
        paymentModality: this.form.paymentModality,
        amount: this.form.amount,
        search: null,
        filter,
      } as IMassActionFinancialAssistanceCreatePayload;

      this.loading = true;
      const entity = await useMassActionStore().create(MassActionType.FinancialAssistance, payload);
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
      this.formData.set('name', this.makeFormName());

      this.loading = true;
      await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      this.loading = false;
    },

    makeFormName(): string {
      const programName = this.$m(this.form?.program?.name);
      const paymentLineName = this.$m(this.form?.item?.name);
      const creationTime = format(new Date(), 'yyyyMMdd HHmmss');

      return `${programName} - ${paymentLineName} - ${creationTime}`;
    },

  },
});
</script>
