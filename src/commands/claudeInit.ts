import * as path from 'path';
import { pathExists } from '../utils/fsUtils';
import { findPackageRoot } from '../utils/packageUtils';
import { installCommandTemplates } from '../services/commandInstaller';
import { installSpecFiles } from '../services/specInstaller';

export interface ClaudeInitOptions {
  projectRoot: string;
  force: boolean;
}

/**
 * Initializes Claude commands in the target project
 * Copies command templates from this package to the host project's .claude/commands/ directory
 */
export function claudeInit(options: ClaudeInitOptions): void {
  const { projectRoot, force } = options;

  // Resolve paths
  const packageRoot = findPackageRoot();
  const templatesDir = path.join(packageRoot, 'templates', 'claude');
  const targetDir = path.join(projectRoot, '.claude', 'commands');

  // Verify templates directory exists
  if (!pathExists(templatesDir)) {
    throw new Error(
      `Templates directory not found at ${templatesDir}. ` +
      `This may indicate a broken package installation.`
    );
  }

  // Install command templates
  console.log(`Creating .claude/commands directory at: ${targetDir}`);
  console.log(`Processing command templates from: ${templatesDir}`);

  const commandResult = installCommandTemplates({
    templatesDir,
    targetDir,
    force
  });

  // Report command installation results
  console.log('\nCommand templates initialized successfully!');
  console.log(`  Copied: ${commandResult.totalCopied} files`);
  if (commandResult.totalSkipped > 0) {
    console.log(`  Skipped: ${commandResult.totalSkipped} files (already exist)`);
    console.log(`  Tip: Use --force to overwrite existing files`);
  }

  console.log('\nAvailable commands:');
  commandResult.installedCommands.forEach(cmd => {
    console.log(`  - /${cmd}`);
  });

  // Install FluidSpec files
  installSpecFiles({ projectRoot, force });

  console.log('\nYou can now use these commands in Claude!');
}
