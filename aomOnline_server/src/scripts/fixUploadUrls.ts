/**
 * One-off repair for upload URLs that were stored with the env variable name
 * baked into them — a value like `API_URL=https://host` pasted whole into the
 * deployment panel made every generated URL read
 * `API_URL=https://host/uploads/...`, which no browser can load. config's
 * cleanUrl() stops new ones being written; this rewrites the rows already
 * saved.
 *
 * Dry run (default):  npm run fix:urls
 * Apply the changes:  npm run fix:urls -- --apply
 */
import mongoose from 'mongoose';
import config from '../app/config';

// `SOME_VAR=` glued to the front of an otherwise valid absolute URL.
const BAD_PREFIX = /^[A-Za-z_][A-Za-z0-9_]*\s*=\s*(?=https?:\/\/)/;

const repair = (value: string): string => value.trim().replace(BAD_PREFIX, '');

/** Walks a document, rewriting every damaged string it finds in place. */
const walk = (
  node: unknown,
  onFix: (path: string, before: string, after: string) => void,
  path = '',
): unknown => {
  if (typeof node === 'string') {
    const fixed = repair(node);
    if (fixed !== node) {
      onFix(path, node, fixed);
      return fixed;
    }
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((item, i) => walk(item, onFix, `${path}[${i}]`));
  }
  if (node && typeof node === 'object' && node.constructor === Object) {
    const out = node as Record<string, unknown>;
    for (const key of Object.keys(out)) {
      out[key] = walk(out[key], onFix, path ? `${path}.${key}` : key);
    }
    return out;
  }
  return node;
};

const main = async () => {
  const apply = process.argv.includes('--apply');

  await mongoose.connect(config.database_url as string);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database handle');

  console.log(`Database: ${db.databaseName}`);
  console.log(apply ? 'Mode: APPLY (writing changes)\n' : 'Mode: DRY RUN (no writes)\n');

  let totalDocs = 0;
  let totalFields = 0;

  for (const { name } of await db.listCollections().toArray()) {
    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();

    for (const doc of docs) {
      const changes: string[] = [];
      const { _id, ...rest } = doc;
      walk(rest, (path, before, after) =>
        changes.push(`    ${path}\n      - ${before}\n      + ${after}`),
      );

      if (!changes.length) continue;
      totalDocs += 1;
      totalFields += changes.length;
      console.log(`  ${name} / ${String(_id)}`);
      console.log(changes.join('\n'));

      if (apply) {
        await collection.updateOne({ _id }, { $set: rest });
      }
    }
  }

  console.log(
    `\n${totalFields} field(s) across ${totalDocs} document(s)` +
      (apply ? ' updated.' : ' would be updated. Re-run with --apply.'),
  );

  await mongoose.disconnect();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
