import VueI18n from 'vue-i18n';

import _difference from 'lodash/difference';
import { IAddress } from '../address/address.types';
import { ICurrentAddress } from '../current-address/currentAddress.types';
import { IEntity } from '../../base';
import { IMemberMetadata, IMemberEntity } from '../member/member.types';

/* eslint-disable complexity */
import helpers from '../../../ui/helpers';
import { IHistoryItemTemplateData, IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';
import {
  Address, CurrentAddress, ECurrentAddressTypes, EIndigenousTypes,
} from '../../household-create';
import { IMultilingual } from '../../../types';
import { IHouseholdEntity } from '../../household';

export class VersionedEntityCombined implements IVersionedEntityCombined {
  versionId: string;

  timestamp: string | Date;

  userName: string;

  roleName: IMultilingual;

  entityType?: string;

  entity: IEntity;

  previousEntity?: IEntity;

  metadata?: IEntity;

  previousMetadata?: IEntity;

  constructor(data: IVersionedEntity, metadata?: IVersionedEntity) {
    this.versionId = data.versionId;
    this.timestamp = data.timestamp;
    this.userName = data.userName;
    this.roleName = data.roleName;
    this.entityType = data.entityType;
    this.entity = data.entity;
    this.previousEntity = data.previousEntity;
    this.metadata = metadata?.entity;
    this.previousMetadata = metadata?.previousEntity;
  }

  getLastActionName(): string {
    switch (this.entityType) {
      case 'household':
        switch (this.entity.lastAction) {
          case 'Created':
            return 'household.history.action.household_created';
          case 'AddMember':
            return 'household.history.action.household_member_added';
          case 'RemoveMember':
            return 'household.history.action.household_member_removed';
          case 'UpdateAddress':
            return 'household.history.action.address_information_changed';
          case 'SetNoFixedAddress':
            return 'household.history.action.no_fixed_address_set';
          default:
            return '';
        }

      case 'householdMember':
        switch (this.entity.lastAction) {
          case 'UpdateContactInformation':
            return 'household.history.action.contact_information_changed';
          case 'UpdateCurrentAddress':
            return 'household.history.action.temporary_address_changed';
          case 'UpdateIdentitySet':
            return 'household.history.action.personal_information_changed';
          default:
            return '';
        }

      default:
        return '';
    }
  }

  getTemplateData(historyItems: IVersionedEntityCombined[], isPreviousValue: boolean, i18n: VueI18n): IHistoryItemTemplateData[] {
    switch (this.entityType) {
      case 'household': {
        const entityData = (isPreviousValue ? this.previousEntity : this.entity) as IHouseholdEntity;
        switch (this.entity.lastAction) {
          case 'Created':
            return isPreviousValue ? this.makeEmptyTemplate() : this.makeAddMemberTemplate(historyItems, i18n);
          case 'Activate':
          case 'Deactivate':
            return null;
          case 'SetNoFixedAddress':
            return isPreviousValue ? this.makeHomeTemplate(entityData, i18n) : this.makeEmptyTemplate();
          case 'UpdateAddress':
            return this.makeHomeTemplate(entityData, i18n);
          case 'AddMember':
            return isPreviousValue ? this.makeEmptyTemplate() : this.makeAddMemberTemplate(historyItems, i18n);
          case 'RemoveMember':
            return isPreviousValue ? this.makeRemoveMemberTemplate(historyItems, i18n) : this.makeEmptyTemplate();
          default:
            return this.makeEmptyTemplate();
        }
      }

      case 'householdMember':
      {
        const entityData = (isPreviousValue ? this.previousEntity : this.entity) as IMemberEntity;
        const metadata = (isPreviousValue ? this.previousMetadata : this.metadata) as IMemberMetadata;

        switch (this.entity.lastAction) {
          case 'Created':
          case 'Activate':
          case 'Deactivate':
            return null;
          case 'UpdateContactInformation':
            return this.makeContactInfoTemplate(entityData, metadata, i18n);
          case 'UpdateIdentitySet':
            return this.makePersonalInfoTemplate(entityData, metadata, i18n);
          case 'UpdateCurrentAddress':
            return [...this.makeMemberNameTemplate(entityData), ...this.makeTemporaryAddressTemplate(entityData, metadata, i18n)];
          default:
            return this.makeEmptyTemplate();
        }
      }

      default:
        return this.makeEmptyTemplate();
    }
  }

  /** Private methods */

  /**
   *
   * @param entity Household entity that has the new home address
   * @param i18n Localization plugin
   * @returns Template data for household address change. Example:
   * {label: Home address, value: '120 East Str.\n12345, NY, New York}
   */
  makeHomeTemplate(entity: IHouseholdEntity, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!entity?.address?.address) return this.makeEmptyTemplate();
    const addressText = this.getAddressText(new Address(entity.address.address), i18n);
    return [{ label: 'household.history.label.home_address', value: addressText }];
  }

  /**
   *
   * @param entity Member entity of member that has the new contact information
   * @param metadata Member metadata of member that has the new contact information
   * @param i18n Localization plugin
   * @returns Template data for contact information change. Example:
   *  { label: 'Member', value: 'John Smith' },
      { label: 'Email', value: 'example@example.com', },
      { label: 'Home', value: '504-555-5555', },
      { label: 'Mobile', value: '504-555-5555', },
      { label: 'Alternate', value: '504-555-5555', },
      { label: 'Preferred language', value: 'English', },
      { label: 'Primary spoken language', value: 'English', },
   */
  makeContactInfoTemplate(entity: IMemberEntity, metadata: IMemberMetadata, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!entity?.contactInformation) return this.makeEmptyTemplate();

    const alternatePhoneNumber = entity.contactInformation.alternatePhoneNumber?.number ? {
      label: 'household.history.label.alternate_phone',
      value: entity.contactInformation.alternatePhoneNumber.number,
    } : null;

    const contactInfoTemplate = [
      ...this.makeMemberNameTemplate(entity),
      {
        label: 'household.history.label.email',
        value: entity.contactInformation.email || '—',
      },
      {
        label: 'household.history.label.home_phone',
        value: entity.contactInformation.homePhoneNumber?.number || '—',
      },
      {
        label: 'household.history.label.mobile_phone',
        value: entity.contactInformation.mobilePhoneNumber?.number || '—',
      },
      // Only add alternate phone number line if it exists
      ...([alternatePhoneNumber] || []),
      {
        label: 'household.history.label.preferred_language',
        value: metadata ? helpers.getMultilingualValue(metadata.preferredLanguageName, i18n) : '—',
      },
      {
        label: 'household.history.label.primary_spoken_language',
        value: metadata?.primarySpokenLanguageName ? helpers.getMultilingualValue(metadata.primarySpokenLanguageName, i18n) : '—',
      },
    ];

    // Clean up empty elements in the list
    return contactInfoTemplate.filter((i) => !!i);
  }

  /**
   *
   * @param entity Member entity of member that has the new personal information
   * @param metadata Member metadata of member that has the new personal information
   * @param i18n Localization plugin
   * @returns Template data for personal information change. Example:
   *  { label: 'Member', value: 'John Smith' },
      { label: 'Date of birth', value: 'July 10, 1999', },
      { label: 'Gender', value: 'Male', },
      { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   */
  makePersonalInfoTemplate(entity: IMemberEntity, metadata: IMemberMetadata, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!entity?.identitySet) return this.makeEmptyTemplate();

    return [
      ...this.makeMemberNameTemplate(entity),
      {
        label: 'household.profile.member.middle_name',
        value: entity.identitySet.middleName ? entity.identitySet.middleName : '—',
      },
      {
        label: 'household.history.label.date_of_birth',
        value: helpers.getBirthDateAndAge(entity.identitySet.dateOfBirth, i18n),
      },
      {
        label: 'household.history.label.gender',
        value: metadata?.genderName ? helpers.getMultilingualValue(metadata.genderName, i18n) : '—',
      },
      {
        label: 'household.history.label.indigenous_identity',
        value: metadata?.indigenousCommunityType && metadata?.indigenousIdentityName
          ? `${i18n.t(`common.indigenous.types.${EIndigenousTypes[metadata.indigenousCommunityType]}`)}, ${metadata.indigenousIdentityName}` : '—',
      },
    ];
  }

  /**
   *
   * @param entity Member entity of member that has the new temporary address
   * @param metadata Member metadata of member that has the new temporary address
   * @param i18n Localization plugin
   * @returns Template data for temporary address change. Example:
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeTemporaryAddressTemplate(entity: IMemberEntity, metadata: IMemberMetadata, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!entity?.currentAddress) return this.makeEmptyTemplate();
    let address = '';

    if (entity.currentAddress?.shelterLocationId && metadata?.shelterLocationName) {
      address = helpers.getMultilingualValue(metadata.shelterLocationName, i18n);
    } else {
      const memberAddress = new CurrentAddress(entity.currentAddress);
      if (memberAddress.requiresPlaceName()) {
        address += memberAddress.placeName;
        if (memberAddress.hasPlaceNumber && memberAddress.placeNumber) {
          address += ` #${memberAddress.placeNumber}`;
        }
        address += ',';
      }
      if (memberAddress.address) {
        address += `\n${this.getAddressText(memberAddress.address, i18n)}`;
      }
    }

    const addressTypeName = i18n.t(`registration.addresses.temporaryAddressTypes.${ECurrentAddressTypes[entity.currentAddress.addressType]}`);

    return [
      {
        label: 'household.history.label.temporary_address',
        value: `${addressTypeName}${address ? `, ${address}` : ''}`,
      },
    ];
  }

  /**
   *
   * @param historyItems List of all history items of a household, including household and members history
   * @param i18n Localization plugin
   * @returns Template data for adding a member to the household. Example:
   *  { label: 'Member', value: 'John Smith' },
   *  { label: 'Date of birth', value: 'July 10, 1999', },
   *  { label: 'Gender', value: 'Male', },
   *  { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   *  { label: '\n', value: '' }
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   *  { label: '\n', value: '' }
   *  { label: 'Member', value: 'Jane Smith' },
   *  { label: 'Date of birth', value: 'July 1, 1990', },
   *  { label: 'Gender', value: 'Female', },
   *  { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   *  { label: '\n', value: '' }
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeAddMemberTemplate(historyItems: IVersionedEntityCombined[], i18n: VueI18n): IHistoryItemTemplateData[] {
    let addedMemberIds = (this.entity as IHouseholdEntity).members;
    if (this.previousEntity) {
      addedMemberIds = _difference((this.entity as IHouseholdEntity).members, (this.previousEntity as IHouseholdEntity).members);
    }

    let template: IHistoryItemTemplateData[] = [];
    addedMemberIds.forEach((id, i) => {
      const addedMember = historyItems.find((i) => i.entityType === 'householdMember' && i.entity.id === id && i.entity.lastAction === 'Created');
      if (addedMember) {
        template = template.concat(this.makeFullMemberTemplate((addedMember.entity) as IMemberEntity, (addedMember.metadata) as IMemberMetadata, i18n));
        if (i < addedMemberIds.length - 1) {
          template = template.concat(this.makeEmptyLine());
        }
      }
    });

    return template.length ? template : this.makeEmptyTemplate();
  }

  /**
   *
   * @param historyItems List of all history items of a household, including household and members history
   * @param i18n Localization plugin
   * @returns Template data for removing a member to the household. Example:
   *  { label: 'Member', value: 'John Smith' },
   *  { label: 'Date of birth', value: 'July 10, 1999', },
   *  { label: 'Gender', value: 'Male', },
   *  { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   *  { label: '\n', value: '' }
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeRemoveMemberTemplate(historyItems: IVersionedEntityCombined[], i18n: VueI18n): IHistoryItemTemplateData[] {
    const removedMemberId = _difference((this.previousEntity as IHouseholdEntity).members, (this.entity as IHouseholdEntity).members);

    if (removedMemberId.length === 1) {
      const removedMember = historyItems.find((i) => i.entityType === 'householdMember' && i.entity.id === removedMemberId[0] && i.entity.lastAction === 'Deactivate');
      if (!removedMember) return this.makeEmptyTemplate();
      return this.makeFullMemberTemplate((removedMember.previousEntity) as IMemberEntity, (removedMember.previousMetadata) as IMemberMetadata, i18n);
    }
    return this.makeEmptyTemplate();
  }

  /**
   *
   * @param entity Member entity of member that has new information
   * @returns Template data for member name. Example:
   *  { label: 'Member', value: 'John Smith' },
   */
  makeMemberNameTemplate(entity: IMemberEntity): IHistoryItemTemplateData[] {
    return [
      {
        label: 'household.history.label.member',
        value: `${entity.identitySet.firstName} ${entity.identitySet.lastName}`,
      },
    ];
  }

  makeEmptyTemplate(): IHistoryItemTemplateData[] {
    return [{ label: '—', value: '' }];
  }

  makeEmptyLine(): IHistoryItemTemplateData[] {
    return [{ label: '\n', value: '' }];
  }

  /**
   *
   * @param entity Member entity of member that has new information
   * @param metadata Member metadata of member that has the new information
   * @returns Template data for member name. Example:
   *  { label: 'Member', value: 'John Smith' },
   *  { label: 'Date of birth', value: 'July 10, 1999', },
   *  { label: 'Gender', value: 'Male', },
   *  { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   *  { label: '\n', value: '' }
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeFullMemberTemplate(entity: IMemberEntity, metadata: IMemberMetadata, i18n: VueI18n): IHistoryItemTemplateData[] {
    const memberIdentity = this.makePersonalInfoTemplate(entity, metadata, i18n);
    const memberAddress = this.makeTemporaryAddressTemplate(entity, metadata, i18n);

    return [...memberIdentity, ...this.makeEmptyLine(), ...memberAddress];
  }

  getAddressText(addressData: IAddress, i18n: VueI18n): string {
    let address = '';
    const addressLines = helpers.getAddressLines(new Address(addressData), i18n);

    if (addressLines.length) {
      address += `${addressLines[0]},\n${addressLines[1]},`;
      if (addressLines.length > 2) {
        address += ` ${addressLines[2]}`;
      }
    }

    return address;
  }
}
