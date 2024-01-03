<template>
  <div>
    <v-data-table
      :data-test="`duplicate-table-${isPotentialTable ? 'potential' : 'resolved'}`"
      must-sort
      :headers="headers"
      :loading="loading || submitting"
      :items="duplicates">
      <template #[`item.duplicateHousehold.primaryBeneficiaryFullName`]="{ item }">
        <div class="d-flex flex-column my-3">
          <router-link
            class="rc-link14 font-weight-bold"
            data-test="householdDetails-manageDuplicates-household-link"
            :to="getHouseholdRoute(item)">
            {{ item.duplicateHousehold.primaryBeneficiaryFullName }}
          </router-link>

          <div class="mb-2 d-flex flex-column rc-body12 case-file-data">
            <span data-test="householdDetails-manageDuplicates-household-registration-number">
              {{ $t('household.profile.registration_number') }}: {{ item.duplicateHousehold.registrationNumber }}
            </span>
            <span v-for="cf in item.duplicateHousehold.caseFiles" :key="cf.id" data-test="householdDetails-manageDuplicates-caseFile-data">
              <span class="mr-2"> {{ $t('caseFileDetail.caseFileNumber') }}: {{ cf.caseFileNumber }} </span>
              {{ $t('caseFileDetail.eventLabel') }}: {{ $m(cf.eventName) }}
            </span>
          </div>

          <div v-if="showLine(item, DuplicateReason.FullName)" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color=" secondary ">
              mdi-account
            </v-icon>
            <span class="mr-1"> {{ $t('householdDetails.manageDuplicates.table.name') }}: </span>
            <span data-test="householdDetails-duplicate-name"> {{ item.memberFirstName && item.memberLastName ? item.memberFirstName + " " + item.memberLastName : '-' }} </span>
          </div>

          <div v-if="showLine(item, DuplicateReason.HomePhoneNumber)" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color="secondary">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.home') }}: </span>
            <case-file-details-beneficiary-phone-number
              v-if="item.duplicateHousehold.homePhoneNumber"
              data-test="duplicate-home-phone-number"
              :phone-number="item.duplicateHousehold.homePhoneNumber"
              :show-labels="false" />
            <span v-else>-</span>
          </div>

          <div v-if="showLine(item, DuplicateReason.MobilePhoneNumber)" class="d-flex align-center mb-1">
            <v-icon size="16" class="pr-2" color=" secondary ">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.mobile') }}: </span>
            <case-file-details-beneficiary-phone-number
              v-if="item.duplicateHousehold.mobilePhoneNumber"
              data-test="duplicate-mobile-phone-number"
              :phone-number="item.duplicateHousehold.mobilePhoneNumber"
              :show-labels="false" />
            <span v-else>-</span>
          </div>

          <div v-if="showLine(item, DuplicateReason.AlternatePhoneNumber)" class="d-flex align-start mb-1">
            <v-icon size="16" class="d-flex align-start pr-2" color=" secondary ">
              mdi-phone
            </v-icon>
            <span class="mr-1"> {{ $t('household.profile.member.phone_numbers.alternate') }}: </span>
            <case-file-details-beneficiary-phone-number
              v-if="item.duplicateHousehold.alternatePhoneNumber"
              data-test="duplicate-alternate-phone-number"
              :phone-number="item.duplicateHousehold.alternatePhoneNumber"
              :show-labels="false" />
            <span v-else>-</span>
          </div>

          <div v-if="showLine(item, DuplicateReason.HomeAddress)" class="d-flex align-start mb-1">
            <v-icon small class="mr-1" color="secondary ">
              mdi-map-marker
            </v-icon>
            <div class="d-flex" data-test="caseFileDetails-home-address">
              <span class="mr-1 no-wrap"> {{ $t('caseFileDetail.addressLabel') }}: </span>
              <span class="mr-1" data-test="householdDetails-duplicate-address">
                {{ item.duplicateHousehold.homeAddress && item.duplicateHousehold.homeAddress.address ? getFormattedAddress(item.duplicateHousehold.homeAddress) : '-' }}
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
            <template v-if="historyItem.userInformation">
              <div class="px-1" data-test="householdDetails-duplicate-history-user">
                {{ $t('common.by') }}: {{ isFlaggedByTheSystem(historyItem) ? $t('system.system_user_id') : historyItem.userInformation.userName }}
                <span v-if="historyItem.userInformation.roleName">({{ $m(historyItem.userInformation.roleName) }})</span>
                - {{ format(parseISO(historyItem.dateOfAction), 'PP') }}
              </div>
            </template>
            <div v-if="historyItem.rationale" class="px-1 pre-line" data-test="householdDetails-duplicate-history-rationale">
              {{ historyItem.duplicateStatus === DuplicateStatus.Potential
                ? $t('householdDetails.manageDuplicates.rationale')
                : $t('householdDetails.manageDuplicates.actionTaken') }}:
              {{ isFlaggedByTheSystem(historyItem) ? $t('householdDetails.manageDuplicates.flaggedByTheSystem') : historyItem.rationale }}
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
              :disabled="!canAction"
              :aria-label="$t('householdDetails.manageDuplicates.table.action')"
              hide-details
              @input="action(duplicate)">
              <template #selection>
                <div class="d-flex flex-nowrap justify-center z-index" :aria-label="$t('householdDetails.manageDuplicates.table.action')">
                  <v-icon
                    class="mr-1"
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
                <div class="d-flex flex-nowrap justify-center" :aria-label="item.text">
                  <v-icon
                    class="mr-2"
                    :data-test="`householdDetails-manageDuplicates-action-menu-${item.id}`"
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
import routes from '@/constants/routes';
import { system } from '@/constants/system';
import householdHelpers from '@/ui/helpers/household';
import { IHouseholdAddress } from '@libs/entities-lib/household';
import { IPotentialDuplicateExtended, DuplicateStatus, DuplicateReason, IPotentialDuplicateEntity, IHouseholdDuplicateStatusHistory } from '@libs/entities-lib/potential-duplicate';
import { usePotentialDuplicateStore } from '@/pinia/potential-duplicate/potential-duplicate';
import helpers from '@/ui/helpers/helpers';
import CaseFileDetailsBeneficiaryPhoneNumber from '@/ui/views/pages/case-files/details/components/CaseFileDetailsBeneficiaryPhoneNumber.vue';
import { UserRoles } from '@libs/entities-lib/user';
import { format, parseISO } from 'date-fns';
import ManageDuplicatesActionDialog from './ManageDuplicatesActionDialog.vue';

