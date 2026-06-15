import re

with open('f:/developer/deshexam/src/app/mock-tests/[slug]/take/exam-client.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 2. Header
header_match = re.search(r'<header className=\"h-\[72px\].*?</header>', content, re.DOTALL)
if header_match:
    old_header = header_match.group(0)
    new_header = '''<header className=\"h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 z-20 flex-shrink-0\">
        <div className=\"flex items-center gap-2 md:gap-4 w-auto md:w-1/3\">
          <button onClick={() => isReviewMode ? setIsReviewMode(false) : handleExitExam()} className=\"flex items-center text-slate-800 font-medium hover:text-slate-600 transition-colors\">
            <ArrowLeft className=\"w-5 h-5 md:mr-2\" />
            <span className=\"hidden md:inline\">{isReviewMode ? \"Back to Results\" : \"Exit Exam\"}</span>
          </button>
          <div className=\"h-4 w-px bg-slate-200 mx-1 md:mx-2 hidden md:block\"></div>
          <button className=\"text-slate-500 hover:text-slate-800 transition-colors hidden sm:block\" title=\"Bookmark Question\">
            <Bookmark className=\"w-5 h-5\" />
          </button>
          <button className=\"text-slate-500 hover:text-slate-800 transition-colors hidden sm:block\" title=\"Report Issue\">
            <AlertCircle className=\"w-5 h-5\" />
          </button>
          <button onClick={toggleFullscreen} className=\"text-slate-500 hover:text-slate-800 transition-colors hidden sm:block\" title={isFullscreen ? \"Exit Fullscreen\" : \"Fullscreen\"}>
            {isFullscreen ? <Minimize className=\"w-5 h-5\" /> : <Maximize className=\"w-5 h-5\" />}
          </button>
          
          <div className=\"lg:hidden flex items-center ml-1\">
            <Sheet>
              <SheetTrigger asChild>
                <button className=\"text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-lg bg-slate-50 border border-slate-200\" title=\"Question Navigator\">
                  <LayoutGrid className=\"w-5 h-5\" />
                </button>
              </SheetTrigger>
              <SheetContent side=\"left\" className=\"w-[300px] sm:w-[340px] p-0 border-r-0\">
                <SheetTitle className=\"sr-only\">Question Navigator</SheetTitle>
                {renderQuestionNavigator(true)}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className=\"flex flex-col items-center justify-center flex-1 md:w-1/3 text-center px-2\">
          <h1 className=\"font-bold text-[14px] md:text-lg text-slate-900 line-clamp-1 max-w-[150px] sm:max-w-[200px] md:max-w-none\">
            {isReviewMode ? \"Reviewing Solutions\" : mockTest.title}
          </h1>
          <p className=\"text-[11px] md:text-sm text-slate-600\">Q. {currentQuestionIndex + 1} of {questions.length}</p>
        </div>

        <div className=\"flex items-center justify-end gap-2 md:gap-5 w-auto md:w-1/3\">
          {!isReviewMode && (
            <>
              <div className=\"bg-[#E6F4EA] text-[#137333] px-2 py-1 md:px-3 md:py-1.5 rounded-full font-semibold text-[13px] md:text-[15px] border border-[#CEEAD6] flex items-center gap-1 md:gap-1.5\">
                <Clock className=\"w-3.5 h-3.5 md:w-4 md:h-4\" />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div className=\"text-[15px] font-semibold text-slate-900 hidden md:block\">
                Score: {mockTest.totalMarks || 0}
              </div>
              <Button 
                onClick={() => setShowSubmitConfirm(true)}
                className=\"bg-[#16A34A] hover:bg-green-700 text-white rounded-full px-4 md:px-6 shadow-sm font-medium h-8 md:h-10 text-sm md:text-base\"
              >
                Submit
              </Button>
            </>
          )}
          {isReviewMode && (
             <Button 
               onClick={() => setIsReviewMode(false)}
               variant=\"outline\"
               className=\"rounded-full px-4 md:px-6 shadow-sm font-medium border-slate-300 h-8 md:h-10 text-sm md:text-base\"
             >
               Close
             </Button>
          )}
        </div>
      </header>'''
    content = content.replace(old_header, new_header)

# 3. Main structure (extracting aside to renderQuestionNavigator)
# First find the aside
aside_match = re.search(r'<aside className=\"w-\[280px\] hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 overflow-hidden\">.*?</aside>', content, re.DOTALL)
if aside_match:
    old_aside = aside_match.group(0)
    
    # We replace 'hidden lg:flex' with 'flex' but we will call it from two places.
    # We will make the actual aside in the DOM 'hidden lg:flex', but inside the Sheet it will be 'flex h-full w-full'
    new_aside_def = old_aside.replace(
      '<aside className=\"w-[280px] hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-5 overflow-hidden\">',
      '<div className={lex flex-col bg-white overflow-hidden }>'
    ).replace('</aside>', '</div>')
    
    # Insert renderQuestionNavigator right before return (
    return_index = content.find('  return (')
    if return_index != -1:
        insert_code = f'''  const renderQuestionNavigator = (isMobile: boolean = false) => (
    {new_aside_def}
  );

'''
        content = content[:return_index] + insert_code + content[return_index:]
    
    # Replace the old aside in the main section with a call to renderQuestionNavigator
    content = content.replace(old_aside, '<div className=\"hidden lg:block\">{renderQuestionNavigator(false)}</div>')


# 4. Footer buttons
footer_match = re.search(r'<div className=\"p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4\">.*?</div>\s*</section>', content, re.DOTALL)
if footer_match:
    old_footer = footer_match.group(0)
    new_footer = '''<div className=\"p-3 md:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3\">
            <Button 
              variant=\"outline\" 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className=\"h-10 md:h-11 px-4 md:px-6 rounded-full font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 text-sm md:text-base\"
            >
              Previous
            </Button>
            
            {!isReviewMode ? (
              <div className=\"flex items-center gap-2 md:gap-3 flex-1 md:flex-initial justify-end\">
                <Button 
                  onClick={handleMarkReview}
                  className=\"h-10 md:h-11 px-3 md:px-6 rounded-full font-semibold bg-[#D97706] hover:bg-amber-700 text-white border-0 text-xs md:text-sm whitespace-nowrap hidden sm:flex\"
                >
                  Mark Review
                </Button>
                <Button 
                  onClick={handleMarkReview}
                  className=\"h-10 w-10 md:hidden rounded-full font-semibold bg-[#D97706] hover:bg-amber-700 text-white border-0 p-0 flex items-center justify-center shrink-0\"
                  title=\"Mark for Review\"
                >
                  <Flag className=\"w-4 h-4\" />
                </Button>
                <Button 
                  onClick={handleClear}
                  className=\"h-10 md:h-11 px-3 md:px-6 rounded-full font-semibold bg-[#64748B] hover:bg-slate-600 text-white border-0 text-xs md:text-sm whitespace-nowrap hidden sm:flex\"
                >
                  Clear
                </Button>
                <Button 
                  onClick={handleSaveAndNext}
                  className=\"h-10 md:h-11 px-6 md:px-8 rounded-full font-semibold bg-[#16A34A] hover:bg-green-700 text-white border-0 shadow-sm text-sm md:text-base flex-1 sm:flex-initial\"
                >
                  Save & Next
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleSaveAndNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className=\"h-10 md:h-11 px-6 md:px-8 rounded-full font-semibold bg-[#2563EB] hover:bg-blue-700 text-white border-0 shadow-sm text-sm md:text-base flex-1 sm:flex-initial\"
              >
                Next Question
              </Button>
            )}
          </div>
        </section>'''
    content = content.replace(old_footer, new_footer)

with open('f:/developer/deshexam/src/app/mock-tests/[slug]/take/exam-client.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Success')
