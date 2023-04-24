<template>
  <div>
    <v-data-table
      :data-test="`duplicate-table-${isPotentialTable ? 'potential' : 'resolved'}`"
      must-sort
      hide-default-footer
      :headers="headers"
      :loading="loading"
      :items="duplicates">
      <template #[`item.primaryBeneficiaryFullName`]="{ item }">
        <div class="d-flex flex-column my-4">
          <router-link
            class="rc-link14 font-weight-bold"
            data-test="householdDetails-manageDuplicates-household-link"
            :to="getHouseholdRoute(item.householdId)">
            {{ item.primaryBeneficiaryFullName }}
          </router-link>

          <div class="mb-2 d-flex flex-column rc-body12 case-file-data">
            <span data-test="householdDetails-manageDuplicates-household-registration-number">
              {{ $t('household.profile.registration_number') }}: {{ item.registrationNumber }}
            </span>
            <span v-for="cf in item.caseFiles" :key="cf.id" data-test="householdDetails-manageDuplicates-caseFile-data">
              <span class="mr-2"> {{ $t('caseFileDetail.caseFileNumber') }}: {{ cf.caseFileNumber }} </span>
              {{ $t('caseFileDetail.eventLabel') }}: {{ $m(cf.eventName) }}
            </span>
          </div>

          <div v-if="showLine(item, DuplicateReason.FullName)" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color=" secondary ">
              mdi-account
            </v-icon>
            <span class="mr-1"> {{ $t('householdDetails.manageDuplicates.table.name') }}: </span>
            <span data-test="householdDetails-duplicate-name"> {{ item.memberFullName }} </span>
          </div>

          <div v-if="showLine(item, DuplicateReason.MemberHomePhoneNumber) && item.memberHomePhoneNumber" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color="secondary">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.home') }}: </span>
            <case-file-details-beneficiary-phone-number
              data-test="duplicate-home-phone-number"
              :phone-number="item.memberHomePhoneNumber"
              :show-labels="false" />
          </div>

          <div v-if="showLine(item, DuplicateReason.MemberMobilePhoneNumber) && item.memberMobilePhoneNumber" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color=" secondary ">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.mobile') }}: </span>
            <case-file-details-beneficiary-phone-number
              data-test="duplicate-mobile-phone-number"
              :phone-number="item.memberMobilePhoneNumber"
              :show-labels="false" />
          </div>

          <div v-if="showLine(item, DuplicateReason.MemberAlternatePhoneNumber) && item.memberAlternatePhoneNumber" class="d-flex align-start mb-1">
            <v-icon size="16" class="d-flex align-start pr-2" color=" secondary ">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.alternate') }}: </span>
            <case-file-details-beneficiary-phone-number
              data-test="duplicate-alternate-phone-number"
              :phone-number="item.memberAlternatePhoneNumber"
              :show-labels="false" />
          </div>

          <div v-if="showLine(item, DuplicateReason.HomeAddress)" class="d-flex align-start mb-1">
            <v-icon small class="mr-1" color="secondary ">
              mdi-map-marker
            </v-icon>
            <div class="d-flex" data-test="caseFileDetails-home-address">
              <span class="mr-1 no-wrap"> {{ $t('caseFileDetail.addressLabel') }}: </span>
              <span class="mr-1" data-test="householdDetails-duplicate-address">
                {{ getFormattedAddress(item.homeAddress) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #[`item.flaggedAs`]="{ item }">
        <div class="d-flex flex-column my-4">
          <div v-for="(historyItem, $index) in item.duplicateStatusHistory" :key="$index" class="pb-3 full-height d-flex flex-column justify-start rc-body12">
            <span class="fw-bold flagged-as-label px-1" data-test="householdDetails-duplicate-history-status">
              {{ $t('householdDetails.manageDuplicates.flaggedAs') }} {{ $t(`householdDetails.manageDuplicates.enum.duplicateStatus.${historyItem.duplicateStatus}`) }}
            </span>
            <div class="px-1" data-test="householdDetails-duplicate-history-user">
              {{ $t('common.by') }}: {{ historyItem.userInformation.userName }} ({{ $m(historyItem.userInformation.roleName) }})
              - {{ moment(historyItem.dateOfAction).local().format('lll') }}
            </div>
            <div v-if="historyItem.rationale" class="px-1" data-test="householdDetails-duplicate-history-rationale">
              {{ historyItem.duplicateStatus === DuplicateStatus.Potential
                ? $t('householdDetails.manageDuplicates.rationale')
                : $t('householdDetails.manageDuplicates.actionTaken') }}:
              {{ historyItem.rationale }}
            </div>
          </div>
        </div>
      </template>

      <template #[`item.action`]="{ item: duplicate }">
        <div class="pb-3 full-height d-flex flex-column justify-start">
          <div class="duplicate-action-wrapper border-radius-all mt-3 px-1 pt-0 pb-1">
            <v-select
              v-model="initialSelect"
              data-test="householdDetails-manageDuplicates-actionDropdown"
              :items="statuses"
              hide-details
              @input="action(duplicate)">
              <template #selection>
                <div class="d-flex flex-nowrap justify-center">
                  <v-icon
                    class="mr-2"
                    :color="isPotentialTable ? 'secondary' : 'green'">
                    {{ isPotentialTable ? '$rctech-duplicate' : '$rctech-resolved' }}
                  </v-icon>
                  <div class="select-text rc-body14">
                    {{ isPotentialTable ? $t('householdDetails.manageDuplicates.enum.duplicateStatus.Potential')
                      : $t('householdDetails.manageDuplicates.enum.duplicateStatus.Resolved') }}
                  </div>
                </div>
              </template>

              <template #item="{ item }">
                <div class="d-flex flex-nowrap justify-center">
                  <v-icon
                    class="mr-2"
                    :data-test="`householdDetails-manageDuplicates-action-menu-${item}`"
                    :color="item.value === DuplicateStatus.Potential ? 'secondary' : 'green'">
                    {{ item.value === DuplicateStatus.Potential ? '$rctech-duplicate' : '$rctech-resolved' }}
                  </v-icon>
                  <span class="select-text rc-body14">{{ item.text }}</span>
                </div>
              </template>
            </v-select>
          </div>
        </div>
      </template>
    </v-data-table>

    <manage-duplicates-action-dialog
      v-if="showActionDialog"
      :show.sync="showActionDialog"
      :initial-status="isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved"
      @submitAction="submitAction"
      @cancelAction="cancelAction" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import moment from 'moment';
import routes from '@/constants/routes';
import householdHelpers from '@/ui/helpers/household';
import { IHouseholdAddress, IHouseholdDuplicateFullData, DuplicateReason, DuplicateStatus } from '@libs/entities-lib/household';
import helpers from '@/ui/helpers/helpers';
import CaseFileDetailsBeneficiaryPhoneNumber from '@/ui/views/pages/case-files/details/components/CaseFileDetailsBeneficiaryPhoneNumber.vue';
import ManageDuplicatesActionDialog from './ManageDuplicatesActionDialog.vue';

export default Vue.extend({
  name: 'ManageDuplicatesTable',

  components: {
    CaseFileDetailsBeneficiaryPhoneNumber,
    ManageDuplicatesActionDialog,
  },

  props: {
    isPotentialTable: {
      type: Boolean,
      default: false,
    },
    duplicates: {
      type: Array as () => IHouseholdDuplicateFullData[],
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      moment,
      DuplicateReason,
      DuplicateStatus,
      showActionDialog: false,
      actionedDuplicate: null as IHouseholdDuplicateFullData,
      initialSelect: this.isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('householdDetails.manageDuplicates.table.households') as string,
          value: 'primaryBeneficiaryFullName',
          sortable: true,
          width: '50%',
        },
        {
          text: this.$t('householdDetails.manageDuplicates.table.flaggedAs') as string,
          value: 'flaggedAs',
          sortable: false,
          cellClass: 'flagged-as',
          width: '35%',
        },
        {
          text: this.$t('householdDetails.manageDuplicates.table.action') as string,
          value: 'action',
          sortable: false,
        },
      ];
    },

    statuses() {
      return helpers.enumToTranslatedCollection(DuplicateStatus, 'householdDetails.manageDuplicates.enum.duplicateStatus');
    },
  },

  methods: {
    getCaseFileRoute(id: string) {
      return {
        name: routes.caseFile.activity.name,
        params: {
          id,
        },
      };
    },

    getHouseholdRoute(id: string) {
      return {
        name: routes.household.householdProfile.name,
        params: {
          id,
        },
      };
    },

    getFormattedAddress(address: IHouseholdAddress): string {
      return householdHelpers.getAddressLines(address?.address).join(', ');
    },

    showLine(duplicate: IHouseholdDuplicateFullData, reason: DuplicateReason): boolean {
      return duplicate.duplicateReasons.includes(reason);
    },

    action(duplicate: IHouseholdDuplicateFullData) {
      this.actionedDuplicate = duplicate;
      this.showActionDialog = true;
    },

    async submitAction({ status, rationale } : { status: DuplicateStatus, rationale: string }) {
      // TO DO in next stories
      // eslint-disable-next-line no-console
      console.log({ rationale, status });
      this.actionedDuplicate = null;
      this.$emit('fetchDuplicates');
    },

    cancelAction() {
      this.initialSelect = this.isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved;
      this.showActionDialog = false;
      this.actionedDuplicate = null;
    },
  },

});

</script>

<style lang="scss">

.flagged-as {
  vertical-align: top;
}
</style>

<style scoped lang="scss">
  .flagged-as-label {
  background: var(--v-status_yellow_pale-base);
  width: fit-content;
}

.duplicate-action-wrapper{
  background-color: var(--v-grey-lighten5);
  width: min-content;
}

::v-deep .v-input__slot:before, .v-input__slot:after {
  display: none;
}

::v-deep .v-input {
  padding-top: 4px;
}

.no-wrap {
  white-space: nowrap;
}

.select-text {
  white-space: nowrap;
  line-height: 25px;
}

.case-file-data {
  color: var(--v-grey-darken2);
}
</style>
