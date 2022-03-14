<template>
  <rc-dialog
    :title="$t('household.profile.split.member.title')"
    :show.sync="show"
    :cancel-action-label="$t('common.buttons.cancel')"
    :submit-action-label="$t('common.buttons.next')"
    :content-only-scrolling="true"
    fullscreen
    persistent
    show-close
    @close="onClose"
    @cancel="onClose"
    @submit="onNext">
    <v-row class="justify-center">
      <v-col cols="12" md="6">
        <h3 class="pt-4 pb-2">
          {{ $t('household.profile.split.title.new_household_profile') }}
        </h3>
        <v-sheet rounded outlined class="pb-2">
          <table width="100%">
            <thead>
              <tr>
                <th class="pa-4" style="text-align: left" width="40%">
                  <span class="rc-body18 fw-bold" data-test="household_profile_split_new_primary_member_name">
                    {{ displayName(newPrimaryMember) }}
                  </span>
                </th>
                <th style="text-align: right">
                  <v-chip
                    class="px-2 mr-4 "
                    small
                    label
                    color="grey darken-2"
                    outlined
                    data-test="household_profile_member_primary_member_label">
                    <v-icon color="secondary" small class="mr-1">
                      mdi-account
                    </v-icon>
                    <span class="text-uppercase chip "> {{ $t('household.profile.member.primary_member') }} </span>
                  </v-chip>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in memberInfo(newPrimaryMember)" :key="item.label" class="rc-body14">
                <td
                  style="vertical-align: top"
                  class="label px-4 pb-1 fw-bold"
                  :data-test="`household_profile_primary_member_split_label_${item.test}`">
                  {{ $t(item.label) }}
                </td>
                <td v-if="!item.customContent" class="pb-1" :data-test="`household_profile_primary_member_split_data_${item.test}`">
                  <span class="pre-line line-height-24">
                    {{ item.data }}
                  </span>
                </td>
                <td v-if="item.customContent === 'address'" class="address" :data-test="`household_profile_member_info_data_${item.test}`">
                  <current-address-template :current-address="newPrimaryMember.currentAddress" hide-title />
                </td>
              </tr>
            </tbody>
          </table>
        </v-sheet>

        <h3 v-if="additionalMembers.length" class="pt-10 pb-2">
          {{ $t('household.profile.split.title.transfer_household_member') }}
        </h3>

        <v-sheet v-for="member in additionalMembers" :key="member.id" rounded outlined class="mb-2 pb-2">
          <table width="100%">
            <thead>
              <tr>
                <th width="5%" class="pl-2">
                  <v-checkbox
                    v-model="selectedMembers"
                    data-test="checkbox_member"
                    :value="member" />
                </th>
                <th class="py-4" style="text-align: left" width="35%">
                  <span class="rc-body18 fw-bold" data-test="household_profile_split_additional_member_name"> {{ displayName(member) }} </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in memberInfo(member)" :key="item.label" class="rc-body14">
                <td />
                <td
                  style="vertical-align: top"
                  class="label pb-1 fw-bold"
                  :data-test="`household_profile_additional_member_split_label_${item.test}`">
                  {{ $t(item.label) }}
                </td>
                <td v-if="!item.customContent" class="pb-1" :data-test="`household_profile_additional_member_split_data_${item.test}`">
                  <span class="pre-line line-height-24">
                    {{ item.data }}
                  </span>
                </td>
                <td v-if="item.customContent === 'address'" :data-test="`household_profile_member_info_data_${item.test}`">
                  <current-address-template :current-address="member.currentAddress" hide-title />
                </td>
              </tr>
            </tbody>
          </table>
        </v-sheet>
      </v-col>
    </v-row>
  </rc-dialog>
</template>

<script lang='ts'>
import Vue from 'vue';
import { RcDialog } from '@libs/component-lib/components';
import libHelpers from '@libs/registration-lib/ui/helpers';
import { EIndigenousTypes, IIndigenousCommunityData, IMember } from '@libs/registration-lib/entities/household-create';
import CurrentAddressTemplate from '@libs/registration-lib/components/review/addresses/CurrentAddressTemplate.vue';
import routes from '@/constants/routes';

