import * as path from 'path';
import * as fs from 'fs';
import { copyDir, copyFile, ensureDir, pathExists } from '../utils/fsUtils';
import { findPackageRoot } from '../utils/packageUtils';

export interface SpecInstallOptions {
  projectRoot: string;
  force?: boolean;
}

export interface SpecInstallResult {
  baseCopied: number;
  projectCopied: number;
  projectSkipped: number;
  agentsCopied: number;
}

/**
 * Installs FluidSpec files to a project
 */
export function installSpecFiles(options: SpecInstallOptions): SpecInstallResult {
  const { projectRoot, force = false } = options;
  const packageRoot = findPackageRoot();
  const specTemplatesRoot = path.join(packageRoot, 'templates', 'spec');

  const result: SpecInstallResult = {
    baseCopied: 0,
    projectCopied: 0,
    projectSkipped: 0,
    agentsCopied: 0
  };

  if (!pathExists(specTemplatesRoot)) {
    console.warn(`Spec templates directory not found at ${specTemplatesRoot}`);
    return result;
  }

  const targetSpecRoot = path.join(projectRoot, '.fluidspec', 'spec');
  const baseSourceDir = path.join(specTemplatesRoot, 'base');
  const projectTemplateDir = path.join(specTemplatesRoot, 'project');
  const baseTargetDir = path.join(targetSpecRoot, 'base');
  const projectTargetDir = path.join(targetSpecRoot, 'project');

  ensureDir(targetSpecRoot);

  // Copy base spec files (always overwrite)
  if (pathExists(baseSourceDir)) {
    console.log(`\nCopying FluidSpec base files to: ${baseTargetDir}`);
    const { copied } = copyDir(baseSourceDir, baseTargetDir, true);
    result.baseCopied = copied;
    console.log(`  Base files copied: ${copied} (overwritten if existed)`);
  } else {
    console.warn(`Warning: Base spec templates not found at ${baseSourceDir}`);
  }

  // Copy project spec templates (skip if they exist)
  if (pathExists(projectTemplateDir)) {
    console.log(`\nCopying project spec templates to: ${projectTargetDir}`);
    ensureDir(projectTargetDir);

    const { copied, skipped } = copyProjectTemplates(projectTemplateDir, projectTargetDir);
    result.projectCopied = copied;
    result.projectSkipped = skipped;

    console.log(`  Project templates copied: ${copied}`);
    if (skipped > 0) {
      console.log(`  Project templates skipped (existing): ${skipped}`);
      if (force) {
        console.log('  Note: Project spec files are not overwritten, even with --force.');
      }
    }
  } else {
    console.warn(`Warning: Project spec templates not found at ${projectTemplateDir}`);
  }

  // Copy agents configuration (always overwrite)
  const agentsSourceDir = path.join(specTemplatesRoot, 'agents');
  const agentsTargetDir = path.join(projectRoot, '.fluidspec', 'agents');

  if (pathExists(agentsSourceDir)) {
    console.log(`\nCopying agent configuration to: ${agentsTargetDir}`);
    const { copied } = copyDir(agentsSourceDir, agentsTargetDir, true);
    result.agentsCopied = copied;
    console.log(`  Agent files copied: ${copied} (overwritten if existed)`);
  } else {
    console.warn(`Warning: Agents directory not found at ${agentsSourceDir}`);
  }

  return result;
}

/**
 * Recursively copies project template files, renaming .template.md to .md
 * Skips files that already exist
 */
function copyProjectTemplates(
  sourceDir: string,
  targetDir: string
): { copied: number; skipped: number } {
  let copied = 0;
  let skipped = 0;

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      ensureDir(targetPath);
      const result = copyProjectTemplates(sourcePath, targetPath);
      copied += result.copied;
      skipped += result.skipped;
      continue;
    }

    if (entry.isFile()) {
      const targetFilename = entry.name.endsWith('.template.md')
        ? entry.name.replace(/\.template\.md$/, '.md')
        : entry.name;
      const finalTargetPath = path.join(targetDir, targetFilename);

      if (fs.existsSync(finalTargetPath)) {
        skipped++;
        continue;
      }

      copyFile(sourcePath, finalTargetPath, false);
      copied++;
    }
  }

  return { copied, skipped };
}
