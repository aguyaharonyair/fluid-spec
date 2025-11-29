import * as path from 'path';
import * as fs from 'fs';

/**
 * Package.json interface
 */
export interface PackageJson {
  name: string;
  version: string;
  [key: string]: unknown;
}

/**
 * Finds the root directory of this package
 * Works both in development (src/) and production (dist/) environments
 *
 * @returns Absolute path to package root
 * @throws Error if package root cannot be found
 */
export function findPackageRoot(): string {
  let currentDir = __dirname;

  // Walk up the directory tree until we find package.json
  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Verify this is the right package
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.name === '@digital-fluid/fluid-agent-spec') {
          return currentDir;
        }
      } catch (error) {
        // Continue searching if JSON parsing fails
      }
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find @digital-fluid/fluid-agent-spec package root');
}

/**
 * Gets the package.json content
 *
 * @returns Parsed package.json object
 * @throws Error if package.json cannot be read or parsed
 */
export function getPackageJson(): PackageJson {
  const packageRoot = findPackageRoot();
  const packageJsonPath = path.join(packageRoot, 'package.json');
  const content = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(content) as PackageJson;
}

/**
 * Resolves a path relative to the package root
 *
 * @param relativePath - Path segments relative to package root
 * @returns Absolute path
 */
export function resolvePackagePath(...relativePath: string[]): string {
  const packageRoot = findPackageRoot();
  return path.join(packageRoot, ...relativePath);
}
