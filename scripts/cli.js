#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');

// Utility functions
function logError(message) {
  console.log(chalk.red(`❌ ${message}`));
}

function logSuccess(message) {
  console.log(chalk.green(`✅ ${message}`));
}

function logWarning(message) {
  console.log(chalk.yellow(`⚠️  ${message}`));
}

function logInfo(message) {
  console.log(chalk.blue(`ℹ️  ${message}`));
}

function logHeader(message) {
  console.log(chalk.bold.cyan(message));
}

function exec(command, { silent = false } = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return result?.toString().trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function execSilent(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return null;
  }
}

// Version management functions
function parseVersion(version) {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function incrementVersion(version, type) {
  const parsed = parseVersion(version);

  switch (type) {
    case 'major':
      return formatVersion({ major: parsed.major + 1, minor: 0, patch: 0 });
    case 'minor':
      return formatVersion({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
    case 'patch':
      return formatVersion({ major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 });
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

async function getCurrentPackageInfo() {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private,
    };
  } catch (error) {
    throw new Error(`Failed to read package.json: ${error.message}`);
  }
}

async function updatePackageVersion(newVersion) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    logSuccess(`Updated package.json version to ${newVersion}`);
  } catch (error) {
    throw new Error(`Failed to update package.json: ${error.message}`);
  }
}

// Validation functions
async function checkPackageJson() {
  try {
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    const checks = [
      { name: 'Package name', value: pkg.name, required: true },
      { name: 'Version', value: pkg.version, required: true },
      { name: 'Description', value: pkg.description, required: true },
      { name: 'Main entry', value: pkg.main, required: true },
      { name: 'Module entry', value: pkg.module, required: true },
      { name: 'Types entry', value: pkg.types, required: true },
      { name: 'Repository', value: pkg.repository?.url, required: false },
      { name: 'License', value: pkg.license, required: true },
      { name: 'Keywords', value: pkg.keywords?.length > 0, required: false },
      { name: 'Not private', value: !pkg.private, required: true },
    ];

    console.log(chalk.blue('📦 Package.json validation:'));

    let allGood = true;
    checks.forEach(check => {
      const status = check.value ? '✅' : check.required ? '❌' : '⚠️';
      const message = `  ${status} ${check.name}: ${check.value || 'missing'}`;

      if (check.value) {
        console.log(chalk.green(message));
      } else if (check.required) {
        console.log(chalk.red(message));
        allGood = false;
      } else {
        console.log(chalk.yellow(message));
      }
    });

    return allGood;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to read package.json: ${error.message}`));
    return false;
  }
}

async function checkBuildFiles() {
  const { access } = await import('fs/promises');
  const files = ['dist/index.d.ts', 'dist/index.mjs', 'dist/index.cjs'];

  console.log(chalk.blue('\n🏗️  Build files:'));

  let allGood = true;
  for (const file of files) {
    try {
      await access(file);
      console.log(chalk.green(`  ✅ ${file}`));
    } catch {
      console.log(chalk.red(`  ❌ ${file} - missing`));
      allGood = false;
    }
  }

  return allGood;
}

async function checkGitStatus() {
  console.log(chalk.blue('\n🔍 Git status:'));

  const status = execSilent('git status --porcelain');
  const branch = execSilent('git branch --show-current');

  if (status) {
    console.log(chalk.yellow('  ⚠️  Uncommitted changes detected'));
    console.log(chalk.dim(status));
    return false;
  } else {
    console.log(chalk.green('  ✅ Working directory clean'));
  }

  if (branch && (branch === 'main' || branch === 'master')) {
    console.log(chalk.green(`  ✅ On ${branch} branch`));
  } else {
    console.log(chalk.yellow(`  ⚠️  On '${branch || 'unknown'}' branch (not main/master)`));
    return false;
  }

  return true;
}

async function checkNpmLogin() {
  console.log(chalk.blue('\n🔑 NPM authentication:'));

  const whoami = execSilent('npm whoami');
  if (whoami) {
    console.log(chalk.green(`  ✅ Logged in as: ${whoami}`));
    return true;
  } else {
    console.log(chalk.red('  ❌ Not logged in to npm'));
    console.log(chalk.yellow('  Run: npm login'));
    return false;
  }
}

async function runQualityChecks() {
  console.log(chalk.blue('\n🔍 Quality checks:'));

  const checks = [
    { name: 'Type check', command: 'pnpm type-check' },
    { name: 'Lint', command: 'pnpm lint' },
    { name: 'Format check', command: 'pnpm format:check' },
  ];

  let allGood = true;

  for (const check of checks) {
    const spinner = ora(`Running ${check.name.toLowerCase()}...`).start();

    try {
      execSilent(check.command);
      spinner.succeed(check.name);
    } catch (error) {
      spinner.fail(`${check.name} failed`);
      allGood = false;
    }
  }

  return allGood;
}

async function checkIfVersionExists(packageName, version) {
  try {
    execSilent(`npm view ${packageName}@${version} version`);
    return true;
  } catch {
    return false;
  }
}

async function checkGitStatusForPublish() {
  try {
    const status = execSilent('git status --porcelain');
    if (status) {
      logWarning('You have uncommitted changes:');
      console.log(chalk.dim(status));
      return false;
    }
    return true;
  } catch {
    logWarning('Not in a git repository or git not available');
    return true;
  }
}

async function checkGitBranch() {
  try {
    const branch = execSilent('git branch --show-current');
    if (branch !== 'main' && branch !== 'master') {
      logWarning(`You are on branch '${chalk.bold(branch)}', not on main/master`);
      return false;
    }
    return true;
  } catch {
    logWarning('Could not determine git branch');
    return true;
  }
}

async function buildPackage() {
  const spinner = ora('Building package...').start();
  try {
    exec('pnpm build');
    spinner.succeed('Build completed successfully!');
    return true;
  } catch (error) {
    spinner.fail(`Build failed: ${error.message}`);
    return false;
  }
}

async function createGitTag(version) {
  try {
    exec(`git add package.json`);
    exec(`git commit -m "chore: bump version to ${version}"`);
    exec(`git tag v${version}`);
    logSuccess(`Created git tag v${version}`);
    return true;
  } catch (error) {
    logError(`Failed to create git tag: ${error.message}`);
    return false;
  }
}

async function publishToNpm(isDryRun = false) {
  const command = isDryRun ? 'npm publish --dry-run' : 'npm publish';

  try {
    if (isDryRun) {
      // For dry run, show a message and then run with full output
      console.log(chalk.blue('🧪 Running dry-run publish...'));
      console.log(chalk.dim('─'.repeat(50)));

      // Execute with full output visible
      exec(command, { silent: false });

      console.log(chalk.dim('─'.repeat(50)));
      console.log(chalk.green('✅ Dry-run completed successfully!'));
    } else {
      // For actual publish, show a message and then run with full output
      console.log(chalk.magenta('🚀 Publishing to npm...'));
      console.log(chalk.dim('─'.repeat(50)));

      // Execute with full output visible
      exec(command, { silent: false });

      console.log(chalk.dim('─'.repeat(50)));
      console.log(chalk.green('✅ Package published successfully!'));
    }
    return true;
  } catch (error) {
    if (isDryRun) {
      console.log(chalk.red(`❌ Dry-run failed: ${error.message}`));
    } else {
      console.log(chalk.red(`❌ Publish failed: ${error.message}`));
    }
    return false;
  }
}

async function pushToGit() {
  const spinner = ora('Pushing to git...').start();
  try {
    exec('git push');
    exec('git push --tags');
    spinner.succeed('Pushed changes and tags to git');
    return true;
  } catch (error) {
    spinner.fail(`Failed to push to git: ${error.message}`);
    return false;
  }
}

// Main action functions
async function validateAction() {
  console.log(chalk.bold.blue('🔍 Pre-publish Validation'));
  console.log(chalk.bold.blue('========================'));
  console.log();

  const checks = await Promise.all([
    checkPackageJson(),
    checkBuildFiles(),
    checkGitStatus(),
    checkNpmLogin(),
    runQualityChecks(),
  ]);

  const allPassed = checks.every(Boolean);

  console.log();
  console.log(chalk.blue('📊 Summary:'));
  if (allPassed) {
    console.log(chalk.green('✅ All checks passed! Ready to publish.'));
    return true;
  } else {
    console.log(chalk.red('❌ Some checks failed. Please fix the issues above.'));
    return false;
  }
}

async function versionBumpAction() {
  try {
    console.log(chalk.bold.blue('📦 Version Bump'));
    console.log(chalk.bold.blue('==============='));
    console.log();

    const packageInfo = await getCurrentPackageInfo();
    const currentVersion = packageInfo.version;
    console.log(chalk.yellow(`Current version: ${currentVersion}`));
    console.log();

    const patchVersion = incrementVersion(currentVersion, 'patch');
    const minorVersion = incrementVersion(currentVersion, 'minor');
    const majorVersion = incrementVersion(currentVersion, 'major');

    const { versionChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'versionChoice',
        message: 'How would you like to increment the version?',
        choices: [
          {
            name: `Patch (${chalk.green(patchVersion)}) - Bug fixes`,
            value: 'patch',
            short: patchVersion,
          },
          {
            name: `Minor (${chalk.blue(minorVersion)}) - New features (backward compatible)`,
            value: 'minor',
            short: minorVersion,
          },
          {
            name: `Major (${chalk.red(majorVersion)}) - Breaking changes`,
            value: 'major',
            short: majorVersion,
          },
          {
            name: 'Custom version',
            value: 'custom',
          },
        ],
      },
    ]);

    let newVersion;

    if (versionChoice === 'patch') {
      newVersion = patchVersion;
    } else if (versionChoice === 'minor') {
      newVersion = minorVersion;
    } else if (versionChoice === 'major') {
      newVersion = majorVersion;
    } else if (versionChoice === 'custom') {
      const { customVersion } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customVersion',
          message: 'Enter custom version:',
          validate: input => {
            if (!/^\d+\.\d+\.\d+$/.test(input)) {
              return 'Invalid version format. Use semver format (x.y.z)';
            }
            return true;
          },
        },
      ]);
      newVersion = customVersion;
    }

    // Final confirmation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Update version from ${chalk.yellow(currentVersion)} to ${chalk.green(newVersion)}?`,
        default: true,
      },
    ]);

    if (confirm) {
      await updatePackageVersion(newVersion);
      console.log();
      console.log(chalk.green('✅ Version updated successfully!'));
      return { success: true, newVersion };
    } else {
      console.log(chalk.yellow('Version update cancelled.'));
      return { success: false };
    }
  } catch (error) {
    console.log(chalk.red(`❌ Failed to update version: ${error.message}`));
    return { success: false };
  }
}

