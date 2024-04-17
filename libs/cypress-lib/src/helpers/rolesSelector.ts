import { UserRoles } from '../support/msal';

export enum Mode {
  boundary = 'boundary', // Will return the highest and lowest roles available. Only available for canRoles as the hierarchy does not contain contributor etc.
  all = 'all',
  none = 'none',
}

export const sortRolesByHierarchy = (roles: UserRoles[]) => {
  const hierarchy = [
    UserRoles.level6,
    UserRoles.level5,
    UserRoles.level4,
    UserRoles.level3,
    UserRoles.level2,
    UserRoles.level1,
    UserRoles.level0,
  ];
  const customSort = (a: UserRoles, b: UserRoles) => {
    const indexA = hierarchy.indexOf(a);
    const indexB = hierarchy.indexOf(b);

    if (indexA === -1) {
      throw new Error(`Item '${a}' not found in hierarchy.`);
    }
    if (indexB === -1) {
      throw new Error(`Item '${b}' not found in hierarchy.`);
    }

    return indexA - indexB;
  };
  return roles.filter((r) => hierarchy.includes(r)).slice().sort(customSort);
};

function validateParameters(canMode: string, cannotMode: string) {
  const validModes = Object.keys(Mode);

  if (!validModes.includes(canMode)) {
    throw new Error(`Invalid parameter CYPRESS_CAN_MODE: ${canMode}`);
  }

  if (!validModes.includes(cannotMode)) {
    throw new Error(`Invalid parameter CYPRESS_CANNOT_MODE: ${cannotMode}`);
  }
}

export const getHighestRole = (roles: UserRoles[]) => [sortRolesByHierarchy(roles)[0]];

export const getLowestRole = (roles: UserRoles[]) => {
  const r = sortRolesByHierarchy(roles);
  return [r[r.length - 1]];
};

export const getBoundaryRoles = (roles: UserRoles[]) => {
  const highestRole = getHighestRole(roles)[0];
  const lowestRole = getLowestRole(roles)[0];

  if (!highestRole && !lowestRole) {
    return roles;
  }

  if (highestRole === lowestRole) {
    return [highestRole];
  }

  return [highestRole, lowestRole];
};
export const getAllRoles = (roles: UserRoles[]) => roles;

export const getRoles = (canRoles: UserRoles[], cannotRoles: UserRoles[]) => {
  let filteredCanRoles: UserRoles[] = [];
  let filteredCannotRoles: UserRoles[] = [];

  const canMode = Cypress.env('CAN_MODE');
  const cannotMode = Cypress.env('CANNOT_MODE');

  validateParameters(canMode, cannotMode);

  const roleModes = {
    [Mode.boundary]: getBoundaryRoles,
    [Mode.all]: getAllRoles,
  } as Record<string, (roles: UserRoles[]) => UserRoles[]>;

  if (roleModes[canMode]) {
    filteredCanRoles = roleModes[canMode](canRoles); // Will use method linked to the mode with canRoles parameters. Ex: getBoundaryRoles(canRole)
  }

  if (roleModes[cannotMode]) {
    filteredCannotRoles = roleModes[cannotMode](cannotRoles); // Will use method linked to the mode with canRoles parameters. Ex: getAllRoles(cannotRoles)

    if (cannotRoles.indexOf(UserRoles.contributor2) !== -1 && cannotMode === 'boundary') {
      filteredCannotRoles.push(UserRoles.contributor2);
    }
  }

  const allRoles = [...filteredCanRoles, ...filteredCannotRoles];

  return {
    filteredCanRoles, filteredCannotRoles, allRoles,
  };
};
