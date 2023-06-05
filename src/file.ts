import { stat } from 'fs';

export function checkIfFile(filePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    stat(filePath, (err, stats) => {
      if (err) {
        console.error(`Failed to retrieve file information: ${filePath}`);
        reject(err);
      } else {
        resolve(stats.isFile());
      }
    });
  });
}
