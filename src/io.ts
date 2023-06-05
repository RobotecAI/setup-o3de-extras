import { execSync } from 'child_process';
import { rimraf } from 'rimraf'; 

export function writeToFile(filePath: string, data: string): Promise<void> {

  return new Promise<void>((resolve) => {
    const command = `echo "${data}" > ${filePath}`;
    const output = execSync(command).toString();
    resolve();
  });
}

export function removeDirectory(directoryPath: string): Promise<void> {

  return new Promise<void>((resolve) => {
    rimraf(directoryPath, {preserveRoot: false});
    resolve();
  });
}

// Sync version of removeDirectory

export function removeDirectorySync(directoryPath: string): void {
  rimraf.sync(directoryPath, {preserveRoot: false});
}