import globals from 'globals';

import { eslintConfig } from '@brybrant/configs';

export default eslintConfig({
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
});
