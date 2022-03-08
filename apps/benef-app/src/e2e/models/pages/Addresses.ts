import HomeAddressModel from '../core/HomeAddress';
import TemporaryAddressModel from '../core/TemporaryAddress';

class Addresses {
    homeAddress: typeof HomeAddressModel;

    temporaryAddress: typeof TemporaryAddressModel;

    constructor() {
      this.homeAddress = HomeAddressModel;
      this.temporaryAddress = TemporaryAddressModel;
    }
}

export default new Addresses();
