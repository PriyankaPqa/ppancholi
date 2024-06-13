import { CaseFileStatusUpdateReason, getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';
import { CaseFileStatus } from '@libs/entities-lib/src/case-file';
import { IEventEntity } from '@libs/entities-lib/src/event';
import { IMassActionCaseFileStatusCreatePayload } from '@libs/services-lib/src/mass-actions/entity';
import { IListOption } from '@libs/shared-lib/src/types';

// eslint-disable-next-line
export const mockCreateMassCaseFileStatusUpdateRequest = (event: IEventEntity, force?: Partial<IMassActionCaseFileStatusCreatePayload>): IMassActionCaseFileStatusCreatePayload => ({
  name: `test mass case file status update- ${getCurrentDateString()} - s${getRandomNumber()}`,
  description: 'description mass action case file status update',
  eventId: '',
  status: CaseFileStatus.Inactive,
  reason: {
    optionItemId: CaseFileStatusUpdateReason.Inactive,
    specifiedOther: null,
  },
  rationale: 'test rationale',
  search: null,
  filter: `?$filter=Entity/EventId eq ${event.id} and Entity/Status eq 'Active'`,
  ...force,
});

export interface MockCreateMassCaseFileStatusUpdateFileRequestParams {
  eventId: string,
  reason: IListOption,
  rationale: string,
  status: number,
  fileContents: string
}

export const mockCreateMassCaseFileStatusUpdateFileRequest = (params: MockCreateMassCaseFileStatusUpdateFileRequestParams) => {
  const data = new FormData();

  data.append('eventId', params.eventId);
  data.append('reason', JSON.stringify(params.reason));
  data.append('rationale', params.rationale);
  data.append('status', params.status.toString());
  data.append('name', `test mass case file status update - ${getCurrentDateString()} - s${getRandomNumber()}`);
  data.append('description', 'description mass case file status update via upload file');

  const blob = new Blob([params.fileContents], { type: 'text/csv' });
  data.append('file', blob);
  const payload = data;
  return payload;
};
