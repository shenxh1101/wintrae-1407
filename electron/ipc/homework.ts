import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import type { Homework, PracticeSection, Recording, SectionStatus } from '@shared/types';

export function setupHomeworkIpc(): void {
  ipcMain.handle('homework:getAll', async (_event, studentId?: number) => {
    try {
      const db = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework
      `;
      const params: (number | string)[] = [];
      if (studentId) {
        query += ' WHERE student_id = ?';
        params.push(studentId);
      }
      query += ' ORDER BY assigned_date DESC';
      const homework = db.prepare(query).all(...params) as Homework[];
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:getById', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const homework = db.prepare(`
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework WHERE id = ?
      `).get(id) as Homework | undefined;
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:getSections', async (_event, homeworkId: number) => {
    try {
      const db = getDatabase();
      const sections = db.prepare(`
        SELECT id, homework_id as homeworkId, section_name as sectionName, measures, practice_notes as practiceNotes, status, created_at as createdAt
        FROM practice_sections WHERE homework_id = ? ORDER BY id
      `).all(homeworkId) as PracticeSection[];
      return { success: true, data: sections };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:getRecordings', async (_event, sectionId: number) => {
    try {
      const db = getDatabase();
      const recordings = db.prepare(`
        SELECT id, section_id as sectionId, file_path as filePath, file_name as fileName, file_size as fileSize, duration, uploaded_date as uploadedDate, feedback
        FROM recordings WHERE section_id = ? ORDER BY uploaded_date DESC
      `).all(sectionId) as Recording[];
      return { success: true, data: recordings };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:createHomework', async (_event, data: Omit<Homework, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO homework (student_id, piece_name, composer, assigned_date, due_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.pieceName, data.composer, data.assignedDate, data.dueDate, data.status, data.notes);
      const id = result.lastInsertRowid as number;
      const homework = db.prepare(`
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework WHERE id = ?
      `).get(id) as Homework;
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:updateHomework', async (_event, id: number, data: Partial<Omit<Homework, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE homework SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:deleteHomework', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM homework WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:createSection', async (_event, data: Omit<PracticeSection, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO practice_sections (homework_id, section_name, measures, practice_notes, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(data.homeworkId, data.sectionName, data.measures, data.practiceNotes, data.status || 'pending');
      const id = result.lastInsertRowid as number;
      const section = db.prepare(`
        SELECT id, homework_id as homeworkId, section_name as sectionName, measures, practice_notes as practiceNotes, status, created_at as createdAt
        FROM practice_sections WHERE id = ?
      `).get(id) as PracticeSection;
      return { success: true, data: section };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:updateSection', async (_event, id: number, data: Partial<Omit<PracticeSection, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE practice_sections SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:updateSectionStatus', async (_event, id: number, status: SectionStatus) => {
    try {
      const db = getDatabase();
      db.prepare('UPDATE practice_sections SET status = ? WHERE id = ?').run(status, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:deleteSection', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM practice_sections WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:createRecording', async (_event, data: Omit<Recording, 'id'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO recordings (section_id, file_path, file_name, file_size, duration, uploaded_date, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.sectionId, data.filePath, data.fileName, data.fileSize, data.duration, data.uploadedDate, data.feedback);
      const id = result.lastInsertRowid as number;
      const recording = db.prepare(`
        SELECT id, section_id as sectionId, file_path as filePath, file_name as fileName, file_size as fileSize, duration, uploaded_date as uploadedDate, feedback
        FROM recordings WHERE id = ?
      `).get(id) as Recording;
      return { success: true, data: recording };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:updateRecording', async (_event, id: number, data: Partial<Omit<Recording, 'id' | 'sectionId'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE recordings SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('homework:deleteRecording', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM recordings WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
