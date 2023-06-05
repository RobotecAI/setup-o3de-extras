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

    // Run the main script on the modified container
    const mainOutput = await runContainerScript(container, scriptToExecute);
    core.info('Main script output:');
    core.info(mainOutput);

    // Perform assertions on the output as needed
    if (mainOutput.includes('RESULT: ALL TESTS PASSED')) {
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
