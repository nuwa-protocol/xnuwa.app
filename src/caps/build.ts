import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

function findYamlFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findYamlFiles(fullPath));
    } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
      files.push(fullPath);
    }
  }

  return files;
}

function generateRandomData() {
  const authors = [
    'AI Assistant Team',
    'CodeCraft Team',
    'Nuwa Labs',
    'Developer Tools',
    'AI Studio',
  ];
  const tags = [
    'development',
    'productivity',
    'design',
    'analytics',
    'security',
  ];
  const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '0.9.0'];

  return {
    downloads: Math.floor(Math.random() * 5000) + 100,
    version: versions[Math.floor(Math.random() * versions.length)],
    author: authors[Math.floor(Math.random() * authors.length)],
    tag: tags[Math.floor(Math.random() * tags.length)],
    size: (Math.random() * 5 + 0.5).toFixed(1),
    createdAt:
      Date.now() - Math.floor(Math.random() * 90 + 10) * 24 * 60 * 60 * 1000,
    updatedAt:
      Date.now() - Math.floor(Math.random() * 30 + 1) * 24 * 60 * 60 * 1000,
  };
}

function standardizeCapObject(yamlData: any, key: string, yamlPath: string) {
  const randomData = generateRandomData();

  return {
    id: yamlData.metadata?.id || `cap:${key.replace(/\//g, ':')}`,
    name:
      yamlData.metadata?.name ||
      yamlData.name ||
      key.split('/').pop()?.replace(/_/g, ' ') ||
      'Unknown Cap',
    description:
      yamlData.metadata?.description ||
      yamlData.description ||
      'A useful AI assistant capability',
    tag: randomData.tag,
    downloads: randomData.downloads,
    version: randomData.version,
    author: randomData.author,
    createdAt: randomData.createdAt,
    updatedAt: randomData.updatedAt,
    size: Number.parseFloat(randomData.size),
    yaml: yamlData,
  };
}

async function main() {
  const capsDir = path.join(dirname);
  const publicDir = path.join(dirname, '../..', 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const yamlFiles = findYamlFiles(capsDir);

  console.log(`Found ${yamlFiles.length} YAML files:`);

  const allCaps: Record<string, any> = {};

  for (const yamlFile of yamlFiles) {
    try {
      const content = fs.readFileSync(yamlFile, 'utf8');
      const json = yaml.load(content) as any;

      const relativePath = path.relative(capsDir, yamlFile);
      const fileName = path.basename(yamlFile, path.extname(yamlFile));

      const capName = json.metadata?.name || json.name || fileName;
      const key = capName.toLowerCase().replace(/\s+/g, '_');

      const standardizedCap = standardizeCapObject(json, key, relativePath);
      allCaps[key] = standardizedCap;

      console.log(
        `✓ Processed: ${relativePath} -> ${standardizedCap.name} (key: ${key})`,
      );
    } catch (error) {
      console.error(`✗ Error processing ${yamlFile}:`, error);
    }
  }

  const outputPath = path.join(publicDir, 'caps.json');
  fs.writeFileSync(outputPath, JSON.stringify(allCaps, null, 2), 'utf8');

  console.log(`\nBuild completed! Generated 1 JSON file: public/caps.json`);
  console.log(`Contains ${Object.keys(allCaps).length} caps`);
}

main().catch(console.error);
