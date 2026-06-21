CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date TEXT,
    level TEXT,
    preferred_genres TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS lesson_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    lesson_id TEXT,
    date TEXT NOT NULL,
    key_points TEXT,
    demo_audio_url TEXT,
    next_goals TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE IF NOT EXISTS homework (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    piece_name TEXT NOT NULL,
    composer TEXT,
    assigned_date TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS practice_sections (
    id TEXT PRIMARY KEY,
    homework_id TEXT NOT NULL,
    section_name TEXT NOT NULL,
    measures TEXT,
    description TEXT,
    FOREIGN KEY (homework_id) REFERENCES homework(id)
);

CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    section_id TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    status TEXT NOT NULL,
    feedback TEXT,
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES practice_sections(id)
);

CREATE TABLE IF NOT EXISTS billing_records (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    is_paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_student_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_time ON lessons(start_time);
CREATE INDEX IF NOT EXISTS idx_billing_student ON billing_records(student_id);
