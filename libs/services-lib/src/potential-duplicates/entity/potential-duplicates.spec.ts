import { DuplicateReason } from '@libs/entities-lib/potential-duplicate';
import { IHttpMock, mockHttp } from '../../http-client';
import { PotentialDuplicatesService } from './potential-duplicates';

describe('>>> Potential Duplicate Service', () => {
  let http: IHttpMock;
  let service: PotentialDuplicatesService;

  beforeEach(() => {
    jest.clearAllMocks();
    http = mockHttp();
    service = new PotentialDuplicatesService(http as never);
  });

describe('getHouseholds', () => {
  it('is linked to the correct URL and params', async () => {
    const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
    await service.getHouseholds(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/households`);
  });
});

describe('getDuplicates', () => {
  it('is linked to the correct URL and params', async () => {
    const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
    await service.getDuplicates(id);
    expect(http.get).toHaveBeenCalledWith(`${service.baseUrl}/${id}/duplicates`);
  });
});

describe('flagNewDuplicate', () => {
  it('is linked to the correct URL and params', async () => {
    const householdIds = ['0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3', '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c4'];
    const duplicateReasons = [DuplicateReason.HomePhoneNumber];
    const rationale = 'rationale';
    const memberFirstName = 'John';
    const memberLastName = 'Smith';
    await service.flagNewDuplicate({ householdIds, duplicateReasons, rationale, memberFirstName, memberLastName });
    expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}/duplicates`, { householdIds, duplicateReasons, rationale, memberFirstName, memberLastName });
  });
});

describe('flagDuplicate', () => {
  it('is linked to the correct URL and params', async () => {
    const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c4';
    const rationale = 'rationale';

    await service.flagDuplicate(id, rationale);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/flag-duplicates`, { rationale });
  });
});

describe('resolveDuplicate', () => {
  it('is linked to the correct URL and params', async () => {
    const id = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c4';
    const rationale = 'rationale';
    await service.resolveDuplicate(id, rationale);
    expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/resolve-duplicates`, { rationale });
  });
});
});
