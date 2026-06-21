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

  const insertStudent = database.prepare(`
    INSERT INTO students (id, name, birth_date, level, preferred_genres, parent_name, parent_phone, parent_email, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const students = [
    {
      id: 's1',
      name: '李小明',
      birthDate: '2015-03-15',
      level: '中级',
      preferredGenres: '古典, 浪漫',
      parentName: '李华',
      parentPhone: '13800138001',
      parentEmail: 'lihua@example.com',
      notes: '学习钢琴3年，手指力度需要加强'
    },
    {
      id: 's2',
      name: '王小红',
      birthDate: '2012-07-22',
      level: '高级',
      preferredGenres: '爵士, 流行',
      parentName: '王芳',
      parentPhone: '13900139002',
      parentEmail: 'wangfang@example.com',
      notes: '有天赋，表现力强，准备考级'
    },
    {
      id: 's3',
      name: '张小雨',
      birthDate: '2018-11-08',
      level: '初级',
      preferredGenres: '儿童歌曲',
      parentName: '张伟',
      parentPhone: '13700137003',
      parentEmail: 'zhangwei@example.com',
      notes: '刚开始学习，兴趣浓厚'
    },
    {
      id: 's4',
      name: '陈小雨',
      birthDate: '2014-05-30',
      level: '中级',
      preferredGenres: '流行, 摇滚',
      parentName: '陈静',
      parentPhone: '13600136004',
      parentEmail: 'chenjing@example.com',
      notes: '节奏感好，需要加强视奏'
    },
    {
      id: 's5',
      name: '刘小天',
      birthDate: '2011-09-12',
      level: '高级',
      preferredGenres: '古典',
      parentName: '刘强',
      parentPhone: '13500135005',
      parentEmail: 'liuqiang@example.com',
      notes: '准备参加比赛，需要加强乐曲表现力'
    }
  ];

  const transaction = database.transaction((studentsData: typeof students) => {
    for (const s of studentsData) {
      insertStudent.run(s.id, s.name, s.birthDate, s.level, s.preferredGenres, s.parentName, s.parentPhone, s.parentEmail, s.notes);
    }
  });
  transaction(students);

  const insertLesson = database.prepare(`
    INSERT INTO lessons (id, student_id, start_time, end_time, type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const lessons = [
    { id: 'l1', studentId: 's1', dayOffset: 0, hour: 9, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
    { id: 'l2', studentId: 's2', dayOffset: 0, hour: 11, type: 'regular' as const, status: 'scheduled' as const, notes: '考级曲目重点练习' },
    { id: 'l3', studentId: 's3', dayOffset: 1, hour: 14, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
    { id: 'l4', studentId: 's4', dayOffset: 2, hour: 10, type: 'makeup' as const, status: 'scheduled' as const, notes: '上周请假补课' },
    { id: 'l5', studentId: 's5', dayOffset: 2, hour: 15, type: 'regular' as const, status: 'scheduled' as const, notes: '比赛曲目打磨' },
    { id: 'l6', studentId: 's1', dayOffset: 3, hour: 9, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
    { id: 'l7', studentId: 's2', dayOffset: 4, hour: 11, type: 'leave' as const, status: 'cancelled' as const, notes: '学生请假' },
    { id: 'l8', studentId: 's3', dayOffset: 5, hour: 14, type: 'regular' as const, status: 'scheduled' as const, notes: '' },
    { id: 'l9', studentId: 's4', dayOffset: -1, hour: 10, type: 'regular' as const, status: 'completed' as const, notes: '' },
    { id: 'l10', studentId: 's5', dayOffset: -2, hour: 15, type: 'regular' as const, status: 'completed' as const, notes: '' },
  ];

  const lessonTransaction = database.transaction((lessonsData: typeof lessons) => {
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
      id: 'r1', studentId: 's4', lessonId: 'l9',
      keyPoints: '1. 音阶练习需要注意指法的流畅性\n2. 乐曲第16小节的节奏需要更稳定\n3. 注意弱音记号的表现',
      nextGoals: '1. 继续练习C大调音阶，速度达到120\n2. 熟练演奏乐曲第一部分\n3. 开始学习第二部分'
    },
    {
      id: 'r2', studentId: 's5', lessonId: 'l10',
      keyPoints: '1. 肖邦练习曲的左手琶音需要更清晰\n2. 乐曲中段的情感表达需要加强\n3. 注意踏板的使用时机',
      nextGoals: '1. 慢速练习左手琶音，确保每个音清晰\n2. 分段练习乐曲中段，注意力度变化\n3. 准备下次课录音检查'
    }
  ];

  const recordTransaction = database.transaction((recordsData: typeof records) => {
    for (const r of recordsData) {
      const date = new Date(today);
      date.setDate(date.getDate() - (r.lessonId === 'l9' ? 1 : 2));
      insertRecord.run(r.id, r.studentId, r.lessonId, date.toISOString().split('T')[0], r.keyPoints, '', r.nextGoals);
    }
  });
  recordTransaction(records);

  const insertHomework = database.prepare(`
    INSERT INTO homework (id, student_id, piece_name, composer, assigned_date, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const homework = [
    { id: 'h1', studentId: 's1', pieceName: '献给爱丽丝', composer: '贝多芬', daysAgo: 3, daysDue: 4, status: 'in_progress' as const },
    { id: 'h2', studentId: 's2', pieceName: '月光奏鸣曲第三乐章', composer: '贝多芬', daysAgo: 5, daysDue: 2, status: 'in_progress' as const },
    { id: 'h3', studentId: 's4', pieceName: 'C大调小奏鸣曲', composer: '库劳', daysAgo: 1, daysDue: 6, status: 'pending' as const },
    { id: 'h4', studentId: 's5', pieceName: '肖邦练习曲Op.10 No.3', composer: '肖邦', daysAgo: 7, daysDue: 0, status: 'completed' as const },
    { id: 'h5', studentId: 's1', pieceName: '哈农练指法', composer: '哈农', daysAgo: 2, daysDue: 5, status: 'in_progress' as const },
  ];

  const homeworkTransaction = database.transaction((homeworkData: typeof homework) => {
    for (const h of homeworkData) {
      const assigned = new Date(today);
      assigned.setDate(assigned.getDate() - h.daysAgo);
      const due = new Date(today);
      due.setDate(due.getDate() + h.daysDue);
      insertHomework.run(h.id, h.studentId, h.pieceName, h.composer, assigned.toISOString().split('T')[0], due.toISOString().split('T')[0], h.status);
    }
  });
  homeworkTransaction(homework);

  const insertSection = database.prepare(`
    INSERT INTO practice_sections (id, homework_id, section_name, measures, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const sections = [
    { id: 'sec1', homeworkId: 'h1', sectionName: '主题呈示部', measures: '1-16小节', description: '注意连音和断音的区别' },
    { id: 'sec2', homeworkId: 'h1', sectionName: '中段', measures: '17-32小节', description: '左手伴奏要轻' },
    { id: 'sec3', homeworkId: 'h1', sectionName: '再现部', measures: '33-48小节', description: '注意力度变化' },
    { id: 'sec4', homeworkId: 'h2', sectionName: '引子', measures: '1-8小节', description: '琶音要清晰' },
    { id: 'sec5', homeworkId: 'h2', sectionName: '第一主题', measures: '9-32小节', description: '注意快速音阶的准确性' },
    { id: 'sec6', homeworkId: 'h3', sectionName: '第一乐章', measures: '1-40小节', description: '保持稳定的节奏' },
    { id: 'sec7', homeworkId: 'h4', sectionName: 'A段', measures: '1-16小节', description: '注意右手旋律的歌唱性' },
    { id: 'sec8', homeworkId: 'h4', sectionName: 'B段', measures: '17-32小节', description: '左手琶音要流畅' },
    { id: 'sec9', homeworkId: 'h5', sectionName: '第1-5条', measures: '每条12遍', description: '高抬指练习' },
  ];

  const sectionTransaction = database.transaction((sectionsData: typeof sections) => {
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
    { id: 'rec1', sectionId: 'sec7', status: 'passed' as const, feedback: '演奏流畅，音乐性好！' },
    { id: 'rec2', sectionId: 'sec8', status: 'needs_retry' as const, feedback: '左手琶音有些模糊，建议单独练习' },
    { id: 'rec3', sectionId: 'sec9', status: 'passed' as const, feedback: '手指力度有进步' },
  ];

  const recordingTransaction = database.transaction((recordingsData: typeof recordings) => {
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
    { id: 'b1', studentId: 's1', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], type: 'lesson' as const, amount: 800, description: '6月份课时费（8课时）', isPaid: true },
    { id: 'b2', studentId: 's2', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], type: 'lesson' as const, amount: 1200, description: '6月份课时费（8课时）', isPaid: true },
    { id: 'b3', studentId: 's3', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], type: 'lesson' as const, amount: 600, description: '6月份课时费（8课时）', isPaid: true },
    { id: 'b4', studentId: 's4', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], type: 'lesson' as const, amount: 800, description: '6月份课时费（8课时）', isPaid: false },
    { id: 'b5', studentId: 's5', date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0], type: 'lesson' as const, amount: 1200, description: '6月份课时费（8课时）', isPaid: false },
    { id: 'b6', studentId: 's2', date: new Date(today.getFullYear(), today.getMonth(), 10).toISOString().split('T')[0], type: 'material' as const, amount: 120, description: '考级教材', isPaid: true },
    { id: 'b7', studentId: 's5', date: new Date(today.getFullYear(), today.getMonth(), 5).toISOString().split('T')[0], type: 'material' as const, amount: 180, description: '比赛曲目乐谱', isPaid: false },
    { id: 'b8', studentId: 's3', date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0], type: 'material' as const, amount: 85, description: '拜厄钢琴基础教程', isPaid: true },
  ];

  const billingTransaction = database.transaction((billingData: typeof billingRecords) => {
    for (const b of billingData) {
      insertBilling.run(b.id, b.studentId, b.date, b.type, b.amount, b.description, b.isPaid ? 1 : 0);
    }
  });
  billingTransaction(billingRecords);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
