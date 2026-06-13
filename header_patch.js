const fs = require('fs');

const filePath = 'f:\\developer\\deshexam\\src\\app\\e-question-builder\\create-question\\QuestionPaperBuilder.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change initial states
content = content.replace(
    "const [headerTitle, setHeaderTitle] = useState('দেশ এক্সাম একাডেমী');\n  const [headerAddress, setHeaderAddress] = useState('চামারী, পেঠলা, দিনহাটা, কোচবিহার, পশ্চিমবঙ্গ, ৭৩৬১৩৫');\n  const [headerClassName, setHeaderClassName] = useState('অষ্টম শ্রেণি (মাধ্যমিক) - ২০২৬');\n  const [headerSubjectName, setHeaderSubjectName] = useState('বাংলা');\n  const [headerChapterName, setHeaderChapterName] = useState('প্রথম অধ্যায়');",
    "const [headerTitle, setHeaderTitle] = useState('');\n  const [headerAddress, setHeaderAddress] = useState('');\n  const [headerClassName, setHeaderClassName] = useState('');\n  const [headerSubjectName, setHeaderSubjectName] = useState('');\n  const [headerChapterName, setHeaderChapterName] = useState('');"
);

// 2. Remove useEffect auto-translate logic
const useEffectTarget = `  // Auto-translate default header texts based on language
  useEffect(() => {
    const isDefault = (text: string, key: string) => {
      const en = i18n.en[key as keyof typeof i18n.en];
      const bn = i18n.bn[key as keyof typeof i18n.bn];
      const hi = i18n.hi[key as keyof typeof i18n.hi];
      return text === en || text === bn || text === hi || !text;
    };

    if (isDefault(headerTitle, 'defaultHeaderTitle')) setHeaderTitle(t('defaultHeaderTitle', appLanguage));
    if (isDefault(headerAddress, 'defaultHeaderAddress')) setHeaderAddress(t('defaultHeaderAddress', appLanguage));
    if (isDefault(headerClassName, 'defaultHeaderClass')) setHeaderClassName(t('defaultHeaderClass', appLanguage));
    if (isDefault(headerSubjectName, 'defaultHeaderSubject')) setHeaderSubjectName(t('defaultHeaderSubject', appLanguage));
    if (isDefault(headerChapterName, 'defaultHeaderChapter')) setHeaderChapterName(t('defaultHeaderChapter', appLanguage));

  }, [appLanguage, headerTitle, headerAddress, headerClassName, headerSubjectName, headerChapterName]);`;

content = content.replace(useEffectTarget, '  // Auto-translate removed, using placeholders instead.');


// 3. Update Inputs with placeholders
content = content.replace(
    /placeholder=\{t\('institutePlaceholder', appLanguage\)\}/g,
    "placeholder={t('defaultHeaderTitle', appLanguage)}"
);
content = content.replace(
    /placeholder=\{t\('addressPlaceholder', appLanguage\)\}/g,
    "placeholder={t('defaultHeaderAddress', appLanguage)}"
);
content = content.replace(
    /placeholder=\{t\('classPlaceholder', appLanguage\)\}/g,
    "placeholder={t('defaultHeaderClass', appLanguage)}"
);
content = content.replace(
    /placeholder=\{t\('subjectPlaceholder', appLanguage\)\}/g,
    "placeholder={t('defaultHeaderSubject', appLanguage)}"
);
content = content.replace(
    /placeholder=\{t\('chapterPlaceholder', appLanguage\)\}/g,
    "placeholder={t('defaultHeaderChapter', appLanguage)}"
);

// 4. Update the Paper Output renders
content = content.replace(
    /\{showTitle && <h1 (.*?)>\{headerTitle\}<\/h1>\}/g,
    "{showTitle && <h1 $1>{headerTitle || t('defaultHeaderTitle', appLanguage)}</h1>}"
);
content = content.replace(
    /\{showAddress && <p (.*?)>\{headerAddress\}<\/p>\}/g,
    "{showAddress && <p $1>{headerAddress || t('defaultHeaderAddress', appLanguage)}</p>}"
);
content = content.replace(
    /\{showClassName && <h2 (.*?)>\{headerClassName\}<\/h2>\}/g,
    "{showClassName && <h2 $1>{headerClassName || t('defaultHeaderClass', appLanguage)}</h2>}"
);
content = content.replace(
    /\{showSubjectName && <h3 (.*?)>\{headerSubjectName\}<\/h3>\}/g,
    "{showSubjectName && <h3 $1>{headerSubjectName || t('defaultHeaderSubject', appLanguage)}</h3>}"
);
content = content.replace(
    /\{showChapterName && <h4 (.*?)>\{headerChapterName\}<\/h4>\}/g,
    "{showChapterName && <h4 $1>{headerChapterName || t('defaultHeaderChapter', appLanguage)}</h4>}"
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched header fields successfully!');
