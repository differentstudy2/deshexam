const fs = require('fs');
const file = 'f:\\developer\\deshexam\\src\\app\\admin\\guide-content\\explorer\\components\\MobileExplorer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
`import { 
  getGuideBoards, getGuideClassesByBoard, getGuideClasses, getGuideSubjectsByClass, getGuideTextbooksBySubject, getGuideChaptersByTextbook, getGuideTopicsByChapter, getTopicSections, 
  createGuideBoard, createGuideClass, createGuideSubject, createGuideTextbook, createGuideChapter, createGuideTopic,
  deleteGuideBoard, deleteGuideClass, deleteGuideSubject, deleteGuideTextbook, deleteGuideChapter, deleteGuideTopic,
  updateGuideNodeTitle, migrateOldTextbooksToGuide, updateGuideNodeOrders, updateGuideNodeSEO, getGuideNodeById,
  moveGuideNode, getGuideAllChapters, getGuideTextbooks
} from '@/lib/firebase/guide';`,
`import { 
  getTaxonomyNodesByTrack, getTaxonomyNodesByType, getTaxonomyNodesByParent,
  createTaxonomyNode, updateTaxonomyNode, deleteTaxonomyNode, getTaxonomyNodeById,
  updateTaxonomyNodeOrders, generateSlug, NodeType
} from '@/lib/firebase/taxonomy';
import { 
  getTopicSections, migrateOldTextbooksToGuide, getGuideAllChapters, getGuideTextbooks
} from '@/lib/firebase/guide';`);

content = content.replace(
`      if (node.type === 'root') {
        const cls = (await getGuideBoards()) as any[];
        fetched = cls.map((c, i) => ({ id: c.id, name: c.title || c.name || c.id, type: 'board', status: c.status || 'published', author: c.author, orderIndex: c.orderIndex ?? i }));
      } else if (node.type === 'board') {
        const res = (await getGuideClassesByBoard(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'class', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'class') {
        const res = (await getGuideSubjectsByClass(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'subject', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'subject') {
        const res = (await getGuideTextbooksBySubject(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'textbook', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'textbook') {
        const res = (await getGuideChaptersByTextbook(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'chapter', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'chapter') {
        const res = (await getGuideTopicsByChapter(node.id)) as any[];
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: 'topic', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
      } else if (node.type === 'topic') {
        const res = (await getTopicSections(node.id)) as Record<string, any>;
        fetched = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
      }`,
`      if (node.type === 'root') {
        const cls = await getTaxonomyNodesByTrack('academic', 'board');
        fetched = cls.map((c, i) => ({ id: c.id, name: c.title, type: 'board', status: c.status, author: c.author, orderIndex: c.orderIndex ?? i }));
      } else if (node.type === 'topic') {
        const res = (await getTopicSections(node.id)) as Record<string, any>;
        fetched = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
      } else {
        const res = await getTaxonomyNodesByParent(node.id);
        fetched = res.map((r, i) => ({ id: r.id, name: r.title, type: r.type, status: r.status, author: r.author, orderIndex: r.orderIndex ?? i }));
      }`);

content = content.replace(
`    try {
      await updateGuideNodeOrders(newNodes[0].type, newNodes.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {`,
`    try {
      await updateTaxonomyNodeOrders(newNodes.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {`);

content = content.replace(
`      if (dialogState.parentType === 'root') {
        for (const item of items) await createGuideBoard(item);
      } else if (dialogState.parentType === 'board') {
        for (const item of items) await createGuideClass(dialogState.parentId, item);
      } else if (dialogState.parentType === 'class') {
        for (const item of items) await createGuideSubject(dialogState.parentId, item);
      } else if (dialogState.parentType === 'subject') {
        for (const item of items) await createGuideTextbook(dialogState.parentId, item, authorInput);
      } else if (dialogState.parentType === 'textbook') {
        for (const item of items) await createGuideChapter(dialogState.parentId, item, authorInput);
      } else if (dialogState.parentType === 'chapter') {
        for (const item of items) await createGuideTopic(dialogState.parentId, item, authorInput);
      }`,
`      for (const item of items) {
        let nType: NodeType = 'board';
        if (dialogState.parentType === 'board') nType = 'class';
        else if (dialogState.parentType === 'class') nType = 'subject';
        else if (dialogState.parentType === 'subject') nType = 'textbook';
        else if (dialogState.parentType === 'textbook') nType = 'chapter';
        else if (dialogState.parentType === 'chapter') nType = 'topic';
        await createTaxonomyNode('academic', nType, dialogState.parentType === 'root' ? null : dialogState.parentId, item, { author: authorInput });
      }`);

content = content.replace(
`    const freshNode = await getGuideNodeById(nodeId) || nodeData;`,
`    const freshNode = await getTaxonomyNodeById(nodeId) || nodeData;`);

