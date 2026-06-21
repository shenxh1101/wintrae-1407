"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
let db = null;
function getDatabase() {
  if (!db) {
    const userDataPath = electron.app.getPath("userData");
    const dataPath = path.join(userDataPath, "data");
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    const dbPath = path.join(dataPath, "music-studio.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDatabase(db);
    insertMockData(db);
  }
  return db;
}
function initializeDatabase(database) {
  const migrationPath = path.join(process.cwd(), "migrations", "001_init.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  database.exec(migrationSql);
}
function insertMockData(database) {
  const studentCount = database.prepare("SELECT COUNT(*) as count FROM students").get();
  if (studentCount.count > 0) return;
  const insertStudent = database.prepare(`
    INSERT INTO students (id, name, birth_date, level, preferred_genres, parent_name, parent_phone, parent_email, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const students = [
    {
      id: "s1",
      name: "李小明",
      birthDate: "2015-03-15",
      level: "中级",
      preferredGenres: "古典, 浪漫",
      parentName: "李华",
      parentPhone: "13800138001",
      parentEmail: "lihua@example.com",
      notes: "学习钢琴3年，手指力度需要加强"
    },
    {
      id: "s2",
      name: "王小红",
      birthDate: "2012-07-22",
      level: "高级",
      preferredGenres: "爵士, 流行",
      parentName: "王芳",
      parentPhone: "13900139002",
      parentEmail: "wangfang@example.com",
      notes: "有天赋，表现力强，准备考级"
    },
    {
      id: "s3",
      name: "张小雨",
      birthDate: "2018-11-08",
      level: "初级",
      preferredGenres: "儿童歌曲",
      parentName: "张伟",
      parentPhone: "13700137003",
      parentEmail: "zhangwei@example.com",
      notes: "刚开始学习，兴趣浓厚"
    },
    {
      id: "s4",
      name: "陈小雨",
      birthDate: "2014-05-30",
      level: "中级",
      preferredGenres: "流行, 摇滚",
      parentName: "陈静",
      parentPhone: "13600136004",
      parentEmail: "chenjing@example.com",
      notes: "节奏感好，需要加强视奏"
    },
    {
      id: "s5",
      name: "刘小天",
      birthDate: "2011-09-12",
      level: "高级",
      preferredGenres: "古典",
      parentName: "刘强",
      parentPhone: "13500135005",
      parentEmail: "liuqiang@example.com",
      notes: "准备参加比赛，需要加强乐曲表现力"
    }
  ];
  const transaction = database.transaction((studentsData) => {
    for (const s of studentsData) {
      insertStudent.run(s.id, s.name, s.birthDate, s.level, s.preferredGenres, s.parentName, s.parentPhone, s.parentEmail, s.notes);
    }
  });
  transaction(students);
  const insertLesson = database.prepare(`
    INSERT INTO lessons (id, student_id, start_time, end_time, type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const today = /* @__PURE__ */ new Date();
  const lessons = [
    { id: "l1", studentId: "s1", dayOffset: 0, hour: 9, type: "regular", status: "scheduled", notes: "" },
    { id: "l2", studentId: "s2", dayOffset: 0, hour: 11, type: "regular", status: "scheduled", notes: "考级曲目重点练习" },
    { id: "l3", studentId: "s3", dayOffset: 1, hour: 14, type: "regular", status: "scheduled", notes: "" },
    { id: "l4", studentId: "s4", dayOffset: 2, hour: 10, type: "makeup", status: "scheduled", notes: "上周请假补课" },
    { id: "l5", studentId: "s5", dayOffset: 2, hour: 15, type: "regular", status: "scheduled", notes: "比赛曲目打磨" },
    { id: "l6", studentId: "s1", dayOffset: 3, hour: 9, type: "regular", status: "scheduled", notes: "" },
    { id: "l7", studentId: "s2", dayOffset: 4, hour: 11, type: "leave", status: "cancelled", notes: "学生请假" },
    { id: "l8", studentId: "s3", dayOffset: 5, hour: 14, type: "regular", status: "scheduled", notes: "" },
    { id: "l9", studentId: "s4", dayOffset: -1, hour: 10, type: "regular", status: "completed", notes: "" },
    { id: "l10", studentId: "s5", dayOffset: -2, hour: 15, type: "regular", status: "completed", notes: "" }
  ];
  const lessonTransaction = database.transaction((lessonsData) => {
    for (const l of lessonsData) {
      const date = new Date(today);
      date.setDate(date.getDate() + l.dayOffset);
      const startTime = new Date(date);
      startTime.setHours(l.hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      insertLesson.run(l.id, l.studentId, startTime.toISOString(), endTime.toISOString(), l.type, l.status, l.notes);
    }
  });
  lessonTransaction(lessons);
  const insertRecord = database.prepare(`
    INSERT INTO lesson_records (id, student_id, lesson_id, date, key_points, demo_audio_url, next_goals)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const records = [
    {
      id: "r1",
      studentId: "s4",
      lessonId: "l9",
      keyPoints: "1. 音阶练习需要注意指法的流畅性\n2. 乐曲第16小节的节奏需要更稳定\n3. 注意弱音记号的表现",
      nextGoals: "1. 继续练习C大调音阶，速度达到120\n2. 熟练演奏乐曲第一部分\n3. 开始学习第二部分"
    },
    {
      id: "r2",
      studentId: "s5",
      lessonId: "l10",
      keyPoints: "1. 肖邦练习曲的左手琶音需要更清晰\n2. 乐曲中段的情感表达需要加强\n3. 注意踏板的使用时机",
      nextGoals: "1. 慢速练习左手琶音，确保每个音清晰\n2. 分段练习乐曲中段，注意力度变化\n3. 准备下次课录音检查"
    }
  ];
  const recordTransaction = database.transaction((recordsData) => {
    for (const r of recordsData) {
      const date = new Date(today);
      date.setDate(date.getDate() - (r.lessonId === "l9" ? 1 : 2));
      insertRecord.run(r.id, r.studentId, r.lessonId, date.toISOString().split("T")[0], r.keyPoints, "", r.nextGoals);
    }
  });
  recordTransaction(records);
  const insertHomework = database.prepare(`
    INSERT INTO homework (id, student_id, piece_name, composer, assigned_date, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const homework = [
    { id: "h1", studentId: "s1", pieceName: "献给爱丽丝", composer: "贝多芬", daysAgo: 3, daysDue: 4, status: "in_progress" },
    { id: "h2", studentId: "s2", pieceName: "月光奏鸣曲第三乐章", composer: "贝多芬", daysAgo: 5, daysDue: 2, status: "in_progress" },
    { id: "h3", studentId: "s4", pieceName: "C大调小奏鸣曲", composer: "库劳", daysAgo: 1, daysDue: 6, status: "pending" },
    { id: "h4", studentId: "s5", pieceName: "肖邦练习曲Op.10 No.3", composer: "肖邦", daysAgo: 7, daysDue: 0, status: "completed" },
    { id: "h5", studentId: "s1", pieceName: "哈农练指法", composer: "哈农", daysAgo: 2, daysDue: 5, status: "in_progress" }
  ];
  const homeworkTransaction = database.transaction((homeworkData) => {
    for (const h of homeworkData) {
      const assigned = new Date(today);
      assigned.setDate(assigned.getDate() - h.daysAgo);
      const due = new Date(today);
      due.setDate(due.getDate() + h.daysDue);
      insertHomework.run(h.id, h.studentId, h.pieceName, h.composer, assigned.toISOString().split("T")[0], due.toISOString().split("T")[0], h.status);
    }
  });
  homeworkTransaction(homework);
  const insertSection = database.prepare(`
    INSERT INTO practice_sections (id, homework_id, section_name, measures, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  const sections = [
    { id: "sec1", homeworkId: "h1", sectionName: "主题呈示部", measures: "1-16小节", description: "注意连音和断音的区别" },
    { id: "sec2", homeworkId: "h1", sectionName: "中段", measures: "17-32小节", description: "左手伴奏要轻" },
    { id: "sec3", homeworkId: "h1", sectionName: "再现部", measures: "33-48小节", description: "注意力度变化" },
    { id: "sec4", homeworkId: "h2", sectionName: "引子", measures: "1-8小节", description: "琶音要清晰" },
    { id: "sec5", homeworkId: "h2", sectionName: "第一主题", measures: "9-32小节", description: "注意快速音阶的准确性" },
    { id: "sec6", homeworkId: "h3", sectionName: "第一乐章", measures: "1-40小节", description: "保持稳定的节奏" },
    { id: "sec7", homeworkId: "h4", sectionName: "A段", measures: "1-16小节", description: "注意右手旋律的歌唱性" },
    { id: "sec8", homeworkId: "h4", sectionName: "B段", measures: "17-32小节", description: "左手琶音要流畅" },
    { id: "sec9", homeworkId: "h5", sectionName: "第1-5条", measures: "每条12遍", description: "高抬指练习" }
  ];
  const sectionTransaction = database.transaction((sectionsData) => {
    for (const s of sectionsData) {
      insertSection.run(s.id, s.homeworkId, s.sectionName, s.measures, s.description);
    }
  });
  sectionTransaction(sections);
  const insertRecording = database.prepare(`
    INSERT INTO recordings (id, section_id, audio_url, status, feedback)
    VALUES (?, ?, ?, ?, ?)
  `);
  const recordings = [
    { id: "rec1", sectionId: "sec7", status: "passed", feedback: "演奏流畅，音乐性好！" },
    { id: "rec2", sectionId: "sec8", status: "needs_retry", feedback: "左手琶音有些模糊，建议单独练习" },
    { id: "rec3", sectionId: "sec9", status: "passed", feedback: "手指力度有进步" }
  ];
  const recordingTransaction = database.transaction((recordingsData) => {
    for (const r of recordingsData) {
      insertRecording.run(r.id, r.sectionId, `audio/${r.id}.mp3`, r.status, r.feedback);
    }
  });
  recordingTransaction(recordings);
  const insertBilling = database.prepare(`
    INSERT INTO billing_records (id, student_id, date, type, amount, description, is_paid)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const billingRecords = [
    { id: "b1", studentId: "s1", date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0], type: "lesson", amount: 800, description: "6月份课时费（8课时）", isPaid: true },
    { id: "b2", studentId: "s2", date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0], type: "lesson", amount: 1200, description: "6月份课时费（8课时）", isPaid: true },
    { id: "b3", studentId: "s3", date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0], type: "lesson", amount: 600, description: "6月份课时费（8课时）", isPaid: true },
    { id: "b4", studentId: "s4", date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0], type: "lesson", amount: 800, description: "6月份课时费（8课时）", isPaid: false },
    { id: "b5", studentId: "s5", date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0], type: "lesson", amount: 1200, description: "6月份课时费（8课时）", isPaid: false },
    { id: "b6", studentId: "s2", date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split("T")[0], type: "material", amount: 120, description: "考级教材", isPaid: true },
    { id: "b7", studentId: "s5", date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split("T")[0], type: "material", amount: 180, description: "比赛曲目乐谱", isPaid: false },
    { id: "b8", studentId: "s3", date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split("T")[0], type: "material", amount: 85, description: "拜厄钢琴基础教程", isPaid: true }
  ];
  const billingTransaction = database.transaction((billingData) => {
    for (const b of billingData) {
      insertBilling.run(b.id, b.studentId, b.date, b.type, b.amount, b.description, b.isPaid ? 1 : 0);
    }
  });
  billingTransaction(billingRecords);
}
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
function setupStudentIpc() {
  electron.ipcMain.handle("students:getAll", async () => {
    try {
      const db2 = getDatabase();
      const students = db2.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students ORDER BY name
      `).all();
      return { success: true, data: students };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("students:getById", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const student = db2.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students WHERE id = ?
      `).get(id);
      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("students:create", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO students (name, birth_date, level, preferred_genres, parent_name, parent_phone, parent_email, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.name,
        data.birthDate,
        data.level,
        data.preferredGenres,
        data.parentName,
        data.parentPhone,
        data.parentEmail,
        data.notes
      );
      const id = result.lastInsertRowid;
      const student = db2.prepare(`
        SELECT 
          id, name, birth_date as birthDate, level, preferred_genres as preferredGenres,
          parent_name as parentName, parent_phone as parentPhone, parent_email as parentEmail,
          notes, created_at as createdAt
        FROM students WHERE id = ?
      `).get(id);
      return { success: true, data: student };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("students:update", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE students SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("students:delete", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM students WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("students:getStats", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const totalLessons = db2.prepare(`
        SELECT COUNT(*) as count FROM lessons WHERE student_id = ? AND status = 'completed'
      `).get(id);
      const completedHomework = db2.prepare(`
        SELECT COUNT(*) as count FROM homework WHERE student_id = ? AND status = 'completed'
      `).get(id);
      const pendingHomework = db2.prepare(`
        SELECT COUNT(*) as count FROM homework WHERE student_id = ? AND status IN ('pending', 'in_progress')
      `).get(id);
      const totalAmount = db2.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM billing_records WHERE student_id = ?
      `).get(id);
      const unpaidAmount = db2.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total FROM billing_records WHERE student_id = ? AND is_paid = 0
      `).get(id);
      const stats = {
        totalLessons: totalLessons.count,
        completedHomework: completedHomework.count,
        pendingHomework: pendingHomework.count,
        totalAmount: totalAmount.total,
        unpaidAmount: unpaidAmount.total
      };
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
function setupLessonIpc() {
  electron.ipcMain.handle("lessons:getAll", async (_event, startDate, endDate) => {
    try {
      const db2 = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons
      `;
      const params = [];
      if (startDate && endDate) {
        query += " WHERE start_time >= ? AND start_time <= ?";
        params.push(startDate, endDate);
      }
      query += " ORDER BY start_time";
      const lessons = db2.prepare(query).all(...params);
      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:getById", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const lesson = db2.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE id = ?
      `).get(id);
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:getByStudent", async (_event, studentId) => {
    try {
      const db2 = getDatabase();
      const lessons = db2.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE student_id = ? ORDER BY start_time DESC
      `).all(studentId);
      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:create", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO lessons (student_id, day_of_week, start_time, end_time, type, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.dayOfWeek, data.startTime, data.endTime, data.type, data.status, data.notes);
      const id = result.lastInsertRowid;
      const lesson = db2.prepare(`
        SELECT 
          id, student_id as studentId, day_of_week as dayOfWeek, start_time as startTime, end_time as endTime,
          type, status, notes, created_at as createdAt
        FROM lessons WHERE id = ?
      `).get(id);
      return { success: true, data: lesson };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:update", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE lessons SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:move", async (_event, id, dayOfWeek, startTime, endTime) => {
    try {
      const db2 = getDatabase();
      db2.prepare(`
        UPDATE lessons SET day_of_week = ?, start_time = ?, end_time = ? WHERE id = ?
      `).run(dayOfWeek, startTime, endTime, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("lessons:delete", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM lessons WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
function setupRecordIpc() {
  electron.ipcMain.handle("records:getAll", async (_event, studentId) => {
    try {
      const db2 = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records
      `;
      const params = [];
      if (studentId) {
        query += " WHERE student_id = ?";
        params.push(studentId);
      }
      query += " ORDER BY date DESC";
      const records = db2.prepare(query).all(...params);
      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("records:getById", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const record = db2.prepare(`
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records WHERE id = ?
      `).get(id);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("records:create", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO lesson_records (student_id, lesson_id, date, key_points, demonstration_audio, next_goals, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.lessonId, data.date, data.keyPoints, data.demonstrationAudio, data.nextGoals, data.notes);
      const id = result.lastInsertRowid;
      const record = db2.prepare(`
        SELECT 
          id, student_id as studentId, lesson_id as lessonId, date,
          key_points as keyPoints, demonstration_audio as demonstrationAudio,
          next_goals as nextGoals, notes, created_at as createdAt
        FROM lesson_records WHERE id = ?
      `).get(id);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("records:update", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE lesson_records SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("records:delete", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM lesson_records WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
function setupHomeworkIpc() {
  electron.ipcMain.handle("homework:getAll", async (_event, studentId) => {
    try {
      const db2 = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework
      `;
      const params = [];
      if (studentId) {
        query += " WHERE student_id = ?";
        params.push(studentId);
      }
      query += " ORDER BY assigned_date DESC";
      const homework = db2.prepare(query).all(...params);
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:getById", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const homework = db2.prepare(`
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework WHERE id = ?
      `).get(id);
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:getSections", async (_event, homeworkId) => {
    try {
      const db2 = getDatabase();
      const sections = db2.prepare(`
        SELECT id, homework_id as homeworkId, section_name as sectionName, measures, practice_notes as practiceNotes, status, created_at as createdAt
        FROM practice_sections WHERE homework_id = ? ORDER BY id
      `).all(homeworkId);
      return { success: true, data: sections };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:getRecordings", async (_event, sectionId) => {
    try {
      const db2 = getDatabase();
      const recordings = db2.prepare(`
        SELECT id, section_id as sectionId, file_path as filePath, file_name as fileName, file_size as fileSize, duration, uploaded_date as uploadedDate, feedback
        FROM recordings WHERE section_id = ? ORDER BY uploaded_date DESC
      `).all(sectionId);
      return { success: true, data: recordings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:createHomework", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO homework (student_id, piece_name, composer, assigned_date, due_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.studentId, data.pieceName, data.composer, data.assignedDate, data.dueDate, data.status, data.notes);
      const id = result.lastInsertRowid;
      const homework = db2.prepare(`
        SELECT 
          id, student_id as studentId, piece_name as pieceName, composer,
          assigned_date as assignedDate, due_date as dueDate, status, notes, created_at as createdAt
        FROM homework WHERE id = ?
      `).get(id);
      return { success: true, data: homework };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:updateHomework", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE homework SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:deleteHomework", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM homework WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:createSection", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO practice_sections (homework_id, section_name, measures, practice_notes, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(data.homeworkId, data.sectionName, data.measures, data.practiceNotes, data.status || "pending");
      const id = result.lastInsertRowid;
      const section = db2.prepare(`
        SELECT id, homework_id as homeworkId, section_name as sectionName, measures, practice_notes as practiceNotes, status, created_at as createdAt
        FROM practice_sections WHERE id = ?
      `).get(id);
      return { success: true, data: section };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:updateSection", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE practice_sections SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:updateSectionStatus", async (_event, id, status) => {
    try {
      const db2 = getDatabase();
      db2.prepare("UPDATE practice_sections SET status = ? WHERE id = ?").run(status, id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:deleteSection", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM practice_sections WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:createRecording", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO recordings (section_id, file_path, file_name, file_size, duration, uploaded_date, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(data.sectionId, data.filePath, data.fileName, data.fileSize, data.duration, data.uploadedDate, data.feedback);
      const id = result.lastInsertRowid;
      const recording = db2.prepare(`
        SELECT id, section_id as sectionId, file_path as filePath, file_name as fileName, file_size as fileSize, duration, uploaded_date as uploadedDate, feedback
        FROM recordings WHERE id = ?
      `).get(id);
      return { success: true, data: recording };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:updateRecording", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data);
      values.push(id);
      db2.prepare(`UPDATE recordings SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("homework:deleteRecording", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM recordings WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
function setupBillingIpc() {
  electron.ipcMain.handle("billing:getAll", async (_event, studentId) => {
    try {
      const db2 = getDatabase();
      let query = `
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records
      `;
      const params = [];
      if (studentId) {
        query += " WHERE student_id = ?";
        params.push(studentId);
      }
      query += " ORDER BY date DESC";
      const records = db2.prepare(query).all(...params);
      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:getById", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const record = db2.prepare(`
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records WHERE id = ?
      `).get(id);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:getMonthlyStats", async () => {
    try {
      const db2 = getDatabase();
      const stats = db2.prepare(`
        SELECT 
          strftime('%Y-%m', date) as month,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) as unpaidAmount
        FROM billing_records
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
      `).all();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:getSummary", async () => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        SELECT 
          COALESCE(SUM(amount), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN is_paid = 0 THEN amount ELSE 0 END), 0) as unpaidAmount,
          COUNT(DISTINCT CASE WHEN is_paid = 0 THEN student_id END) as unpaidStudents
        FROM billing_records
      `).get();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:create", async (_event, data) => {
    try {
      const db2 = getDatabase();
      const result = db2.prepare(`
        INSERT INTO billing_records (student_id, date, type, amount, description, is_paid, lesson_hours, material_name, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.studentId,
        data.date,
        data.type,
        data.amount,
        data.description,
        data.isPaid ? 1 : 0,
        data.lessonHours,
        data.materialName,
        data.notes
      );
      const id = result.lastInsertRowid;
      const record = db2.prepare(`
        SELECT 
          id, student_id as studentId, date, type, amount, description,
          is_paid as isPaid, lesson_hours as lessonHours, material_name as materialName,
          notes, created_at as createdAt
        FROM billing_records WHERE id = ?
      `).get(id);
      return { success: true, data: record };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:update", async (_event, id, data) => {
    try {
      const db2 = getDatabase();
      const fields = Object.keys(data).map((key) => {
        const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        return `${dbKey} = ?`;
      }).join(", ");
      const values = Object.values(data).map((v) => v === true ? 1 : v === false ? 0 : v);
      values.push(id);
      db2.prepare(`UPDATE billing_records SET ${fields} WHERE id = ?`).run(...values);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:delete", async (_event, id) => {
    try {
      const db2 = getDatabase();
      db2.prepare("DELETE FROM billing_records WHERE id = ?").run(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("billing:togglePaid", async (_event, id) => {
    try {
      const db2 = getDatabase();
      const record = db2.prepare("SELECT is_paid as isPaid FROM billing_records WHERE id = ?").get(id);
      db2.prepare("UPDATE billing_records SET is_paid = ? WHERE id = ?").run(record.isPaid ? 0 : 1, id);
      return { success: true, data: { id, isPaid: !record.isPaid } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    backgroundColor: "#faf8f5",
    title: "Music Studio Manager",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    titleBarStyle: "default"
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5174");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  getDatabase();
  setupStudentIpc();
  setupLessonIpc();
  setupRecordIpc();
  setupHomeworkIpc();
  setupBillingIpc();
  setupFileIpc();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  closeDatabase();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
function setupFileIpc() {
  electron.ipcMain.handle("files:selectAudio", async () => {
    try {
      const result = await electron.dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [
          { name: "Audio Files", extensions: ["mp3", "wav", "m4a", "ogg"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: "No file selected" };
      }
      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("files:saveAudio", async (_event, fileName, arrayBuffer) => {
    try {
      const userDataPath = electron.app.getPath("userData");
      const audioDir = path.join(userDataPath, "audio");
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }
      const filePath = path.join(audioDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      return { success: true, data: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  electron.ipcMain.handle("files:savePdf", async (_event, fileName, arrayBuffer) => {
    try {
      const result = await electron.dialog.showSaveDialog({
        defaultPath: fileName,
        filters: [{ name: "PDF Files", extensions: ["pdf"] }]
      });
      if (result.canceled || !result.filePath) {
        return { success: false, error: "Save cancelled" };
      }
      fs.writeFileSync(result.filePath, Buffer.from(arrayBuffer));
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
