import { ipcMain } from 'electron';
import { getDatabase } from '../database';
import type { BillingRecord, MonthlyStats, BillingSummary } from '@shared/types';

export function setupBillingIpc(): void {
  ipcMain.handle('billing:getAll', async (_event, studentId?: number) => {
    try {
      const db = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records
      `;
      const params: (number | string)[] = [];
      if (studentId) {
        query += ' WHERE student_id = ?';
        params.push(studentId);
      }
      query += ' ORDER BY date DESC';
      const records = db.prepare(query).all(...params) as BillingRecord[];
      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:getById', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const record = db.prepare(`
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records WHERE id = ?
      `).get(id) as BillingRecord | undefined;
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:getMonthlyStats', async () => {
    try {
      const db = getDatabase();
      const stats = db.prepare(`
        SELECT 
          strftime('%Y-%m', date) as month,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) as unpaidAmount
        FROM billing_records
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
      `).all() as MonthlyStats[];
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:getSummary', async () => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        SELECT 
          COALESCE(SUM(amount), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) as unpaidAmount,
          COUNT(DISTINCT CASE WHEN is_paid = 0 THEN student_id END) as unpaidStudents
        FROM billing_records
      `).get() as BillingSummary;
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:create', async (_event, data: Omit<BillingRecord, 'id' | 'createdAt'>) => {
    try {
      const db = getDatabase();
      const result = db.prepare(`
        INSERT INTO billing_records (student_id, date, type, amount, description, is_paid, lesson_hours, material_name, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.studentId, data.date, data.type, data.amount, data.description,
        data.isPaid ? 1 : 0, data.lessonHours, data.materialName, data.notes
      );
      const id = result.lastInsertRowid as number;
      const record = db.prepare(`
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records WHERE id = ?
      `).get(id) as BillingRecord;
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:update', async (_event, id: number, data: Partial<Omit<BillingRecord, 'id' | 'createdAt'>>) => {
    try {
      const db = getDatabase();
      const fields = Object.keys(data).map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      }).join(', ');
      const values = Object.values(data).map(v => v === true ? 1 : v === false ? 0 : v);
      values.push(id);
      db.prepare(`UPDATE billing_records SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:delete', async (_event, id: number) => {
    try {
      const db = getDatabase();
      db.prepare('DELETE FROM billing_records WHERE id = ?').run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('billing:togglePaid', async (_event, id: number) => {
    try {
      const db = getDatabase();
      const record = db.prepare('SELECT is_paid as isPaid FROM billing_records WHERE id = ?').get(id) as { isPaid: number };
      db.prepare('UPDATE billing_records SET is_paid = ? WHERE id = ?').run(record.isPaid ? 0 : 1, id);
      return { success: true, data: { id, isPaid: !record.isPaid } };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
