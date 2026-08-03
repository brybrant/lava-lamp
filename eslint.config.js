import globals from 'globals';

import eslintConfig from '@brybrant/eslint-config';

export default eslintConfig({
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
});
