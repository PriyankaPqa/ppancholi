<template>
  <validation-observer ref="form" v-slot="{ failed }" slim>
    <rc-page-content
      content-padding="8"
      :outer-scroll="true"
      :title="$t('recoveryPlan.title')"
      :show-help="false">
      <rc-page-loading v-if="loading" />
      <v-row class="justify-center mt-0 rc-body14">
        <v-col cols="12" md="12" lg="8" class="border-all border-radius-6 pa-0">
          <v-row class="justify-space-between mt-3 mb-0 pl-4 mx-0">
            <div data-test="recoveryPlan_description" class="font-weight-bold flex-grow-1 pb-3 description-section">
              {{ questionList[0].question }}
            </div>
            <div>
              <v-radio-group
                v-model="recoveryPlanLocal.hasRecoveryPlan"
                row
                class="pa-0 my-0"
                :disabled="!canEdit"
                data-test="recoveryPlan_hasRecoveryPlan_radioGroup"
                @change="resetCrcProvidedAndStartDate()">
                <v-radio
                  class="mr-8"
                  data-test="hasRecoveryPlan_yes"
                  :label="$t('common.yes')"
                  :value="true" />
                <v-radio
                  data-test="hasRecoveryPlan_no"
                  :label="$t('common.no')"
                  :value="false" />
              </v-radio-group>
            </div>
          </v-row>
          <v-row
            v-if="recoveryPlanLocal.hasRecoveryPlan"
            class="border-top flex-nowrap justify-space-between pt-3 pl-0 mx-0 my-0 px-0"
            data-test="recoveryPlan_crcProvidedSection">
            <div class="pb-3 pl-4 description-section">
              <div class="font-weight-bold">
                {{ questionList[1].question }}
              </div>
              <div class="rc-body12">
                {{ questionList[1].description }}
              </div>
            </div>
            <div>
              <validation-provider v-slot="{ errors }" :rules="rules.crcProvided">
                <v-radio-group
                  v-model="recoveryPlanLocal.crcProvided"
                  row
                  :error-messages="errors"
                  class="pa-0 my-0">
                  <v-radio
                    class="mr-8"
                    data-test="crcProvided_yes"
                    :label="$t('common.yes')"
                    :value="true" />
                  <v-radio
                    data-test="crcProvided_no"
                    :label="$t('common.no')"
                    :value="false"
                    @click="recoveryPlanLocal.startDate = null" />
                </v-radio-group>
              </validation-provider>
            </div>
          </v-row>
          <v-row
            v-if="recoveryPlanLocal.crcProvided"
            class="border-top justify-space-between flex-nowrap pt-3 pb-0 pr-4 my-0 mx-0"
            data-test="recoveryPlan_startDateSection">
            <div class="description-section pl-4">
              <div class="font-weight-bold">
                {{ questionList[2].question }}
              </div>
              <div class="rc-body12">
                {{ questionList[2].description }}
              </div>
            </div>
            <div class="date-input-section">
              <v-date-field-with-validation
                v-model="recoveryPlanLocal.startDate"
                :locale="$i18n.locale"
                :prepend-inner-icon="'mdi-calendar'"
                :label="$t('recoveryPlan.question.as_of_when.select_date') + ' *'"
                :rules="rules.startDate"
                class="ma-0 pa-0"
                data-test="recoveryPlan_startDate" />
            </div>
          </v-row>
          <v-row
            v-if="recoveryPlanLocal.hasRecoveryPlan !== null"
            class=" border-top justify-end pt-4 pb-4 px-4 my-0 mx-0"
            data-test="recoveryPlan_actionSection">
            <v-btn class="mr-8" data-test="recoveryPlan_cancelBtn" @click="cancel()">
              {{ $t('common.buttons.cancel') }}
            </v-btn>
            <v-btn color="primary" data-test="recoveryPlan_saveBtn" :disabled="failed || (isEditMode && !isDirty) || submitting" @click="submit()">
              {{ $t('common.buttons.save') }}
            </v-btn>
          </v-row>
        </v-col>
      </v-row>
    </rc-page-content>
  </validation-observer>
</template>

<script lang="ts">

import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';
import { RcPageContent, VDateFieldWithValidation, RcPageLoading } from '@libs/component-lib/components';
import { CaseFileStatus, IRecoveryPlan } from '@libs/entities-lib/case-file';
import { VForm } from '@libs/shared-lib/types';
import helpers from '@/ui/helpers/helpers';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { format } from 'date-fns';
import _isEqual from 'lodash/isEqual';
import { NavigationGuardNext, Route } from 'vue-router';
import routes from '@/constants/routes';
import { UserRoles } from '@libs/entities-lib/user';

const VISUAL_DELAY = 500;

