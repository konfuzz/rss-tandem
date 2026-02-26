const config = {
  '*': ['prettier --write --ignore-unknown'],
  '*.{js,mjs,ts,jsx,tsx,vue,css}': ['eslint --max-warnings 0 --no-warn-ignored'],
};

export default config;
