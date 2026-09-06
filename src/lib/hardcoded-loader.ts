/**
 * Hardcoded Assessment Loader
 *
 * নতুন test যোগ করতে শুধু JSON file রাখুন:
 *   src/data/hardcoded/mock-tests/my-new-test.json
 *   src/data/hardcoded/quizzes/my-new-quiz.json
 *   src/data/hardcoded/practice/my-new-practice.json
 *
 * আর কিছু করতে হবে না — এই loader নিজেই খুঁজে নেবে।
 */

import fs from 'fs';
import path from 'path';

// project root থেকে path তৈরি
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'hardcoded');

function loadAllFromFolder(folderName: string): any[] {
  try {
    const folderPath = path.join(DATA_DIR, folderName);
    if (!fs.existsSync(folderPath)) {
      console.warn(`[hardcoded-loader] Folder not found: ${folderPath}`);
      return [];
    }
    return fs
      .readdirSync(folderPath)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        try {
          const raw = fs.readFileSync(path.join(folderPath, file), 'utf-8');
          return JSON.parse(raw);
        } catch (e) {
          console.error(`[hardcoded-loader] Failed to parse ${file}:`, e);
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    console.error(`[hardcoded-loader] Error loading folder ${folderName}:`, e);
    return [];
  }
}

export function getHardcodedMockTest(slug: string): any | null {
  const all = loadAllFromFolder('mock-tests');
  const found = all.find(t => t.slug === slug) ?? null;
  if (!found) console.log(`[hardcoded-loader] mock-test slug "${slug}" not found. Available:`, all.map(t => t.slug));
  return found;
}

export function getHardcodedQuiz(slug: string): any | null {
  const all = loadAllFromFolder('quizzes');
  const found = all.find(t => t.slug === slug) ?? null;
  if (!found) console.log(`[hardcoded-loader] quiz slug "${slug}" not found. Available:`, all.map(t => t.slug));
  return found;
}

export function getHardcodedPracticeSet(slug: string): any | null {
  const all = loadAllFromFolder('practice');
  const found = all.find(t => t.slug === slug) ?? null;
  if (!found) console.log(`[hardcoded-loader] practice slug "${slug}" not found. Available:`, all.map(t => t.slug));
  return found;
}

export function getAllHardcodedMockTests(): any[] {
  return loadAllFromFolder('mock-tests');
}

export function getAllHardcodedQuizzes(): any[] {
  return loadAllFromFolder('quizzes');
}

export function getAllHardcodedPracticeSets(): any[] {
  return loadAllFromFolder('practice');
}
