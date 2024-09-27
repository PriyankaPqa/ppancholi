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
import { CaseFileIndividualEntity, MembershipStatus } from '@libs/entities-lib/case-file-individual';
import { useCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual';
import { Status } from '@libs/shared-lib/types';

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

    activeIndividuals(): CaseFileIndividualEntity[] {
      return this.individuals.filter((i) => i.membershipStatus === MembershipStatus.Active && this.members?.find((m) => m.id === i.personId && m.status === Status.Active));
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

  methods: {
    // these are loaded when in the case file page.  if you need this outside of the main page
    // these insure we have all the getters ready
    async loadMissingCaseFileDetails() {
      const cf = (await useCaseFileStore().fetchByIds([this.id], true))[0];
      await useEventStore().fetchByIds([cf?.eventId], true);
      const hh = (await useHouseholdStore().fetchByIds([cf?.householdId], true))[0];
      const individuals = await useCaseFileIndividualStore().fetchAll({ caseFileId: this.caseFileId });
      await usePersonStore().fetchByIds([hh?.primaryBeneficiary, ...individuals.map((i) => i.personId)], true);
    },
  },
});
