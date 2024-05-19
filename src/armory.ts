import { getBitableData } from './feishu';

const OWNER_ROW = '所属人';
const PRIVATE_OWNER = '私人共享';
const ARMORY_ID_ROW = '序列号';

export type ArmoryData = Record<string, { shared: boolean }>;

export async function fetchArmory(bitable: string, table: string, accessToken: string): Promise<ArmoryData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await getBitableData(bitable, table, accessToken);
  const armory: ArmoryData = {};
  for (const record of data) {
    const fields = record.fields;
    const owner = fields[OWNER_ROW];
    if (owner === PRIVATE_OWNER) {
      continue;
    }
    const armoryId = fields[ARMORY_ID_ROW];
    armory[armoryId] = { shared: true };
  }
  return armory;
}
