import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { mockMember } from '@libs/entities-lib/household-create';
import { MembershipStatus, mockCaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { Status } from '@libs/shared-lib/src/types';

// creates data which makes sense together of 1 case file with 2 active individuals and a household with 4 active members
export class CaseFileDetailsMock {
  public mocks = {
    caseFile: mockCaseFileEntity({ id: 'cf-id', eventId: 'event-id', householdId: 'household-id', caseFileStatus: CaseFileStatus.Open }),
    event: mockEventEntity({ id: 'event-id' }),
    // member 4 isnt part of this case file, member 5 was deleted
    members: [mockMember({ id: 'primary-1' }), mockMember({ id: 'personId-2' }), mockMember({ id: 'personId-3' }), mockMember({ id: 'personId-4' }),
      mockMember({ id: 'personId-5', status: Status.Inactive })],
    household: mockHouseholdEntity({ id: 'household-id', members: ['primary-1', 'personId-2', 'personId-3', 'personId-4', 'personId-5'], primaryBeneficiary: 'primary-1' }),
    individuals: [
      mockCaseFileIndividualEntity({ id: 'indv-1', personId: 'primary-1' }),
      mockCaseFileIndividualEntity({ id: 'indv-2', personId: 'personId-2' }),
      mockCaseFileIndividualEntity({ id: 'indv-3', personId: 'personId-3', membershipStatus: MembershipStatus.Removed }),
      mockCaseFileIndividualEntity({ id: 'indv-4', personId: 'personId-5' }),
    ],
  };

  public propsData = {
    id: 'cf-id',
  };

  public computed: any;

  public constructor() {
    this.mocks.event.schedule.status = EEventStatus.Open;
    const mock = this.mocks;

    this.computed = {
      caseFile() {
        return mock.caseFile;
      },
      event() {
        return mock.event;
      },
      household() {
        return mock.household;
      },
      primaryMember() {
        return mock.members[0];
      },
      members() {
        return mock.members;
      },
      individuals() {
        return mock.individuals;
      },
    };
  }
}
