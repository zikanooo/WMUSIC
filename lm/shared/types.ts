export type ItemType = 'song' | 'video' | 'album' | 'playlist' | 'artist' | 'mood';
export type Item = { id: string; type: ItemType; title: string; subtitle?: string; cover?: string; color?: string };
export type Section = { title: string; sub?: string; items: Item[] };
export type Detail = { title?: string; subtitle?: string; cover?: string; sections: Section[] };