content = content.replace(
`      const success = await updateGuideNodeSEO(seoDialog.nodeType, seoDialog.nodeId, {
        ...seoInput,
        tags: parsedTags,
        keywords: parsedKeywords
      });

      if (success) {
        toast({ title: "Success", description: "SEO metadata saved successfully." });
        setSeoDialog(prev => ({ ...prev, isOpen: false }));
        seoDialog.onSuccess();
      } else {
        toast({ title: "Error", description: "Failed to save SEO metadata.", variant: "destructive" });
      }`,
`      await updateTaxonomyNode(seoDialog.nodeId, {
        slug: seoInput.slug,
        featureImage: seoInput.featureImage,
        seo: {
          customTitle: seoInput.seoTitle,
          customDescription: seoInput.description,
          keywords: parsedKeywords
        },
        tags: parsedTags
      });
      toast({ title: "Success", description: "SEO metadata saved successfully." });
      setSeoDialog(prev => ({ ...prev, isOpen: false }));
      seoDialog.onSuccess();`);

content = content.replace(
`      await updateGuideNodeTitle(editDialog.nodeId, editDialog.nodeType, editTitleInput, editAuthorInput);`,
`      await updateTaxonomyNode(editDialog.nodeId, { title: editTitleInput, author: editAuthorInput });`);

content = content.replace(
`      const { nodeId, nodeType } = deleteDialog;
      if (nodeType === 'board') await deleteGuideBoard(nodeId);
      else if (nodeType === 'class') await deleteGuideClass(nodeId);
      else if (nodeType === 'subject') await deleteGuideSubject(nodeId);
      else if (nodeType === 'textbook') await deleteGuideTextbook(nodeId);
      else if (nodeType === 'chapter') await deleteGuideChapter(nodeId);
      else if (nodeType === 'topic') await deleteGuideTopic(nodeId);`,
`      const { nodeId, nodeType } = deleteDialog;
      await deleteTaxonomyNode(nodeId);`);

content = content.replace(
`      let textbookId = null;
      if (nodeType === 'chapter') {
        const nodeData: any = await getGuideNodeById(nodeId);
        textbookId = nodeData?.textbookId;
      } else if (nodeType === 'topic') {
        const nodeData: any = await getGuideNodeById(nodeId);
        const chapterId = nodeData?.chapterId;
        if (chapterId) {
          const chapData: any = await getGuideNodeById(chapterId);
          textbookId = chapData?.textbookId;
        }
      }`,
`      let textbookId = null;
      if (nodeType === 'chapter') {
        const nodeData: any = await getTaxonomyNodeById(nodeId);
        textbookId = nodeData?.parentId;
      } else if (nodeType === 'topic') {
        const nodeData: any = await getTaxonomyNodeById(nodeId);
        const chapterId = nodeData?.parentId;
        if (chapterId) {
          const chapData: any = await getTaxonomyNodeById(chapterId);
          textbookId = chapData?.parentId;
        }
      }`);

content = content.replace(
`        filteredChapters = chapters.filter((c: any) => c.textbookId === textbookId);`,
`        filteredChapters = chapters.filter((c: any) => c.parentId === textbookId);`);

content = content.replace(
`      const res = await moveGuideNode(moveNodeDialog.nodeId, moveNodeDialog.nodeType as any, dest.id, dest.type as any);
      
      if (res.success) {
        toast({ title: "Success", description: res.message });
        moveNodeDialog.onSuccess();
        fetchRoot(); // Refresh root to reflect structural changes
        setMoveNodeDialog({ ...moveNodeDialog, isOpen: false });
      } else {
        toast({ title: "Move failed", description: res.message, variant: "destructive" });
      }`,
`      await updateTaxonomyNode(moveNodeDialog.nodeId, { parentId: dest.id });
      toast({ title: "Success", description: "Moved successfully" });
      moveNodeDialog.onSuccess();
      fetchRoot(); // Refresh root to reflect structural changes
      setMoveNodeDialog({ ...moveNodeDialog, isOpen: false });`);

content = content.replace(
`      const [boards, classes] = await Promise.all([getGuideBoards(), getGuideClasses()]);`,
`      const [boards, classes] = await Promise.all([getTaxonomyNodesByType('board'), getTaxonomyNodesByType('class')]);`);

// Fix missing relative class
content = content.replace(
`    <div className={\`flex flex-col h-full bg-[#f6faf8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden \${className || ''}\`}>`,
`    <div className={\`flex flex-col relative h-full bg-[#f6faf8] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden \${className || ''}\`}>`
)

fs.writeFileSync(file, content);
console.log('MobileExplorer.tsx updated successfully');
