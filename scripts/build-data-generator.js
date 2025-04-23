import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Compile TypeScript file
exec('npx tsc src/scripts/generateStudentData.ts --outDir dist/scripts --esModuleInterop --module es2020 --target es2020', 
  { cwd: rootDir },
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error compiling TypeScript: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`TypeScript compilation stderr: ${stderr}`);
      return;
    }
    console.log('TypeScript compilation successful');
    
    // Run the compiled JavaScript
    exec('node dist/scripts/generateStudentData.js',
      { cwd: rootDir },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running script: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`Script stderr: ${stderr}`);
          return;
        }
        console.log(stdout);
      }
    );
  }
);
