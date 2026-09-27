const fs = require('fs');

const file = 'f:/developer/deshexam/src/app/admin/guide-content/explorer/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. We keep imports, but add the new ones.
const importLinesEnd = content.indexOf('const getIcon = (type: string) => {');
const imports = content.substring(0, importLinesEnd);
const newImports = imports.replace(
  "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
  `import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';`
);

// 2. We grab getIcon
const getIconEnd = content.indexOf('type TreeNodeProps = {');
const getIcon = content.substring(importLinesEnd, getIconEnd);

// 3. New Helpers
const newHelpers = `const loadNodeChildren = async (nodeType: string, nodeId: string) => {
  let fetchedChildren: any[] = [];
  try {
    if (nodeType === 'root') {
      const res = (await getGuideBoards()) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title || r.name || r.id, type: 'board', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'board') {
      const res = (await getGuideClassesByBoard(nodeId)) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'class', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'class') {
      const res = (await getGuideSubjectsByClass(nodeId)) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'subject', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'subject') {
      const res = (await getGuideTextbooksBySubject(nodeId)) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'textbook', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'textbook') {
      const res = (await getGuideChaptersByTextbook(nodeId)) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'chapter', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'chapter') {
      const res = (await getGuideTopicsByChapter(nodeId)) as any[];
      fetchedChildren = res.map((r, i) => ({ id: r.id, name: r.title, type: 'topic', status: r.status || 'published', author: r.author, orderIndex: r.orderIndex ?? i }));
    } else if (nodeType === 'topic') {
      const res = (await getTopicSections(nodeId)) as Record<string, any>;
      fetchedChildren = Object.keys(res).map((key, i) => ({ id: key, name: key, type: 'section', status: 'published', orderIndex: i }));
    }
    fetchedChildren.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  } catch (e) {
    console.error(e);
  }
  return fetchedChildren;
};

const getChildTypeName = (type: string) => {
  switch (type) {
    case 'root': return 'Board';
    case 'board': return 'Class';
    case 'class': return 'Subject';
    case 'subject': return 'Textbook';
    case 'textbook': return 'Chapter';
    case 'chapter': return 'Topic';
    case 'topic': return 'Section';
    default: return '';
  }
};

const SidebarTreeNode = ({ node, level = 0, selectedId, onSelect, onToggle, isExpanded, childrenMap, loadingMap }: any) => {
  const hasChildren = node.type !== 'section';
  const children = childrenMap[node.id];
  const loading = loadingMap[node.id];
  const isSelected = selectedId === node.id;

  return (
    <div className="space-y-0.5">
      <div 
        className={\`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors \${isSelected ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}\`}
        style={{ paddingLeft: \`\${level * 16 + 8}px\` }}
        onClick={() => onSelect(node)}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id, node.type); }}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : hasChildren ? (
            isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : <div className="w-3" />}
        </div>
        {getIcon(node.type)}
        <span className="truncate text-[13px]">{node.name}</span>
      </div>
      {isExpanded && children && (
        <div className="flex flex-col gap-0.5">
          {children.map((child: any) => (
            <SidebarTreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              onToggle={onToggle} 
              isExpanded={!!childrenMap[child.id]} 
              childrenMap={childrenMap}
              loadingMap={loadingMap}
            />
          ))}
        </div>
      )}
    </div>
  );
};
`;

// 4. ContentExplorer component
const explorerStart = content.indexOf('export default function ContentExplorer() {');
const mainReturnStart = content.indexOf('  return (\n    <div className="space-y-6">');
const dialogsStart = content.indexOf('      {/* SEO Dialog */}');

// The state definitions from the old component
const stateDefs = content.substring(explorerStart, mainReturnStart);

