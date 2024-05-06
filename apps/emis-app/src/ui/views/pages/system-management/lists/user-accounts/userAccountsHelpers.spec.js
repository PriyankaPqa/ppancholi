import { i18n } from '@/ui/plugins';
import { createUserAccount, getSubRoleById } from './userAccountsHelpers';

const optionData = [
  {
    id: '1',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    name: {
      translation: {
        en: 'Z',
        fr: 'Inundation',
      },
    },
    subitems: [
      {
        id: '123',
        name: {
          translation: {
            en: 'case worker 2',
            fr: 'case worker 2 fr',
          },
        },
      },
    ],
  }, {
    id: '2',
    created: new Date('2021-01-14T00:00:00.000Z'),
    timestamp: new Date('2021-01-14T00:00:00.000Z'),
    name: {
      translation: {
        en: 'A',
        fr: 'Incendies',
      },
    },
    subitems: [
      {
        id: '456',
        name: {
          translation: {
            en: 'case worker 3',
            fr: 'case worker 3 fr',
          },
        },
      },
    ],
  },
];

const mockSubRole = {
  id: '123',
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
};

const testUserData = {
  entity: {
    id: '1',
    status: 1,
  },
  metadata: {
    id: '1',
    displayName: 'C',
    givenName: 'Some Person',
    surname: '',
    emailAddress: 'fake@email.com',
    phoneNumber: '123-456-7890',
  },
};

describe('userAccountsHelpers', () => {
  describe('createUserAccount', () => {
    const toasted = { global: { success: jest.fn(), error: jest.fn() } };
    const allSubRoles = [mockSubRole];
    let createAccountFn = jest.fn(() => ({ data: {} }));

    const user = { role: {
      id: mockSubRole.id,
      displayName: 'roleText',
      value: null,
    },
    emailAddress: 'email',
    givenName: 'givenName',
    surname: 'surname',
    };

    const payload = {
      emailAddress: user.emailAddress,
      givenName: user.givenName,
      surname: user.surname,
      roleId: mockSubRole.id,
      id: user.id,
    };
    it('should call services correctly and opens the correct toast on success', async () => {
      await createUserAccount(user, allSubRoles, createAccountFn, i18n, toasted);

      expect(createAccountFn).toHaveBeenCalledWith(payload, true);
      expect(toasted.global.success).toHaveBeenCalled();
    });

    it('opens the correct toast on exception', async () => {
      createAccountFn = jest.fn(() => new Promise(() => {
        throw new Error('err');
      }));
      await createUserAccount(user, allSubRoles, createAccountFn, i18n, toasted);
      expect(toasted.global.error).toHaveBeenCalled();
    });

    it('opens the correct toast on failure', async () => {
      await createUserAccount(user, [], createAccountFn, i18n, toasted);
      expect(toasted.global.error).toHaveBeenCalled();
    });
  });

  describe('getSubRoleById', () => {
    it('retrieves the correct sub-role from a user', async () => {
      const allSubRoles = [...optionData[0].subitems, ...optionData[1].subitems];
      const user = testUserData;
      user.roleId = allSubRoles[0].id;
      expect(getSubRoleById(user.roleId, allSubRoles)).toEqual(allSubRoles[0]);
    });
  });
});
