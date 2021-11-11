import VueI18n from 'vue-i18n';
import { IAddress } from '../address/address.types';
import helpers from '../../../ui/helpers';
import {
  HouseholdActivityType,
  IHouseholdActivity,
  IHouseholdActivityContactInfo,
  IHouseholdActivityIdentity,
  IHouseholdActivityMembers,
  IHouseholdActivityPerson,
  IHouseholdActivityTempAddress,
} from './householdActivity.types';
import {
  Address, CurrentAddress, ECurrentAddressTypes, EIndigenousTypes,
} from '../../household-create';
import { IMultilingual } from '../../../types';
import { IHistoryItemTemplateData } from '../versioned-entity/versionedEntity.types';

export class HouseholdActivity implements IHouseholdActivity {
  householdId: uuid;

  timestamp: string |Date;

  user: {
    id: uuid;
    name: string;
  };

  role: {
    id: uuid;
    name: IMultilingual;
  };

  activityType: HouseholdActivityType;

  newDetails: unknown;

  previousDetails: unknown;

  constructor(data: IHouseholdActivity) {
    this.householdId = data.householdId;
    this.timestamp = data.timestamp;
    this.user = data.user;
    this.role = data.role;
    this.activityType = data.activityType;
    this.newDetails = data.newDetails;
    this.previousDetails = data.previousDetails;
  }

  getActivityName(): string {
    switch (this.activityType) {
      case HouseholdActivityType.ContactInformationEdited:
        return 'household.history.action.contact_information_changed';
      case HouseholdActivityType.IdentitySetEdited:
        return 'household.history.action.personal_information_changed';
      case HouseholdActivityType.MemberAdded:
        return 'household.history.action.household_member_added';
      case HouseholdActivityType.MemberRemoved:
        return 'household.history.action.household_member_removed';
      case HouseholdActivityType.OriginalHouseholdSplit:
        return 'household.history.action.household_member_split';
      case HouseholdActivityType.HouseholdMoved:
        return 'household.history.action.household_member_moved';
      case HouseholdActivityType.HomeAddressEdited:
        return 'household.history.action.address_information_changed';
      case HouseholdActivityType.TempAddressEdited:
        return 'household.history.action.temporary_address_changed';
      case HouseholdActivityType.PrimaryAssigned:
        return 'household.history.action.household_member_assign_primary';
      default:
        return '';
    }
  }

  getTemplateData(isPreviousValue: boolean, i18n: VueI18n): IHistoryItemTemplateData[] {
    const data = isPreviousValue ? this.previousDetails : this.newDetails;
    switch (this.activityType) {
      case HouseholdActivityType.ContactInformationEdited:
        return this.makeContactInfoTemplate(data as IHouseholdActivityContactInfo, i18n);

      case HouseholdActivityType.IdentitySetEdited:
        return this.makePersonalInfoTemplate(data as IHouseholdActivityIdentity, i18n);

      case HouseholdActivityType.MemberAdded:
        return isPreviousValue ? this.makeEmptyTemplate()
          : this.makeFullMemberTemplate(data as IHouseholdActivityIdentity & IHouseholdActivityTempAddress, i18n);

      case HouseholdActivityType.MemberRemoved:
        return !isPreviousValue ? this.makeEmptyTemplate()
          : this.makeFullMemberTemplate(data as IHouseholdActivityIdentity & IHouseholdActivityTempAddress, i18n);

      case HouseholdActivityType.OriginalHouseholdSplit:
      case HouseholdActivityType.HouseholdMoved:
        return this.makeMultipleMembersTemplate((data as IHouseholdActivityMembers)?.memberDetails, i18n);

      case HouseholdActivityType.HomeAddressEdited:
        return this.makeHomeTemplate((data as CurrentAddress)?.address, i18n);

      case HouseholdActivityType.TempAddressEdited:
        return [...this.makeMemberNameTemplate((data as IHouseholdActivityPerson).personFullName),
          ...this.makeTemporaryAddressTemplate(data as IHouseholdActivityTempAddress, i18n)];

      case HouseholdActivityType.PrimaryAssigned:
        return this.makePrimaryTemplate(data as IHouseholdActivityPerson);

      default:
        return this.makeEmptyTemplate();
    }
  }

  /** Private methods */

  /**
   *
   * @param data New home address
   * @param i18n Localization plugin
   * @returns Template data for household address change. Example:
   * {label: Home address, value: '120 East Str.\n12345, NY, New York}
   */
  makeHomeTemplate(data: Address, i18n: VueI18n): IHistoryItemTemplateData[] {
    const addressText = data ? this.getAddressText(data, i18n) : '-';
    return [{ label: 'household.history.label.home_address', value: addressText }];
  }