export default Vue.extend({
  name: 'ManageDuplicatesTable',

  components: {
    CaseFileDetailsBeneficiaryPhoneNumber,
    ManageDuplicatesActionDialog,
  },

  props: {
    currentHouseholdId: {
      type: String,
      required: true,
    },
    isPotentialTable: {
      type: Boolean,
      default: false,
    },
    duplicates: {
      type: Array as () => IPotentialDuplicateExtended[],
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  },

  data() {
    return {
      DuplicateReason,
      DuplicateStatus,
      showActionDialog: false,
      actionedDuplicate: null as IPotentialDuplicateExtended,
      initialSelect: this.isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved,
      submitting: false,
      format,
      parseISO,
    };
  },

  computed: {
    headers(): Array<DataTableHeader> {
      return [
        {
          text: this.$t('householdDetails.manageDuplicates.table.household') as string,
          value: 'duplicateHousehold.primaryBeneficiaryFullName',
          sortable: true,
          cellClass: 'vertical-align',
          width: '50%',
        },
        {
          text: this.$t('householdDetails.manageDuplicates.table.flaggedAs') as string,
          value: 'flaggedAs',
          sortable: false,
          cellClass: 'vertical-align',
          width: '35%',
        },
        {
          text: this.$t('householdDetails.manageDuplicates.table.action') as string,
          value: 'action',
          cellClass: 'vertical-align',
          sortable: false,
        },
      ];
    },

    statuses() {
      return helpers.enumToTranslatedCollection(DuplicateStatus, 'householdDetails.manageDuplicates.enum.duplicateStatus');
    },

    canAction():boolean {
      return this.isPotentialTable || this.$hasLevel(UserRoles.level6);
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

    getHouseholdRoute(duplicate: IPotentialDuplicateExtended) {
      const householdId = duplicate.duplicateHousehold.householdId;
      return {
        name: routes.household.householdProfile.name,
        params: {
          id: householdId,
        },
      };
    },

    getFormattedAddress(address: IHouseholdAddress): string {
      return householdHelpers.getAddressLines(address?.address).join(', ');
    },

    showLine(duplicate: IPotentialDuplicateExtended, reason: DuplicateReason): boolean {
      return duplicate.duplicateReasons.includes(reason);
    },

    action(duplicate: IPotentialDuplicateExtended) {
      this.actionedDuplicate = duplicate;
      this.showActionDialog = true;
    },

    async submitAction({ status, rationale } : { status: DuplicateStatus, rationale: string }) {
      if (!this.actionedDuplicate) {
        return;
      }
      this.submitting = true;
      try {
        let result = null as IPotentialDuplicateEntity;
        if (status === DuplicateStatus.Potential) {
          result = await usePotentialDuplicateStore().flagDuplicate(this.actionedDuplicate.id, rationale);
        } else if (status === DuplicateStatus.Resolved) {
          result = await usePotentialDuplicateStore().resolveDuplicate(this.actionedDuplicate.id, rationale);
        }

        if (result) {
          this.actionedDuplicate = null;
        }
      } finally {
        this.submitting = false;
        // So that the dropdown selection returns to initial value, after the use clicked on the other value
        this.initialSelect = this.isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved;
      }
    },

    cancelAction() {
      this.initialSelect = this.isPotentialTable ? DuplicateStatus.Potential : DuplicateStatus.Resolved;
      this.showActionDialog = false;
      this.actionedDuplicate = null;
    },

    isFlaggedByTheSystem(historyItem: IHouseholdDuplicateStatusHistory): boolean {
      return historyItem?.userInformation?.userId === system.system_user_id;
    },
  },

});

</script>

<style lang="scss">

.vertical-align {
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
  padding-top: 2px;
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

.pre-line {
  white-space: pre-line;
}
</style>
