<template>
  <rc-page-content
    content-padding="8"
    :outer-scroll="true"
    :title="$t('recoveryPlan.title')"
    :show-help="false">
    <div v-if="!recoveryPlan || loading">
      <v-skeleton-loader tile type="table-heading" />
      <v-skeleton-loader tile type="list-item" />
    </div>
    <div v-else>
      <v-row class="justify-center mb-0">
        <v-col cols="12" md="12" lg="8" class="d-flex justify-end pr-0">
          <v-btn icon :disabled="!canEdit" :aria-label="$t('common.edit')" @click="getEditRecoveryPlanRoute()">
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="justify-center mt-0 rc-body14">
        <v-col cols="12" md="12" lg="8" class="border-all border-radius-6 pa-0">
          <v-row class="justify-space-between mt-3 mb-0 pl-4 mx-0">
            <div class="font-weight-bold flex-grow-1 pb-3 description-section">
              {{ questionList[0].question }}
            </div>
            <div class="mr-4">
              {{ recoveryPlan.hasRecoveryPlan ? $t('common.yes') : $t('common.no') }}
            </div>
          </v-row>
          <v-row v-if="recoveryPlan.hasRecoveryPlan" class="border-top flex-nowrap justify-space-between pt-3 pl-0 mx-0 my-0 px-0">
            <div class="pb-3 pl-4 description-section">
              <div class="font-weight-bold">
                {{ questionList[1].question }}
              </div>
              <div class="rc-body12">
                {{ questionList[1].description }}
              </div>
            </div>
            <div class="mr-4">
              {{ recoveryPlan.crcProvided ? $t('common.yes') : $t('common.no') }}
            </div>
          </v-row>
          <template v-if="recoveryPlan.crcProvided">
            <v-row class="border-bottom border-top justify-space-between flex-nowrap py-3 pr-4 mx-0 my-0">
              <div class="description-section pl-4">
                <div class="font-weight-bold">
                  {{ questionList[2].question }}
                </div>
                <div class="rc-body12">
                  {{ questionList[2].description }}
                </div>
              </div>
              <div>
                {{ helpers.getLocalStringDate(recoveryPlan.startDate, '', 'PP') }}
              </div>
            </v-row>
            <v-row class="justify-space-between flex-nowrap pt-4 pb-4 px-4 ma-0 mt-0">
              <div class="mr-6">
                <v-btn color="primary" data-test="recoveryPlan_uploadBtn" @click="getCaseFileDocumentRoute()">
                  {{ $t('recoveryPlan.upload_file.button') }}
                </v-btn>
              </div>
              <div class="d-flex">
                <div class="mr-1">
                  <v-icon small>
                    mdi-alert-circle
                  </v-icon>
                </div>
                <div> {{ $t('recoveryPlan.upload_file.reminder') }} </div>
              </div>
            </v-row>
          </template>
        </v-col>
      </v-row>
    </div>
  </rc-page-content>
</template>

<script lang="ts">

import mixins from 'vue-typed-mixins';
import caseFileDetail from '@/ui/views/pages/case-files/details/caseFileDetail';
import { RcPageContent, VDateFieldWithValidation } from '@libs/component-lib/components';
import { CaseFileStatus, IRecoveryPlan } from '@libs/entities-lib/case-file';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers/helpers';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { UserRoles } from '@libs/entities-lib/user';

export default mixins(caseFileDetail).extend({
  name: 'RecoveryPlanDetails',

  components: {
    RcPageContent,
    VDateFieldWithValidation,
  },

  data() {
    return {
      helpers,
      loading: false,
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

  async created() {
    try {
      this.loading = true;
      await useCaseFileStore().fetch(this.caseFileId);
    } finally {
      this.loading = false;
    }
  },

  computed: {
    recoveryPlan(): IRecoveryPlan {
      return this.caseFile?.recoveryPlan;
    },

    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level6) || this.caseFile.caseFileStatus === CaseFileStatus.Open;
    },
  },

  methods: {
    getCaseFileDocumentRoute() {
      this.$router.push({
        name: routes.caseFile.documents.home.name,
        params: {
          id: this.id,
        },
      });
    },

    getEditRecoveryPlanRoute() {
      this.$router.push({
        name: routes.caseFile.recoveryPlan.edit.name,
        params: {
          id: this.id,
        },
      });
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

</style>
