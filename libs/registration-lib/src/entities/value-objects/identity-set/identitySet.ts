import _cloneDeep from 'lodash/cloneDeep';
import {
  IIdentitySetData, IBirthDate, EIndigenousTypes, IIndigenousIdentityOption, IHoneyPotIdentitySet,
} from './identitySet.types';
import { ECanadaProvinces, IOptionItemData } from '../../../types';
import { MAX_LENGTH_MD, MAX_LENGTH_SM } from '../../../constants/validations';
import {
  maxLengthCheck, required, isValidBirthday, hasMinimumAge,
} from '../../classValidation';
import helpers from '../../../ui/helpers';

export class IdentitySet implements IHoneyPotIdentitySet {
  firstName: string;

  middleName: string;

  lastName: string;

  preferredName: string;

  gender: IOptionItemData;

  genderOther: string;

  birthDate: IBirthDate;

  dateOfBirth: string;

  indigenousProvince: ECanadaProvinces;

  indigenousType: EIndigenousTypes;

  indigenousCommunityId: string;

  indigenousCommunityOther: string;

  indigenousIdentity: IIndigenousIdentityOption;

  name: string;

  constructor(data?: IIdentitySetData) {
    if (!data) {
      this.reset();
    } else {
      this.firstName = data.firstName;
      this.middleName = data.middleName;
      this.lastName = data.lastName;
      this.preferredName = data.preferredName;
      this.gender = _cloneDeep(data.gender);
      this.genderOther = data.genderOther;
      this.birthDate = _cloneDeep(data.birthDate);
      this.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null;
      this.indigenousProvince = data.indigenousProvince;
      this.indigenousType = data.indigenousType;
      this.indigenousCommunityId = data.indigenousCommunityId;
      this.indigenousCommunityOther = data.indigenousCommunityOther;
      this.indigenousIdentity = _cloneDeep(data.indigenousIdentity);
      // name is honey pot - it should always be null...
      this.name = (data as IHoneyPotIdentitySet).name;
    }
  }

  validate(skipAgeRestriction = false): string[] {
    const errors: string[] = [];
    required(this.firstName, 'first name is required', errors);
    maxLengthCheck(this.firstName, MAX_LENGTH_SM, 'first name', errors);

    maxLengthCheck(this.middleName, MAX_LENGTH_SM, 'middle name', errors);

    required(this.lastName, 'last name is required', errors);
    maxLengthCheck(this.lastName, MAX_LENGTH_SM, 'last name', errors);

    maxLengthCheck(this.preferredName, MAX_LENGTH_SM, 'preferred name', errors);

    required(this.gender, 'gender is required', errors);

    if (this.gender?.isOther) {
      maxLengthCheck(this.genderOther, MAX_LENGTH_MD, 'other gender', errors);
      required(this.genderOther, 'genderOther is required', errors);
    }

    required(this.birthDate.year, 'year is required', errors);
    required(this.birthDate.month, 'month is required', errors);
    required(this.birthDate.day, 'day is required', errors);
    isValidBirthday(this.birthDate, 'birth date not valid', errors);

    if (!skipAgeRestriction) {
      hasMinimumAge(this.birthDate, 'minimum age required', errors);
    }

    if (this.indigenousProvince) {
      required(this.indigenousType, 'indigenousType is required', errors);
    }

    if (this.indigenousType && this.indigenousType !== EIndigenousTypes.Other) {
      required(this.indigenousCommunityId, 'indigenousCommunityId is required', errors);
    }

    if (this.indigenousType === EIndigenousTypes.Other) {
      required(this.indigenousCommunityOther, 'indigenousCommunityOther is required', errors);
      maxLengthCheck(this.indigenousCommunityOther, MAX_LENGTH_MD, 'indigenousCommunityOther', errors);
    }
    return errors;
  }

  setIdentity(data: IIdentitySetData) {
    this.firstName = data.firstName;
    this.middleName = data.middleName;
    this.lastName = data.lastName;
    this.preferredName = data.preferredName;
    this.gender = _cloneDeep(data.gender);
    this.genderOther = data.genderOther;
    this.birthDate = _cloneDeep(data.birthDate);
    this.dateOfBirth = helpers.getBirthDateUTCString(data.birthDate);
    // name is honey pot - it should always be null...
    this.name = (data as IHoneyPotIdentitySet).name;
  }

  setIndigenousIdentity(data: IIdentitySetData) {
    this.indigenousProvince = data.indigenousProvince;
    this.indigenousType = data.indigenousType;
    this.indigenousCommunityId = data.indigenousCommunityId;
    this.indigenousCommunityOther = data.indigenousCommunityOther;

    if (this.indigenousCommunityId == null && this.indigenousCommunityOther == null) {
      this.indigenousIdentity = null;
    } else {
      this.indigenousIdentity = {
        indigenousCommunityId: this.indigenousCommunityId,
        specifiedOther: this.indigenousCommunityOther,
      };
    }
  }

  reset(): void {
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.preferredName = '';
    this.gender = null;
    this.genderOther = null;
    this.birthDate = {
      year: null,
      month: null,
      day: null,
    };
    this.dateOfBirth = '';
    this.indigenousProvince = null;
    this.indigenousType = null;
    this.indigenousCommunityId = null;
    this.indigenousCommunityOther = null;
    this.indigenousIdentity = null;
    this.name = null;
  }
}
