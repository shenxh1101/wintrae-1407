import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import type { Lesson } from '@shared/types';

export function setupLessonIpc(): void {
  ipcMain.handle('lessons:getAll', async () => {
    try {
      const db = getDatabase();
      const query = `
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons
        ORDER BY day_of_week, start_time
      `;
      const lessons = db.prepare(query).all() as Lesson[];
      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:getById', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const lesson = db.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE id = ?
      `).get(id) as Lesson | undefined;
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:getByStudent', async (_event, studentId: number) => {
    try {
      const db = getDatabase();
      const lessons = db.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE student_id = ? ORDER BY start_time DESC
      `).all(studentId) as Lesson[];
      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:create', async (_event, data: Omit<Lesson, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO lessons (student_id, day_of_week, start_time, end_time, type, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.dayOfWeek, data.startTime, data.endTime, data.type, data.status, data.notes);
      const id = result.lastInsertRowid as number;
      const lesson = db.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE id = ?
      `).get(id) as Lesson;
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:update', async (_event, id: number, data: Partial<Omit<Lesson, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE lessons SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:move', async (_event, id: number, dayOfWeek: number, startTime: string, endTime: string) => {
    try {
      const db = getDatabase();
      db.prepare(`
        UPDATE lessons SET day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?
      `).run(dayOfWeek, startTime, endTime, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('lessons:delete', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