async function publishAction() {
  try {
    console.log(chalk.bold.magenta('🚀 Publishing Wizard'));
    console.log(chalk.bold.magenta('=================='));
    console.log();

    // Get current package info
    const packageInfo = await getCurrentPackageInfo();

    if (packageInfo.private) {
      logError('Package is marked as private in package.json');
      return false;
    }

    logInfo(`Current package: ${chalk.bold(packageInfo.name)}@${chalk.bold(packageInfo.version)}`);
    console.log();

    // Pre-flight checks
    logHeader('🔍 Pre-flight Checks');

    const gitStatusClean = await checkGitStatusForPublish();
    const onMainBranch = await checkGitBranch();

    if (!gitStatusClean || !onMainBranch) {
      const { continueWithIssues } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueWithIssues',
          message: 'There are git issues detected. Continue anyway?',
          default: false,
        },
      ]);

      if (!continueWithIssues) {
        logInfo('Aborted. Please resolve git issues first.');
        return false;
      }
    }

    // Quality checks
    console.log();
    logHeader('🔍 Quality Checks');

    const { runChecks } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runChecks',
        message: 'Run quality checks (type-check, lint, format)?',
        default: true,
      },
    ]);

    if (runChecks) {
      const checksPass = await runQualityChecks();
      if (!checksPass) {
        const { continueWithFailedChecks } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueWithFailedChecks',
            message: 'Quality checks failed. Continue anyway?',
            default: false,
          },
        ]);

        if (!continueWithFailedChecks) {
          logInfo('Aborted due to failed quality checks.');
          return false;
        }
      }
    }

    // Build
    console.log();
    logHeader('🏗️  Build');

    const { shouldBuild } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldBuild',
        message: 'Build the package?',
        default: true,
      },
    ]);

    if (shouldBuild) {
      const buildSuccess = await buildPackage();
      if (!buildSuccess) {
        logError('Build failed. Cannot continue.');
        return false;
      }
    }

    // Dry run
    console.log();
    logHeader('🧪 Dry Run');

    const { dryRun } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Run npm publish --dry-run first?',
        default: true,
      },
    ]);

    if (dryRun) {
      const dryRunSuccess = await publishToNpm(true);
      if (!dryRunSuccess) {
        logError('Dry run failed. Cannot continue.');
        return false;
      }

      console.log();
      logSuccess('Dry run completed successfully! Package is ready for publishing.');
      console.log(
        chalk.gray('The dry run validates that your package can be published without actually publishing it.'),
      );
    }

    // Final confirmation
    console.log();
    logHeader('🚀 Ready to Publish');
    console.log(chalk.yellow(`Package: ${packageInfo.name}`));
    console.log(chalk.yellow(`Version: ${packageInfo.version}`));
    console.log();

    const { finalConfirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'finalConfirm',
        message: chalk.bold('🚨 Proceed with publishing to npm?'),
        default: false,
      },
    ]);

    if (!finalConfirm) {
      logInfo('Publishing cancelled.');
      return false;
    }

    // Create git tag
    const { shouldTag } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldTag',
        message: 'Create git tag and commit?',
        default: true,
      },
    ]);

    if (shouldTag) {
      await createGitTag(packageInfo.version);
    }

    // Publish
    const publishSuccess = await publishToNpm(false);

    if (publishSuccess) {
      // Push to git
      const { shouldPush } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldPush',
          message: 'Push changes to git?',
          default: true,
        },
      ]);

      if (shouldPush) {
        await pushToGit();
      }

      console.log();
      console.log(chalk.bold.green('🎉 Publishing Complete!'));
      console.log(chalk.bold.green('============================'));
      logSuccess(`${packageInfo.name}@${packageInfo.version} has been published successfully!`);
      logInfo(chalk.cyan(`npm install ${packageInfo.name}@${packageInfo.version}`));
      logInfo(chalk.cyan(`https://www.npmjs.com/package/${packageInfo.name}`));
      return true;
    } else {
      logError('Publishing failed');
      return false;
    }
  } catch (error) {
    logError(`Publishing failed: ${error.message}`);
    return false;
  }
}

