<template>
  <v-sheet
    v-if="member"
    rounded
    outlined
    class="mb-4 background">
    <div class="px-4 py-2 rc-body18 fw-bold d-flex  align-center justify-space-between">
      <div data-test="household_profile_member_display_name">
        <v-icon size="22" class="pr-2" color="secondary">
          mdi-account
        </v-icon>
        {{ displayName }}
      </div>

      <div class="d-flex align-center">
        <v-chip
          v-if="isPrimaryMember"
          class="px-2 mr-4"
          small
          label
          color="grey darken-2"
          outlined
          data-test="household_profile_member_primary_member_label">
          <v-icon color="secondary" small class="mr-1">
            mdi-account
          </v-icon>
          <span class="text-uppercase"> {{ $t('household.profile.member.primary_member') }} </span>
        </v-chip>

        <div v-else-if="canChangePrimary" class="pr-4 mr-1 border-right">
          <v-btn small depressed class="mr-2" data-test="household_profile_member_make_primary_btn" @click="makePrimary">
            <v-icon color="grey darken-3" small class="mr-1">
              mdi-account
            </v-icon>
            <span class="fw-bold"> {{ $t('household.profile.member.make_primary') }}</span>
          </v-btn>
        </div>

        <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
        <rc-tooltip
          v-for="btn in buttons"
          v-if="!btn.hide && (!isPrimaryMember || !btn.additionalMemberOnly)"
          :key="btn.test"
          :disabled="!btn.tooltipText"
          bottom>
          <template #activator="{ on }">
            <v-btn
              icon
              class="ml-2"
              :data-test="`household_profile_member_action_btn_${btn.test}`"
              v-on="on"
              @click="btn.event">
              <v-icon size="24" color="grey darken-2">
                {{ btn.icon }}
              </v-icon>
            </v-btn>
          </template>
          {{ btn.tooltipText }}
        </rc-tooltip>
      </div>
    </div>
    <v-simple-table>
      <tbody class="rc-body12">
        <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
        <tr v-for="item in memberInfo" v-if="isPrimaryMember || !item.primaryMemberOnly" :key="item.label">
          <td class="label py-4 fw-bold" :data-test="`household_profile_member_info_label_${item.test}`">
            {{ $t(item.label) }}
          </td>
          <td v-if="!item.customContent" class="py-4" :data-test="`household_profile_member_info_data_${item.test}`">
            <span class="pre-line line-height-24">
              {{ item.data }}
            </span>
          </td>
          <td v-if="item.customContent === 'name'" :data-test="`household_profile_member_info_data_${item.test}`">
            <span class="pr-4 name-cell border-right">
              {{ member.identitySet.firstName + " " + member.identitySet.lastName }}
            </span>
            <span class="px-4 mr-4 name-cell border-right">
              {{ $t('household.profile.member.middle_name') }}: {{ member.identitySet.middleName || "—" }}
            </span>
            <span class="name-cell">
              {{ $t('household.profile.member.preferred_name') }}: {{ member.identitySet.preferredName || "—" }}
            </span>
          </td>
          <td v-if="item.customContent === 'phoneNumbers'" :data-test="`household_profile_member_info_data_${item.test}`">
            <div class="d-flex flex-column py-4 line-height-24">
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.home') }}: </span>
                {{ householdHelpers.homePhoneNumber(member) }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.mobile') }}: </span>
                {{ householdHelpers.mobilePhoneNumber(member) }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.alternate') }}: </span>
                {{ householdHelpers.alternatePhoneNumber(member) }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.extension') }}:</span>
                {{ householdHelpers.alternatePhoneExtension(member) }}
              </span>
            </div>
          </td>
          <td v-if="item.customContent === 'address'" class="py-4" :data-test="`household_profile_member_info_data_${item.test}`">
            <current-address-template :current-address="member.currentAddress" hide-title />
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <primary-member-dialog
      v-if="showPrimaryMemberDialog"
      :show="showPrimaryMemberDialog"
      :shelter-locations="shelterLocations"
      :member-id="member.id"
      :make-primary-mode="!isPrimaryMember"
      :registration-locations="registrationLocations"
      @cancel="closeAndReload"
      @close="closeAndReload" />

    <add-edit-additional-members
      v-if="showAdditionalMemberDialog"
      :i18n="i18n"
      :show="showAdditionalMemberDialog"
      :index="index"
      :member="member"
      :shelter-locations-list="shelterLocations"
      in-household-profile
      @close="closeAndReload" />

    <split-household-dialog
      v-if="showSplitDialog"
      :show.sync="showSplitDialog"
      :index="index"
      :new-primary-member="member"
      :initial-additional-members="splitAdditionalMembers" />
  </v-sheet>
</template>

<script lang="ts">
import Vue from 'vue';
import { IMember } from '@crctech/registration-lib/src/entities/household-create';
import { CurrentAddressTemplate, AddEditAdditionalMembers } from '@crctech/registration-lib';
import { RcTooltip } from '@crctech/component-library';
import householdHelpers from '@/ui/helpers/household';
import { IEventGenericLocation } from '@/entities/event';

import PrimaryMemberDialog from './PrimaryMemberDialog.vue';
import SplitHouseholdDialog from '../split/SplitHouseholdDialog.vue';

export default Vue.extend({
  name: 'HouseholdMemberCard',
  components: {
    CurrentAddressTemplate,
    PrimaryMemberDialog,
    AddEditAdditionalMembers,
    SplitHouseholdDialog,
    RcTooltip,
  },

  props: {
    /**
     * The data of the member
     */
    member: {
      type: Object as ()=> IMember,
      required: true,
    },
    /**
     * Whether the member is primary
     */
    isPrimaryMember: {
      type: Boolean,
      default: false,
    },
    /**
     * The index of the additional member
     */
    index: {
      type: Number,
      default: -1,
    },
    /**
     * The shelter locations of active events in which the member has an active case file
     */
    shelterLocations: {
      type: Array as ()=> IEventGenericLocation[],
      default: null,
    },
    /**
     * The active registration locations of events in which the member has an active case file
     */
    registrationLocations: {
      type: Array as ()=> IEventGenericLocation[],
      default: null,
    },
  },

  data() {
    return {
      showPrimaryMemberDialog: false,
      showAdditionalMemberDialog: false,
      showSplitDialog: false,
      i18n: this.$i18n,
      householdHelpers,
    };
  },

  computed: {
    buttons() : Array<Record<string, unknown>> {
      return [
        {
          test: 'edit',
          icon: 'mdi-pencil',
          additionalMemberOnly: false,
          event: () => this.openEditDialog(),
          hide: !this.canEdit,
        },
        {
          test: 'transfer',
          icon: 'mdi-call-split',
          additionalMemberOnly: true,
          event: () => { this.showSplitDialog = true; },
          hide: !this.canSplit,
          tooltipText: this.$t('household.profile.split.member.title'),
        },
        {
          test: 'delete',
          icon: 'mdi-delete',
          additionalMemberOnly: true,
          event: this.deleteAdditionalMember,
          hide: !this.canEdit,
        },
      ];
    },

    canChangePrimary():boolean {
      return this.$hasLevel('level2');
    },

    canSplit():boolean {
      return this.$hasLevel('level2');
    },

    canEdit():boolean {
      return this.$hasLevel('level1');
    },

    memberInfo(): Array<Record<string, unknown>> {
      return [
        {
          primaryMemberOnly: false,
          test: 'name',
          label: 'household.profile.member.full_name',
          customContent: 'name',
        },
        {
          primaryMemberOnly: true,
          test: 'email_address',
          label: 'household.profile.member.email_address',
          data: this.member.contactInformation.email || '—',
        },
        {
          test: 'phone_numbers',
          primaryMemberOnly: true,
          label: 'household.profile.member.phone_numbers',
          customContent: 'phoneNumbers',
        },
        {
          test: 'date_of_birth',
          primaryMemberOnly: false,
          label: 'household.profile.member.date_of_birth',
          data: householdHelpers.getBirthDateDisplayWithAge(this.member.identitySet.birthDate) || '—',
        },
        {
          test: 'gender',
          primaryMemberOnly: false,
          label: 'household.profile.member.gender',
          data: householdHelpers.gender(this.member) || '—',
        },
        {
          test: 'indigenous_identity',
          primaryMemberOnly: false,
          label: 'household.profile.member.indigenous_identity',
          data: householdHelpers.indigenousIdentity(this.member) || '—',
        },
        {
          test: 'preferred_language',
          primaryMemberOnly: true,
          label: 'household.profile.member.preferred_language',
          data: householdHelpers.preferredLanguage(this.member) || '—',
        },
        {
          test: 'primary_spoken_language',
          primaryMemberOnly: true,
          label: 'household.profile.member.primary_spoken_language',
          data: householdHelpers.primarySpokenLanguage(this.member) || '—',
        },
        {
          test: 'temporary_address',
          primaryMemberOnly: false,
          label: 'household.profile.member.temporary_address',
          customContent: 'address',
        },
      ];
    },

    displayName(): string {
      return `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
    },

    splitHouseholdMembers() : {primaryMember: IMember, additionalMembers: IMember[]} {
      return this.$store.state.registration.splitHousehold?.splitMembers;
    },

    splitAdditionalMembers() : IMember[] {
      if (this.splitHouseholdMembers?.primaryMember?.id === this.member.id) {
        return this.splitHouseholdMembers.additionalMembers;
      }
      return [];
    },
  },

  created() {
    // When coming back to the household profile page from the household split flow,
    // the split household dialog should open with the correct state
    // (the previously selected additional members involved in the split should be displayed as selected)
    if (this.$storage.registration.getters.isSplitMode()) {
      this.initSplitView();
    }
  },

  methods: {
    initSplitView() {
      if (this.splitHouseholdMembers && this.splitHouseholdMembers?.primaryMember?.id === this.member.id) {
        this.showSplitDialog = true;
      }
    },

    async makePrimary() {
      if (await this.$confirm(this.$t('household.profile.member.make_primary.confirm_title'), null,
        this.$t('household.profile.member.make_primary.confirm_message', { name: this.displayName }).toString())) {
        this.showPrimaryMemberDialog = true;
      }
    },

    openEditDialog() {
      if (this.isPrimaryMember) {
        this.showPrimaryMemberDialog = true;
      } else {
        this.showAdditionalMemberDialog = true;
      }
    },

    async deleteAdditionalMember() {
      const doDelete = await this.$confirm(this.$t('common.delete'),
        this.$t('household.profile.member.delete.message'));
      if (doDelete) {
        const res = await this.$storage.registration.actions.deleteAdditionalMember({
          householdId: this.$storage.registration.getters.householdCreate().id,
          memberId: this.member.id,
          index: this.index,
        });
        if (res) {
          this.$toasted.global.success(this.$t('registration.member.removed'));
        }
      }
    },

    closeAndReload() {
      this.$emit('reload-household-create');
      this.showPrimaryMemberDialog = false;
      this.showAdditionalMemberDialog = false;
    },
  },
});
</script>

<style scoped lang="scss">

  .background {
    background: var(--v-grey-lighten4);
  }

  ::v-deep .v-data-table {
    border-radius: 0;
  }

  .label{
    width: 30%;
    vertical-align: top;
  }

  .pre-line {
    white-space: pre-line;
  }

  .name-cell {
    display: inline-block;
    line-height: 30px;
  }

  .line-height-24{
    line-height: 24px;
  }

  .border-right {
    border-right: 1px solid var(--v-grey-lighten2);
  }
</style>
