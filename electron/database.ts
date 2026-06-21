import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const userDataPath = app.getPath('userData');
    const dataPath = path.join(userDataPath, 'data');
    
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    const dbPath = path.join(dataPath, 'music-studio.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    initializeDatabase(db);
    insertMockData(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database): void {
  const migrationPath = path.join(process.cwd(), 'migrations', '001_init.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  database.exec(migrationSql);
}

function insertMockData(database: Database.Database): void {
  const studentCount = database.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  if (studentCount.count > 0) return;

  const today = new Date();

  const insertStudent = database.prepare(`
    INSERT INTO students (name, birth_date, level, preferred_genres, parent_name, parent_phone, parent_email, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLesson = database.prepare(`
    INSERT INTO lessons (student_id, day_of_week, start_time, end_time, type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecord = database.prepare(`
    INSERT INTO lesson_records (student_id, lesson_id, date, key_points, demonstration_audio, next_goals, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertHomework = database.prepare(`
    INSERT INTO homework (student_id, piece_name, composer, assigned_date, due_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSection = database.prepare(`
    INSERT INTO practice_sections (homework_id, section_name, measures, practice_notes, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertRecording = database.prepare(`
    INSERT INTO recordings (section_id, file_path, file_name, file_size, duration, uploaded_date, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBilling = database.prepare(`
    INSERT INTO billing_records (student_id, date, type, amount, description, lesson_hours, material_name, notes, is_paid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction(() => {
    const studentIds: number[] = [];
    const studentsData = [
      { name: '李小明', birthDate: '2015-03-15', level: '中级', preferredGenres: '古典, 浪漫', parentName: '李华', parentPhone: '13800138001', parentEmail: 'lihua@example.com', notes: '学习钢琴3年，手指力度需要加强' },
      { name: '王小红', birthDate: '2012-07-22', level: '高级', preferredGenres: '爵士, 流行', parentName: '王芳', parentPhone: '13900139002', parentEmail: 'wangfang@example.com', notes: '有天赋，表现力强，准备考级' },
      { name: '张小雨', birthDate: '2018-11-08', level: '初级', preferredGenres: '儿童歌曲', parentName: '张伟', parentPhone: '13700137003', parentEmail: 'zhangwei@example.com', notes: '刚开始学习，兴趣浓厚' },
      { name: '陈小雨', birthDate: '2014-05-30', level: '中级', preferredGenres: '流行, 摇滚', parentName: '陈静', parentPhone: '13600136004', parentEmail: 'chenjing@example.com', notes: '节奏感好，需要加强视奏' },
      { name: '刘小天', birthDate: '2011-09-12', level: '高级', preferredGenres: '古典', parentName: '刘强', parentPhone: '13500135005', parentEmail: 'liuqiang@example.com', notes: '准备参加比赛，需要加强乐曲表现力' },
    ];
    for (const s of studentsData) {
      const result = insertStudent.run(s.name, s.birthDate, s.level, s.preferredGenres, s.parentName, s.parentPhone, s.parentEmail, s.notes);
      studentIds.push(result.lastInsertRowid as number);
    }

    const lessonsData = [
      { studentIdx: 0, dayOffset: 0, hour: 9, dayOfWeek: 1, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
      { studentIdx: 1, dayOffset: 0, hour: 11, dayOfWeek: 1, type: 'regular' as const, status: 'scheduled' as const, notes: '考级曲目重点练习' },
      { studentIdx: 2, dayOffset: 1, hour: 14, dayOfWeek: 2, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
      { studentIdx: 3, dayOffset: 2, hour: 10, dayOfWeek: 3, type: 'makeup' as const, status: 'scheduled' as const, notes: '上周请假补课' },
      { studentIdx: 4, dayOffset: 2, hour: 15, dayOfWeek: 3, type: 'regular' as const, status: 'scheduled' as const, notes: '比赛曲目打磨' },
      { studentIdx: 0, dayOffset: 3, hour: 9, dayOfWeek: 4, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
      { studentIdx: 1, dayOffset: 4, hour: 11, dayOfWeek: 5, type: 'leave' as const, status: 'cancelled' as const, notes: '学生请假' },
      { studentIdx: 2, dayOffset: 5, hour: 14, dayOfWeek: 6, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
      { studentIdx: 3, dayOffset: -1, hour: 10, dayOfWeek: 0, type: 'regular' as const, status: 'completed' as const, notes: '' },
      { studentIdx: 4, dayOffset: -2, hour: 15, dayOfWeek: 6, type: 'regular' as const, status: 'completed' as const, notes: '' },
    ];
    const lessonIds: number[] = [];
    for (const l of lessonsData) {
      const date = new Date(today);
      date.setDate(date.getDate() + l.dayOffset);
      const startTime = new Date(date);
      startTime.setHours(l.hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      const result = insertLesson.run(studentIds[l.studentIdx], l.dayOfWeek, startTime.toISOString(), endTime.toISOString(), l.type, l.status, l.notes);
      lessonIds.push(result.lastInsertRowid as number);
    }

    const recordsData = [
      { studentIdx: 3, lessonIdx: 8, keyPoints: '1. 音阶练习需要注意指法的流畅性\n2. 乐曲第16小节的节奏需要更稳定\n3. 注意弱音记号的表现', nextGoals: '1. 继续练习C大调音阶，速度达到120\n2. 熟练演奏乐曲第一部分\n3. 开始学习第二部分' },
      { studentIdx: 4, lessonIdx: 9, keyPoints: '1. 肖邦练习曲的左手琶音需要更清晰\n2. 乐曲中段的情感表达需要加强\n3. 注意踏板的使用时机', nextGoals: '1. 慢速练习左手琶音，确保每个音清晰\n2. 分段练习乐曲中段，注意力度变化\n3. 准备下次课录音检查' },
    ];
    for (const r of recordsData) {
      const date = new Date(today);
      date.setDate(date.getDate() - (r.lessonIdx === 8 ? 1 : 2));
      insertRecord.run(studentIds[r.studentIdx], lessonIds[r.lessonIdx], date.toISOString().split('T')[0], r.keyPoints, '', r.nextGoals, '');
    }

    const homeworkData = [
      { studentIdx: 0, pieceName: '献给爱丽丝', composer: '贝多芬', daysAgo: 3, daysDue: 4, status: 'in_progress' as const, notes: '' },
      { studentIdx: 1, pieceName: '月光奏鸣曲第三乐章', composer: '贝多芬', daysAgo: 5, daysDue: 2, status: 'in_progress' as const, notes: '重点练习快速音阶段落' },
      { studentIdx: 3, pieceName: 'C大调小奏鸣曲', composer: '库劳', daysAgo: 1, daysDue: 6, status: 'pending' as const, notes: '' },
      { studentIdx: 4, pieceName: '肖邦练习曲Op.10 No.3', composer: '肖邦', daysAgo: 7, daysDue: 0, status: 'completed' as const, notes: '已完成，演奏效果好' },
      { studentIdx: 0, pieceName: '哈农练指法', composer: '哈农', daysAgo: 2, daysDue: 5, status: 'in_progress' as const, notes: '每日必练' },
    ];
    const homeworkIds: number[] = [];
    for (const h of homeworkData) {
      const assigned = new Date(today);
      assigned.setDate(assigned.getDate() - h.daysAgo);
      const due = new Date(today);
      due.setDate(due.getDate() + h.daysDue);
      const result = insertHomework.run(studentIds[h.studentIdx], h.pieceName, h.composer, assigned.toISOString().split('T')[0], due.toISOString().split('T')[0], h.status, h.notes);
      homeworkIds.push(result.lastInsertRowid as number);
    }

    const sectionsData = [
      { homeworkIdx: 0, sectionName: '主题呈示部', measures: '1-16小节', practiceNotes: '注意连音和断音的区别', status: 'passed' as const },
      { homeworkIdx: 0, sectionName: '中段', measures: '17-32小节', practiceNotes: '左手伴奏要轻', status: 'needs_review' as const },
      { homeworkIdx: 0, sectionName: '再现部', measures: '33-48小节', practiceNotes: '注意力度变化', status: 'pending' as const },
      { homeworkIdx: 1, sectionName: '引子', measures: '1-8小节', practiceNotes: '琶音要清晰', status: 'passed' as const },
      { homeworkIdx: 1, sectionName: '第一主题', measures: '9-32小节', practiceNotes: '注意快速音阶的准确性', status: 'needs_review' as const },
      { homeworkIdx: 2, sectionName: '第一乐章', measures: '1-40小节', practiceNotes: '保持稳定的节奏', status: 'pending' as const },
      { homeworkIdx: 3, sectionName: 'A段', measures: '1-16小节', practiceNotes: '注意右手旋律的歌唱性', status: 'passed' as const },
      { homeworkIdx: 3, sectionName: 'B段', measures: '17-32小节', practiceNotes: '左手琶音要流畅', status: 'passed' as const },
      { homeworkIdx: 4, sectionName: '第1-5条', measures: '每条12遍', practiceNotes: '高抬指练习', status: 'passed' as const },
    ];
    const sectionIds: number[] = [];
    for (const s of sectionsData) {
      const result = insertSection.run(homeworkIds[s.homeworkIdx], s.sectionName, s.measures, s.practiceNotes, s.status);
      sectionIds.push(result.lastInsertRowid as number);
    }

    const recordingsData = [
      { sectionIdx: 6, fileName: 'recording_001.mp3', fileSize: 2450000, duration: '2:35', daysAgo: 2, feedback: '演奏流畅，音乐性好！' },
      { sectionIdx: 7, fileName: 'recording_002.mp3', fileSize: 3120000, duration: '3:12', daysAgo: 1, feedback: '左手琶音有些模糊，建议单独练习' },
      { sectionIdx: 8, fileName: 'recording_003.mp3', fileSize: 1850000, duration: '1:58', daysAgo: 3, feedback: '手指力度有进步' },
    ];
    for (const r of recordingsData) {
      const uploaded = new Date(today);
      uploaded.setDate(uploaded.getDate() - r.daysAgo);
      insertRecording.run(sectionIds[r.sectionIdx], `audio/${r.fileName}`, r.fileName, r.fileSize, r.duration, uploaded.toISOString().split('T')[0], r.feedback);
    }

    const billingData = [
      { studentIdx: 0, monthOffset: 0, type: 'lesson' as const, amount: 800, description: '6月份课时费（8课时）', lessonHours: 8, isPaid: true },
      { studentIdx: 1, monthOffset: 0, type: 'lesson' as const, amount: 1200, description: '6月份课时费（8课时）', lessonHours: 8, isPaid: true },
      { studentIdx: 2, monthOffset: 0, type: 'lesson' as const, amount: 600, description: '6月份课时费（8课时）', lessonHours: 8, isPaid: true },
      { studentIdx: 3, monthOffset: 0, type: 'lesson' as const, amount: 800, description: '6月份课时费（8课时）', lessonHours: 8, isPaid: false },
      { studentIdx: 4, monthOffset: 0, type: 'lesson' as const, amount: 1200, description: '6月份课时费（8课时）', lessonHours: 8, isPaid: false },
      { studentIdx: 1, monthOffset: 0, dayOffset: 10, type: 'material' as const, amount: 120, description: '考级教材', materialName: '考级教材', isPaid: true },
      { studentIdx: 4, monthOffset: 0, dayOffset: 5, type: 'material' as const, amount: 180, description: '比赛曲目乐谱', materialName: '比赛曲目乐谱', isPaid: false },
      { studentIdx: 2, monthOffset: 0, dayOffset: 15, type: 'material' as const, amount: 85, description: '拜厄钢琴基础教程', materialName: '拜厄钢琴基础教程', isPaid: true },
    ];
    for (const b of billingData) {
      const date = new Date(today.getFullYear(), today.getMonth() + b.monthOffset, b.dayOffset || 1);
      insertBilling.run(studentIds[b.studentIdx], date.toISOString().split('T')[0], b.type, b.amount, b.description, b.lessonHours || null, b.materialName || null, '', b.isPaid ? 1 : 0);
    }
  });

  transaction();
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
