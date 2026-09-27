const fs = require('fs');

const path = 'src/app/admin/guide-content/explorer/components/MobileExplorer.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Remove TreeNode component (lines 48 to 288 approximately)
code = code.replace(/type TreeNodeProps = \{[\s\S]*?export default function ContentExplorer\(\) \{/m, 'export function MobileExplorer({ className }: { className?: string }) {');

// Add navigation stack logic
code = code.replace(/const \[classes, setClasses\] = useState<any\[\]>\(\[\]\);\s*const \[loading, setLoading\] = useState\(true\);/, `
  const [navigationStack, setNavigationStack] = useState<any[]>([{ id: 'root', name: 'Boards', type: 'root' }]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeLevel = navigationStack[navigationStack.length - 1];

  const fetchRoot = async () => {
    setLoading(true);
    try {
      let fetched: any[] = [];
      const node = navigationStack[navigationStack.length - 1];
      if (node.type === 'root') {
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
      }
      fetched.sort((a, b) => a.orderIndex - b.orderIndex);
      setNodes(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoot();
  }, [navigationStack]);

  const handlePush = (node: any) => {
    if (node.type === 'section') return;
    setNavigationStack(prev => [...prev, node]);
  };

  const handlePop = () => {
    setNavigationStack(prev => prev.slice(0, Math.max(1, prev.length - 1)));
  };
`);

// Replace the handleMoveBoard with handleMoveNode (since we only care about nodes in the current list)
code = code.replace(/const handleMoveBoard = async [\s\S]*?\} catch \(e\) \{\s*console\.error\("Failed to reorder boards", e\);\s*\}\s*\};/m, `
  const handleMoveNodeOrder = async (index: number, direction: number) => {
    const newNodes = [...nodes];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newNodes.length) return;

    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIndex];
    newNodes[targetIndex] = temp;

    newNodes.forEach((child, i) => { child.orderIndex = i; });
    setNodes(newNodes);

    try {
      await updateGuideNodeOrders(newNodes[0].type, newNodes.map(c => ({ id: c.id, orderIndex: c.orderIndex })));
    } catch (e) {
      console.error("Failed to reorder", e);
    }
  };
`);

// Replace the entire return statement up to the SEO dialog
const returnMatch = code.match(/return \([\s\S]*?\{.*?SEO Dialog.*?\}/);
if (returnMatch) {
  const newReturn = `return (
    <div className={\`flex flex-col h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-900 \${className || ''}\`}>
      {/* Mobile App Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {navigationStack.length > 1 && (
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" onClick={handlePop}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
            {activeLevel.type === 'root' ? <FolderTree className="w-5 h-5 text-[#107c41]" /> : getIcon(activeLevel.type)}
            {activeLevel.name}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={fetchRoot}>
            <Loader2 className={\`w-4 h-4 \${loading ? 'animate-spin' : ''}\`} />
          </Button>
          {activeLevel.type !== 'section' && activeLevel.type !== 'topic' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#107c41] bg-emerald-50 hover:bg-emerald-100" onClick={() => {
              let typeName = '';
              if (activeLevel.type === 'root') typeName = 'Board';
              else if (activeLevel.type === 'board') typeName = 'Class';
              else if (activeLevel.type === 'class') typeName = 'Subject';
              else if (activeLevel.type === 'subject') typeName = 'Textbook';
              else if (activeLevel.type === 'textbook') typeName = 'Chapter';
              else if (activeLevel.type === 'chapter') typeName = 'Topic';
              handleOpenDialog(activeLevel.id, activeLevel.type, typeName, fetchRoot);
            }}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb Summary */}
      {navigationStack.length > 1 && (
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 flex items-center gap-1 overflow-x-auto whitespace-nowrap hide-scrollbar shrink-0 border-b border-slate-200 dark:border-slate-800">
          {navigationStack.map((nav, idx) => (
            <React.Fragment key={nav.id}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              <span className={\`shrink-0 \${idx === navigationStack.length - 1 ? 'font-medium text-slate-700 dark:text-slate-300' : ''}\`}>
                {nav.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <FolderTree className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">It's empty here</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">No items found in this {activeLevel.type}. Tap the + button above to add one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node, index) => {
              const hasChildren = node.type !== 'section';
              return (
                <div key={node.id} className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden active:scale-[0.99] transition-transform">
                  <div className="flex items-stretch min-h-[64px]">
                    {/* Main Tappable Area for Drill-down */}
                    <div 
                      className="flex-1 flex items-center gap-3 px-4 py-3"
                      onClick={() => hasChildren ? handlePush(node) : null}
                    >
                      <div className="shrink-0 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        {getIcon(node.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{node.name}</p>
                        {node.author && <p className="text-xs text-slate-500 truncate mt-0.5">By {node.author}</p>}
                      </div>
                    </div>
                    
                    {/* Actions Area */}
                    <div className="flex items-center pr-2 shrink-0 border-l border-slate-100 dark:border-slate-800">
                      {node.type === 'topic' || node.type === 'chapter' ? (
                        <Link href={\`/admin/guide-content/topic/\${node.id}\`} className="p-2 h-full flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {index > 0 && node.type !== 'section' && (
                            <DropdownMenuItem onClick={() => handleMoveNodeOrder(index, -1)}>
                              <ArrowUp className="w-4 h-4 mr-2 text-slate-500" /> Move Up
                            </DropdownMenuItem>
                          )}
                          {index < nodes.length - 1 && node.type !== 'section' && (
                            <DropdownMenuItem onClick={() => handleMoveNodeOrder(index, 1)}>
                              <ArrowDown className="w-4 h-4 mr-2 text-slate-500" /> Move Down
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={\`/guide/\${node.slug || node.id}\`} target="_blank">
                              <Eye className="w-4 h-4 mr-2 text-emerald-500" /> View in Guide
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenSeo(node.id, node.type, node, fetchRoot)}>
                            <Settings className="w-4 h-4 mr-2 text-amber-500" /> SEO Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(node.id, node.type, node.name, node.author, fetchRoot)}>
                            <Edit2 className="w-4 h-4 mr-2 text-blue-500" /> Rename
                          </DropdownMenuItem>
                          {(node.type === 'chapter' || node.type === 'topic') && (
                            <DropdownMenuItem onClick={() => handleMoveNodeClick(node.id, node.type, node.name, fetchRoot)}>
                              <ArrowRightLeft className="w-4 h-4 mr-2 text-indigo-500" /> Move / Convert
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600" onClick={() => handleDeleteClick(node.id, node.type, node.name, fetchRoot)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEO Dialog */}`;
  code = code.replace(returnMatch[0], newReturn);
}

// remove unused fetchRoot implementation up top since we overwrote it.
code = code.replace(/const fetchRoot = async \(\) => \{[\s\S]*?^\s*\}\s*\];\s*/m, '');

fs.writeFileSync('scratch/rewrite.js', 'console.log("Rewriting...");'); // Just a placeholder, we evaluate code directly here
fs.writeFileSync(path, code);
console.log('MobileExplorer rewritten successfully!');
