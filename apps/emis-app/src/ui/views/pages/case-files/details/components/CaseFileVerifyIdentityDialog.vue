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
      :submit-button-disabled="(!dirty && !isChanged) || failed || readonly"
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
                      row
                      :disabled="readonly"
                      @change="onStatusChange">
                      <div class="status-radio-option status-radio-option-border-radius-left" :class="{ 'active-background': form.status === status.Passed }">
                        <v-icon left color="status_success">
                          mdi-shield-check
                        </v-icon>
                        <v-radio
                          class="mr-8"
                          data-test="status-passed"
                          :label="$t('caseFile.beneficiaryIdentityVerificationStatus.Passed')"
                          :value="status.Passed" />
                      </div>
                      <div class="status-radio-option status-radio-option-border" :class="{ 'active-background': form.status === status.Failed }">
                        <v-icon left class="error-icon-color">
                          $rctech-identity-failed
                        </v-icon>
                        <v-radio
                          class="mr-8"
                          data-test="status-failed"
                          :label="$t('caseFile.beneficiaryIdentityVerificationStatus.Failed')"
                          :value="status.Failed" />
                      </div>
                      <div class="status-radio-option status-radio-option-border-radius-right" :class="{ 'active-background': form.status === status.NotVerified }">
                        <v-icon left class="warning-icon-color">
                          $rctech-identity-not-verified
                        </v-icon>
                        <v-radio
                          class="mr-8"
                          data-test="status-notVerified"
                          :label="$t('caseFile.beneficiaryIdentityVerificationStatus.NotVerified')"
                          :value="status.NotVerified" />
                      </div>
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
                :disabled="!isValidAuthStatus || readonly"
                :items="verificationMethods"
                :label="isValidAuthStatus ? $t('caseFileDetail.verifyIdentityDialog.method.label') : $t('common.notApplicable')"
                :rules="rules.method" />
            </v-col>
          </v-row>
          <div v-if="form.method === IdentityAuthenticationMethod.Exceptional">
            <v-row>
              <v-col cols="12" xl="12" lg="12">
                <v-select-with-validation
                  v-model="form.exceptionalTypeId"
                  :attach="false"
                  data-test="verifyIdentity_options"
                  :disabled="readonly"
                  :items="exceptionalTypes"
                  :item-text="(item) => $m(item.name)"
                  :item-value="(item) => item.id"
                  :label="$t('caseFileDetail.verifyIdentityDialog.exceptionalType')"
                  :rules="rules.exceptionalType" />
              </v-col>
            </v-row>
            <v-row v-if="exceptionalMustSpecifyOther">
              <v-col>
                <v-text-field-with-validation
                  v-model="form.exceptionalTypeOther"
                  data-test="exceptional-specified-other"
                  autocomplete="off"
                  :disabled="readonly"
                  :label="`${$t('common.pleaseSpecify')} *`"
                  :rules="rules.exceptionalTypeOther" />
              </v-col>
            </v-row>
          </div>
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
                :disabled="!canSelectIds || readonly"
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
                autocomplete="off"
                :disabled="readonly"
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
} from '@libs/entities-lib/case-file';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { MAX_LENGTH_SM } from '@libs/shared-lib/constants/validations';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { useHouseholdStore } from '@/pinia/household/household';
import { UserRoles } from '@libs/entities-lib/user';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { useEventStore } from '@/pinia/event/event';

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
        method: null as IdentityAuthenticationMethod,
        identificationIds: [] as Array<string>,
        status: null as IdentityAuthenticationStatus,
        specifiedOther: null as string,
        exceptionalTypeId: null as string,
        exceptionalTypeOther: null as string,
      },
      helpLink: this.$t('zendesk.authentication_identity'),
      IdentityAuthenticationMethod,
      FeatureKeys,
    };
  },
  computed: {
    readonly(): boolean {
      return useHouseholdStore().getById(this.caseFile.householdId)?.address?.address === null && !this.$hasLevel(UserRoles.level4);
    },
    /**
     * Return list of methods. System method is read only
    */
    verificationMethods(): { value: number, text: string, disabled?: boolean }[] {
      const methods = helpers.enumToTranslatedCollection(IdentityAuthenticationMethod, 'caseFile.verifyMethod')
        .filter((x) => x.value !== IdentityAuthenticationMethod.NotApplicable) as { value: number, text: string, disabled?: boolean }[];
      const systemMethod = methods.find((m) => m.value === IdentityAuthenticationMethod.System);
      systemMethod.disabled = true;
      // if the household doesnt have a permanent address, only exceptional is allowed with level4+.
      if (useHouseholdStore().getById(this.caseFile.householdId)?.address?.address === null) {
        methods.forEach((m) => {
          m.disabled = !(m.value === IdentityAuthenticationMethod.Exceptional && this.$hasLevel(UserRoles.level4));
        });
      }
      return methods;
    },
    /**
     * Return list of options.
     */
    verificationOptions(): Array<IOptionItem> {
      return useCaseFileStore().getScreeningIds(true, this.form.identificationIds);
    },

    exceptionalTypes(): Array<IOptionItem> {
      return useEventStore().getExceptionalAuthenticationTypes(true, this.form.exceptionalTypeId, useEventStore().getById(this.caseFile.eventId));
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
        exceptionalType: { required: true },
        exceptionalTypeOther: {
          required: true,
          max: MAX_LENGTH_SM,
        },
      };
    },

    mustSpecifyOther(): boolean {
      return this.verificationOptions.filter((v) => this.form.identificationIds.indexOf(v.id) > -1 && v.isOther).length > 0;
    },

    exceptionalMustSpecifyOther(): boolean {
      return !!this.exceptionalTypes.find((v) => this.form.exceptionalTypeId === v.id && v.isOther);
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
    exceptionalMustSpecifyOther(newValue: boolean) {
      if (!newValue) {
        this.form.exceptionalTypeOther = null;
      }
    },
  },

  async created() {
    await useCaseFileStore().fetchScreeningIds();
    await useEventStore().fetchExceptionalAuthenticationTypes();
    this.form.method = this.caseFile.identityAuthentication?.method || IdentityAuthenticationMethod.NotApplicable;
    this.form.status = this.caseFile.identityAuthentication?.status || IdentityAuthenticationStatus.NotVerified;
    this.form.identificationIds = (this.caseFile.identityAuthentication?.identificationIds || []).map((x) => x.optionItemId);
    this.form.specifiedOther = (this.caseFile.identityAuthentication?.identificationIds || [])
      .filter((x) => x.specifiedOther)[0]?.specifiedOther || null;
    this.form.exceptionalTypeId = this.caseFile.identityAuthentication?.exceptionalAuthenticationTypeId?.optionItemId || this.exceptionalTypes.find((x) => x.isDefault)?.id;
    this.form.exceptionalTypeOther = this.caseFile.identityAuthentication?.exceptionalAuthenticationTypeId?.specifiedOther;
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
        if (value.method === IdentityAuthenticationMethod.Exceptional) {
          value.exceptionalAuthenticationTypeId = { optionItemId: this.form.exceptionalTypeId, specifiedOther: this.form.exceptionalTypeOther };
        }
        value.identificationIds = this.form.identificationIds.map((m: string) => (
          {
            optionItemId: m,
            specifiedOther: this.verificationOptions.filter((v) => m === v.id && v.isOther).length > 0 ? this.form.specifiedOther : null,
          }));
        const res = await useCaseFileStore().setCaseFileIdentityAuthentication(this.caseFile.id, value);

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

    onStatusChange() {
      this.form.method = IdentityAuthenticationMethod.NotApplicable;
    },
  },
});
</script>

<style scoped lang="scss">
  .status-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 16px;
    & .status-radio-container {
      display: flex;
      justify-content: center;
      width: 672px !important;
    }
  }

  .status-radio-option {
    display: flex;
    background: var(--v-grey-lighten5);
    padding: 16px;
    width: 224px;
    height: 48px;
  }

  .status-radio-option-border {
    border-left: 1px solid var(--v-grey-lighten2);
    border-right: 1px solid var(--v-grey-lighten2);
  }

  .status-radio-option-border-radius-left {
    border-radius: 6px 0px 0px 6px;
  }

  .status-radio-option-border-radius-right {
    border-radius: 0px 6px 6px 0px;
  }

  .active-background {
    background-color: var(--v-primary-lighten2);
  }

  ::v-deep .status-container label.v-label{
    font-size: 14px !important;
    padding-top: 2px;
    color: var(--v-grey-darken2);
  }

  ::v-deep .status-container .v-radio--is-disabled label{
    color: rgba(0,0,0,0.38) !important;
  }
</style>
