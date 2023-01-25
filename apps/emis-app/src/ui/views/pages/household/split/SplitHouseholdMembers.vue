<template>
  <v-row justify="center">
    <v-col cols="12" md="8">
      <div v-for="(member, index) in members" :key="member.id">
        <additional-member-section
          :key="member.id"
          :show-edit-button="false"
          :show-delete-button="false"
          :data-test="`additionalMember_${index}`"
          :member="member">
          <additional-member-template :member="member" />
        </additional-member-section>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import AdditionalMemberTemplate from '@libs/registration-lib/components/review/additional-members/AdditionalMemberTemplate.vue';
import AdditionalMemberSection from '@libs/registration-lib/components/review/additional-members/AdditionalMemberSection.vue';
import { IMember } from '@libs/entities-lib/value-objects/member';
import { useRegistrationStore } from '@/pinia/registration/registration';

export default Vue.extend({
  name: 'SplitHouseholdMembers',

  components: {
    AdditionalMemberTemplate,
    AdditionalMemberSection,
  },

  computed: {
    members(): IMember[] {
      return useRegistrationStore().getHouseholdCreate().additionalMembers;
    },
  },
});

</script>
