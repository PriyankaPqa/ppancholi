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

        <div v-else-if="canEdit" class="pr-4 mr-1 border-right">
          <v-btn small depressed class="mr-2" data-test="household_profile_member_make_primary_btn">
            <v-icon color="grey darken-3" small class="mr-1">
              mdi-account
            </v-icon>
            <span class="fw-bold"> {{ $t('household.profile.member.make_primary') }}</span>
          </v-btn>
        </div>

        <!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->
        <v-btn
          v-for="btn in buttons"
          v-if="!btn.hide && (!isPrimaryMember || !btn.additionalMemberOnly)"
          :key="btn.test"
          icon
          class="ml-2"
          :data-test="`household_profile_member_action_btn_${btn.test}`"
          @click="btn.event">
          <v-icon size="24" color="grey darken-2">
            {{ btn.icon }}
          </v-icon>
        </v-btn>
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
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.home') }}: </span> {{ homePhoneNumber }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.mobile') }}: </span> {{ mobilePhoneNumber }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.alternate') }}: </span> {{ alternatePhoneNumber }}
              </span>
              <span>
                <span class="fw-bold">  {{ $t('household.profile.member.phone_numbers.extension') }}:</span>  {{ alternatePhoneExtension }}
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
import libHelpers from '@crctech/registration-lib/src/ui/helpers';
import {
  EIndigenousTypes, IIndigenousCommunityData, IMember,
} from '@crctech/registration-lib/src/entities/household-create';
import { CurrentAddressTemplate, AddEditAdditionalMembers } from '@crctech/registration-lib';
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
  },

  data() {
    return {
      showPrimaryMemberDialog: false,
      showAdditionalMemberDialog: false,
      showSplitDialog: false,
      i18n: this.$i18n,
    };
  },

  computed: {
    buttons() : Array<Record<string, unknown>> {
      return [
        {
          test: 'edit',
          icon: 'mdi-pencil',
          additionalMemberOnly: false,
          event: this.openEditDialog,
          hide: !this.canEdit,
        },
        {
          test: 'transfer',
          icon: 'mdi-call-split',
          additionalMemberOnly: true,
          event: () => { this.showSplitDialog = true; },
          hide: !this.canSplit,
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
          data: this.birthDate || '—',
        },
        {
          test: 'gender',
          primaryMemberOnly: false,
          label: 'household.profile.member.gender',
          data: this.gender || '—',
        },
        {
          test: 'indigenous_identity',
          primaryMemberOnly: false,
          label: 'household.profile.member.indigenous_identity',
          data: this.indigenousIdentity || '—',
        },
        {
          test: 'preferred_language',
          primaryMemberOnly: true,
          label: 'household.profile.member.preferred_language',
          data: this.preferredLanguage || '—',
        },
        {
          test: 'primary_spoken_language',
          primaryMemberOnly: true,
          label: 'household.profile.member.primary_spoken_language',
          data: this.primarySpokenLanguage || '—',
        },
        {
          test: 'temporary_address',
          primaryMemberOnly: false,
          label: 'household.profile.member.temporary_address',
          customContent: 'address',
        },
      ];
    },

    birthDate(): string {
      const { birthDate } = this.member.identitySet;
      if (!birthDate) return '';

      let result = libHelpers.displayBirthDate(birthDate);
      result += ` (${libHelpers.getAge(birthDate)} ${this.$t('common.years')})`;
      return result;
    },

    displayName(): string {
      return `${this.member.identitySet.firstName} ${this.member.identitySet.lastName}`;
    },

    indigenousIdentity(): string {
      const type = this.member.identitySet.indigenousType
        ? `${this.$t(`common.indigenous.types.${EIndigenousTypes[this.member.identitySet.indigenousType]}`)}, ` : '';

      const community = this.$store.state.registration.indigenousCommunities
        .find((i: IIndigenousCommunityData) => i.id === this.member.identitySet.indigenousCommunityId);

      let communityName = '';
      if (this.member.identitySet.indigenousType === EIndigenousTypes.Other) {
        communityName = `${this.member.identitySet.indigenousCommunityOther}`;
      } else if (this.member.identitySet.indigenousType && community) {
        communityName = `${community.communityName}`;
      }
      return type + communityName;
    },

    gender(): string {
      if (!this.member.identitySet?.gender) return '';
      if (this.member.identitySet.genderOther) return this.member.identitySet.genderOther;
      return this.$m(this.member.identitySet.gender.name);
    },

    preferredLanguage(): string {
      if (!this.member.contactInformation?.preferredLanguage) return '';
      if (this.member.contactInformation.preferredLanguage.isOther) return this.member.contactInformation.preferredLanguageOther;
      return this.$m(this.member.contactInformation.preferredLanguage.name);
    },

    primarySpokenLanguage(): string {
      if (!this.member.contactInformation?.primarySpokenLanguage) return '';
      if (this.member.contactInformation.primarySpokenLanguage.isOther) return this.member.contactInformation.primarySpokenLanguageOther;
      return this.$m(this.member.contactInformation.primarySpokenLanguage.name);
    },

    mobilePhoneNumber(): string {
      if (this.member.contactInformation?.mobilePhoneNumber?.number) {
        return this.member.contactInformation?.mobilePhoneNumber.number;
      }
      return '—';
    },

    homePhoneNumber(): string {
      if (this.member.contactInformation?.homePhoneNumber?.number) {
        return this.member.contactInformation.homePhoneNumber.number;
      }
      return '—';
    },

    alternatePhoneNumber(): string {
      if (this.member.contactInformation?.alternatePhoneNumber?.number) {
        return this.member.contactInformation.alternatePhoneNumber.number;
      }
      return '—';
    },

    alternatePhoneExtension(): string {
      if (this.member.contactInformation?.alternatePhoneNumber?.extension) {
        return this.member.contactInformation.alternatePhoneNumber.extension;
      }
      return '—';
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
