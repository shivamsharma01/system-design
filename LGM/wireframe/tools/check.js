import { readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for (const dir of ['.', 'tools', 'tests']) {
  for (const f of readdirSync(dir).filter(f => f.endsWith('.js'))) {
    execFileSync(process.execPath, ['--check', `${dir}/${f}`], { stdio: 'inherit' });
  }
}
console.log('JavaScript syntax checks passed.');
