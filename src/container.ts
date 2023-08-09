import {execSync, spawn, spawnSync} from 'child_process';
import {mkdir} from 'fs';
import os from 'os';
import path from 'path';

import {checkIfFile} from './file';
import {removeDirectorySync, writeToFile} from './io';

export async function runContainerScript(
    imageName: string, scriptToExecute: string,
    coreInfo: (message: string) => void): Promise<number> {
  // Write the script to a temporary file

  const tempFilePath = path.join(os.tmpdir(), 'ci-test');
  const tempFileName = 'script.sh';
  const tempFileFullPath = path.join(tempFilePath, tempFileName);
  const containerScriptsPath = path.join(os.tmpdir(), 'scripts');
  const containerScriptFullPath = path.join(containerScriptsPath, tempFileName);

  try {

    removeDirectorySync(tempFilePath);

    // create the directory
    await new Promise<void>((resolve, reject) => {
      mkdir(tempFilePath, { recursive: true }, (err) => {
        if (err) {
          console.error(`Failed to create directory: ${tempFilePath}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // wait for 1 second before writing to the file
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000); // 1 second delay
    });

    // write the file to the temp file
    await writeToFile(tempFileFullPath, scriptToExecute.toString());

    // check if the created file is a file
    const isFile = await checkIfFile(tempFileFullPath);
    if (!isFile) {
      console.error(`Created file is not a file: ${tempFileFullPath}`);
      throw new Error(`Created file is not a file: ${tempFileFullPath}`);
    } else {
      // Determine the working directory
      const repoPath = execSync('pwd').toString().trim();
      console.debug(`Working directory: ${repoPath}`);

      // Determine the command based on the repo name
      let command = '';
      if (repoPath.endsWith('o3de-extras')) {
        console.debug('o3de-extras detected');
        command = `docker run --rm -v ${tempFilePath}:${containerScriptsPath} -v ${repoPath}:/data/workspace/o3de-extras --workdir /data/workspace/o3de-extras ${imageName} /bin/bash ${containerScriptFullPath}`;
      } else {
        console.debug(`Running on a general-purpose repo: ${repoPath}`);
        command = `docker run --rm -v ${tempFilePath}:${containerScriptsPath} -v ${repoPath}:/data/workspace/repository --workdir /data/workspace/repository ${imageName} /bin/bash ${containerScriptFullPath}`;
      }

      // remove any new line characters
      command = command.replace('\n', '');

      // Execute the Docker command using spawn
      const commandRunner = spawn('sh', ['-c', command]);

      let infoOutput: string = '';
      let errorOutput: string = '';

      commandRunner.stdout.on('data', (data: string) => {
        coreInfo(data);
        infoOutput += data;
      })

      commandRunner.stderr.on('data', (data: string) => {
        coreInfo(data);
        errorOutput += data;
      })

      const exitCode = await new Promise<number>((resolve, reject) => {
        commandRunner.on('close', resolve);
      });

      const output = infoOutput + errorOutput;

      return exitCode;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
