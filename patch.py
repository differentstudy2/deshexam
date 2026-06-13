import re

file_path = r"f:\developer\deshexam\src\app\e-question-builder\create-question\QuestionPaperBuilder.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
    "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';\nimport { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';"
)

content = content.replace(
    "import { QuestionBankModal } from './QuestionBankModal';",
    "import { QuestionBankModal } from './QuestionBankModal';\nimport { AiQuestionGeneratorModal } from './AiQuestionGeneratorModal';"
)

content = content.replace(
    "import { Download, Settings, FileText, Shuffle, Save, ArrowLeft, Edit, Book, Monitor, Lightbulb, User, Tag, Star, Grid3X3, Columns, Barcode, Hash, LayoutGrid, FileDigit, Heading, MapPin, Landmark, Layers, HelpCircle, RefreshCw, Printer, Languages, QrCode, ImageIcon, Waves, PlusCircle, Plus, CheckCircle, CircleDot, Zap, Loader2, GripVertical, Trash2, Database } from 'lucide-react';",
    "import { Download, Settings, FileText, Shuffle, Save, ArrowLeft, Edit, Book, Monitor, Lightbulb, User, Tag, Star, Grid3X3, Columns, Barcode, Hash, LayoutGrid, FileDigit, Heading, MapPin, Landmark, Layers, HelpCircle, RefreshCw, Printer, Languages, QrCode, ImageIcon, Waves, PlusCircle, Plus, CheckCircle, CircleDot, Zap, Loader2, GripVertical, Trash2, Database, Sparkles } from 'lucide-react';"
)

# 2. States
content = content.replace(
    "const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);",
    "const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);\n  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);\n  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);"
)

# 3. handleAddFromBank
add_from_bank_fn = """  const handleAddFromBank = (newQs: QuestionBankEntry[]) => {
    setQuestions([...questions, ...newQs]);
  };"""
if "const handleAddFromBank =" not in content:
    content = content.replace(
        "const [showExplanations, setShowExplanations] = useState(false);",
        "const [showExplanations, setShowExplanations] = useState(false);\n\n" + add_from_bank_fn
    )

# 4. Header & Layout Wrapper
content = content.replace(
    '<header className="bg-white border-b px-6 py-4 flex justify-between items-center print:hidden">',
    '<header className="bg-white border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">'
)

content = content.replace(
    '<Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500">',
    '<Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-500 shrink-0">'
)

content = content.replace(
    '<div className="flex items-center gap-4">',
    '<div className="flex items-center gap-3 w-full sm:w-auto">'
)

content = content.replace(
    '          <div>\n            <h1 className="text-xl font-bold text-gray-800">{t(\'create_question_paper\', appLanguage)}</h1>\n            <div className="text-sm text-gray-500">Home &gt; E-Question Builder &gt; Create Question</div>\n          </div>',
    '          <div className="min-w-0 flex-1">\n            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{t(\'create_question_paper\', appLanguage)}</h1>\n            <div className="text-xs sm:text-sm text-gray-500 truncate">Home &gt; E-Question Builder &gt; Create Question</div>\n          </div>'
)

content = content.replace(
    '<div className="flex gap-2">',
    '<div className="flex gap-2 w-full sm:w-auto sm:justify-end">'
)

content = content.replace(
    '<Button\n              className="bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-sm flex items-center h-9 px-4 text-sm font-medium"\n              onClick={handlePrint}\n            >',
    '<Button\n              className="bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-sm flex items-center h-9 px-4 text-sm font-medium shrink-0"\n              onClick={handlePrint}\n            >'
)

content = content.replace(
    '<div className="flex flex-col min-h-screen bg-[#f0f2f5] print:bg-white">',
    '<div className="flex flex-col min-h-screen bg-[#f0f2f5] print:bg-white pb-20 lg:pb-0">'
)

