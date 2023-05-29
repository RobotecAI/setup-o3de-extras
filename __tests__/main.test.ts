import {wait} from '../src/wait'
import * as process from 'process'
import {expect, test} from '@jest/globals'
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

function runContainerScript(imageName: string, scriptToExecute: string): string {
  // Write the script to a temporary file
  const tempFilePath = '/tmp/script.sh';
  writeFileSync(tempFilePath, scriptToExecute);

  // Create a temporary container from the image and execute the script
  const command = `docker run --rm -v ${tempFilePath}:${tempFilePath} ${imageName} sh ${tempFilePath}`;
  const output = execSync(command).toString();

  return output;
}

test('Docker Test', () => {
  const container = process.env['INPUT_KHASRETO/O3DE-EXTRAS-DAILY_DEV'] = 'khasreto/o3de-extras-daily_dev';
  const scriptPath = process.env['script-path'] || 'test/test-script.sh';
  // debug print the script path 
  console.log(`scriptPath: ${scriptPath}`);
  const scriptToExecute = readFileSync(scriptPath, 'utf-8');

  const output = runContainerScript(container, scriptToExecute);

  // Perform assertions on the output as needed
  expect(output).toContain('Expected output');
});