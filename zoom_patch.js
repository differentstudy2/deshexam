const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
    "} from 'lucide-react';",
    ", ZoomIn, ZoomOut } from 'lucide-react';"
);

// 2. States and useEffect
const zoomCode = `  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        const scale = Math.max(0.3, Math.min(1, (window.innerWidth - 32) / 820));
        setZoom(scale);
      } else {
        setZoom(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
`;

if (!content.includes("const [zoom, setZoom] = useState(1);")) {
    content = content.replace(
        "const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);",
        "const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false);\n" + zoomCode
    );
}

// 3. Zoom style for #printable-paper CSS
content = content.replace(
    '#printable-paper {\n                position: absolute;',
    '#printable-paper {\n                zoom: 1 !important;\n                position: absolute;'
);

// 4. Zoom style for #printable-paper DOM
content = content.replace(
    '<div id="printable-paper" className="flex flex-col gap-8 print:gap-0 print:block">',
    '<div id="printable-paper" style={{ zoom: zoom } as React.CSSProperties} className="flex flex-col gap-8 print:gap-0 print:block">'
);

// 5. Floating Zoom Controls
const controls = `
      {/* Floating Zoom Controls */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 flex flex-col gap-2 z-30 print:hidden">
        <Button size="icon" variant="outline" className="rounded-full bg-white shadow-lg w-10 h-10 border-gray-200 text-gray-700" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline" className="rounded-full bg-white shadow-lg w-10 h-10 border-gray-200 text-gray-700" onClick={() => setZoom(1)}>
          <span className="text-[10px] font-bold">{Math.round(zoom * 100)}%</span>
        </Button>
        <Button size="icon" variant="outline" className="rounded-full bg-white shadow-lg w-10 h-10 border-gray-200 text-gray-700" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}>
          <ZoomOut className="w-5 h-5" />
        </Button>
      </div>

    </div>
  );
}`;

content = content.replace(
    '    </div>\n  );\n}',
    controls
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched zoom successfully!');
