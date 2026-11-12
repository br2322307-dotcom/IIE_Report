

-- -- Issues table for Reports
-- CREATE TABLE IF NOT EXISTS issues (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     owner_id INTEGER NOT NULL,
--     title TEXT NOT NULL,
--     description TEXT NOT NULL,
--     category TEXT NOT NULL,
--     location TEXT NOT NULL,
--     priority TEXT NOT NULL,
--     status TEXT DEFAULT 'Pending',
--     FOREIGN KEY (owner_id) REFERENCES users (id)
-- );



-- CREATE TABLE IF NOT EXISTS users (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name TEXT NOT NULL,
--     user_id TEXT UNIQUE NOT NULL, 
--     password_hash TEXT NOT NULL,  
--     role TEXT NOT NULL
-- );


-- CREATE TABLE IF NOT EXISTS issues (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     student_id TEXT NOT NULL,
--     title TEXT NOT NULL,
--     category TEXT NOT NULL,
--     description TEXT NOT NULL,
--     status TEXT DEFAULT 'Pending',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY(student_id) REFERENCES users(user_id)
-- );

-- Users table 
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id TEXT UNIQUE NOT NULL, 
    password_hash TEXT NOT NULL,  
    role TEXT NOT NULL
);


-- Issues table 

CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES users(user_id)
);

