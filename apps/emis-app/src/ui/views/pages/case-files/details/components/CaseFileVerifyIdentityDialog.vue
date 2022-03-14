<template>
  <validation-observer ref="verifyIdentity" v-slot="{ dirty, failed }" slim>
    <rc-dialog
      :show-help="false"
      :help-link="helpLink"
      :title="$t('caseFileDetail.verifyIdentityDialog.title')"
      :show="show"
      :submit-action-label="$t('common.buttons.save')"
      :cancel-action-label="$t('common.cancel')"
      :loading="loading"
      :submit-button-disabled="(!dirty && !isChanged) || failed"
      max-width="800"
      :persistent="true"
      @cancel="close"
      @submit="save"
      @close="close">
      <div class="pa-8">
        <v-form class="full-width">
          <v-row>
            <v-col cols="12" xl="12" lg="12">
              <div class="status-container">
                <div class="rc-body16 fw-bold">
                  {{ $t('caseFileDetail.verifyIdentityDialog.status') }}
                </div>
                <div class="status-radio-container">
                  <validation-provider v-slot="{ errors }" :rules="rules.status">
                    <v-radio-group
                      v-model="form.status"
                      :error-messages="errors"
                      data-test="verifyIdentity_status"
                      row>
                      <v-icon left color="status_success">
                        mdi-shield-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="status-passed"
                        :label="$t('caseFile.beneficiaryIdentityVerificationStatus.Passed')"
                        :value="status.Passed" />
                      <v-icon left color="status_error">
                        mdi-shield-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="status-failed"
                        :label="$t('caseFile.beneficiaryIdentityVerificationStatus.Failed')"
                        :value="status.Failed" />
                      <v-icon left color="status_warning">
                        mdi-shield-check
                      </v-icon>
                      <v-radio
                        class="mr-8"
                        data-test="status-notVerified"
                        :label="$t('caseFile.beneficiaryIdentityVerificationStatus.NotVerified')"
                        :value="status.NotVerified" />
                    </v-radio-group>
                  </validation-provider>
                </div>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" xl="12" lg="12">
              <div class="rc-body16 fw-bold mb-4">
                {{ $t('caseFileDetail.verifyIdentityDialog.method') }}
              </div>
              <v-select-with-validation
                v-model="form.method"
                data-test="verifyIdentity_method"
                :attach="false"
                :disabled="!isValidAuthStatus"
                :items="verificationMethods"
                :label="isValidAuthStatus ? $t('caseFileDetail.verifyIdentityDialog.method.label') : $t('common.notApplicable')"
                :rules="rules.method" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" xl="12" lg="12">
              <div class="rc-body16 fw-bold mb-4">
                {{ $t('caseFileDetail.verifyIdentityDialog.options') }}
              </div>
              <v-select-with-validation
                v-model="form.identificationIds"
                :attach="false"
                data-test="verifyIdentity_options"
                multiple
                :disabled="!canSelectIds"
                :items="verificationOptions"
                :item-text="(item) => $m(item.name)"
                :item-value="(item) => item.id"
                :label="canSelectIds ? $t('caseFileDetail.verifyIdentityDialog.options.label') : $t('common.notApplicable')"
                :rules="rules.identificationIds"
                @delete="isChanged = true" />
            </v-col>
          </v-row>
          <v-row v-if="mustSpecifyOther">
            <v-col>
              <v-text-field-with-validation
                v-model="form.specifiedOther"
                data-test="specified-other"
                autocomplete="nope"
                :label="`${$t('common.pleaseSpecify')} *`"
                :rules="rules.specifiedOther" />
            </v-col>
          </v-row>
        </v-form>
      </div>
    </rc-dialog>
  </validation-observer>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationObserver } from 'vee-validate';
import {
  RcDialog,
  VSelectWithValidation,
  VTextFieldWithValidation,
} from '@libs/component-lib/components';
import helpers from '@/ui/helpers/helpers';
import {
  IdentityAuthenticationMethod, IdentityAuthenticationStatus, ICaseFileEntity, IIdentityAuthentication,
} from '@/entities/case-file';
import { IOptionItem } from '@/entities/optionItem';
import { MAX_LENGTH_SM } from '@/constants/validations';