async function fullPublishWorkflow() {
  try {
    console.log(chalk.bold.magenta('🚀 Complete Publishing Workflow'));
    console.log(chalk.bold.magenta('==============================='));
    console.log();

    // Step 1: Validation
    logHeader('Step 1: Validation');
    const validationPassed = await validateAction();

    if (!validationPassed) {
      const { continueAnyway } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAnyway',
          message: 'Validation failed. Continue anyway?',
          default: false,
        },
      ]);

      if (!continueAnyway) {
        logInfo('Workflow aborted.');
        return;
      }
    }

    console.log();

    // Step 2: Version Bump
    logHeader('Step 2: Version Management');
    const { shouldBumpVersion } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldBumpVersion',
        message: 'Would you like to bump the version?',
        default: true,
      },
    ]);

    if (shouldBumpVersion) {
      const versionResult = await versionBumpAction();
      if (!versionResult.success) {
        logInfo('Workflow aborted.');
        return;
      }
      logSuccess(`Version updated to ${versionResult.newVersion}`);
    }

    console.log();

    // Step 3: Publishing
    logHeader('Step 3: Publishing');
    const publishSuccess = await publishAction();

    if (publishSuccess) {
      console.log();
      console.log(chalk.bold.green('🎉 Complete workflow finished successfully!'));
    } else {
      logError('Publishing workflow failed.');
    }
  } catch (error) {
    logError(`Workflow failed: ${error.message}`);
  }
}

