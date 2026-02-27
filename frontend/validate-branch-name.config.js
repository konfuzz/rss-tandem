export const errorMsg = 'Please use correct branch name 🌿';
export const pattern = '^(feat|fix|hotfix|chore|refactor|test|docs|ci)/[a-z0-9]+(-[a-z0-9]+)*$';

// Branch Name Examples:
// "chore/ci-setup"
// "feat/login"
// "fix/bug-123"
// "docs/update-readme"

// more info here https://www.conventionalcommits.org/en/v1.0.0/

// ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
// chore: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
// docs: Documentation only changes
// feat: A new feature
// fix: A bug fix
// refactor: A code change that neither fixes a bug nor adds a feature
// test: Adding missing tests or correcting existing tests
