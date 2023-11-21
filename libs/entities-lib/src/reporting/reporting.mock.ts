import { mockBaseData } from '../base';

import {
  EnumEntry,
  ObjectName,
  IQuery, ListOption, QueryType, ReportingTopic,
  IPowerBiTokenDetails,
} from './reporting.types';

export const mockQueryEntity = (force?: Partial<IQuery>) : IQuery => ({
  ...mockBaseData(),
  name: 'some query',
  queryType: QueryType.Custom,
  state: 'state',
  topic: ReportingTopic.HouseholdMembers,
  owner: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
  createdBy: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
  ...force,
});

export const mockQueryEntities = () : IQuery[] => [
  mockQueryEntity({ id: '1' }),
  mockQueryEntity({ id: '2', queryType: QueryType.StandardL6en, owner: null, name: 'second' }),
  mockQueryEntity({ id: '3', createdBy: 'd9cd254a-f527-4000-95ea-285442253cda', name: 'mon troisième', topic: ReportingTopic.HouseholdPrimary }),
  mockQueryEntity({ id: '4', createdBy: 'd9cd254a-f527-4000-95ea-285442253cda', name: 'mon quatrième', topic: ReportingTopic.HouseholdPrimary }),
];

export const mockEnums = () : EnumEntry[] => [
  {
    entity: 'AccessLevels',
    english: 'NoAccess',
    french: 'Accès non autorisé',
    value: 0,
  },
  {
    entity: 'AccessLevels',
    english: 'Level1',
    french: 'Niveau d’accès1',
    value: 1,
  },
  {
    entity: 'AccessLevels',
    english: 'Level2',
    french: 'Niveau d’accès2',
    value: 2,
  },
  {
    entity: 'AccessLevels',
    english: 'Level3',
    french: 'Niveau d’accès3',
    value: 4,
  },
  {
    entity: 'DocumentStatus',
    english: 'Past',
    french: 'Passé',
    value: 2,
},
];

export const mockListOptions = () : ListOption[] => [
  {
    id: '0a3fcda4-aedf-4e29-96a0-02732ad6bfd0',
    discriminator: 'FinancialAssistanceCategory',
    english: 'Accommodation',
    french: 'Hébergement',
    orderRank: 1,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    isHidden: false,
    parentListOptionId: null,
  },
  {
    id: '0a3fcda4-aedf-4e29-96a0-02732ad6bfd1',
    discriminator: 'FinancialAssistanceCategory',
    english: 'SubItem EN',
    french: 'SubItem Fr',
    orderRank: 1,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    isHidden: false,
    parentListOptionId: '0a3fcda4-aedf-4e29-96a0-02732ad6bfd0',
  },
  {
    id: 'a35234b9-872c-494d-a3ce-03ce0db3e54f',
    discriminator: 'TaskCategory',
    english: 'New item Tammy',
    french: 'New item Tammy',
    orderRank: 13,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    isHidden: false,
    parentListOptionId: null,
  },
  {
    id: '2c11cb37-d4e0-42f0-a190-075947167ed4',
    discriminator: 'AgreementType',
    english: 'Federal',
    french: 'Fédéral',
    orderRank: 1,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    isHidden: false,
    parentListOptionId: null,
  },
  {
    id: 'e6f12581-65b3-4a3d-bee3-07f0618fb687',
    discriminator: 'PrimarySpokenLanguage',
    english: 'Urdu',
    french: 'Ourdou',
    orderRank: 12,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    isHidden: false,
    parentListOptionId: null,
  },
];

export const mockObjectNames = () : ObjectName[] => [
  {
    id: '0897ee5f-bdee-4e7c-931b-00e4ad633e83',
    english: 'event for Authtencation',
    french: 'event for Authtencation',
  },
  {
    id: '25de82f1-3236-43c5-be08-01118c4e2d77',
    english: 'TEST THIS EVENT',
    french: 'TEST fr',
  },
  {
    id: 'c6accc11-915b-4300-a462-014ae5bf7479',
    english: 'MANITOBA Wilfire 2022',
    french: 'MANITOBA Wilfire 2022',
  },
];

export const mockPowerBiToken = (force?: Partial<IPowerBiTokenDetails>) : IPowerBiTokenDetails => ({
  type: 'Report',
  embedReport: [{ embedUrl: 'some url', reportId: '1', reportName: 'some name', reportPageId: 'pageid' }],
  embedToken: { token: 'token', expiration: '2030-01-01', tokenId: '1' },
  ...force,
});
