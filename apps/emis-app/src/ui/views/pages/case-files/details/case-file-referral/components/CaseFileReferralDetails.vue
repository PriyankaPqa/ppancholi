<template>
  <rc-page-content
    :title=" $t('referralDetails.title')"
    :show-help="false"
    :help-link="$t('zendesk.help_link.case_referral_list')">
    <v-row class="justify-center mt-10">
      <v-col cols="12" lg="7">
        <div class="pb-4 d-flex justify-space-between">
          <div class="details-page-title" data-test="organization-name">
            {{ referral.name }}
          </div>
          <v-btn v-if="canEdit" icon :to="referralEditRoute" :aria-label="$t('common.edit')" data-test="editReferral-link">
            <v-icon>
              mdi-pencil
            </v-icon>
          </v-btn>
        </div>
        <v-sheet rounded outlined>
          <v-simple-table>
            <tbody>
              <tr v-for="item in referralData" :key="item.test" :data-test="`referral_details_${item.test}`">
                <td class="label fw-bold">
                  {{ $t(item.label) }}
                </td>
                <td class="data">
                  {{ item.data }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>

        <v-sheet v-if="referral.outcomeStatus" rounded class="mt-10 grey-container">
          <v-simple-table class="grey-container">
            <tbody>
              <tr data-test="referral_details_outcome">
                <td class="label fw-bold">
                  {{ $t('caseFile.referral.outcomeStatus') }}
                </td>
                <td class="data">
                  {{ outcomeStatus }}
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </v-col>
    </v-row>
    <template slot="actions">
      <v-btn
        color="primary"
        data-test="referral_details_back_btn"
        @click="goToReferrals()">
        {{ $t('referralDetails.back_to_referrals') }}
      </v-btn>
    </template>
  </rc-page-content>
</template>

<script lang="ts">
import mixins from 'vue-typed-mixins';
import { RcPageContent } from '@libs/component-lib/components';
import routes from '@/constants/routes';
import { CaseFileReferralEntity, ICaseFileReferralEntity, ReferralMethod } from '@libs/entities-lib/case-file-referral';
import { useCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral';
import { UserRoles } from '@libs/entities-lib/user';
import { TranslateResult } from 'vue-i18n';
import caseFileDetail from '../../caseFileDetail';

export default mixins(caseFileDetail).extend({
  name: 'CaseFileReferralDetails',

  components: {
    RcPageContent,
  },

  props: {
    referralId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      referralLoading: true,
      loading: false,
      error: false,
    };
  },

  computed: {
    canEdit(): boolean {
      return this.$hasLevel(UserRoles.level1) && !this.readonly;
    },

    referral(): ICaseFileReferralEntity {
      const referralEntity = useCaseFileReferralStore().getById(this.referralId);
      return referralEntity || new CaseFileReferralEntity();
    },

    typeName(): string {
      if (!this.referral?.type?.optionItemId) {
        return null;
      }
      const types = useCaseFileReferralStore().getAllTypes(false);
      const type = types.find((t) => t.id === this.referral.type.optionItemId);
      return this.$m(type?.name);
    },

    outcomeStatus(): string {
      if (!this.referral?.outcomeStatus?.optionItemId) {
        return null;
      }
      const statuses = useCaseFileReferralStore().getAllOutcomeStatuses(false);
      const status = statuses.find((t) => t.id === this.referral.outcomeStatus.optionItemId);
      return this.$m(status?.name);
    },

    referralData(): Record<string, string | TranslateResult>[] {
      return [
        {
          label: 'caseFile.referral.referralType',
          data: this.typeName,
          test: 'type',
        },
        {
          label: 'caseFile.referral.notes',
          data: this.referral.note,
          test: 'notes',
        },
        {
          label: 'referral.method',
          data: this.$t(`caseFile.referral.method.${ReferralMethod[this.referral.method]}`),
          test: 'method',
        },
      ];
    },

    referralEditRoute(): { name: string, params: Record<string, string> } {
      return {
        name: routes.caseFile.referrals.edit.name,
        params: {
          referralId: this.referralId,
        },
      };
    },

  },

  async created() {
    await useCaseFileReferralStore().fetchTypes();
    await useCaseFileReferralStore().fetchOutcomeStatuses();
    await useCaseFileReferralStore().fetch(
      { caseFileId: this.id, id: this.referralId },
    );
  },

  methods: {
    goToReferrals() {
      this.$router.push({
        name: routes.caseFile.referrals.home.name,
      });
    },
  },

});
</script>
