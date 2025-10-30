import type { CapStoreSection } from './types';
export const REGISTRIES: CapStoreSection[] = [
  {
    id: '0x4f4B183eAE80D62B880458E4A812F896CFb2d4d6',
    label: 'Nuwa Agents',
    type: 'tag',
  },
];

export type Registry = CapStoreSection & {
  address: string;
};