export default mixins(caseFileDetail).extend({
  name: 'CreateEditRecoveryPlan',

  components: {
    RcPageContent,
    VDateFieldWithValidation,
    RcPageLoading,
  },

  async beforeRouteLeave(to: Route, from: Route, next: NavigationGuardNext) {
    if (!this.isDirty) {
      next();
    } else {
      const leavingConfirmed = await this.$confirm({
        title: this.$t('confirmLeaveDialog.title'),
        messages: this.$t('confirmLeaveDialog.message_1'),
      });

      if (leavingConfirmed) {
        next();
      }
    }
  },

  data() {
    return {
      loading: false,
      submitting: false,
      originalData: {
        hasRecoveryPlan: null,
        crcProvided: null,
        startDate: null,
      } as IRecoveryPlan,
      recoveryPlanLocal: {
        hasRecoveryPlan: null,
        crcProvided: null,
        startDate: null,
      } as IRecoveryPlan,
      questionList: [
        {
          question: this.$t('recoveryPlan.question.has_recovery_plan'),
          description: '',
        },
        {
          question: this.$t('recoveryPlan.question.crc_provided'),
          description: this.$t('recoveryPlan.description.crc_provided'),
        },
        {
          question: this.$t('recoveryPlan.question.as_of_when'),
          description: this.$t('recoveryPlan.description.as_of_when'),
        },
      ],
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level6) || this.caseFile.caseFileStatus === CaseFileStatus.Open;
    },

    isEditMode(): boolean {
      return this.$route.name === routes.caseFile.recoveryPlan.edit.name;
    },

    recoveryPlan(): IRecoveryPlan {
      return this.caseFile.recoveryPlan;
    },

    startDateRule(): Record<string, unknown> {
        return {
          mustBeBeforeOrSame: { X: this.recoveryPlanLocal.startDate, Y: format(Date.now(), 'yyyy-MM-dd') },
        };
    },

    rules(): Record<string, unknown> {
      return {
        crcProvided: { requiredCheckbox: true, oneOf: [true, false] },
        startDate: {
          required: true,
          ...this.startDateRule,
        },
      };
    },

    isDirty(): boolean {
      return !_isEqual(this.originalData, {
        hasRecoveryPlan: this.recoveryPlanLocal.hasRecoveryPlan,
        crcProvided: this.recoveryPlanLocal.crcProvided,
        startDate: this.recoveryPlanLocal.startDate,
      });
    },
  },

  created() {
    this.loading = true;
    if (this.isEditMode) {
      this.recoveryPlanLocal = {
        hasRecoveryPlan: this.recoveryPlan.hasRecoveryPlan,
        crcProvided: this.recoveryPlan.crcProvided,
        startDate: this.recoveryPlan.startDate ? helpers.getLocalStringDate(this.recoveryPlan.startDate, 'RecoveryPlan.startDate') : null,
      };
      this.setOriginalData(this.recoveryPlan);
    }
    this.loading = false;
  },

  methods: {
    async submit() {
      const isValid = await (this.$refs.form as VForm).validate();

      if (!isValid) {
        helpers.scrollToFirstError('scrollAnchor');
        return;
      }
      try {
        this.submitting = true;
        const res = await this.$services.caseFiles.editRecoveryPlan(this.id, this.recoveryPlanLocal);
        await helpers.timeout(VISUAL_DELAY);
        if (res) {
          this.setOriginalData(res.recoveryPlan);
          await this.$router.replace({ name: routes.caseFile.recoveryPlan.details.name, params: { id: this.id } });
        }
      } catch (e) {
        applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'editRecoveryPlan');
      } finally {
        this.submitting = false;
      }
    },

    cancel() {
      if (this.isEditMode) {
        this.recoveryPlanLocal = this.originalData;
        this.$router.replace({ name: routes.caseFile.recoveryPlan.details.name, params: { id: this.id } });
      } else {
        this.resetLocalData();
      }
    },

    setOriginalData(recoveryPlan: IRecoveryPlan) {
      this.originalData = {
        hasRecoveryPlan: recoveryPlan.hasRecoveryPlan,
        crcProvided: recoveryPlan.crcProvided,
        startDate: recoveryPlan.startDate ? helpers.getLocalStringDate(recoveryPlan.startDate, 'RecoveryPlan.startDate') : null,
      };
    },

    resetLocalData() {
      this.recoveryPlanLocal = {
        hasRecoveryPlan: null,
        crcProvided: null,
        startDate: null,
      };
    },

    resetCrcProvidedAndStartDate() {
      this.recoveryPlanLocal.crcProvided = null;
      this.recoveryPlanLocal.startDate = null;
      },
    },
});
</script>

<style scoped lang="scss">
.border-bottom {
  border-bottom: 1px solid var(--v-grey-lighten2);
}

.border-top {
  border-top: 1px solid var(--v-grey-lighten2);
}

.border-radius-6 {
  border-radius: 6px;
}

.description-section {
  width: 70%
}

.date-input-section {
  margin-left: 4px;
  margin-bottom: -10px;
}

</style>
