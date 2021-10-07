/* eslint-disable no-nested-ternary */
import { mockHouseholdEntity, mockHouseholdMetadata } from '../../household';
import { mockMember, mockMemberMetadata } from '../member';
import { IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';

export const mockVersionedEntity = (type?: string, force?: Partial<IVersionedEntity>): IVersionedEntity => ({
  versionId: '60983874-18bb-467d-b55a-94dc55818151',
  timestamp: '2021-01-01',
  userName: 'Jane Smith',
  roleName: { translation: { en: 'Admin' } },
  entity: type === 'householdMetadata' ? mockHouseholdMetadata({ id: '1' })
    : type === 'householdMember' ? mockMember()
      : type === 'memberMetadata' ? mockMemberMetadata({ id: '1' })
        : mockHouseholdEntity({ id: '1' }),
  previousEntity: type === 'householdMetadata' ? mockHouseholdMetadata({ id: '1' })
    : type === 'householdMember' ? mockMember({ id: '1' })
      : type === 'memberMetadata' ? mockMemberMetadata({ id: '1' })
        : mockHouseholdEntity({ id: '1' }),
  ...force,
});

export const mockVersionedEntityCombined = (
  entityType? : string,
  force? : Partial<IVersionedEntityCombined>,
  householdLastAction?: string,
  memberLastAction? : string,
): IVersionedEntityCombined => ({
  versionId: '60983874-18bb-467d-b55a-94dc55818151',
  timestamp: '2021-01-01',
  userName: 'John Smith',
  roleName: { translation: { en: 'Admin' } },
  entityType,
  entity: entityType === 'householdMember' ? mockMember({ id: '1', lastAction: memberLastAction }) : mockHouseholdEntity({ id: '1', lastAction: householdLastAction }),
  previousEntity: entityType === 'householdMember' ? mockMember({ id: '1' }) : mockHouseholdEntity({ id: '1' }),
  metadata: entityType === 'householdMember' ? mockMemberMetadata({ id: '1' }) : mockHouseholdMetadata({ id: '1' }),
  previousMetadata: entityType === 'householdMember' ? mockMemberMetadata({ id: '1' }) : mockHouseholdMetadata({ id: '1' }),
  getTemplateData: jest.fn(),
  getLastActionName: jest.fn(),
  ...force,
});
