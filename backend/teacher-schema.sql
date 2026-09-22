-- Run once in the KBCOLLEGE database before using teacher login.
CREATE TABLE IF NOT EXISTS teachers (
  teacher_id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(80) NOT NULL,
  designation VARCHAR(80) NOT NULL
);

-- Development faculty accounts; change passwords before deployment.
-- INSERT IGNORE makes this script safe to run again without duplicating teachers.
INSERT IGNORE INTO teachers (teacher_id, name, email, password, department, designation)
VALUES
  ('TCH-001', 'Dr. Anirudh Mehta', 'anirudh.mehta@kbcollege.edu.in', 'teacher123', 'Computer Applications', 'Assistant Professor'),
  ('TCH-002', 'Ms. Kavya Nair', 'kavya.nair@kbcollege.edu.in', 'teacher123', 'English', 'Assistant Professor'),
  ('TCH-003', 'Dr. Rohan Chatterjee', 'rohan.chatterjee@kbcollege.edu.in', 'teacher123', 'Mathematics', 'Associate Professor'),
  ('TCH-004', 'Mr. Sameer Kulkarni', 'sameer.kulkarni@kbcollege.edu.in', 'teacher123', 'Physics', 'Assistant Professor'),
  ('TCH-005', 'Ms. Nisha Iyer', 'nisha.iyer@kbcollege.edu.in', 'teacher123', 'Chemistry', 'Assistant Professor'),
  ('TCH-006', 'Dr. Manav Bhatia', 'manav.bhatia@kbcollege.edu.in', 'teacher123', 'Botany', 'Associate Professor'),
  ('TCH-007', 'Ms. Ritu Deshmukh', 'ritu.deshmukh@kbcollege.edu.in', 'teacher123', 'Zoology', 'Assistant Professor'),
  ('TCH-008', 'Dr. Vivek Menon', 'vivek.menon@kbcollege.edu.in', 'teacher123', 'History', 'Professor'),
  ('TCH-009', 'Mr. Arjun Siddiqui', 'arjun.siddiqui@kbcollege.edu.in', 'teacher123', 'Economics', 'Assistant Professor'),
  ('TCH-010', 'Ms. Pooja Malhotra', 'pooja.malhotra@kbcollege.edu.in', 'teacher123', 'Commerce', 'Assistant Professor');
