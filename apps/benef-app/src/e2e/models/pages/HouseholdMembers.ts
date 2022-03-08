import { Selector, t } from 'testcafe';
import Identity from '../core/Identity';
import TemporaryAddress from '../core/TemporaryAddress';

export enum MemberIdentityDataTest {
    firstName = 'additionalMember__firstName',
    lastName = 'additionalMember__lastName',
    middleName = 'additionalMember__middleName',
    preferredName = 'additionalMember__preferredName',
    gender = 'additionalMember__gender',
    genderOther = 'additionalMember__genderOther',
    birthdateMonth = 'additionalMember__month',
    birthdateDay = 'additionalMember__day',
    birthdateYear = 'additionalMember__year',
}

export class HouseholdMembers {
    identity: Identity

    address: typeof TemporaryAddress

    sameCurrentAddressYes: Selector;

    sameCurrentAddressNo: Selector;

    constructor() {
      this.identity = new Identity(MemberIdentityDataTest);
      this.address = TemporaryAddress;
      this.sameCurrentAddressYes = Selector('input').withAttribute('data-test', 'sameCurrentAddressYes');
      this.sameCurrentAddressNo = Selector('input').withAttribute('data-test', 'sameCurrentAddressNo');
    }

    async setSameCurrentAddress(value: 'yes' | 'no') {
      if (value === 'yes') {
        await t.click(this.sameCurrentAddressYes());
      }
      if (value === 'no') {
        await t.click(this.sameCurrentAddressNo());
      }
    }
}
