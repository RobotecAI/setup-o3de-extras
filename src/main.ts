import * as core from '@actions/core';
import { readFile } from 'fs';
import { runContainerScript } from './container';

async function run(): Promise<void> {
  try {
    const container = core.getInput('container');
    const scriptPath = core.getInput('script-path');

    const scriptToExecute = await new Promise<string>((resolve, reject) => {
      readFile(scriptPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    core.info('Main script output:');

    // Run the main script on the modified container
    const exitCode =
        await runContainerScript(container, scriptToExecute, core.info);

    // Perform assertions on the output as needed
    if (exitCode === 0) {
      core.info('Docker test passed!');
    } else {
      core.error('Docker test failed!');
      core.setFailed('Docker test failed!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message);
      core.setFailed(error.message);
    }
  }
}

run();
