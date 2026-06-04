const fs = require('fs');
const path = require('path');

const exclude = new Set(['node_modules', '.git', 'snapshots', 'dist', 'build']);

async function copyRecursive(src, dest) {
  const stat = await fs.promises.stat(src);
  if (stat.isDirectory()) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src);
    for (const entry of entries) {
      if (exclude.has(entry)) continue;
      const s = path.join(src, entry);
      const d = path.join(dest, entry);
      await copyRecursive(s, d);
    }
  } else if (stat.isFile()) {
    await fs.promises.copyFile(src, dest);
  }
}

async function prompt(question) {
  return new Promise((resolve) => {
    process.stdout.write(question + ' ');
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      process.stdin.pause();
      resolve(String(data).trim());
    });
  });
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node revert_snapshot.js <snapshot-name>');
    process.exitCode = 2;
    return;
  }
  const workspaceRoot = path.resolve(__dirname, '..');
  const snapshotDir = path.join(workspaceRoot, 'snapshots', name);
  try {
    const stat = await fs.promises.stat(snapshotDir);
    if (!stat.isDirectory()) throw new Error('Snapshot not found');
  } catch (err) {
    console.error('Snapshot not found at', snapshotDir);
    process.exitCode = 2;
    return;
  }

  const answer = await prompt(`This will overwrite current files from snapshot "${name}". Type 'yes' to continue:`);
  if (answer.toLowerCase() !== 'yes') {
    console.log('Aborted by user.');
    return;
  }

  try {
    const entries = await fs.promises.readdir(snapshotDir);
    for (const entry of entries) {
      if (exclude.has(entry)) continue;
      const src = path.join(snapshotDir, entry);
      const dest = path.join(workspaceRoot, entry);
      await copyRecursive(src, dest);
    }
    console.log('Workspace restored from snapshot', name);
  } catch (err) {
    console.error('Restore failed:', err);
    process.exitCode = 2;
  }
}

main();
