import Vue from 'vue';
import _orderBy from 'lodash/orderBy';
import { CaseFileStatus, ICaseFileEntity } from '@libs/entities-lib/case-file';
import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { useEventStore } from '@/pinia/event/event';
import { useCaseFileStore } from '@/pinia/case-file/case-file';
import { UserRoles } from '@libs/entities-lib/user';
import { IHouseholdEntity } from '@libs/entities-lib/household';
import { useHouseholdStore } from '@/pinia/household/household';
import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { usePersonStore } from '@/pinia/person/person';
import { CaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';

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

    members(): IMemberEntity[] {
      if (!this.household?.members) {
        return null;
      }
      return usePersonStore().getByIds(this.household.members);
    },

    readonly(): boolean {
      return (this.caseFile.caseFileStatus !== CaseFileStatus.Open || this.event?.schedule?.status !== +EEventStatus.Open) && !this.$hasLevel(UserRoles.level6);
    },

    individuals(): CaseFileIndividualEntity[] {
      return _orderBy(
        useCaseFileIndividualStore().getByCaseFile(this.caseFileId).map((i) => new CaseFileIndividualEntity(i)),
        [(x) => this.household?.primaryBeneficiary === x.personId, (x) => x.membershipStatus],
        ['desc', 'asc'],
      );
    },
  },
  watch: {
    async household(newValue: IHouseholdEntity, oldValue: IHouseholdEntity) {
      if (newValue?.primaryBeneficiary === oldValue?.primaryBeneficiary && JSON.stringify(newValue?.members) === JSON.stringify(oldValue?.members)) {
        return;
      }

      const individuals = await useCaseFileIndividualStore().fetchAll({ caseFileId: this.caseFileId });
      await usePersonStore().fetchByIds([newValue.primaryBeneficiary, ...individuals.map((i) => i.personId)], true);
    },
  },
});