  /**
   *
   * @param data The new contact information
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
  makeContactInfoTemplate(data: IHouseholdActivityContactInfo, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!data?.contactInformation) return this.makeEmptyTemplate();

    const alternatePhoneNumber = data.contactInformation.alternatePhoneNumber?.number ? {
      label: 'household.history.label.alternate_phone',
      value: data.contactInformation.alternatePhoneNumber.number,
    } : null;

    const contactInfoTemplate = [
      ...this.makeMemberNameTemplate(data.personFullName || ''),
      {
        label: 'household.history.label.email',
        value: data.contactInformation.email || '—',
      },
      {
        label: 'household.history.label.home_phone',
        value: data.contactInformation.homePhoneNumber?.number || '-',
      },
      {
        label: 'household.history.label.mobile_phone',
        value: data.contactInformation.mobilePhoneNumber?.number || '-',
      },
      // Only add alternate phone number line if it exists
      ...([alternatePhoneNumber] || []),
      {
        label: 'household.history.label.preferred_language',
        value: data.preferredLanguageName ? helpers.getMultilingualValue(data.preferredLanguageName, i18n) : '-',
      },
      {
        label: 'household.history.label.primary_spoken_language',
        value: data.primarySpokenLanguageName ? helpers.getMultilingualValue(data.primarySpokenLanguageName, i18n) : '-',
      },
    ];

    // Clean up empty elements in the list
    return contactInfoTemplate.filter((i) => !!i);
  }

  /**
   *
   * @param data Personal information data of a member
   * @param i18n Localization plugin
   * @returns Template data for personal information change. Example:
   *  { label: 'Member', value: 'John Smith' },
      { label: 'Date of birth', value: 'July 10, 1999', },
      { label: 'Gender', value: 'Male', },
      { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   */
  makePersonalInfoTemplate(data: IHouseholdActivityIdentity, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!data) return this.makeEmptyTemplate();

    return [
      ...this.makeMemberNameTemplate(data.identitySet.firstName, data.identitySet.lastName),
      {
        label: 'household.profile.member.middle_name',
        value: data.identitySet.middleName ? data.identitySet.middleName : '-',
      },
      {
        label: 'household.history.label.date_of_birth',
        value: helpers.getBirthDateAndAge(data.identitySet.dateOfBirth, i18n),
      },
      {
        label: 'household.history.label.gender',
        value: helpers.getMultilingualValue(data.genderName, i18n),
      },
      {
        label: 'household.history.label.indigenous_identity',
        value: data.indigenousIdentityInfo && data.indigenousIdentityInfo.communityType
          ? `${i18n.t(`common.indigenous.types.${EIndigenousTypes[data.indigenousIdentityInfo.communityType]}`)}, ${data.indigenousIdentityInfo.name}` : '-',
      },
    ];
  }

  /**
   *
   * @param data New temporary address data
   * @param i18n Localization plugin
   * @returns Template data for temporary address change. Example:
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeTemporaryAddressTemplate(data: IHouseholdActivityTempAddress, i18n: VueI18n): IHistoryItemTemplateData[] {
    if (!data?.currentAddress) return this.makeEmptyTemplate();
    let address = '';

    if (data.currentAddress.addressType === ECurrentAddressTypes.Shelter && data.shelterLocationName) {
      address = helpers.getMultilingualValue(data.shelterLocationName, i18n);
    } else {
      const memberAddress = new CurrentAddress(data.currentAddress);
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

    const addressTypeName = i18n.t(`registration.addresses.temporaryAddressTypes.${ECurrentAddressTypes[data.currentAddress.addressType]}`);

    return [
      {
        label: 'household.history.label.temporary_address',
        value: `${addressTypeName}${address ? `, ${address}` : ''}`,
      },
    ];
  }

  /**
   *
   * @param data Data for all members
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
  makeMultipleMembersTemplate(data: (IHouseholdActivityIdentity & IHouseholdActivityTempAddress)[], i18n: VueI18n): IHistoryItemTemplateData[] {
    let template: IHistoryItemTemplateData[] = [];
    if (data && Array.isArray(data)) {
      data.forEach((member, i) => {
        template.push(...this.makeFullMemberTemplate(member, i18n));
        if (i < data.length - 1) {
          template = template.concat(this.makeEmptyLine());
        }
      });
    }
    return template.length ? template : this.makeEmptyTemplate();
  }

  /**
   *
   * @param data Primary member name
   * @returns Template data for member name. Example:
   *  { label: 'Primary member', value: 'John Smith' },
   */
  makePrimaryTemplate(data: IHouseholdActivityPerson): IHistoryItemTemplateData[] {
    return [
      {
        label: 'household.history.label.primaryMember',
        value: data.personFullName,
      },
    ];
  }

  /**
   *
   * @param entity Member entity of member that has new information
   * @returns Template data for member name. Example:
   *  { label: 'Member', value: 'John Smith' },
   */
  makeMemberNameTemplate(name: string, lastName?: string): IHistoryItemTemplateData[] {
    return [
      {
        label: 'household.history.label.member',
        value: name + (lastName ? ` ${lastName}` : ''),
      },
    ];
  }

  /**
   *
   * @param data Member data
   * @returns Template data for member name. Example:
   *  { label: 'Member', value: 'John Smith' },
   *  { label: 'Date of birth', value: 'July 10, 1999', },
   *  { label: 'Gender', value: 'Male', },
   *  { label: 'Indigenous identity', value: 'Metis, Fishing Lake Métis Settlement', },
   *  { label: '\n', value: '' }
   *  { label: 'Temporary address', value: 'Hotel/Motel, Mock Place Name #1234,\n120 East Str.,\n12345, NY, New York' },
   */
  makeFullMemberTemplate(data: IHouseholdActivityIdentity & IHouseholdActivityTempAddress, i18n: VueI18n): IHistoryItemTemplateData[] {
    const memberIdentity = this.makePersonalInfoTemplate(data, i18n);
    const memberAddress = this.makeTemporaryAddressTemplate(data, i18n);

    return [...memberIdentity, ...this.makeEmptyLine(), ...memberAddress];
  }

  makeEmptyTemplate(): IHistoryItemTemplateData[] {
    return [{ label: '—', value: '' }];
  }

  makeEmptyLine(): IHistoryItemTemplateData[] {
    return [{ label: '\n', value: '' }];
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
