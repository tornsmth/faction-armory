import assert from 'assert';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { getTenantAccessToken } from './feishu';
import { fetchArmory } from './armory';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  assert.ok(value, `FATAL: environment variable "${name}" is required`);
  return value;
}

const FEISHU_APP_ID = requireEnv('FEISHU_APP_ID');
const FEISHU_APP_SECRET = requireEnv('FEISHU_APP_SECRET');
const ARMORY_BITABLE = requireEnv('ARMORY_BITABLE');
const ARMORY_TABLE = requireEnv('ARMORY_TABLE');

const EXPIRATION = 3600 * 4; // 4 hours

async function main() {
  console.log('Loading the armory table');

  try {
    const accessToken = await getTenantAccessToken(FEISHU_APP_ID, FEISHU_APP_SECRET);
    const armoryData = await fetchArmory(ARMORY_BITABLE, ARMORY_TABLE, accessToken);
    console.log(`${Object.keys(armoryData).length} entried loaded`);
    const now = Math.floor(new Date().getTime() / 1000);
    const data = {
      armory: armoryData,
      timestamp: now,
      expire: now + EXPIRATION,
    };
    console.log('Writing data to file');
    writeFileSync('docs/armory.json', JSON.stringify(data));
  } catch (err) {
    console.log('Error:', err);
    process.exit(-1);
  }
}

void main();
