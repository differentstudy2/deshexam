import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import boards from './boards.json';
import classes from './classes.json';
// Import other JSON files when needed:
// import subjects from './subjects.json';
// import textbooks from './textbooks.json';
// import chapters from './chapters.json';
// import topics from './topics.json';

// Combine all hardcoded nodes into a single array
const allHardcodedTaxonomyNodes: TaxonomyNode[] = [
  ...(boards as TaxonomyNode[]),
  ...(classes as TaxonomyNode[]),
  // ...(subjects as TaxonomyNode[]),
  // ...(textbooks as TaxonomyNode[]),
  // ...(chapters as TaxonomyNode[]),
  // ...(topics as TaxonomyNode[]),
].map(node => ({
  ...node,
  isHardcoded: true // Ensure the flag is always set for UI logic
}));

export const getHardcodedTaxonomyNodes = (): TaxonomyNode[] => {
  return allHardcodedTaxonomyNodes;
};

export const getHardcodedTaxonomyNodesByTrack = (track: string): TaxonomyNode[] => {
  return allHardcodedTaxonomyNodes.filter(node => node.track === track);
};

export const getHardcodedTaxonomyNodesByType = (track: string, type: string): TaxonomyNode[] => {
  return allHardcodedTaxonomyNodes.filter(node => node.track === track && node.type === type);
};

export const getHardcodedTaxonomyNodesByParent = (parentId: string): TaxonomyNode[] => {
  return allHardcodedTaxonomyNodes.filter(node => node.parentId === parentId);
};

export const getHardcodedTaxonomyNodeById = (id: string): TaxonomyNode | undefined => {
  return allHardcodedTaxonomyNodes.find(node => node.id === id);
};

export const getHardcodedTaxonomyNodeBySlug = (slug: string, type: string, track: string): TaxonomyNode | undefined => {
  return allHardcodedTaxonomyNodes.find(node => 
    node.slug === slug && node.type === type && node.track === track
  );
};
