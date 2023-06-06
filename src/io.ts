import { execSync } from 'child_process';
import { rimraf } from 'rimraf'; 

export async function writeToFile(filePath: string, data: string): Promise<void> {

  return new Promise<void>((resolve) => {
    const command = `echo "${data}" > ${filePath}`;
    execSync(command).toString();
    resolve();
  });
}

export async function removeDirectory(directoryPath: string): Promise<void> {

  return new Promise<void>((resolve) => {
    rimraf(directoryPath, {preserveRoot: false});
    resolve();
  });
}

// Sync version of removeDirectory

export function removeDirectorySync(directoryPath: string): void {
  rimraf.sync(directoryPath, {preserveRoot: false});
}