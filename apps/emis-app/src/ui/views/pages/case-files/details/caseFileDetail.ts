import Vue from 'vue';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { useHouseholdStore } from '@/pinia/household/household';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { usePersonStore } from '@/pinia/person/person';

export default Vue.extend({
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {

    caseFileId(): string {
      return this.id;
    },

    caseFile(): ICaseFileEntity {
      return useCaseFileStore().getById(this.caseFileId);
    },

    event(): IEventEntity {
      if (!this.caseFile?.eventId) {
        return null;
      }
      return useEventStore().getById(this.caseFile.eventId);
    },

    household(): IHouseholdEntity {
      if (!this.caseFile?.householdId) {
        return null;
      }
      return useHouseholdStore().getById(this.caseFile.householdId);
    },

    primaryMember(): IMemberEntity {
      if (!this.household?.primaryBeneficiary) {
        return null;
      }
      return usePersonStore().getById(this.household.primaryBeneficiary);
    },

    readonly(): boolean {
      return (this.caseFile.caseFileStatus !== CaseFileStatus.Open || this.event?.schedule?.status !== +EEventStatus.Open) && !this.$hasLevel(UserRoles.level6);
    },
  },
  watch: {
    async household(newValue: IHouseholdEntity, oldValue: IHouseholdEntity) {
      if (newValue?.primaryBeneficiary === oldValue?.primaryBeneficiary) {
        return;
      }
      await usePersonStore().fetchByIds([newValue.primaryBeneficiary], true);
    },
  },
});
