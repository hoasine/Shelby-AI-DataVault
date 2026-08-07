import type { Aptos } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS ?? "";

export type DatasetListItem = {
  id: string;
  datasetAddr: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  size: string;
  downloads: number;
  seller: string;
};

function formatSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1073741824) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1073741824).toFixed(1)} GB`;
}

export async function fetchAllDatasetsFromChain(aptos: Aptos): Promise<DatasetListItem[]> {
  const [countRaw] = await aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_count`,
      typeArguments: [],
      functionArguments: [],
    },
  });
  const count = Number(countRaw);
  const results: DatasetListItem[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const [addrRaw] = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::dataset_registry::get_dataset_address`,
          typeArguments: [],
          functionArguments: [i],
        },
      });
      const datasetAddr = addrRaw as string;
      const resource = await aptos.getAccountResource({
        accountAddress: datasetAddr,
        resourceType: `${MODULE_ADDRESS}::dataset_registry::DatasetInfo`,
      }) as {
        name: string;
        description: string;
        owner: string;
        size_bytes: string;
        price_octas: string;
        download_count: string;
        is_active: boolean;
        tags: string[];
      };

      if (!resource.is_active) continue;

      const { name, description, owner, size_bytes, price_octas, download_count } = resource;

      results.push({
        id: String(i),
        datasetAddr,
        name,
        description,
        price: Number(price_octas) / 1e8,
        tags: resource.tags ?? [],
        size: formatSize(Number(size_bytes)),
        downloads: Number(download_count),
        seller: owner.slice(0, 8) + "…" + owner.slice(-6),
      });
    } catch {
      // skip unreadable datasets
    }
  }

  return results;
}

export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
  }
  throw last;
}