// Main menu
async function showMainMenu() {
  console.log(chalk.bold.cyan('📦 Next Form Action CLI'));
  console.log(chalk.bold.cyan('========================'));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        {
          name: '🚀 Complete Publishing Workflow (recommended)',
          value: 'full-workflow',
          short: 'Full Workflow',
        },
        new inquirer.Separator(),
        {
          name: '🔍 Validate Package',
          value: 'validate',
          short: 'Validate',
        },
        {
          name: '📦 Bump Version',
          value: 'version',
          short: 'Version',
        },
        {
          name: '📤 Publish to NPM',
          value: 'publish',
          short: 'Publish',
        },
        new inquirer.Separator(),
        {
          name: '❌ Exit',
          value: 'exit',
          short: 'Exit',
        },
      ],
    },
  ]);

  return action;
}

async function main() {
  try {
    while (true) {
      const action = await showMainMenu();
      console.log();

      switch (action) {
        case 'full-workflow':
          await fullPublishWorkflow();
          break;
        case 'validate':
          await validateAction();
          break;
        case 'version':
          await versionBumpAction();
          break;
        case 'publish':
          await publishAction();
          break;
        case 'exit':
          console.log(chalk.yellow('👋 Goodbye!'));
          process.exit(0);
          break;
        default:
          logError('Invalid action selected');
          continue;
      }

      // Ask if user wants to continue after each action
      console.log();
      const { continueAction } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAction',
          message: 'Would you like to perform another action?',
          default: true,
        },
      ]);

      if (!continueAction) {
        console.log(chalk.yellow('👋 Goodbye!'));
        process.exit(0);
      }

      console.log(); // Add spacing before showing menu again
    }
  } catch (error) {
    logError(`CLI failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Script interrupted by user'));
  process.exit(0);
});

main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
