import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import type { Student, StudentStats } from '@shared/types';

export function setupStudentIpc(): void {
  ipcMain.handle('students:getAll', async () => {
    try {
      const db = getDatabase();
      const students = db.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students ORDER BY name
      `).all() as Student[];
      return { success: true, data: students };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('students:getById', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const student = db.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students WHERE id = ?
      `).get(id) as Student | undefined;
      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('students:create', async (_event, data: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO students (name, birth_date, level, preferred_genres, parent_name, parent_phone, parent_email, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.name, data.birthDate, data.level, data.preferredGenres,
        data.parentName, data.parentPhone, data.parentEmail, data.notes
      );
      const id = result.lastInsertRowid as number;
      const student = db.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students WHERE id = ?
      `).get(id) as Student;
      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('students:update', async (_event, id: number, data: Partial<Omit<Student, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values: (string | number | null | undefined)[] = Object.values(data);
      values.push(id);
      db.prepare(`UPDATE students SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('students:delete', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM students WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('students:getStats', async (_event, id: number): Promise<{ success: boolean; data?: StudentStats; error?: string }> => {
    try {
      const db = getDatabase();
      const totalLessons = db.prepare(`
        SELECT COUNT(*) as count FROM lessons WHERE student_id = ? AND status = 'completed'
      `).get(id) as { count: number };
      
      const completedHomework = db.prepare(`
        SELECT COUNT(*) as count FROM homework WHERE student_id = ? AND status = 'completed'
      `).get(id) as { count: number };
      
      const pendingHomework = db.prepare(`
        SELECT COUNT(*) as count FROM homework WHERE student_id = ? AND status IN ('pending', 'in_progress')
      `).get(id) as { count: number };
      
      const totalAmount = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM billing_records WHERE student_id = ?
      `).get(id) as { total: number };
      
      const unpaidAmount = db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM billing_records WHERE student_id = ? AND is_paid = 0
      `).get(id) as { total: number };

      const stats: StudentStats = {
        totalLessons: totalLessons.count,
        completedHomework: completedHomework.count,
        pendingHomework: pendingHomework.count,
        totalAmount: totalAmount.total,
        unpaidAmount: unpaidAmount.total,
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
