import { i18n } from '../../../ui/plugins/i18n';
import { mockBaseEntity } from '../../base/base.mock';
import helpers from '../../../ui/helpers';

import { VersionedEntityCombined } from '.';
import { mockVersionedEntity } from './versionedEntity.mock';
import { Address, mockAddress } from '../address';
import { mockMemberMetadata, mockMember } from '../member';
import { CurrentAddress, ECurrentAddressTypes } from '../current-address';

const mockEntity = mockVersionedEntity();
const mockMetadata = mockVersionedEntity('householdMetadata');

describe('>>> Versioned Entity', () => {
  describe('>> constructor', () => {
    it('should instantiate versionId', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.versionId).toBe(mockEntity.versionId);
    });

    it('should instantiate timestamp', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.timestamp).toBe(mockEntity.timestamp);
    });

    it('should instantiate userName', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.userName).toBe(mockEntity.userName);
    });

    it('should instantiate roleName', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.roleName).toBe(mockEntity.roleName);
    });

    it('should instantiate entityType', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entityType).toBe(mockEntity.entityType);
    });

    it('should instantiate entity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entity).toBe(mockEntity.entity);
    });

    it('should instantiate previousEntity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousEntity).toBe(mockEntity.previousEntity);
    });

    it('should instantiate metadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.metadata).toBe(mockMetadata.entity);
    });

    it('should instantiate previousMetadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousMetadata).toBe(mockMetadata.previousEntity);
    });
  });

  describe('getLastActionName', () => {
    it('returns the right data if entity type is household and last action AddMember', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'AddMember' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.household_member_added');
    });
    it('returns the right data if entity type is household and last action RemoveMember', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'RemoveMember' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.household_member_removed');
    });
    it('returns the right data if entity type is household and last action UpdateAddress', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'UpdateAddress' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.address_information_changed');
    });
    it('returns the right data if entity type is household and last action SetNoFixedAddress', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'SetNoFixedAddress' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.no_fixed_address_set');
    });
    it('returns the right data if entity type is household member and last action UpdateContactInformation', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateContactInformation' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.contact_information_changed');
    });
    it('returns the right data if entity type is household member and last action UpdateCurrentAddress', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateCurrentAddress' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.temporary_address_changed');
    });
    it('returns the right data if entity type is household member and last action UpdateIdentitySet', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateIdentitySet' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      expect(entity.getLastActionName()).toEqual('household.history.action.personal_information_changed');
    });
  });

  describe('getTemplateData', () => {
    describe('entity type - household', () => {
      it('calls makeEmptyTemplate for the previous entity if  last action Created ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'Created' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });

      it('calls makeAddMemberTemplate for the current entity if  last action Created', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'Created' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);

        expect(entity.makeAddMemberTemplate).toHaveBeenCalled();
      });

      it('returns null if last action Activate', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'Activate' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();

        expect(entity.getTemplateData([entity], false, i18n)).toBeNull();
      });

      it('returns null if  last action Deactivate', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'Deactivate' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();

        expect(entity.getTemplateData([entity], false, i18n)).toBeNull();
      });

      it('calls makeHomeTemplate for the previous entity if last action SetNoFixedAddress', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'SetNoFixedAddress' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeHomeTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);

        expect(entity.makeHomeTemplate).toHaveBeenCalled();
      });

      it('calls makeEmptyTemplate for the current entity if last action SetNoFixedAddress ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'SetNoFixedAddress' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });

      it('calls makeHomeTemplate if last action UpdateAddress', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'UpdateAddress' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeHomeTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);

        expect(entity.makeHomeTemplate).toHaveBeenCalled();
      });

      it('calls makeEmptyTemplate for the previous entity if last action AddMember ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'AddMember' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });

      it('calls makeAddMemberTemplate for the current entity if last action AddMember ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'AddMember' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);
        expect(entity.makeAddMemberTemplate).toHaveBeenCalled();
      });

      it('calls makeRemoveMemberTemplate for the previous entity if last action RemoveMember ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'RemoveMember' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeRemoveMemberTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makeRemoveMemberTemplate).toHaveBeenCalled();
      });

      it('calls makeEmptyTemplate for the current entity if last action RemoveMember ', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'RemoveMember' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });

      it('calls makeEmptyTemplate for the current entity if entity type is not known', () => {
        const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'foo' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });
    });

    describe('entity type - household member', () => {
      it('returns null if  last action is Created', () => {
        const entityData = mockVersionedEntity('householdMember', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'Created' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();

        expect(entity.getTemplateData([entity], false, i18n)).toBeNull();
      });

      it('returns null if last action is Activate', () => {
        const entityData = mockVersionedEntity('householdMember', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'Activate' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();

        expect(entity.getTemplateData([entity], false, i18n)).toBeNull();
      });

      it('returns null if last action Deactivate', () => {
        const entityData = mockVersionedEntity('householdMember', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'Deactivate' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeAddMemberTemplate = jest.fn();

        expect(entity.getTemplateData([entity], false, i18n)).toBeNull();
      });

      it('calls makeContactInfoTemplate if last action UpdateContactInformation ', () => {
        const entityData = mockVersionedEntity('householdMember',
          { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateContactInformation' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeContactInfoTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makeContactInfoTemplate).toHaveBeenCalled();
      });

      it('calls makePersonalInfoTemplate if last action UpdateIdentitySet ', () => {
        const entityData = mockVersionedEntity('householdMember',
          { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateIdentitySet' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makePersonalInfoTemplate = jest.fn();
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makePersonalInfoTemplate).toHaveBeenCalled();
      });

      it('calls makeMemberNameTemplate and makeTemporaryAddressTemplate if last action UpdateCurrentAddress ', () => {
        const entityData = mockVersionedEntity('householdMember',
          { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'UpdateCurrentAddress' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeMemberNameTemplate = jest.fn(() => ([]));
        entity.makeTemporaryAddressTemplate = jest.fn(() => ([]));
        entity.getTemplateData([entity], true, i18n);
        expect(entity.makeMemberNameTemplate).toHaveBeenCalled();
        expect(entity.makeTemporaryAddressTemplate).toHaveBeenCalled();
      });

      it('calls makeEmptyTemplate for the current entity if entity type is not known', () => {
        const entityData = mockVersionedEntity('householdMember', { entityType: 'householdMember', entity: { ...mockBaseEntity(), lastAction: 'foo' } });
        const entity = new VersionedEntityCombined(entityData, mockMetadata);
        entity.makeEmptyTemplate = jest.fn();
        entity.getTemplateData([entity], false, i18n);
        expect(entity.makeEmptyTemplate).toHaveBeenCalled();
      });
    });
  });

  describe('makeHomeTemplate', () => {
    it('calls the helper getAddressLines and returns the right data', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), address: { address: mockAddress() } } });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMetadata);

      jest.spyOn(helpers, 'getAddressLines').mockImplementation(() => (['120 East Str.', '12345, NY, New York']));
      const expected = versionedEntity.makeHomeTemplate(versionedEntity.entity, i18n);
      expect(helpers.getAddressLines).toHaveBeenCalledWith(new Address(mockAddress()), i18n);
      expect(expected).toEqual([{ label: 'household.history.label.home_address', value: '120 East Str.\n12345, NY, New York' }]);
    });
  });

  describe('makeContactInfoTemplate', () => {
    it('calls makeMemberNameTemplate and returns the right data', async () => {
      const entityData = mockVersionedEntity('householdMember');
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      versionedEntity.makeMemberNameTemplate = jest.fn(() => ([{ label: 'member', value: 'John Smith' }]));

      const expected = versionedEntity.makeContactInfoTemplate(mockMember(), mockMemberMetadata(), i18n);
      expect(versionedEntity.makeMemberNameTemplate).toHaveBeenCalledWith(mockMember());

      expect(expected).toEqual([
        { label: 'member', value: 'John Smith' },
        {
          label: 'household.history.label.email',
          value: mockMember().contactInformation.email,
        },
        {
          label: 'household.history.label.home_phone',
          value: mockMember().contactInformation.homePhoneNumber.number,
        },
        {
          label: 'household.history.label.mobile_phone',
          value: mockMember().contactInformation.mobilePhoneNumber.number,
        },
        {
          label: 'household.history.label.alternate_phone',
          value: mockMember().contactInformation.alternatePhoneNumber.number,
        },
        {
          label: 'household.history.label.preferred_language',
          value: mockMemberMetadata().preferredLanguageName.translation.en,
        },
        {
          label: 'household.history.label.primary_spoken_language',
          value: mockMemberMetadata().primarySpokenLanguageName.translation.en,
        },
      ]);
    });
  });

  describe('makePersonalInfoTemplate', () => {
    it('calls makeMemberNameTemplate and getBirthDateAndAge helper and returns the right data', () => {
      const entityData = mockVersionedEntity('householdMember');
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      versionedEntity.makeMemberNameTemplate = jest.fn(() => ([{ label: 'member', value: 'John Smith' }]));
      jest.spyOn(helpers, 'getBirthDateAndAge').mockImplementation(() => ('Jan 13, 1955 (66 years)'));

      const expected = versionedEntity.makePersonalInfoTemplate(mockMember(), mockMemberMetadata(), i18n);

      expect(helpers.getBirthDateAndAge).toHaveBeenCalledWith(mockMember().identitySet.dateOfBirth, i18n);
      expect(versionedEntity.makeMemberNameTemplate).toHaveBeenCalledWith(mockMember());
      expect(expected).toEqual([
        { label: 'member', value: 'John Smith' },
        {
          label: 'household.history.label.date_of_birth',
          value: 'Jan 13, 1955 (66 years)',
        },
        {
          label: 'household.history.label.gender',
          value: mockMemberMetadata().genderName.translation.en,
        },
        {
          label: 'household.history.label.indigenous_identity',
          value: `First Nation, ${mockMemberMetadata().indigenousIdentityName}`,
        },
      ]);
    });
  });
  describe('makeTemporaryAddressTemplate', () => {
    it('returns the right address if the address is a shelter', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: { ...mockMember(), currentAddress: { shelterLocationId: 'mock-id', addressType: ECurrentAddressTypes.Shelter } },
      });
      const metadata = mockMemberMetadata({ shelterLocationName: { translation: { en: 'Mock Shelter Location' } } });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      expect(versionedEntity.makeTemporaryAddressTemplate(entityData.entity, metadata, i18n)).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'Shelter, Mock Shelter Location',
        },
      ]);
    });

    it('calls getAddressLines helper and returns the right address if the address has a place name and number', () => {
      jest.spyOn(helpers, 'getAddressLines').mockImplementation(() => (['120 East Str.', '12345, NY, New York']));
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: {
          ...mockMember(),
          currentAddress: new CurrentAddress({
            placeName: 'Mock Place Name',
            placeNumber: '1234',
            addressType: ECurrentAddressTypes.HotelMotel,
            address: mockAddress(),
          }),
        },
      });

      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      const expected = versionedEntity.makeTemporaryAddressTemplate(entityData.entity, mockMemberMetadata(), i18n);

      expect(helpers.getAddressLines).toHaveBeenCalledWith(new Address(mockAddress()), i18n);
      expect(expected).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York',
        },
      ]);
    });
    it('calls getAddressLines helper and returns the right address if the address has no place name and number', () => {
      jest.spyOn(helpers, 'getAddressLines').mockImplementation(() => (['120 East Str.', '12345, NY, New York']));
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: {
          ...mockMember(),
          currentAddress: new CurrentAddress({
            placeName: null,
            placeNumber: null,
            addressType: ECurrentAddressTypes.FriendsFamily,
            address: mockAddress(),
          }),
        },
      });

      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      const expected = versionedEntity.makeTemporaryAddressTemplate(entityData.entity, mockMemberMetadata(), i18n);

      expect(helpers.getAddressLines).toHaveBeenCalledWith(new Address(mockAddress()), i18n);
      expect(expected).toEqual([
        {
          label: 'household.history.label.temporary_address',
          value: 'Friends / Family, \n120 East Str.,\n12345, NY, New York',
        },
      ]);
    });
  });

  describe('makeAddMemberTemplate', () => {
    it('calls makeFullMemberTemplate with the right payload and returns the right data', () => {
      const entityData = mockVersionedEntity('household', {
        entityType: 'household',
        entity: { ...mockBaseEntity(), members: ['id-1', 'id-2'] },
        previousEntity: { ...mockBaseEntity(), members: [] },
      });

      const memberEntity1 = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: mockMember({ id: 'id-1', lastAction: 'Created' }),
        metadata: mockMemberMetadata(),
      });
      const memberEntity2 = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: mockMember({ id: 'id-2', lastAction: 'Created' }),
        metadata: mockMemberMetadata(),
      });

      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      versionedEntity.makeFullMemberTemplate = jest.fn(() => ([{ label: 'foo', value: 'bar' }]));
      versionedEntity.makeEmptyLine = jest.fn(() => ([{ label: '\n', value: '' }]));

      const expected = versionedEntity.makeAddMemberTemplate([entityData, memberEntity1, memberEntity2]);

      expect(versionedEntity.makeFullMemberTemplate).toHaveBeenCalledTimes(2);
      expect(expected).toEqual([
        { label: 'foo', value: 'bar' },
        { label: '\n', value: '' },
        { label: 'foo', value: 'bar' },
      ]);
    });
  });

  describe('makeRemoveMemberTemplate', () => {
    it('calls makeFullMemberTemplate with the right payload and returns the right data', () => {
      const entityData = mockVersionedEntity('household', {
        entityType: 'household',
        entity: { ...mockBaseEntity(), members: ['id-2'] },
        previousEntity: { ...mockBaseEntity(), members: ['id-1', 'id-2'] },
      });

      const memberEntity1 = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: mockMember({ id: 'id-1', lastAction: 'Deactivate' }),
        metadata: mockMemberMetadata(),
      });
      const memberEntity2 = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
        entity: mockMember({ id: 'id-2', lastAction: 'Created' }),
        metadata: mockMemberMetadata(),
      });

      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      versionedEntity.makeFullMemberTemplate = jest.fn(() => ([{ label: 'foo', value: 'bar' }]));
      versionedEntity.makeEmptyLine = jest.fn(() => ([{ label: '\n', value: '' }]));

      const expected = versionedEntity.makeRemoveMemberTemplate([entityData, memberEntity1, memberEntity2]);

      expect(versionedEntity.makeFullMemberTemplate).toHaveBeenCalledTimes(1);
      expect(expected).toEqual([
        { label: 'foo', value: 'bar' },
      ]);
    });
  });

  describe('makeMemberNameTemplate', () => {
    it('returns the right data', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
      });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());

      expect(versionedEntity.makeMemberNameTemplate(entityData.entity)).toEqual([
        {
          label: 'household.history.label.member',
          value: `${mockMember().identitySet.firstName} ${mockMember().identitySet.lastName}`,
        },
      ]);
    });
  });
  describe('makeEmptyTemplate', () => {
    it('returns the right data', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
      });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());

      expect(versionedEntity.makeEmptyTemplate(entityData.entity)).toEqual([
        { label: '—', value: '' },
      ]);
    });
  });
  describe('makeEmptyLine', () => {
    it('returns the right data', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
      });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());

      expect(versionedEntity.makeEmptyLine(entityData.entity)).toEqual([
        { label: '\n', value: '' },
      ]);
    });
  });

  describe('makeFullMemberTemplate', () => {
    it('calls makePersonalInfoTemplate, makeTemporaryAddressTemplate, makeEmptyLine and concatenates the responses', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
      });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());
      versionedEntity.makePersonalInfoTemplate = jest.fn(() => ([{ label: 'foo', value: 'foo-1' }]));
      versionedEntity.makeTemporaryAddressTemplate = jest.fn(() => ([{ label: 'bar', value: 'bar-1' }]));
      versionedEntity.makeEmptyLine = jest.fn(() => ([{ label: '\n', value: '' }]));

      const expected = versionedEntity.makeFullMemberTemplate(entityData, mockMemberMetadata(), i18n);
      expect(versionedEntity.makePersonalInfoTemplate).toHaveBeenCalledTimes(1);
      expect(versionedEntity.makeTemporaryAddressTemplate).toHaveBeenCalledTimes(1);
      expect(versionedEntity.makeEmptyLine).toHaveBeenCalledTimes(1);
      expect(expected).toEqual([
        { label: 'foo', value: 'foo-1' },
        { label: '\n', value: '' },
        { label: 'bar', value: 'bar-1' },
      ]);
    });
  });
});