export default Vue.extend({
  name: 'VerifyIdentity',
  components: {
    VSelectWithValidation,
    RcDialog,
    VTextFieldWithValidation,
  },
  props: {
    /**
     * Whether the dialog would show
     */
    show: {
      type: Boolean,
      required: true,
    },
    caseFile: {
      type: Object as () => ICaseFileEntity,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      isChanged: false,
      status: IdentityAuthenticationStatus,
      form: {
        method: 0 as IdentityAuthenticationMethod,
        identificationIds: [] as Array<string>,
        status: 0 as IdentityAuthenticationStatus,
        specifiedOther: null as string,
      },
      helpLink: this.$t('zendesk.authentication_identity'),
    };
  },
  computed: {
    /**
     * Return list of methods. System method is read only
    */
    verificationMethods(): { value: number, text: string, disabled?: boolean }[] {
      const methods = helpers.enumToTranslatedCollection(IdentityAuthenticationMethod, 'caseFile.verifyMethod')
        .filter((x) => x.value !== IdentityAuthenticationMethod.NotApplicable) as
        { value: number, text: string, disabled?: boolean }[];
      const systemMethod = methods.find((m) => m.value === IdentityAuthenticationMethod.System);
      systemMethod.disabled = true;
      return methods;
    },
    /**
     * Return list of options.
     */
    verificationOptions(): Array<IOptionItem> {
      return this.$storage.caseFile.getters.screeningIds(true, this.form.identificationIds);
    },

    isValidAuthStatus(): boolean {
      return this.form.status === IdentityAuthenticationStatus.Passed;
    },

    canSelectIds(): boolean {
      return this.isValidAuthStatus && this.form.method !== IdentityAuthenticationMethod.System;
    },

    rules(): Record<string, unknown> {
      return {
        method: {
          required: true,
          oneOf: this.isValidAuthStatus
            ? [IdentityAuthenticationMethod.Exceptional, IdentityAuthenticationMethod.InPerson] : [IdentityAuthenticationMethod.NotApplicable],
        },
        identificationIds: { required: this.canSelectIds },
        status: { oneOf: Object.values(IdentityAuthenticationStatus) },
        specifiedOther: {
          required: true,
          max: MAX_LENGTH_SM,
        },
      };
    },

    mustSpecifyOther(): boolean {
      return this.verificationOptions.filter((v) => this.form.identificationIds.indexOf(v.id) > -1 && v.isOther).length > 0;
    },
  },

  watch: {
    isValidAuthStatus(isValid: boolean) {
      if (!isValid) {
        this.form.method = IdentityAuthenticationMethod.NotApplicable;
        this.form.identificationIds = [];
      }
    },
    mustSpecifyOther(newValue: boolean) {
      if (!newValue) {
        this.form.specifiedOther = null;
      }
    },
  },

  async created() {
    await this.$storage.caseFile.actions.fetchScreeningIds();
    this.form.method = this.caseFile.identityAuthentication?.method || IdentityAuthenticationMethod.NotApplicable;
    this.form.status = this.caseFile.identityAuthentication?.status || IdentityAuthenticationStatus.NotVerified;
    this.form.identificationIds = (this.caseFile.identityAuthentication?.identificationIds || []).map((x) => x.optionItemId);
    this.form.specifiedOther = (this.caseFile.identityAuthentication?.identificationIds || [])
      .filter((x) => x.specifiedOther)[0]?.specifiedOther || null;
  },
  methods: {
    /**
     * Save the current dialog
     * @public
     */
    async save() {
      if (!this.mustSpecifyOther) {
        this.form.specifiedOther = null;
      }

      const isValid = await (this.$refs.verifyIdentity as InstanceType<typeof ValidationObserver>).validate();

      if (isValid) {
        this.loading = true;

        const value = ({ status: this.form.status, method: this.form.method, identificationIds: [] }) as IIdentityAuthentication;
        value.identificationIds = this.form.identificationIds.map((m: string) => (
          {
            optionItemId: m,
            specifiedOther: this.verificationOptions.filter((v) => m === v.id && v.isOther).length > 0 ? this.form.specifiedOther : null,
          }));

        const res = await this.$storage.caseFile.actions.setCaseFileIdentityAuthentication(this.caseFile.id, value);

        this.loading = false;

        if (res) {
          this.$toasted.global.success(this.$t('caseFileDetail.verifyIdentityDialog.save.success'));
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
