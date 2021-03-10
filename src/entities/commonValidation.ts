export const required = (value: unknown, errorMsg: string, errors: string[]) => {
  if (value === undefined || value === null) {
    errors.push(errorMsg);
  } else if (typeof value === 'string' && value.trim().length === 0) {
    errors.push(errorMsg);
  }
};

export const maxLengthCheck = (value: string, length: number, fieldName: string, errors: string[]) => {
  if (!value) return;
  const valid = value.trim().length <= length;
  if (!valid) errors.push(`${fieldName} exceeds max length of ${length}`);
};