content = content.replace(
    '<div className="flex flex-1 max-w-[1400px] mx-auto w-full p-4 gap-6 relative print:p-0 print:m-0 print:static">',
    '<div className="flex flex-col lg:flex-row flex-1 max-w-[1400px] mx-auto w-full p-2 sm:p-4 gap-6 relative print:p-0 print:m-0 print:static">'
)

# 5. Extract Sidebar to renderSidebarSettings()
sidebar_match = re.search(r'(<aside className="w-72 bg-white rounded-lg shadow-sm border border-gray-200 h-fit max-h-\[calc\(100vh-120px\)\] overflow-y-auto sticky top-24 print:hidden shrink-0">.*?</aside>)', content, re.DOTALL)
if sidebar_match:
    sidebar_html = sidebar_match.group(1)
    # Remove the wrapper
    inner_sidebar = re.sub(r'^<aside.*?>', '<>', sidebar_html)
    inner_sidebar = re.sub(r'</aside>$', '</>', inner_sidebar)

    # Replace aside with hidden lg:block wrapper
    new_aside = f'<aside className="hidden lg:block w-full lg:w-72 bg-white rounded-lg shadow-sm border border-gray-200 h-fit max-h-[calc(100vh-120px)] overflow-y-auto lg:sticky lg:top-24 print:hidden shrink-0">\n          {{renderSidebarSettings()}}\n        </aside>'

    content = content.replace(sidebar_html, new_aside)

    render_fn = f"  const renderSidebarSettings = () => (\n    {inner_sidebar}\n  );\n\n  return ("
    content = content.replace("  return (", render_fn)

# 6. Add Ai Generator button
ai_btn = """                          <Button variant="outline" className="border-dashed border-2 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50 hover:text-indigo-800" onClick={() => setIsAiGeneratorOpen(true)}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('aiGenerate', appLanguage)}
                          </Button>
                          <Button variant="outline" className="border-dashed border-2 bg-gray-50 text-gray-700 hover:bg-gray-100" onClick={() => setIsQuestionBankOpen(true)}>
                            <Database className="w-4 h-4 mr-2" />
                            {t('addFromBank', appLanguage)}
                          </Button>"""

content = content.replace(
    """<Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => setIsQuestionBankOpen(true)}>
                            <Database className="w-4 h-4 mr-2" /> {t('addFromBank', appLanguage)}
                          </Button>""",
    ai_btn
)

# 7. Add Modals and Mobile Bottom Bar
bottom_content = """      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        onAdd={handleAddFromBank}
        appLanguage={appLanguage}
      />
      
      <AiQuestionGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onAdd={handleAddFromBank}
        appLanguage={appLanguage}
      />

      {/* Mobile Bottom Navigation & Settings Sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-2 py-3 flex items-center justify-around z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe print:hidden">
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1" onClick={() => setIsMobileSettingsOpen(true)}>
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="text-[10px] text-gray-500 font-medium">Settings</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1 text-indigo-600" onClick={() => { setIsAiGeneratorOpen(true); setEditingMode(true); }}>
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] font-medium">AI Gen</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1 text-emerald-600" onClick={() => { setIsQuestionBankOpen(true); setEditingMode(true); }}>
          <Database className="w-5 h-5 text-emerald-600" />
          <span className="text-[10px] font-medium">Bank</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1 text-blue-600" onClick={() => { setIsAddQuestionOpen(true); setEditingMode(true); }}>
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span className="text-[10px] font-medium">Custom</span>
        </Button>
      </div>

      <Sheet open={isMobileSettingsOpen} onOpenChange={setIsMobileSettingsOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col bg-[#f0f2f5] rounded-t-2xl">
          <SheetHeader className="px-4 py-3 bg-white border-b rounded-t-2xl shrink-0">
            <SheetTitle className="text-left text-lg">Builder Settings</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {renderSidebarSettings()}
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}"""

# Remove old QuestionBankModal if it exists
content = re.sub(r'<QuestionBankModal.*?/>', '', content, flags=re.DOTALL)

content = content.replace(
    '    </div>\n  );\n}',
    bottom_content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patched successfully!")
