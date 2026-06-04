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

async function main() {
  const name = process.argv[2] || 'v1';
  const workspaceRoot = path.resolve(__dirname, '..');
  const snapshotsDir = path.join(workspaceRoot, 'snapshots');
  const target = path.join(snapshotsDir, name);

  try {
    await fs.promises.mkdir(target, { recursive: true });
    const entries = await fs.promises.readdir(workspaceRoot);
    for (const entry of entries) {
      if (exclude.has(entry)) continue;
      if (entry === 'snapshots') continue;
      const src = path.join(workspaceRoot, entry);
      const dest = path.join(target, entry);
      await copyRecursive(src, dest);
    }

    const metadata = {
      name,
      createdAt: new Date().toISOString(),
      workspace: path.basename(workspaceRoot),
    };
    await fs.promises.writeFile(path.join(target, 'snapshot-metadata.json'), JSON.stringify(metadata, null, 2));

    console.log('Snapshot created at', target);
  } catch (err) {
    console.error('Snapshot failed:', err);
    process.exitCode = 2;
  }
}

main();
