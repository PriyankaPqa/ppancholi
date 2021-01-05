import { provider } from './index';
import { AuthenticationsService } from '../authentications';

jest.mock('../authentications');

describe('Provider', () => {
  it('should instantiate AuthenticationsService', () => {
    provider();
    expect(AuthenticationsService.prototype.constructor).toBeCalled();
  });
});
