# Project Architecture Metadata

**Project:** @digital-fluid/fluid-agent-spec
**Version:** 0.1.0
**Type:** TypeScript Template Distribution Package
**License:** MIT
**Node.js:** >=18

---

## Table of Contents

- [Overview](#overview)
- [Core Architecture](#core-architecture)
- [Directory Structure](#directory-structure)
- [Build System](#build-system)
- [Module System](#module-system)
- [Key Components](#key-components)
- [Template System](#template-system)
- [Architectural Patterns](#architectural-patterns)
- [Testing Strategy](#testing-strategy)
- [Type System](#type-system)
- [Distribution Model](#distribution-model)

---

## Overview

### Project Purpose

A **zero-dependency TypeScript package** that distributes:
1. **FluidSpec Standards** - Structured task specification format for software development
2. **Claude AI Command Templates** - Pre-configured AI agent personas for task engineering and development workflows
3. **Distribution Infrastructure** - CLI tool and programmatic API for integration

### Key Characteristics

- ✅ **Zero runtime dependencies** (Node.js core modules only)
- ✅ **Git-installable** (no npm registry required)
- ✅ **Dual-module system** (ESM + CJS)
- ✅ **TypeScript-first** with full type definitions
- ✅ **Custom build pipeline** for dual-format generation
- ✅ **Selective update strategy** (preserve user customizations)

---

## Core Architecture

### Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Language | TypeScript 5.3+ | Strict mode enabled |
| Target | ES2020 | Modern JavaScript features |
| Module System | Dual (CJS + ESM) | Custom post-processing |
| Build Tool | Custom scripts | Zero build dependencies |
| Test Framework | Custom | Simple test() pattern |
| CLI Parser | Custom | No argument parsing library |
| File Operations | Node.js `fs` | Synchronous operations |

### Dependencies

**Runtime:** None
**Development Only:**
- `typescript: ^5.3.0`
- `@types/node: ^20.0.0`

---

## Directory Structure

```
fluid-agent-spec/
├── src/                          # TypeScript source files
│   ├── index.ts                  # Library API (public exports)
│   ├── cli.ts                    # CLI entrypoint with argument parsing
│   ├── commands/
│   │   └── claudeInit.ts         # claude:init command implementation
│   └── utils/
│       └── fsUtils.ts            # File system utilities
│
├── templates/                    # Template files (distribution payload)
│   ├── claude/                   # Claude command templates
│   │   └── fluid/                # Multi-command template suite
│   │       ├── command.json      # Multi-command manifest
│   │       ├── create-task.md    # Task creation agent (218 lines)
│   │       ├── execute-task.md   # Task execution agent (501 lines)
│   │       ├── create-branch.md  # Git branch workflow (119 lines)
│   │       ├── commit.md         # Git commit workflow (66 lines)
│   │       └── create-pr.md      # Pull request creation (43 lines)
│   │
│   └── spec/                     # FluidSpec documentation templates
│       ├── base/                 # Core FluidSpec docs (always overwritten)
│       │   ├── README.md
│       │   ├── quick-reference.md
│       │   ├── task-types.md
│       │   ├── constraints.md
│       │   ├── conventions.md
│       │   └── _shared-concepts.md
│       │
│       ├── project/              # Project-specific templates
│       │   ├── task-template.template.md  # Renamed to .md on copy
│       │   ├── tech-stack.md
│       │   ├── design-system.md
│       │   └── design-system/    # Modular design system docs (7 files)
│       │       ├── 00-overview.md
│       │       ├── 01-color-palette.md
│       │       ├── 02-typography.md
│       │       ├── 03-layout.md
│       │       ├── 04-components.md
│       │       ├── 05-content-styling.md
│       │       ├── 06-animations.md
│       │       └── 07-constraints.md
│       │
│       ├── agents/               # Agent configuration
│       │   ├── agents.yaml       # Agent definitions
│       │   ├── README.md
│       │   └── prompts/          # Specialized agent prompts (7 files)
│       │       ├── dev-planner.md
│       │       ├── dev-implementation.md
│       │       ├── test-agent.md
│       │       ├── types-and-logic-agent.md
│       │       ├── ui-agent.md
│       │       ├── integration-agent.md
│       │       └── refactor-agent.md
│       │
│       ├── examples/             # Example task specifications
│       │   ├── README.md
│       │   ├── task-feature-complete.yaml
│       │   ├── task-bugfix-minimal.yaml
│       │   └── task-refactor.yaml
│       │
│       └── indexes/              # Reference documentation
│           ├── README.md
│           ├── frontend-index.md
│           ├── backend-index.md
│           ├── testing-index.md
│           └── workflow-index.md
│
├── scripts/                      # Build and maintenance scripts
│   ├── build.js                  # Two-stage build pipeline
│   ├── clean.js                  # Dist directory cleanup
│   └── test.js                   # Custom test suite
│
├── dist/                         # Compiled output (generated, gitignored)
│   ├── index.{cjs,mjs,d.ts}     # Library exports
│   ├── cli.{cjs,mjs,d.ts}       # CLI executable (cli.cjs has shebang)
│   ├── commands/
│   │   └── claudeInit.{cjs,mjs,d.ts}
│   └── utils/
│       └── fsUtils.{cjs,mjs,d.ts}
│
├── package.json                  # Package manifest
├── tsconfig.json                 # TypeScript configuration
├── .gitignore                    # Git ignore rules
├── README.md                     # User documentation
├── CLAUDE.md                     # AI agent guidance
├── METADATA.md                   # This file
└── LICENSE                       # MIT license
```

---

## Build System

### Two-Stage Build Pipeline

#### Stage 1: TypeScript Compilation

**Command:** `npx tsc`
**Input:** `src/**/*.ts`
**Output:** `dist/**/*.js` + `dist/**/*.d.ts` + declaration maps

**Configuration** ([tsconfig.json](tsconfig.json)):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

#### Stage 2: Dual-Format Generation

**Script:** [scripts/build.js](scripts/build.js)
**Process:**

1. Recursively scan all `.js` files in `dist/`
2. Remove existing shebangs from all files
3. Add shebang only to `cli.js`: `#!/usr/bin/env node`
4. For each `.js` file, create two variants:
   - **CJS variant** (`.cjs`): Rewrite `require("./path")` → `require("./path.cjs")`
   - **MJS variant** (`.mjs`): Rewrite `require("./path")` → `require("./path.mjs")`
5. Delete original `.js` files
6. Make `cli.cjs` executable (`chmod 755`)

**Result:**
```
dist/
├── index.cjs          # CommonJS variant
├── index.mjs          # ESM variant
├── index.d.ts         # Shared type definitions
├── cli.cjs            # #!/usr/bin/env node (executable)
├── cli.mjs            # Non-executable variant
└── cli.d.ts           # Shared type definitions
```

### Build Commands

```bash
# Full build
pnpm build              # Runs scripts/build.js (tsc → dual-format)

# Clean
pnpm clean              # Removes dist/

# Rebuild
pnpm prepare            # clean + build (runs automatically on git install)

# Test
pnpm test               # Runs scripts/test.js
```

---

## Module System

### Dual-Format Strategy

The package supports both CommonJS and ESM consumers through a custom dual-format generation process.

**Package.json Exports:**
```json
{
  "main": "dist/index.cjs",        // CommonJS entrypoint
  "module": "dist/index.mjs",      // ESM entrypoint
  "types": "dist/index.d.ts",      // TypeScript definitions
  "bin": {
    "fluidspec": "dist/cli.cjs"    // CLI executable
  }
}
```

### Import Path Transformation

**Original TypeScript:**
```typescript
import { copyDir } from './utils/fsUtils';
```

**After tsc (CommonJS):**
```javascript
const fsUtils = require("./utils/fsUtils");
```

**After dual-format generation:**

**CJS variant (`.cjs`):**
```javascript
const fsUtils = require("./utils/fsUtils.cjs");
```

**MJS variant (`.mjs`):**
```javascript
const fsUtils = require("./utils/fsUtils.mjs");
```

### Why Custom Build?

- ✅ Zero build dependencies (no rollup/webpack/esbuild)
- ✅ Leverage TypeScript's native CJS output
- ✅ Simple transformation (regex-based)
- ✅ Full control over shebang and permissions
- ✅ Minimal code transformation

---

## Key Components

### 1. Library API ([src/index.ts](src/index.ts))

**Public Exports:**

```typescript
// List available Claude command templates
export function listClaudeCommandTemplates(): ClaudeCommandTemplate[]

// Initialize Claude commands in target project
export function initClaudeCommands(options?: InitClaudeCommandsOptions): void

// Re-exported utilities
export { copyDir, ensureDir, pathExists } from './utils/fsUtils'
```

**Types:**
```typescript
interface ClaudeCommandTemplate {
  id: string;            // Directory name (e.g., "fluid")
  name: string;          // Human-readable name
  description: string;   // Template description
  sourceDir: string;     // Absolute path to template
}

interface InitClaudeCommandsOptions {
  projectRoot?: string;  // Defaults to process.cwd()
  force?: boolean;       // Overwrite existing files
}
```

**Package Root Discovery:**
- Walks up directory tree from `__dirname`
- Searches for `package.json` with `name: "@digital-fluid/fluidspec"`
- Works in both development (`src/`) and production (`dist/`)
- Critical for locating `templates/` when installed via Git

### 2. CLI Implementation ([src/cli.ts](src/cli.ts))

**Commands:**

| Command | Description |
|---------|-------------|
| `claude:init` | Install Claude commands and FluidSpec files |
| `list` | List available templates with metadata |
| `help` | Display usage information |
| `version` | Show package version |

**Custom Argument Parser:**
- Parses long flags (`--flag`)
- Parses short flags (`-f`)
- Handles composite commands (`claude:init`)
- No dependencies (custom implementation)

**Error Handling:**
- Try-catch around command execution
- User-friendly error messages
- Exit codes: 0 (success), 1 (error)

### 3. Claude Init Command ([src/commands/claudeInit.ts](src/commands/claudeInit.ts))

**Primary Function:**
```typescript
export function claudeInit(options: ClaudeInitOptions): void
```

**Operations:**

1. **Create `.claude/commands/` directory**
2. **Process Claude templates:**
   - Scans `templates/claude/` subdirectories
   - Reads `command.json` from each template
   - Handles two template types:
     - **Single-command**: Standard template with `prompt.md`
     - **Multi-command**: Array of commands in `command.json`

3. **Multi-command expansion** (e.g., `fluid/` template):
   - Iterates through `commands` array
   - Creates separate directory for each: `{templateDir}-{cmd.id}`
   - Example: `fluid/` → `fluid-create-task/`, `fluid-execute-task/`, etc.
   - Generates individual `command.json` for each command
   - Copies corresponding `.md` file from `cmd.entry`

4. **Copy FluidSpec files** via `initSpecFiles()`:
   - **Base specs** → `.fluidspec/spec/base/` (always overwritten)
   - **Project specs** → `.fluidspec/spec/project/` (skip if exists)
   - **Template file renaming**: `*.template.md` → `*.md`
   - **Agent configs** → `.fluidspec/agents/` (always overwritten)

**Copy Strategy:**
```typescript
// Base specs: Always overwrite to stay current
copyDir(baseSourceDir, baseTargetDir, true);

// Project specs: Never overwrite existing .md files
copyProjectTemplates(projectTemplateDir, projectTargetDir);
// - Renames .template.md to .md
// - Skips if .md already exists
// - Even --force doesn't overwrite project files
```

### 4. File System Utilities ([src/utils/fsUtils.ts](src/utils/fsUtils.ts))

**Functions:**

```typescript
// Create directory recursively if missing
export function ensureDir(dirPath: string): void

// Check if path exists
export function pathExists(filePath: string): boolean

// Copy single file with force option
export function copyFile(src: string, dest: string, force: boolean): boolean

// Recursively copy directory
export function copyDir(
  src: string,
  dest: string,
  force: boolean
): { copied: number; skipped: number }

// List subdirectory names
export function listSubdirectories(dirPath: string): string[]

// Generic JSON file reader
export function readJsonFile<T>(filePath: string): T
```

**Design Principles:**
- No external dependencies
- Synchronous operations (appropriate for CLI/build context)
- Explicit return values for tracking
- Type-safe where possible

---

## Template System

### Claude Command Templates

**Location:** `templates/claude/`

**Current Structure:**
- Single template directory: `fluid/`
- Multi-command manifest with 5 commands

**Commands:**

| Command ID | File | Lines | Purpose |
|------------|------|-------|---------|
| `create-task` | `create-task.md` | 218 | Convert ideas to FluidSpec tasks |
| `execute-task` | `execute-task.md` | 501 | Implement FluidSpec tasks with plan approval |
| `create-branch` | `create-branch.md` | 119 | Git branch creation workflow |
| `commit` | `commit.md` | 66 | Git commit workflow |
| `create-pr` | `create-pr.md` | 43 | Pull request creation |

**Multi-command Format:**
```json
{
  "commands": [
    {
      "name": "Fluid Make Task",
      "id": "create-task",
      "version": "1.0.0",
      "description": "Create FluidSpec tasks.",
      "entry": "create-task.md",
      "input_type": "text"
    },
    {
      "name": "Fluid Execute Task",
      "id": "execute-task",
      "version": "1.0.0",
      "description": "Execute FluidSpec tasks.",
      "entry": "execute-task.md",
      "input_type": "text"
    }
    // ... 3 more commands
  ]
}
```

**Installation Result:**
```
.claude/commands/
├── fluid-create-task/
│   ├── command.json    # Generated from multi-command manifest
│   └── prompt.md       # Copied from create-task.md
├── fluid-execute-task/
│   ├── command.json
│   └── prompt.md
├── fluid-create-branch/
│   ├── command.json
│   └── prompt.md
├── fluid-commit/
│   ├── command.json
│   └── prompt.md
└── fluid-create-pr/
    ├── command.json
    └── prompt.md
```

### FluidSpec Templates

**Location:** `templates/spec/`

**Directory Structure:**

```
spec/
├── base/                    # Core FluidSpec documentation
│   ├── README.md            # FluidSpec overview
│   ├── quick-reference.md   # Cheat sheet
│   ├── task-types.md        # Task categorization
│   ├── constraints.md       # Development constraints
│   ├── conventions.md       # Naming and formatting rules
│   └── _shared-concepts.md  # Common terminology
│
├── project/                 # Project-specific templates
│   ├── task-template.template.md    # Task creation template
│   ├── tech-stack.md                # Technology documentation
│   ├── design-system.md             # Design system overview
│   ├── design-system/               # Modular design docs (7 files)
│   └── custom/                      # User-extensible directory
│
├── agents/                  # Agent configuration
│   ├── agents.yaml          # Agent definitions
│   ├── README.md
│   └── prompts/             # Specialized agent prompts (7 files)
│
├── examples/                # Example task specifications
│   ├── README.md
│   ├── task-feature-complete.yaml
│   ├── task-bugfix-minimal.yaml
│   └── task-refactor.yaml
│
└── indexes/                 # Reference documentation
    ├── README.md
    ├── frontend-index.md
    ├── backend-index.md
    ├── testing-index.md
    └── workflow-index.md
```

**Copy Strategy:**

| Directory | Target | Overwrite Policy |
|-----------|--------|------------------|
| `base/` | `.fluidspec/spec/base/` | Always overwrite |
| `project/` | `.fluidspec/spec/project/` | Skip if exists |
| `agents/` | `.fluidspec/agents/` | Always overwrite |
| `examples/` | `.fluidspec/spec/examples/` | Always overwrite |
| `indexes/` | `.fluidspec/spec/indexes/` | Always overwrite |

**Template Renaming:**
- `task-template.template.md` → `task-template.md` (first run only)
- Subsequent runs skip if `.md` file exists

---

## Architectural Patterns

### 1. Zero-Dependency Philosophy

**Principle:** Use only Node.js core modules

**Implementation:**
- File operations: `fs`, `path`
- CLI parsing: Custom argument parser
- Test framework: Custom `test(name, fn)` pattern
- Build system: Custom dual-format generation

**Benefits:**
- ✅ Minimal attack surface
- ✅ No dependency maintenance burden
- ✅ Faster installation
- ✅ Works in any Node.js environment

### 2. Package Root Discovery Pattern

**Problem:** Locate `templates/` directory when:
- Running from source (`src/`)
- Running from built code (`dist/`)
- Installed as Git dependency (`node_modules/@digital-fluid/fluidspec/`)

**Solution:**
```typescript
function findPackageRoot(): string {
  let currentDir = __dirname;

  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (pkg.name === '@digital-fluid/fluidspec') {
        return currentDir;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find package root');
}
```

**Used in:** `src/index.ts`, `src/commands/claudeInit.ts`

### 3. Multi-Command Template System

**Innovation:** Single template directory can define multiple related commands

**Traditional Approach:**
```
templates/claude/
├── create-task/
│   ├── command.json
│   └── prompt.md
├── execute-task/
│   ├── command.json
│   └── prompt.md
└── ...
```

**Multi-Command Approach:**
```
templates/claude/
└── fluid/
    ├── command.json     # Defines 5 commands
    ├── create-task.md
    ├── execute-task.md
    ├── create-branch.md
    ├── commit.md
    └── create-pr.md
```

**Benefits:**
- ✅ Group related commands
- ✅ Reduce template directory clutter
- ✅ Share common metadata
- ✅ Easier versioning of command suites

**Detection Logic:**
```typescript
const commandJson = JSON.parse(fs.readFileSync(commandJsonPath, 'utf8'));

if (Array.isArray(commandJson.commands)) {
  // Multi-command template
  for (const cmd of commandJson.commands) {
    // Create separate directory for each
  }
} else {
  // Standard single-command template
  copyDir(sourcePath, targetPath);
}
```

### 4. Selective Overwrite Strategy

**Base Files** (`.fluidspec/spec/base/`):
```typescript
copyDir(baseSourceDir, baseTargetDir, true);  // Always force=true
```
- **Rationale:** Package owns these files, users should not edit them
- **Benefit:** Users get latest FluidSpec standards on update

**Project Files** (`.fluidspec/spec/project/`):
```typescript
copyProjectTemplates(projectTemplateDir, projectTargetDir);
// force parameter ignored, always skips existing .md files
```
- **Rationale:** Users customize these files for their project
- **Benefit:** Preserves user modifications across package updates
- **Note:** Even `--force` flag doesn't overwrite

**Template Renaming:**
```typescript
const targetFilename = entry.name.endsWith('.template.md')
  ? entry.name.replace(/\.template\.md$/, '.md')
  : entry.name;
```
- First run: `task-template.template.md` → `task-template.md`
- Subsequent runs: Skip `task-template.md` if exists

### 5. Git-First Distribution

**No npm registry required:**
```bash
pnpm add git+https://github.com/aharonyaircohen/fluid-spec.git
```

**Package.json Requirements:**
```json
{
  "files": [
    "dist",
    "templates",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "prepare": "npm run clean && npm run build"
  }
}
```

**Installation Workflow:**
1. Package manager clones repository
2. Runs `npm install` (installs devDependencies)
3. Runs `prepare` script (builds package)
4. Package is ready to use

**Benefits:**
- ✅ No npm publish step required
- ✅ Direct version control integration
- ✅ Easy to fork and customize
- ✅ Transparent source code

### 6. Custom Test Suite

**File:** [scripts/test.js](scripts/test.js)

**Pattern:**
```javascript
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    exitCode = 1;
  }
}

test('Build artifacts exist', () => {
  assert(fs.existsSync('dist/index.cjs'));
  assert(fs.existsSync('dist/index.mjs'));
  assert(fs.existsSync('dist/index.d.ts'));
});
```

**Test Coverage:**
- ✓ Build artifacts verification
- ✓ Template structure validation
- ✓ CLI functionality tests
- ✓ Multi-command expansion test
- ✓ Integration test (full `claude:init` workflow)

**Benefits:**
- ✅ No test framework dependency
- ✅ Fast execution
- ✅ Easy to understand and modify
- ✅ Comprehensive integration testing

---

## Testing Strategy

### Test Suite ([scripts/test.js](scripts/test.js))

**Test Categories:**

1. **Build Verification:**
   - Dist directory exists
   - CLI is executable
   - All required files present (`.cjs`, `.mjs`, `.d.ts`)

2. **Template Validation:**
   - Template directories exist
   - Each template has `command.json`
   - Multi-command templates have all referenced `.md` files
   - Single-command templates have `prompt.md`

3. **Spec Template Validation:**
   - Base spec directory exists with `.md` files
   - Project spec directory exists
   - Template files (`.template.md`) present
   - Custom directory exists

4. **CLI Functionality:**
   - `help` command works
   - `list` command works and outputs correct data
   - `version` command works

5. **Integration Test:**
   - Creates temporary test project
   - Runs `claude:init`
   - Verifies `.claude/commands/` structure
   - Verifies multi-command expansion
   - Verifies `.fluidspec/` structure
   - Verifies base/project file separation
   - Verifies template renaming
   - Cleans up test project

**Running Tests:**
```bash
pnpm test
```

---

## Type System

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,              // Full strict mode
    "target": "ES2020",          // Modern JavaScript
    "module": "CommonJS",        // CJS for post-processing
    "declaration": true,         // Generate .d.ts files
    "declarationMap": true,      // Source maps for IDE
    "esModuleInterop": true,     // CJS/ESM compatibility
    "resolveJsonModule": true    // Import JSON files
  }
}
```

### Public Interfaces

```typescript
// Template information
export interface ClaudeCommandTemplate {
  id: string;            // Directory name
  name: string;          // Human-readable name
  description: string;   // Template description
  sourceDir: string;     // Absolute path to template
}

// Initialization options
export interface InitClaudeCommandsOptions {
  projectRoot?: string;  // Defaults to process.cwd()
  force?: boolean;       // Overwrite existing files
}
```

### Internal Interfaces

```typescript
// Command metadata (from command.json)
interface CommandMetadata {
  name: string;
  version: string;
  description: string;
  entry: string;
  input_type: string;
}

// Internal command options
interface ClaudeInitOptions {
  projectRoot: string;
  force: boolean;
}

interface InitSpecFilesOptions {
  force?: boolean;
}
```

---

## Distribution Model

### Installation

**Git-based installation:**
```bash
# Install from GitHub
pnpm add git+https://github.com/aharonyaircohen/fluid-spec.git

# Install specific branch
pnpm add git+https://github.com/aharonyaircohen/fluid-spec.git#branch-name

# Install specific commit
pnpm add git+https://github.com/aharonyaircohen/fluid-spec.git#commit-hash
```

### Usage

**CLI:**
```bash
# Initialize Claude commands and FluidSpec files
npx fluidspec claude:init

# List available templates
npx fluidspec list

# Show help
npx fluidspec help

# Show version
npx fluidspec version
```

**Programmatic API:**
```typescript
import { initClaudeCommands, listClaudeCommandTemplates } from '@digital-fluid/fluidspec';

// Initialize in current directory
initClaudeCommands();

// Initialize with options
initClaudeCommands({
  projectRoot: '/path/to/project',
  force: true
});

// List templates
const templates = listClaudeCommandTemplates();
templates.forEach(t => {
  console.log(`${t.id}: ${t.name}`);
});
```

### Published Files

**package.json files array:**
```json
{
  "files": [
    "dist",        // Compiled code
    "templates",   // Template files
    "README.md",   // Documentation
    "LICENSE"      // License file
  ]
}
```

**Excluded files** (via `.gitignore`):
- `node_modules/`
- `dist/` (regenerated on install)
- `.DS_Store`
- `*.log`
- `.env*`
- `.pnpm-debug.log*`

---

## Key Innovations

### 1. Custom Dual-Format Build System

Transforms TypeScript → CJS → (CJS + ESM) using custom post-processing:
- ✅ No build framework dependencies
- ✅ Leverages TypeScript's native CJS output
- ✅ Simple regex-based transformation
- ✅ Full control over shebang and permissions

### 2. Multi-Command Template Support

Single template directory can define multiple related commands:
- ✅ Group related commands (e.g., `fluid/` → 5 commands)
- ✅ Reduce template directory clutter
- ✅ Share common metadata
- ✅ Easier versioning

### 3. Selective Overwrite Strategy

Different update policies for different file types:
- ✅ Base files: Always overwrite (stay current)
- ✅ Project files: Never overwrite (preserve customizations)
- ✅ Template files: Rename once, skip thereafter

### 4. Package Root Discovery

Robust template location across environments:
- ✅ Works in development (`src/`)
- ✅ Works in production (`dist/`)
- ✅ Works as Git dependency (`node_modules/`)

### 5. Zero-Dependency Philosophy

All functionality uses Node.js core modules:
- ✅ Custom test framework
- ✅ Custom CLI parser
- ✅ Custom build system
- ✅ Minimal attack surface

### 6. Git-First Distribution

No npm registry required:
- ✅ Direct version control integration
- ✅ Easy to fork and customize
- ✅ Transparent source code
- ✅ `prepare` script handles build on install

---

## Summary

**@digital-fluid/fluid-agent-spec** demonstrates a **highly sophisticated yet minimalist architecture** that achieves:

- ✅ **Maximum compatibility** (ESM + CJS)
- ✅ **Zero runtime dependencies**
- ✅ **Flexible template system** (multi-command support)
- ✅ **Selective update strategy** (preserve user customizations)
- ✅ **Git-based distribution** (no npm registry)
- ✅ **Type-safe API** (full TypeScript definitions)

The architecture prioritizes **reliability, simplicity, and maintainability** while providing a **powerful template distribution system** for FluidSpec task specifications and Claude AI command templates.

---

**Generated:** 2025-11-29
**Package Version:** 0.1.0
**Node.js Required:** >=18
