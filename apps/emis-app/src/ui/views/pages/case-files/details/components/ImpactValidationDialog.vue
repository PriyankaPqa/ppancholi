<template>
  <validation-observer ref="impactValidation" v-slot="{failed, pristine}">
    <rc-dialog
      :show-help="false"
      :help-link="helpLink"
      :tooltip-label="$t('common.tooltip_label')"
      :title="$t('caseFileDetail.impactValidationDialog.title')"
      :show="show"
      :submit-action-label="$t('common.buttons.save')"
      :cancel-action-label="$t('common.cancel')"
      :loading="loading"
      :submit-button-disabled="pristine || failed"
      max-width="800"
      :persistent="true"
      @cancel="close"
      @submit="save"
      @close="close">
      <div class="pa-8">
        <v-form class="full-width">
          <v-row>
            <v-col cols="12" xl="12" lg="12">
              <div class="rc-body16 fw-bold mb-4">
                {{ $t('caseFileDetail.impactValidationDialog.method') }}
              </div>
              <validation-provider v-slot="{ errors }" :rules="rules.method">
                <v-radio-group
                  v-model="form.method"
                  :error-messages="errors"
                  data-test="impactValidation_method"
                  row>
                  <v-radio
                    class="mr-8"
                    data-test="impact-method-manual"
                    :label="$t('caseFile.beneficiaryImpactValidationMethod.Manual')"
                    :value="method.Manual" />
                  <v-radio
                    class="mr-8"
                    data-test="impact-method-exception"
                    :label="$t('caseFile.beneficiaryImpactValidationMethod.Exception')"
                    :value="method.Exception" />
                  <v-radio
                    class="mr-8"
                    data-test="impact-method-batch"
                    :disabled="true"
                    :label="$t('caseFile.beneficiaryImpactValidationMethod.Batch')"
                    :value="method.Batch" />
                  <v-radio
                    class="mr-8"
                    data-test="impact-method-not-applicable"
                    :disabled="true"
                    :label="$t('caseFile.beneficiaryImpactValidationMethod.NotApplicable')"
                    :value="method.NotApplicable" />
                </v-radio-group>
              </validation-provider>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" xl="12" lg="12">
              <div class="status-container">
                <div class="rc-body16 fw-bold">
                  {{ $t('caseFileDetail.impactValidationDialog.status') }}
                </div>
                <div class="status-radio-container">
                  <validation-provider v-slot="{ errors }" :rules="rules.status">
                    <v-radio-group
                      v-model="form.status"
                      :error-messages="errors"
                      data-test="impactValidation_status"
                      row>
                      <v-icon left color="status_success">
                        mdi-map-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="impact-status-impacted"
                        :label="$t('caseFile.beneficiaryImpactValidationStatus.Impacted')"
                        :value="status.Impacted" />
                      <v-icon left color="status_error">
                        mdi-map-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="impact-status-not-impacted"
                        :label="$t('caseFile.beneficiaryImpactValidationStatus.NotImpacted')"
                        :value="status.NotImpacted" />
                      <v-icon left color="status_warning">
                        mdi-map-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="impact-status-undetermined"
                        :label="$t('caseFile.beneficiaryImpactValidationStatus.Undetermined')"
                        :value="status.Undetermined" />
                    </v-radio-group>
                  </validation-provider>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import Vue from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import { ValidationOfImpactStatus, ImpactValidationMethod, CaseFileEntity } from '@libs/entities-lib/case-file';

export default Vue.extend({
  name: 'ImpactValidationDialog',
  components: {
    RcDialog,
  },
  props: {
    /**
     * Whether the dialog would show
     */
    show: {
      type: Boolean,
      default: false,
    },
    /**
     * The case file being reviewed
     */
    caseFile: {
      type: Object as () => CaseFileEntity,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      status: ValidationOfImpactStatus,
      method: ImpactValidationMethod,
      form: {
        method: 0 as ImpactValidationMethod,
        status: 0 as ValidationOfImpactStatus,
      },
      rules: {
        method: { required: true, oneOf: [ImpactValidationMethod.Manual, ImpactValidationMethod.Exception] },
        status: { required: true, oneOf: Object.values(ValidationOfImpactStatus) },
      },
      helpLink: this.$t('zendesk.impact_validation'),
    };
  },
  created() {
    const validationMethod = this.caseFile.impactStatusValidation && this.caseFile.impactStatusValidation.method;
    const validationStatus = this.caseFile.impactStatusValidation && this.caseFile.impactStatusValidation.status;
    // By default it is Manual
    this.form.method = validationMethod || ImpactValidationMethod.NotApplicable;
    // By default it is Undetermined
    this.form.status = validationStatus || ValidationOfImpactStatus.Undetermined;
  },
  methods: {
    /**
     * Save the current dialog
     * @public
     */
    async save() {
      const isValid = await (this.$refs.impactValidation as InstanceType<typeof ValidationObserver>).validate();
      if (isValid) {
        this.loading = true;
        const res = await this.$storage.caseFile.actions.setCaseFileValidationOfImpact(this.caseFile.id, {
          status: this.form.status,
          method: this.form.method,
        });
        this.loading = false;
        if (res) {
          this.$toasted.global.success(this.$t('caseFileDetail.impactValidationDialog.save.success'));
          this.close();
        }
      }
    },
    /**
     * Close the current dialog without
     * @public
     */
    close() {
      this.$emit('update:show', false);
    },
  },
});
</script>

<style scoped lang="scss">
  .status-container {
    display: flex;
    background: var(--v-grey-lighten5);
    flex-direction: column;
    width: 100%;
    padding: 24px;
    border-radius: 4px;
    & .status-radio-container {
      display: flex;
      justify-content: center;
    }
  }
</style>
