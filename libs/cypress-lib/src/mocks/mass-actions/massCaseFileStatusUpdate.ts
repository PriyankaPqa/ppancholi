import { getCurrentDateString, getRandomNumber, reasonCaseFileStatusUpdate } from '@libs/cypress-lib/helpers';
import { CaseFileStatus } from '@libs/entities-lib/src/case-file';
import { IEventEntity } from '@libs/entities-lib/src/event';
import { IMassActionCaseFileStatusCreatePayload } from '@libs/services-lib/src/mass-actions/entity';

// eslint-disable-next-line
export const mockCreateMassCaseFileStatusUpdateRequest = (event: IEventEntity, force?: Partial<IMassActionCaseFileStatusCreatePayload>): IMassActionCaseFileStatusCreatePayload => ({
  name: `test mass case file status update- ${getCurrentDateString()} - s${getRandomNumber()}`,
  description: 'description mass action case file status update',
  eventId: '',
  status: CaseFileStatus.Inactive,
  reason: {
    optionItemId: reasonCaseFileStatusUpdate.Deceased,
    specifiedOther: null,
  },
  rationale: 'test rationale',
  search: null,
  filter: `?$filter=Entity/EventId eq ${event.id} and Entity/Status eq 'Active'`,
  ...force,
});
