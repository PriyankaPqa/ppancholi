  <!-- DONE in a later story, no need to review -->

<template>
  <mass-action-base-create
    ref="base"
    :title="$t('massAction.caseFileStatus.create.title')"
    :apply-to-label="$t('massAction.caseFileStatus.upload.title')"
    :upload-url="uploadUrl"
    :mode="$route.query.mode"
    :form-data="formData"
    :loading="loading"
    @back="back()"
    @upload:start="onUploadStart()"
    @upload:success="onSuccess($event)"
    @post="onPost($event)" />
</template>

<script lang="ts">
import Vue from 'vue';
import routes from '@/constants/routes';
import MassActionBaseCreate from '@/ui/views/pages/mass-actions/components/MassActionBaseCreate.vue';
import { IMassActionEntity } from '@libs/entities-lib/mass-action';

export default Vue.extend({
  name: 'CaseFileStatusMassActionCreate',

  components: {
    MassActionBaseCreate,
  },

  data() {
    return {
      formData: new FormData(),
      uploadUrl: '',
      loading: false,
    };
  },

  methods: {
    back() {
      this.$router.replace({ name: routes.massActions.caseFileStatus.home.name });
    },

    onSuccess(entity: IMassActionEntity) {
      this.goToDetail(entity.id);
    },

    goToDetail(id: string) {
      this.$router.push({ name: routes.massActions.caseFileStatus.details.name, params: { id } });
    },

    onUpdate() {
      // this.form = form;
    },

    /**
     * Triggered when creating a mass action from a filtered list
     */
    async onPost() {
    // async onPost({ name, description }: { name: string, description: string }) {
      // const azureSearchParams = JSON.parse(this.$route.query.azureSearchParams as string);

      // const filter = buildQuery({ filter: azureSearchParams.filter }).replace('?$filter=', '');

      // const payload = {
      //   name: this.$hasFeature(FeatureKeys.MassActionAutoGenerateName) ? this.makeFormName() : name,
      //   description,
      //   eventId: this.form.event.id,
      //   tableId: this.form.table.id,
      //   programId: this.form.table.programId,
      //   mainCategoryId: this.form.item.id,
      //   subCategoryId: this.form.subItem.id,
      //   paymentModality: this.form.paymentModality,
      //   amount: this.form.amount,
      //   search: azureSearchParams.search,
      //   filter: `${filter} and Entity/Status eq 1`,
      // } as IMassActionFinancialAssistanceCreatePayload;

      // this.loading = true;
      // const entity = await useMassActionStore().create(MassActionType.FinancialAssistance, payload);
      // this.loading = false;

      // if (entity) {
      //   this.onSuccess(entity);
      // }
    },
    /**
     * Triggered when creating a mass action from a file
     */
    async onUploadStart() {
      // this.formData.set('eventId', this.form.event.id);
      // this.formData.set('tableId', this.form.table.id);
      // this.formData.set('programId', this.form.table.programId);
      // this.formData.set('mainCategoryId', this.form.item.id);
      // this.formData.set('subCategoryId', this.form.subItem.id);
      // this.formData.set('paymentModality', this.form.paymentModality.toString());
      // this.formData.set('amount', this.form.amount.toString());
      // if (this.$hasFeature(FeatureKeys.MassActionAutoGenerateName)) {
      //   this.formData.set('name', this.makeFormName());
      // }

      // this.loading = true;
      // await (this.$refs.base as InstanceType<typeof MassActionBaseCreate>).upload();
      // this.loading = false;
    },
  },
});
</script>
