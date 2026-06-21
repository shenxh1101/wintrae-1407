import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import type { LessonRecord } from '@shared/types';

export function setupRecordIpc(): void {
  ipcMain.handle('records:getAll', async (_event, studentId?: number) => {
    try {
      const db = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records
      `;
      const params: (number | string)[] = [];
      if (studentId) {
        query += ' WHERE student_id = ?';
        params.push(studentId);
      }
      query += ' ORDER BY date DESC';
      const records = db.prepare(query).all(...params) as LessonRecord[];
      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('records:getById', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const record = db.prepare(`
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records WHERE id = ?
      `).get(id) as LessonRecord | undefined;
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('records:create', async (_event, data: Omit<LessonRecord, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO lesson_records (student_id, lesson_id, date, key_points, demonstration_audio, next_goals, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.lessonId, data.date, data.keyPoints, data.demonstrationAudio, data.nextGoals, data.notes);
      const id = result.lastInsertRowid as number;
      const record = db.prepare(`
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records WHERE id = ?
      `).get(id) as LessonRecord;
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('records:update', async (_event, id: number, data: Partial<Omit<LessonRecord, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE lesson_records SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('records:delete', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM lesson_records WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
