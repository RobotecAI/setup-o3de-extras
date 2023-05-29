import * as core from '@actions/core';
import { execSync } from 'child_process';
import { readFile, writeFileSync} from 'fs';

function runContainerScript(imageName: string, scriptToExecute: string): string {
  // Write the script to a temporary file
  const tempFilePath = '/tmp/o3de-extras-test-script.sh';
  // try to remove the file if it exists
  try {
    execSync(`rm ${tempFilePath}`);
  } catch (error) {
    // do nothing
  }

  writeFileSync(tempFilePath, scriptToExecute.toString());

  // Execute the script inside the container
  const command = `docker run --rm -v ${tempFilePath}:${tempFilePath} -v $(pwd)/../o3de-extras:/data/workspace/o3de-extras ${imageName} sh ${tempFilePath}`;
  const output = execSync(command).toString();

  return output;
}

async function run(): Promise<void> {
  try {
    // const container = 'khasreto/o3de-extras-daily_dev';
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
    const mainOutput = runContainerScript(container, scriptToExecute);
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