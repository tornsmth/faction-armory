async function fetchFeishu(path: string, accessToken?: string, body?: object): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  if (accessToken !== undefined) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const rsp = await fetch(`https://open.feishu.cn${path}`, {
    method: body !== undefined ? 'POST' : 'GET',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!rsp.ok) {
    throw new Error(`Feishu network error on loading ${path} with code ${rsp.status}`);
  }
  const data = (await rsp.json()) as { code: number };
  if (data.code !== 0) {
    throw new Error(`Feishu error: ${data.code}`);
  }
  return data;
}

export async function getTenantAccessToken(appId: string, appSecret: string): Promise<string> {
  const data = (await fetchFeishu('/open-apis/auth/v3/tenant_access_token/internal', undefined, {
    app_id: appId,
    app_secret: appSecret,
  })) as { tenant_access_token: string };
  return data.tenant_access_token;
}

export interface SheetInfo {
  id: string;
  title: string;
  rowCount: number;
  columnCount: number;
  frozenRowCount: number;
  frozenColumnCount: number;
}

export async function getSheetInfo(spreadsheet: string, sheet: string, accessToken: string): Promise<SheetInfo> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await fetchFeishu(`/open-apis/sheets/v3/spreadsheets/${spreadsheet}/sheets/${sheet}`, accessToken);
  const innerData = data.data.sheet;
  return {
    id: innerData.sheet_id,
    title: innerData.title,
    rowCount: innerData.grid_properties.row_count,
    columnCount: innerData.grid_properties.column_count,
    frozenRowCount: innerData.grid_properties.frozen_row_count,
    frozenColumnCount: innerData.grid_properties.frozen_column_count,
  };
}

export async function getSheetData(
  spreadsheet: string,
  sheet: string,
  accessToken: string,
): Promise<Array<Array<unknown>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await fetchFeishu(
    `/open-apis/sheets/v2/spreadsheets/${spreadsheet}/values/${sheet}?valueRenderOption=UnformattedValue`,
    accessToken,
  );
  return data.data.valueRange.values;
}

export async function getBitableData(bitable: string, table: string, accessToken: string): Promise<Array<unknown>> {
  const PAGE_SIZE = 500;
  const PATH = `/open-apis/bitable/v1/apps/${bitable}/tables/${table}/records?page_size=${PAGE_SIZE}`;
  const result = [];
  let pageToken = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await fetchFeishu(`${PATH}&page_token=${pageToken}`, accessToken);
    result.push(...data.data.items);
    if (data.data.has_more) {
      pageToken = data.data.page_token;
    } else {
      break;
    }
  }
  return result;
}
