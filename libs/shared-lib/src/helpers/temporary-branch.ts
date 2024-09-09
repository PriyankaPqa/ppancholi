export const isTemporaryBranch = (VITE_TEMP_BRANCH_ID: string | undefined) => VITE_TEMP_BRANCH_ID !== undefined
  && VITE_TEMP_BRANCH_ID !== ''
  && !VITE_TEMP_BRANCH_ID.includes('VITE_TEMP_BRANCH_ID');
