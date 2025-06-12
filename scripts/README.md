# Scripts

This directory contains a unified CLI tool for the project, built with modern CLI packages for an enhanced user experience.

## Dependencies

The CLI uses the following modern packages:
- **[inquirer](https://github.com/SBoudrias/Inquirer.js)**: Interactive command line prompts with validation, selection menus, and confirmations
- **[chalk](https://github.com/chalk/chalk)**: Terminal colors and styling for better readability
- **[ora](https://github.com/sindresorhus/ora)**: Elegant terminal spinners for long-running operations

## cli.js

Unified CLI tool that combines validation, version management, and publishing into a single interactive interface.

### Features

- **🚀 Complete Publishing Workflow**: One-command solution for the entire publish process
- **🔍 Package Validation**: Comprehensive pre-publish checks
- **📦 Version Management**: Interactive version bumping with semver support
- **📤 NPM Publishing**: Safe publishing with multiple confirmation steps
- **Modern UI**: Beautiful interactive prompts with colors, spinners, and visual feedback

### Available Actions

1. **Complete Publishing Workflow (Recommended)**
   - Runs validation checks
   - Optionally bumps version
   - Publishes to npm
   - All in one seamless flow

2. **Individual Actions**
   - Validate Package: Check if ready for publishing
   - Bump Version: Update package version
   - Publish to NPM: Publish current version

### Usage

```bash
# Run the unified CLI (recommended)
pnpm run publish

# Or directly
node scripts/cli.js
```

### Workflow Steps

The complete workflow includes:

1. **📋 Validation**
   - Package.json field validation
   - Build files verification
   - Git status and branch checks
   - NPM authentication verification
   - Quality checks (type-check, lint, format, tests)

2. **📦 Version Management** (optional)
   - Interactive version selection
   - Semver compliance validation
   - Package.json update

3. **🚀 Publishing**
   - Pre-flight safety checks
   - Optional quality checks
   - Package building
   - Dry-run validation
   - Final confirmation
   - Git tagging and pushing
   - NPM publishing

### Safety Features

- **Git Safety**: Prevents publishing with uncommitted changes (with override option)
- **Branch Protection**: Warns when not on main/master branch with colored indicators
- **Version Conflicts**: Checks if version already exists on npm with spinner feedback
- **Quality Gates**: Runs all quality checks with progress indicators before publishing
- **Dry-run Validation**: Safe testing before actual npm publish
- **Multiple Confirmations**: Clear prompts at each critical step
- **Graceful Error Handling**: Colored error messages with helpful guidance
- **Visual Feedback**: Spinners, colors, and clear status indicators throughout the process

### User Experience

The CLI provides:
- 🎨 **Beautiful colors** for different message types
- ⏳ **Progress spinners** for long-running operations  
- 📋 **Interactive menus** with keyboard navigation
- ✅ **Clear success/error indicators** 
- 💡 **Helpful next steps** and guidance
- 🛡️ **Safety confirmations** before destructive actions
- 🚀 **One-command workflow** for complete publishing process

## Migration from Old Scripts

The old individual scripts have been replaced by a single unified CLI:

### Before
```bash
pnpm run validate-publish  # Validation only
pnpm run version-bump      # Version bump only  
pnpm run publish-interactive # Publishing only
```

### After
```bash
pnpm run publish           # Unified CLI with all options
```

The new CLI provides the same functionality but with:
- Better organization in a single interface
- Improved workflow with logical step progression
- Unified error handling and user experience
- Complete publishing workflow option
- Easier maintenance and updates
