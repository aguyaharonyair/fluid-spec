import * as path from 'path';
import * as fs from 'fs';
import { copyDir, ensureDir } from '../utils/fsUtils';

export interface CommandInstallOptions {
  templatesDir: string;
  targetDir: string;
  force: boolean;
}

export interface CommandInstallResult {
  totalCopied: number;
  totalSkipped: number;
  installedCommands: string[];
}

/**
 * Installs command templates from a source directory to a target directory
 */
export function installCommandTemplates(options: CommandInstallOptions): CommandInstallResult {
  const { templatesDir, targetDir, force } = options;

  ensureDir(targetDir);

  const templateDirs = fs.readdirSync(templatesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  let totalCopied = 0;
  let totalSkipped = 0;
  const installedCommands: string[] = [];

  for (const templateDir of templateDirs) {
    const sourcePath = path.join(templatesDir, templateDir);
    const commandJsonPath = path.join(sourcePath, 'command.json');

    // Check if command.json exists
    if (!fs.existsSync(commandJsonPath)) {
      console.warn(`Warning: Skipping ${templateDir} - no command.json found`);
      continue;
    }

    // Read command.json
    const commandJson = JSON.parse(fs.readFileSync(commandJsonPath, 'utf8'));

    // Check if it's a multi-command template
    if (commandJson.commands && Array.isArray(commandJson.commands)) {
      // Handle multiple commands in one folder
      for (const cmd of commandJson.commands) {
        const cmdTargetDir = path.join(targetDir, `${templateDir}-${cmd.id}`);
        ensureDir(cmdTargetDir);

        // Create command.json for this specific command
        const singleCommandJson = {
          name: cmd.name,
          version: cmd.version,
          description: cmd.description,
          entry: 'prompt.md',
          input_type: cmd.input_type
        };

        const targetCommandJsonPath = path.join(cmdTargetDir, 'command.json');
        const targetPromptPath = path.join(cmdTargetDir, 'prompt.md');
        const sourcePromptPath = path.join(sourcePath, cmd.entry);

        // Copy or skip based on force flag
        let copied = 0;
        let skipped = 0;

        if (force || !fs.existsSync(targetCommandJsonPath)) {
          fs.writeFileSync(targetCommandJsonPath, JSON.stringify(singleCommandJson, null, 2));
          copied++;
        } else {
          skipped++;
        }

        if (force || !fs.existsSync(targetPromptPath)) {
          fs.copyFileSync(sourcePromptPath, targetPromptPath);
          copied++;
        } else {
          skipped++;
        }

        totalCopied += copied;
        totalSkipped += skipped;
        installedCommands.push(`${templateDir}-${cmd.id}`);
      }
    } else {
      // Standard single-command template
      const result = copyDir(sourcePath, path.join(targetDir, templateDir), force);
      totalCopied += result.copied;
      totalSkipped += result.skipped;
      installedCommands.push(templateDir);
    }
  }

  return {
    totalCopied,
    totalSkipped,
    installedCommands
  };
}
