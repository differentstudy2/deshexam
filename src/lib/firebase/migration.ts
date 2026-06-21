import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { TaxonomyNode } from '@/lib/firebase/taxonomy';
import { generateSlug } from '@/lib/seo/slug';

export async function migrateTaxonomyNodesForSeo(onProgress?: (msg: string) => void) {
  try {
    onProgress?.("Starting SEO migration...");
    const snap = await getDocs(collection(db, 'taxonomy_nodes'));
    const nodes = snap.docs.map(d => ({ id: d.id, ...d.data() } as TaxonomyNode));

    onProgress?.(`Found ${nodes.length} nodes to migrate.`);

    // Build a map for easy lookup
    const nodeMap = new Map<string, TaxonomyNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    const getAncestors = (nodeId: string | null): TaxonomyNode[] => {
      const ancestors: TaxonomyNode[] = [];
      let currentId = nodeId;
      while (currentId && nodeMap.has(currentId)) {
        const parent = nodeMap.get(currentId)!;
        ancestors.unshift(parent);
        currentId = parent.parentId;
      }
      return ancestors;
    };

    let processedCount = 0;
    
    for (const node of nodes) {
      const ancestors = getAncestors(node.parentId);
      
      // Check if existing slug is valid (only english lowercase, numbers, hyphens)
      const isValidSlug = (s?: string) => s && /^[a-z0-9-]+$/.test(s);
      
      // Calculate local slug - force regenerate if existing slug contains invalid chars (like Bengali)
      const localSlug = isValidSlug(node.slug) ? node.slug! : generateSlug(node.title || node.id);
      
      // Calculate full slug
      const ancestorSlugs = ancestors.map(a => isValidSlug(a.slug) ? a.slug! : generateSlug(a.title || a.id));
      const fullSlug = [...ancestorSlugs, localSlug].join('/');

      // Ancestor info array for rich breadcrumbs
      const ancestorsArray = ancestors.map(a => ({
        id: a.id,
        slug: a.slug || generateSlug(a.title || a.id),
        title: a.title,
        type: a.type
      }));

      // Map schema type
      let schemaType = 'LearningResource';
      if (['board', 'class', 'subject'].includes(node.type)) schemaType = 'Course';
      else if (node.type === 'textbook') schemaType = 'Book';
      else if (node.type === 'chapter' || node.type === 'topic') schemaType = 'Article';

      // Update node
      const updates: Partial<TaxonomyNode> = {
        slug: localSlug,
        fullSlug,
        ancestors: ancestorsArray as any,
        isIndexable: true, // Defaulting to true, should be manually reviewed
        schemaType
      };

      // Add specific ancestor slugs for quick filtering
      ancestors.forEach(a => {
        if (a.type === 'board') updates.boardSlug = a.slug || generateSlug(a.title);
        if (a.type === 'class') updates.classSlug = a.slug || generateSlug(a.title);
        if (a.type === 'subject') updates.subjectSlug = a.slug || generateSlug(a.title);
        if (a.type === 'textbook') updates.bookSlug = a.slug || generateSlug(a.title);
        if (a.type === 'chapter') updates.chapterSlug = a.slug || generateSlug(a.title);
        if (a.type === 'topic') updates.topicSlug = a.slug || generateSlug(a.title);
      });

      await updateDoc(doc(db, 'taxonomy_nodes', node.id), updates as any);

      // Save redirect mapping
      await setDoc(doc(db, 'url_redirects', node.id), {
        oldUrl: node.id,
        newUrl: fullSlug,
        createdAt: new Date()
      }, { merge: true });

      processedCount++;
      if (processedCount % 10 === 0) {
        onProgress?.(`Migrated ${processedCount}/${nodes.length} nodes...`);
      }
    }

    onProgress?.("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    onProgress?.("Migration failed! Check console.");
  }
}