export default Vue.extend({
  name: 'SplitHouseholdDialog',

  components: {
    RcDialog,
    CurrentAddressTemplate,
  },

  props: {
    show: {
      type: Boolean,
      required: true,
    },
    newPrimaryMember: {
      type: Object as () => IMember,
      required: true,
    },
    initialAdditionalMembers: {
      type: Array as () => IMember[],
      default: () => [] as IMember[],
    },
  },

  data() {
    return {
      selectedMembers: [] as IMember[],
    };
  },

  computed: {
    additionalMembers(): IMember[] {
      const allMembers = this.$storage.registration.getters.householdCreate().additionalMembers;
      if (allMembers) {
        return allMembers.filter((m) => m.id !== this.newPrimaryMember.id);
      }
      return [];
    },

    householdId(): string {
      return this.$storage.registration.getters.householdCreate().id;
    },

    memberInfo(): (member:IMember) => Array<Record<string, unknown>> {
      return (member:IMember) => [
        {
          test: 'date_of_birth',
          label: 'household.profile.member.date_of_birth',
          data: this.getBirthDate(member) || '-',
        },
        {
          test: 'gender',
          label: 'household.profile.member.gender',
          data: this.getGender(member) || '-',
        },
        {
          test: 'indigenous_identity',
          primaryMemberOnly: false,
          label: 'household.profile.member.indigenous_identity',
          data: this.getIndigenousIdentity(member) || '-',
        },
        {
          test: 'temporary_address',
          label: 'household.profile.member.temporary_address',
          customContent: 'address',
        },
      ];
    },

    displayName(): (member:IMember)=>string {
      return (member:IMember) => `${member.identitySet.firstName} ${member.identitySet.lastName}`;
    },

  },

  created() {
    if (this.initialAdditionalMembers) {
      this.selectedMembers = this.initialAdditionalMembers;
    }
  },

  methods: {
    getBirthDate(member: IMember): string {
      const { birthDate } = member.identitySet;
      if (!birthDate) {
        return '';
      }

      let result = libHelpers.displayBirthDate(birthDate);
      result += ` (${libHelpers.getAge(birthDate)} ${this.$t('common.years')})`;
      return result;
    },

    getGender(member: IMember): string {
      if (!member.identitySet?.gender) {
        return '';
      }
      if (member.identitySet.genderOther) {
        return member.identitySet.genderOther;
      }
      return this.$m(member.identitySet.gender.name);
    },

    getIndigenousIdentity(member: IMember): string {
      const type = member.identitySet.indigenousType
        ? `${this.$t(`common.indigenous.types.${EIndigenousTypes[member.identitySet.indigenousType]}`)}, ` : '';

      const community = this.$store.state.registration.indigenousCommunities
        .find((i: IIndigenousCommunityData) => i.id === member.identitySet.indigenousCommunityId);

      let communityName = '';
      if (member.identitySet.indigenousType === EIndigenousTypes.Other) {
        communityName = `${member.identitySet.indigenousCommunityOther}`;
      } else if (member.identitySet.indigenousType && community) {
        communityName = `${community.communityName}`;
      }
      return type + communityName;
    },

    onClose() {
      this.$storage.registration.mutations.resetSplitHousehold();
      this.$emit('update:show', false);
    },

    async onNext() {
      this.$storage.registration.mutations.setSplitHousehold({
        originHouseholdId: this.householdId,
        primaryMember: this.newPrimaryMember,
        additionalMembers: this.selectedMembers,
      });

      this.$router.push({
        name: routes.household.householdSplit.name,
        params: {
          id: this.householdId,
        },
      });
    },
  },
});

</script>

<style scoped lang="scss">
.chip {
  font-size: 10px;
  padding-top: 2px;
}
</style>