const newMainStateAndRender = `
  // Native UI State
  const [selectedNode, setSelectedNode] = useState<any>({ id: 'root', name: 'National Curriculum', type: 'root' });
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([{ id: 'root', name: 'National Curriculum', type: 'root' }]);
  
  // Tree State
  const [treeExpanded, setTreeExpanded] = useState<Record<string, boolean>>({ 'root': true });
  const [treeChildren, setTreeChildren] = useState<Record<string, any[]>>({});
  const [treeLoading, setTreeLoading] = useState<Record<string, boolean>>({});
  
  // Main Pane State
  const [mainChildren, setMainChildren] = useState<any[]>([]);
  const [mainLoading, setMainLoading] = useState(false);

  const fetchRoot = async () => {
    setLoading(true);
    setTreeLoading(prev => ({ ...prev, root: true }));
    try {
      const cls = await loadNodeChildren('root', 'root');
      setClasses(cls);
      setTreeChildren(prev => ({ ...prev, root: cls }));
      if (selectedNode.id === 'root') {
        setMainChildren(cls);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTreeLoading(prev => ({ ...prev, root: false }));
    }
  };

  const handleToggleTree = async (nodeId: string, nodeType: string, forceReload = false) => {
    const isExpanding = forceReload ? true : !treeExpanded[nodeId];
    setTreeExpanded(prev => ({ ...prev, [nodeId]: isExpanding }));

    if (isExpanding && (!treeChildren[nodeId] || forceReload)) {
      setTreeLoading(prev => ({ ...prev, [nodeId]: true }));
      const children = await loadNodeChildren(nodeType, nodeId);
      setTreeChildren(prev => ({ ...prev, [nodeId]: children }));
      setTreeLoading(prev => ({ ...prev, [nodeId]: false }));
    }
  };

  const handleSelectNode = async (node: any) => {
    setSelectedNode(node);
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs];
    const existingIdx = newBreadcrumbs.findIndex(b => b.id === node.id);
    if (existingIdx >= 0) {
      newBreadcrumbs.splice(existingIdx + 1);
    } else {
      if (node.id === 'root') {
        newBreadcrumbs.splice(1);
      } else {
        newBreadcrumbs.push(node);
      }
    }
    setBreadcrumbs(newBreadcrumbs);

    setMainLoading(true);
    const children = await loadNodeChildren(node.type, node.id);
    setMainChildren(children);
    setMainLoading(false);
  };

  const refreshMainPane = async () => {
    setMainLoading(true);
    const children = await loadNodeChildren(selectedNode.type, selectedNode.id);
    setMainChildren(children);
    setTreeChildren(prev => ({ ...prev, [selectedNode.id]: children }));
    setMainLoading(false);
  };

  const handleMoveItem = async (index: number, direction: number) => {
    const newChildren = [...mainChildren];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newChildren.length) return;

    const temp = newChildren[index];
    newChildren[index] = newChildren[targetIndex];
    newChildren[targetIndex] = temp;

    newChildren.forEach((child, i) => { child.orderIndex = i; });
    setMainChildren(newChildren);
    setTreeChildren(prev => ({ ...prev, [selectedNode.id]: newChildren }));

    try {
      await updateGuideNodeOrders(newChildren[0].type, newChildren.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-4 sm:-m-8 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden m-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#107c41]" />
            Content Explorer
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleOpenMigration} className="text-indigo-600 hover:bg-indigo-50">
            Migrate
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenBulkMove} className="text-blue-600 hover:bg-blue-50">
            Bulk Move
          </Button>
          <Button size="sm" className="bg-[#107c41] hover:bg-[#0b5c30]" onClick={fetchRoot}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar Tree */}
        <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20 py-4 pr-4">
          <SidebarTreeNode 
            node={{ id: 'root', name: 'National Curriculum', type: 'root' }} 
            selectedId={selectedNode.id}
            onSelect={handleSelectNode}
            onToggle={handleToggleTree}
            isExpanded={treeExpanded['root']}
            childrenMap={treeChildren}
            loadingMap={treeLoading}
          />
        </div>

        {/* Right Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Content Header */}
          <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={b.id}>
                    <BreadcrumbItem>
                      <BreadcrumbLink 
                        className="cursor-pointer"
                        onClick={() => handleSelectNode(b)}
                      >
                        {b.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(selectedNode.type)}
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">{selectedNode.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                {selectedNode.type !== 'section' && selectedNode.type !== 'topic' && (
                  <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      if (selectedNode.type === 'chapter') {
                        window.location.href = \`/admin/guide-content/topic/create?chapterId=\${selectedNode.id}\`;
                      } else {
                        handleOpenDialog(selectedNode.id, selectedNode.type, getChildTypeName(selectedNode.type), refreshMainPane);
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {getChildTypeName(selectedNode.type)}
                  </Button>
                )}
                {(selectedNode.type === 'chapter' || selectedNode.type === 'topic') && (
                  <Button size="sm" variant="outline" asChild>
                    <Link href={\`/admin/guide-content/topic/\${selectedNode.id}\`}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Content
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Children Data Table */}
          <div className="flex-1 overflow-y-auto p-8">
            {mainLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : mainChildren.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">No items found in {selectedNode.name}.</p>
              </div>
            ) : (
              <div className="border rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mainChildren.map((child, index) => (
                      <TableRow key={child.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group cursor-pointer" onClick={() => { if (child.type !== 'section') handleSelectNode(child); }}>
                        <TableCell className="font-mono text-xs text-slate-400 text-center align-middle">
                          <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem(index, -1); }} disabled={index === 0} className="hover:text-indigo-600 disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 1); }} disabled={index === mainChildren.length - 1} className="hover:text-indigo-600 disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2">
                            {getIcon(child.type)}
                            <span className="font-medium text-slate-800 dark:text-slate-200">{child.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-slate-500 align-middle">{child.type}</TableCell>
                        <TableCell className="text-slate-500 align-middle">{child.author || '-'}</TableCell>
                        <TableCell className="text-right align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" onClick={e => e.stopPropagation()}>
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(\`/guide/\${child.slug || child.id}\`, '_blank'); }}>
                                <Eye className="w-4 h-4 mr-2" /> View in Guide
                              </DropdownMenuItem>
                              {(child.type === 'chapter' || child.type === 'topic') && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = \`/admin/guide-content/topic/\${child.id}\`; }}>
                                  <FileText className="w-4 h-4 mr-2" /> Edit Content
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenEdit(child.id, child.type, child.name, child.author, refreshMainPane); }}>
                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenSeo(child.id, child.type, child, refreshMainPane); }}>
                                <Settings className="w-4 h-4 mr-2" /> SEO Settings
                              </DropdownMenuItem>
                              {(child.type === 'chapter' || child.type === 'topic') && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveNodeClick(child.id, child.type, child.name, refreshMainPane); }}>
                                  <ArrowRightLeft className="w-4 h-4 mr-2" /> Move/Convert
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteClick(child.id, child.type, child.name, refreshMainPane); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

`;

// 5. Wrap up
const dialogsContent = content.substring(dialogsStart);
const finalContent = newImports + getIcon + newHelpers + '\n' + stateDefs + newMainStateAndRender + dialogsContent;

fs.writeFileSync('f:/developer/deshexam/src/app/admin/guide-content/explorer/page.tsx', finalContent);
console.log('Rewrite executed safely.');
