const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { execFile } = require("child_process");

// Load local development variables without requiring an additional runtime
// package. Existing environment variables always take precedence.
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const execFileAsync = promisify(execFile);
const allowedOrigins = [
  "https://kb-college-k2q0qj3ts-kb-college-bermo.vercel.app",
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
   "https://kb-college.vercel.app",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "KBCOLLEGE",
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const dbQuery = promisify(db.query).bind(db);

db.on("error", (error) => {
  console.error("MySQL connection error:", error.message);
});

const teacherSeedData = [
  ["TCH-001", "Dr. Anirudh Mehta", "anirudh.mehta@kbcollege.edu.in", "teacher123", "Computer Applications", "Assistant Professor"],
  ["TCH-002", "Ms. Kavya Nair", "kavya.nair@kbcollege.edu.in", "teacher123", "English", "Assistant Professor"],
  ["TCH-003", "Dr. Rohan Chatterjee", "rohan.chatterjee@kbcollege.edu.in", "teacher123", "Mathematics", "Associate Professor"],
  ["TCH-004", "Mr. Sameer Kulkarni", "sameer.kulkarni@kbcollege.edu.in", "teacher123", "Physics", "Assistant Professor"],
  ["TCH-005", "Ms. Nisha Iyer", "nisha.iyer@kbcollege.edu.in", "teacher123", "Chemistry", "Assistant Professor"],
  ["TCH-006", "Dr. Manav Bhatia", "manav.bhatia@kbcollege.edu.in", "teacher123", "Botany", "Associate Professor"],
  ["TCH-007", "Ms. Ritu Deshmukh", "ritu.deshmukh@kbcollege.edu.in", "teacher123", "Zoology", "Assistant Professor"],
  ["TCH-008", "Dr. Vivek Menon", "vivek.menon@kbcollege.edu.in", "teacher123", "History", "Professor"],
  ["TCH-009", "Mr. Arjun Siddiqui", "arjun.siddiqui@kbcollege.edu.in", "teacher123", "Economics", "Assistant Professor"],
  ["TCH-010", "Ms. Pooja Malhotra", "pooja.malhotra@kbcollege.edu.in", "teacher123", "Commerce", "Assistant Professor"],
];

const initializeTeachers = () => {
  db.query(`CREATE TABLE IF NOT EXISTS teachers (
    teacher_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(80) NOT NULL,
    designation VARCHAR(80) NOT NULL
  )`, (err) => {
    if (err) return console.error("Teacher table setup failed:", err.message);
    db.query("SHOW COLUMNS FROM teachers LIKE 'designation'", (columnError, columns) => {
      if (columnError) return console.error("Teacher table check failed:", columnError.message);

      const seedTeachers = () => db.query(
        "INSERT INTO teachers (teacher_id, name, email, password, department, designation) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), department = VALUES(department), designation = VALUES(designation)",
        [teacherSeedData],
        (seedError) => {
          if (seedError) return console.error("Teacher seed failed:", seedError.message);
          console.log("Teacher accounts are ready.");
        }
      );

      if (columns.length > 0) return seedTeachers();

      db.query(
        "ALTER TABLE teachers ADD COLUMN designation VARCHAR(80) NOT NULL DEFAULT 'Faculty Member'",
        (migrationError) => {
          if (migrationError) return console.error("Teacher table migration failed:", migrationError.message);
          seedTeachers();
        }
      );
    });
  });
};


const initializeStudents = () => {
  db.query(`CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    admission_year INT NOT NULL,
    admission_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    date_of_birth DATE NULL,
    gender VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    guardian_name VARCHAR(100) NULL,
    guardian_phone VARCHAR(20) NULL,
    qualification_12th VARCHAR(100) NULL,
    board_12th VARCHAR(100) NULL,
    marks_12th DECIMAL(5,2) NULL,
    passing_year_12th INT NULL,
    admission_submitted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (error) => {
    if (error) {
      console.error("Student table setup failed:", error.message);
    } else {
      console.log("Student table is ready.");
    }
  });
};


const initializeResults = () => {
  db.query(`CREATE TABLE IF NOT EXISTS student_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL,
    semester INT NOT NULL,
    course_code VARCHAR(40) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    grade VARCHAR(4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_semester_subject (student_id, semester, subject)
  )`, (err) => {
    if (err) return console.error("Results table setup failed:", err.message);
    db.query("SHOW COLUMNS FROM student_results LIKE 'course_code'", (columnError, columns) => {
      if (columnError) return console.error("Results column check failed:", columnError.message);
      if (columns.length > 0) return console.log("Results records are ready.");
      db.query("ALTER TABLE student_results ADD COLUMN course_code VARCHAR(40) NOT NULL DEFAULT '' AFTER semester", (migrationError) => {
        if (migrationError) console.error("Results column migration failed:", migrationError.message);
        else console.log("Results records are ready.");
      });
    });
  });
};

const initializeAttendance = () => {
  db.query(`CREATE TABLE IF NOT EXISTS student_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL,
    teacher_id VARCHAR(30) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_attendance_date (student_id, attendance_date),
    INDEX idx_attendance_student (student_id)
  )`, (error) => {
    if (error) console.error("Attendance table setup failed:", error.message);
    else console.log("Attendance records are ready.");
  });
};

const initializeTimetable = () => {
  db.query(`CREATE TABLE IF NOT EXISTS timetable_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(80) NOT NULL,
    semester VARCHAR(30) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    teacher VARCHAR(120) NOT NULL,
    day VARCHAR(20) NOT NULL,
    class_time VARCHAR(60) NOT NULL,
    room VARCHAR(60) NOT NULL,
    student_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_timetable_day (day),
    INDEX idx_timetable_department_semester (department, semester)
  )`, (error) => {
    if (error) console.error("Timetable table setup failed:", error.message);
    else db.query("SHOW COLUMNS FROM timetable_entries LIKE 'course_code'", (columnError, columns) => {
      if (columnError) return console.error("Timetable column check failed:", columnError.message);
      if (columns.length > 0) return console.log("Timetable entries are ready.");
      db.query("ALTER TABLE timetable_entries ADD COLUMN course_code VARCHAR(40) NOT NULL DEFAULT '' AFTER department", (migrationError) => {
        if (migrationError) console.error("Timetable column migration failed:", migrationError.message);
        else console.log("Timetable entries are ready.");
      });
    });
  });
};

const initializeAdmissionStatus = () => {
  db.query("SHOW COLUMNS FROM students LIKE 'admission_status'", (checkError, columns) => {
    if (checkError) return console.error("Admission status setup failed:", checkError.message);
    if (columns.length > 0) return;
    db.query("ALTER TABLE students ADD COLUMN admission_status VARCHAR(20) NOT NULL DEFAULT 'Pending'", (migrationError) => {
      if (migrationError) return console.error("Admission status migration failed:", migrationError.message);
      console.log("Admission status is ready.");
    });
  });
};

const initializeAdmissionFields = () => {
  const fields = [
    ["date_of_birth", "DATE"],
    ["gender", "VARCHAR(20)"],
    ["address", "VARCHAR(255)"],
    ["guardian_name", "VARCHAR(100)"],
    ["guardian_phone", "VARCHAR(20)"],
    ["qualification_12th", "VARCHAR(100)"],
    ["board_12th", "VARCHAR(100)"],
    ["marks_12th", "DECIMAL(5,2)"],
    ["passing_year_12th", "INT"],
    ["admission_submitted_at", "DATETIME"],
  ];
  db.query("SHOW COLUMNS FROM students", (error, columns) => {
    if (error) return console.error("Admission fields check failed:", error.message);
    const existing = new Set(columns.map((column) => column.Field));
    const missing = fields.filter(([name]) => !existing.has(name));
    if (missing.length === 0) return console.log("Admission fields are ready.");
    const additions = missing.map(([name, type]) => `ADD COLUMN ${name} ${type} NULL`).join(", ");
    db.query(`ALTER TABLE students ${additions}`, (migrationError) => {
      if (migrationError) console.error("Admission fields migration failed:", migrationError.message);
      else console.log("Admission fields are ready.");
    });
  });
};

const initializeFees = () => {
  db.query(`CREATE TABLE IF NOT EXISTS student_fee_records (
    student_id VARCHAR(30) PRIMARY KEY,
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 300000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (recordError) => {
    if (recordError) return console.error("Fee record setup failed:", recordError.message);
    db.query(`CREATE TABLE IF NOT EXISTS student_fee_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(30) NOT NULL,
      receipt_no VARCHAR(40) NOT NULL UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_status VARCHAR(20) NOT NULL DEFAULT 'Paid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (paymentError) => {
      if (paymentError) return console.error("Fee payment setup failed:", paymentError.message);
      db.query("INSERT IGNORE INTO student_fee_records (student_id, total_fee) SELECT student_id, 300000 FROM students", (seedError) => {
        if (seedError) console.error("Fee record seed failed:", seedError.message);
        else console.log("Student fee records are ready.");
      });
    });
  });
};

const initializeTcApplications = () => {
  db.query(`CREATE TABLE IF NOT EXISTS tc_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    application_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    remarks VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tc_student (student_id),
    INDEX idx_tc_status (status)
  )`, (error) => {
    if (error) return console.error("TC application setup failed:", error.message);
    db.query("SHOW COLUMNS FROM tc_applications", (columnsError, columns) => {
      if (columnsError) return console.error("TC application schema check failed:", columnsError.message);
      const names = new Set(columns.map((column) => column.Field));
      const migrateLegacyColumns = (callback) => {
        if (names.has("status") && names.has("application_date")) return callback();
        if (!names.has("application_status") || !names.has("applied_at")) return callback();
        db.query("ALTER TABLE tc_applications CHANGE COLUMN application_status status VARCHAR(20) NOT NULL DEFAULT 'Pending', CHANGE COLUMN applied_at application_date DATE NOT NULL", callback);
      };
      migrateLegacyColumns((migrationError) => {
        if (migrationError) return console.error("TC application schema migration failed:", migrationError.message);
        db.query("SELECT COUNT(*) AS count FROM tc_applications", (countError, rows) => {
        if (countError) return console.error("TC application count failed:", countError.message);
        if (rows[0].count > 0) return console.log("TC application records are ready.");
        db.query(
          `INSERT INTO tc_applications (student_id, reason, status, application_date)
           SELECT student_id, 'Transfer certificate required for personal reasons', 'Pending', CURDATE()
           FROM students ORDER BY name ASC`,
          (seedError) => {
            if (seedError) console.error("TC application seed failed:", seedError.message);
            else console.log("TC application records are ready.");
          }
        );
      });
      });
    });
  });
};

const initializeNotices = () => {
  db.query(`CREATE TABLE IF NOT EXISTS college_notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`, (error) => {
    if (error) console.error("Notice table setup failed:", error.message);
    else console.log("College notices are ready.");
  });
};

const formatFeeRecord = (record) => {
  const total_fee = Number(record.total_fee);
  const paid = Number(record.paid || 0);
  const remaining = Math.max(total_fee - paid, 0);
  return { ...record, total_fee, paid, remaining, status: remaining === 0 ? "Paid" : paid > 0 ? "Partial" : "Pending" };
};

// Test MySQL connection
// Test MySQL connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
  connection.release();

  initializeTeachers();
  initializeStudents();
  initializeResults();
  initializeAttendance();
  initializeTimetable();
  initializeAdmissionStatus();
  initializeAdmissionFields();
  initializeFees();
  initializeTcApplications();
  initializeNotices();
});

// Home API
app.get("/", (req, res) => {
    res.send("K.B. College Backend is working!");
});

// College API
app.get("/api/college", (req, res) => {
    res.json({
        name: "K.B. College, Bermo",
        fullName: "Krishna Ballav College, Bermo",
        established: 1964,
        location: "Jarangdih, Bermo, Bokaro, Jharkhand",
        university: "Binod Bihari Mahto Koylanchal University"
    });
});

app.get("/api/notices", (req, res) => {
  db.query("SELECT id, title, content, category, priority, DATE_FORMAT(published_at, '%d %M %Y') AS date, DATE_FORMAT(published_at, '%Y-%m-%d') AS dateISO FROM college_notices ORDER BY published_at DESC, id DESC", (error, notices) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to load notices." });
    res.json({ success: true, notices });
  });
});

app.post("/api/teachers/notices", (req, res) => {
  const { title, content, category, priority } = req.body || {};
  if (!title?.trim() || !content?.trim() || !category || !priority) return res.status(400).json({ success: false, message: "Complete all notice fields." });
  db.query("INSERT INTO college_notices (title, content, category, priority) VALUES (?, ?, ?, ?)", [title.trim(), content.trim(), category, priority], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to publish the notice." });
    res.status(201).json({ success: true, message: "Notice published successfully.", id: result.insertId });
  });
});

app.patch("/api/teachers/notices/:id", (req, res) => {
  const { title, content, category, priority } = req.body || {};
  if (!title?.trim() || !content?.trim() || !category || !priority) return res.status(400).json({ success: false, message: "Complete all notice fields." });
  db.query("UPDATE college_notices SET title = ?, content = ?, category = ?, priority = ? WHERE id = ?", [title.trim(), content.trim(), category, priority, req.params.id], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to update the notice." });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Notice not found." });
    res.json({ success: true, message: "Notice updated successfully." });
  });
});

app.delete("/api/teachers/notices/:id", (req, res) => {
  db.query("DELETE FROM college_notices WHERE id = ?", [req.params.id], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to delete the notice." });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Notice not found." });
    res.json({ success: true, message: "Notice deleted successfully." });
  });
});

// AI/ML student performance prediction. The model runs server-side so the
// serialized model and its implementation are never sent to the browser.
app.post("/api/ml/predict-performance", async (req, res) => {
  const { attendance, previous_marks, internal_marks } = req.body || {};
  if ([attendance, previous_marks, internal_marks].some((value) => value === "" || value === null || value === undefined)) {
    return res.status(400).json({ success: false, message: "Attendance, previous marks, and internal marks are all required." });
  }
  const values = { attendance: Number(attendance), previous_marks: Number(previous_marks), internal_marks: Number(internal_marks) };
  const limits = { attendance: [0, 100], previous_marks: [0, 100], internal_marks: [0, 30] };
  const invalid = Object.entries(values).find(([key, value]) => !Number.isFinite(value) || value < limits[key][0] || value > limits[key][1]);
  if (invalid) return res.status(400).json({ success: false, message: `${invalid[0]} is outside the accepted range.` });

  try {
    const python = process.env.PYTHON_BIN || "python";
    const script = path.resolve(__dirname, "..", "ai", "predict.py");
    const { stdout } = await execFileAsync(python, [script, JSON.stringify(values)], { timeout: 10000, windowsHide: true });
    const prediction = JSON.parse(stdout);
    if (!prediction.success) return res.status(503).json(prediction);
    res.json(prediction);
  } catch (error) {
    const output = error.stdout ? String(error.stdout).trim() : "";
    try {
      const payload = JSON.parse(output);
      return res.status(503).json(payload);
    } catch (_) {
      console.error("ML prediction error:", error.message);
      return res.status(503).json({ success: false, message: "AI prediction service is unavailable. Install ai/requirements.txt and train the model." });
    }
  }
});

const getStudentAnalytics = async () => {
  const rows = await dbQuery(`
    SELECT s.student_id, s.name, s.department, s.semester,
      COALESCE(a.total_classes, 0) AS total_classes,
      a.attendance_percentage,
      r.average_marks
    FROM students s
    LEFT JOIN (
      SELECT student_id, COUNT(*) AS total_classes,
        ROUND(100 * SUM(status = 'Present') / COUNT(*), 2) AS attendance_percentage
      FROM student_attendance GROUP BY student_id
    ) a ON a.student_id = s.student_id
    LEFT JOIN (
      SELECT student_id, ROUND(AVG(marks), 2) AS average_marks
      FROM student_results WHERE status = 'Published' GROUP BY student_id
    ) r ON r.student_id = s.student_id
    ORDER BY s.name ASC
  `);

  return rows.map((row) => {
    const attendance = row.attendance_percentage === null ? null : Number(row.attendance_percentage);
    const marks = row.average_marks === null ? null : Number(row.average_marks);
    const attendanceRisk = attendance !== null && attendance < 75;
    const performanceRisk = marks !== null && marks < 50;
    const goodPerformance = marks !== null && marks >= 70 && !attendanceRisk;
    return {
      ...row,
      attendance_percentage: attendance,
      average_marks: marks,
      attendance_risk: attendanceRisk,
      performance_risk: performanceRisk,
      good_performance: goodPerformance,
      needs_attention: attendanceRisk || performanceRisk,
    };
  });
};

// AI analytics: transparent, data-backed early-warning signals for faculty.
app.get("/api/ml/analytics", async (req, res) => {
  try {
    const students = await getStudentAnalytics();
    const analyzed = students.filter((student) => student.total_classes > 0 || student.average_marks !== null);
    const attendanceRisk = students.filter((student) => student.attendance_risk);
    const performanceRisk = students.filter((student) => student.performance_risk);
    const goodPerformance = students.filter((student) => student.good_performance);
    const needsAttention = students.filter((student) => student.needs_attention);
    res.json({
      success: true,
      thresholds: { attendance_percentage: 75, performance_marks: 50 },
      summary: {
        students_analyzed: analyzed.length,
        attendance_risk: attendanceRisk.length,
        performance_risk: performanceRisk.length,
        good_performance: goodPerformance.length,
        needs_attention: needsAttention.length,
      },
      insights: [
        `${attendanceRisk.length} student(s) have attendance below 75%.`,
        `${performanceRisk.length} student(s) have an average published mark below 50%.`,
        `${needsAttention.length} student(s) may benefit from academic attention.`,
      ],
      risk_students: needsAttention.slice(0, 20),
    });
  } catch (error) {
    console.error("AI analytics error:", error.message);
    res.status(500).json({ success: false, message: "Unable to generate AI analytics." });
  }
});

app.get("/api/ml/admissions/:studentId/analyze", async (req, res) => {
  try {
    const students = await dbQuery(
      "SELECT student_id, name, department, qualification_12th, board_12th, marks_12th, passing_year_12th FROM students WHERE student_id = ?",
      [req.params.studentId]
    );
    if (students.length === 0) return res.status(404).json({ success: false, message: "Applicant not found." });
    const applicant = students[0];
    if (applicant.marks_12th === null || applicant.marks_12th === undefined) {
      return res.status(400).json({ success: false, message: "The applicant has not submitted 12th marks yet." });
    }
    const marks = Number(applicant.marks_12th);
    const profile = marks >= 75 ? "Strong academic profile" : marks >= 60 ? "Eligible academic profile" : marks >= 45 ? "Profile needs faculty review" : "Academic support may be required";
    const recommendation = marks >= 60
      ? "Meets the academic screening threshold. Verify documents and make the final decision through normal admission policy."
      : "Does not meet the suggested 60% screening threshold. Review relevant policy, supporting documents, and any permitted exceptions before deciding.";
    res.json({ success: true, applicant, marks, suggested_threshold: 60, profile, recommendation, decision_note: "This is an advisory profile only; the teacher or admissions committee makes every final decision." });
  } catch (error) {
    console.error("Admission analysis error:", error.message);
    res.status(500).json({ success: false, message: "Unable to analyze this application." });
  }
});

app.post("/api/ml/assistant/:studentId", async (req, res) => {
  const message = String(req.body?.message || "").trim().toLowerCase();
  if (!message) return res.status(400).json({ success: false, message: "Ask the college assistant a question." });
  try {
    const students = await getStudentAnalytics();
    const student = students.find((item) => item.student_id === req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });
    let answer;
    if (message.includes("attendance")) {
      answer = student.attendance_percentage === null ? "No attendance has been recorded yet." : `Your current attendance is ${student.attendance_percentage}% across ${student.total_classes} recorded classes.`;
    } else if (message.includes("fee") || message.includes("payment")) {
      const fees = await dbQuery(`SELECT COALESCE(f.total_fee, 300000) AS total_fee, COALESCE(SUM(p.amount), 0) AS paid
        FROM students s LEFT JOIN student_fee_records f ON f.student_id = s.student_id
        LEFT JOIN student_fee_payments p ON p.student_id = s.student_id WHERE s.student_id = ? GROUP BY s.student_id, f.total_fee`, [student.student_id]);
      const fee = fees[0];
      answer = `Your fee status: ₹${Number(fee.paid).toLocaleString("en-IN")} paid of ₹${Number(fee.total_fee).toLocaleString("en-IN")}. Remaining balance: ₹${Math.max(Number(fee.total_fee) - Number(fee.paid), 0).toLocaleString("en-IN")}.`;
    } else if (message.includes("next class") || message.includes("timetable") || message.includes("class")) {
      const classes = await dbQuery(`SELECT day, class_time, subject, teacher, room FROM timetable_entries
        WHERE department = ? AND semester = ? ORDER BY FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), class_time LIMIT 1`, [student.department, `Semester ${student.semester}`]);
      answer = classes.length ? `Your next listed class is ${classes[0].subject} on ${classes[0].day}, ${classes[0].class_time}, in room ${classes[0].room} with ${classes[0].teacher}.` : "No timetable has been published for your semester yet.";
    } else if (message.includes("tc") || message.includes("transfer certificate")) {
      const applications = await dbQuery("SELECT status FROM tc_applications WHERE student_id = ? ORDER BY id DESC LIMIT 1", [student.student_id]);
      answer = applications.length ? `Your latest TC application is ${applications[0].status}.` : "You can apply through Student Services → TC Application and provide a reason for your request.";
    } else if (message.includes("result") || message.includes("marks")) {
      answer = student.average_marks === null ? "No published results are available yet." : `Your average across published result records is ${student.average_marks}%.`;
    } else {
      answer = "I can help with your attendance, next class, fee status, TC application, and published results. Try asking one of those questions.";
    }
    res.json({ success: true, answer });
  } catch (error) {
    console.error("College assistant error:", error.message);
    res.status(500).json({ success: false, message: "The college assistant is temporarily unavailable." });
  }
});

// Test database API
app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS test", (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "MySQL database is connected!",
            result: result
        });
    });
});
// Student Registration API
app.post("/api/students/register", (req, res) => {
    const {
        student_id,
        name,
        email,
        phone,
        password,
        department,
        semester,
        admission_year
    } = req.body || {};

    const parsedSemester = Number(semester);
    const parsedAdmissionYear = Number(admission_year);
    const allowedDepartments = ["BCA", "B.A.", "B.Sc.", "BBA"];
    if (!student_id?.trim() || !name?.trim() || !email?.trim() || !phone?.trim() || !password || !allowedDepartments.includes(department) || !Number.isInteger(parsedSemester) || parsedSemester < 1 || parsedSemester > 6 || !Number.isInteger(parsedAdmissionYear)) {
        return res.status(400).json({ success: false, message: "Please complete all registration fields with valid course and semester details." });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: "Enter a valid email address." });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const sql = `
        INSERT INTO students
        (student_id, name, email, phone, password, department, semester, admission_year, admission_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;

    const values = [
        student_id.trim(),
        name.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        password,
        department,
        parsedSemester,
        parsedAdmissionYear
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Registration error:", err.message);

            return res.status(500).json({
                success: false,
                message: err.code === "ER_DUP_ENTRY" ? "A student with this ID or email already exists." : "Unable to register the student. Please try again."
            });
        }

        db.query("INSERT IGNORE INTO student_fee_records (student_id, total_fee) VALUES (?, 300000)", [student_id], (feeError) => {
            if (feeError) console.error("Student fee record creation failed:", feeError.message);
            res.json({
                success: true,
                message: "Student registered successfully!"
            });
        });
    });
});
// Student Login API
app.post("/api/students/login", (req, res) => {
  const { student_id, password } = req.body;

  const sql = `
    SELECT student_id, name, email, department, semester, admission_year,
      COALESCE(admission_status, 'Pending') AS admission_status,
      admission_submitted_at,
      (SELECT status FROM tc_applications t WHERE t.student_id = students.student_id ORDER BY t.id DESC LIMIT 1) AS tc_status
    FROM students
    WHERE student_id = ? AND password = ?
  `;

  db.query(sql, [student_id, password], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Student ID or Password"
      });
    }

    res.json({
      success: true,
      message: "Student login successful!",
      student: result[0]
    });
  });
});

// Student Password Reset API
app.post("/api/students/reset-password", (req, res) => {
  const { student_id, email, new_password, confirm_password } = req.body;
  const normalizedStudentId = student_id && student_id.trim();
  const normalizedEmail = email && email.trim().toLowerCase();

  if (!normalizedStudentId || !normalizedEmail || !new_password || !confirm_password) {
    return res.status(400).json({ success: false, message: "Student ID, email, and both password fields are required." });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  db.query(
    "SELECT student_id FROM students WHERE student_id = ? AND LOWER(email) = ?",
    [normalizedStudentId, normalizedEmail],
    (lookupError, students) => {
      if (lookupError) {
        console.error("Password reset lookup error:", lookupError.message);
        return res.status(500).json({ success: false, message: "Unable to verify student details." });
      }

      if (students.length === 0) {
        return res.status(404).json({ success: false, message: "Student ID and email do not match our records." });
      }

      db.query(
        "UPDATE students SET password = ? WHERE student_id = ?",
        [new_password, normalizedStudentId],
        (updateError) => {
          if (updateError) {
            console.error("Password reset update error:", updateError.message);
            return res.status(500).json({ success: false, message: "Unable to reset the password." });
          }

          res.json({ success: true, message: "Password reset successfully. You can now sign in." });
        }
      );
    }
  );
});

app.post("/api/students/tc-applications", (req, res) => {
  const { student_id, reason } = req.body;
  if (!student_id || !reason || !reason.trim()) {
    return res.status(400).json({ success: false, message: "A reason is required for the TC application." });
  }

  db.query("SELECT student_id FROM students WHERE student_id = ?", [student_id], (studentError, students) => {
    if (studentError) return res.status(500).json({ success: false, message: "Unable to validate the student." });
    if (students.length === 0) return res.status(404).json({ success: false, message: "Student not found." });
    db.query("SELECT id FROM tc_applications WHERE student_id = ? AND status = 'Pending' LIMIT 1", [student_id], (existingError, existing) => {
      if (existingError) return res.status(500).json({ success: false, message: "Unable to check existing TC applications." });
      if (existing.length > 0) return res.status(409).json({ success: false, message: "You already have a pending TC application." });
      db.query("INSERT INTO tc_applications (student_id, reason, status, application_date) VALUES (?, ?, 'Pending', CURDATE())", [student_id, reason.trim()], (insertError, result) => {
        if (insertError) return res.status(500).json({ success: false, message: "Unable to submit the TC application." });
        res.status(201).json({ success: true, message: "TC application submitted successfully.", application_id: result.insertId });
      });
    });
  });
});

app.post("/api/students/admission", (req, res) => {
  const {
    student_id, date_of_birth, gender, address, guardian_name, guardian_phone,
    qualification_12th, board_12th, marks_12th, passing_year_12th,
  } = req.body;
  if (!student_id || !date_of_birth || !gender || !address || !guardian_name || !guardian_phone || !qualification_12th || !board_12th || marks_12th === "" || !passing_year_12th) {
    return res.status(400).json({ success: false, message: "Complete all admission fields before submitting." });
  }
  const marks = Number(marks_12th);
  const passingYear = Number(passing_year_12th);
  if (!Number.isFinite(marks) || marks < 0 || marks > 100 || !Number.isInteger(passingYear) || passingYear < 2000 || passingYear > 2035) {
    return res.status(400).json({ success: false, message: "Enter valid 12th marks and passing year." });
  }
  const sql = `UPDATE students SET date_of_birth = ?, gender = ?, address = ?, guardian_name = ?, guardian_phone = ?,
    qualification_12th = ?, board_12th = ?, marks_12th = ?, passing_year_12th = ?, admission_status = 'Pending', admission_submitted_at = NOW()
    WHERE student_id = ?`;
  db.query(sql, [date_of_birth, gender, address.trim(), guardian_name.trim(), guardian_phone.trim(), qualification_12th.trim(), board_12th.trim(), marks, passingYear, student_id], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to submit the admission application." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Registered student not found." });
    res.json({ success: true, message: "Admission application submitted successfully." });
  });
});
app.get("/api/students/:studentId/admission-status", (req, res) => {
  db.query(
    `SELECT student_id, admission_submitted_at,
      COALESCE(admission_status, 'Pending') AS admission_status
     FROM students WHERE student_id = ?`,
    [req.params.studentId],
    (error, result) => {
      if (error) {
        console.error("Admission status lookup error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load admission status." });
      }
      if (result.length === 0) return res.status(404).json({ success: false, message: "Student not found." });
      res.json({ success: true, status: result[0] });
    }
  );
});

app.get("/api/students/:studentId/attendance", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total_classes,
      COALESCE(SUM(status = 'Present'), 0) AS present,
      COALESCE(SUM(status = 'Absent'), 0) AS absent
     FROM student_attendance
     WHERE student_id = ?`,
    [req.params.studentId],
    (error, result) => {
      if (error) {
        console.error("Student attendance lookup error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load attendance." });
      }
      const summary = result[0];
      const totalClasses = Number(summary.total_classes);
      const present = Number(summary.present);
      const absent = Number(summary.absent);
      res.json({
        success: true,
        attendance: {
          total_classes: totalClasses,
          present,
          absent,
          percentage: totalClasses === 0 ? 0 : Number(((present / totalClasses) * 100).toFixed(2)),
        },
      });
    }
  );
});

app.get("/api/students/:studentId/results/:semester", (req, res) => {
  const semester = Number(req.params.semester);
  if (!Number.isInteger(semester) || semester < 1 || semester > 6) {
    return res.status(400).json({ success: false, message: "Semester must be between 1 and 6." });
  }
  db.query(
    "SELECT course_code AS code, subject, marks, grade, status FROM student_results WHERE student_id = ? AND semester = ? ORDER BY subject",
    [req.params.studentId, semester],
    (error, results) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to load results." });
      res.json({ success: true, results });
    }
  );
});

// Student timetable: only classes for the logged-in student's course and semester.
app.get("/api/students/:studentId/timetable", (req, res) => {
  db.query("SELECT department, semester FROM students WHERE student_id = ?", [req.params.studentId], (studentError, students) => {
    if (studentError) return res.status(500).json({ success: false, message: "Unable to load the student timetable." });
    if (students.length === 0) return res.status(404).json({ success: false, message: "Student not found." });
    const student = students[0];
    db.query(
      `SELECT id, course_code AS code, subject, teacher, day, class_time AS time, room
       FROM timetable_entries WHERE department = ? AND semester = ?
       ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), class_time, id`,
      [student.department, `Semester ${student.semester}`],
      (error, entries) => {
        if (error) return res.status(500).json({ success: false, message: "Unable to load the student timetable." });
        res.json({ success: true, entries });
      }
    );
  });
});

app.get("/api/students/:studentId/fees", (req, res) => {
  const recordSql = `
    SELECT s.student_id, COALESCE(f.total_fee, 300000) AS total_fee,
      COALESCE((SELECT SUM(p.amount) FROM student_fee_payments p WHERE p.student_id = s.student_id), 0) AS paid
    FROM students s LEFT JOIN student_fee_records f ON f.student_id = s.student_id
    WHERE s.student_id = ?`;
  db.query(recordSql, [req.params.studentId], (recordError, records) => {
    if (recordError) return res.status(500).json({ success: false, message: "Unable to load fee details." });
    if (records.length === 0) return res.status(404).json({ success: false, message: "Student fee record not found." });
    db.query(
      "SELECT receipt_no AS id, amount, DATE_FORMAT(payment_date, '%d-%b-%Y') AS date, payment_status AS status FROM student_fee_payments WHERE student_id = ? ORDER BY payment_date DESC, id DESC",
      [req.params.studentId],
      (paymentError, payments) => {
        if (paymentError) return res.status(500).json({ success: false, message: "Unable to load payment history." });
        const record = formatFeeRecord(records[0]);
        res.json({ success: true, total_fee: record.total_fee, paid: record.paid, remaining: record.remaining, payments });
      }
    );
  });
});

app.post("/api/students/:studentId/fees/payments", (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "A valid payment amount is required." });
  const receiptNo = `KB${Date.now().toString().slice(-8)}`;
  db.query(
    "INSERT INTO student_fee_payments (student_id, receipt_no, amount, payment_date, payment_status) VALUES (?, ?, ?, CURDATE(), 'Paid')",
    [req.params.studentId, receiptNo, amount],
    (error) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to record payment." });
      res.status(201).json({ success: true, message: "Payment recorded successfully.", receipt_no: receiptNo });
    }
  );
});

app.get("/api/students/:studentId/attendance/history", (req, res) => {
  db.query(
    `SELECT DATE_FORMAT(attendance_date, '%d-%m-%Y') AS date, status
     FROM student_attendance
     WHERE student_id = ?
     ORDER BY attendance_date DESC, id DESC`,
    [req.params.studentId],
    (error, result) => {
      if (error) {
        console.error("Student attendance history lookup error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load attendance history." });
      }
      res.json({ success: true, history: result });
    }
  );
});

// Teacher Student Management APIs
app.get("/api/teachers/students", (req, res) => {
  const search = (req.query.search || "").trim();
  const sql = `
    SELECT student_id, name, email, department, semester, admission_year,
      COALESCE(admission_status, 'Pending') AS status
    FROM students
    WHERE student_id LIKE ? OR name LIKE ?
    ORDER BY name ASC
  `;
  const filter = `%${search}%`;

  db.query(sql, [filter, filter], (err, students) => {
    if (err) {
      console.error("Student directory error:", err.message);
      return res.status(500).json({ success: false, message: "Unable to load student records." });
    }
    res.json({ success: true, students });
  });
});

app.post("/api/teachers/attendance", (req, res) => {
  const { student_id, teacher_id, status } = req.body;
  if (!student_id || !teacher_id || !["Present", "Absent"].includes(status)) {
    return res.status(400).json({ success: false, message: "Student, teacher, and a valid attendance status are required." });
  }

  db.query("SELECT student_id FROM students WHERE student_id = ?", [student_id], (studentError, students) => {
    if (studentError) return res.status(500).json({ success: false, message: "Unable to validate the student." });
    if (students.length === 0) return res.status(404).json({ success: false, message: "Student not found." });
    db.query(
      `INSERT INTO student_attendance (student_id, teacher_id, attendance_date, status)
       VALUES (?, ?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), status = VALUES(status)`,
      [student_id, teacher_id, status],
      (attendanceError) => {
        if (attendanceError) return res.status(500).json({ success: false, message: "Unable to save attendance." });
        res.json({ success: true, message: `Attendance marked ${status.toLowerCase()} for today.` });
      }
    );
  });
});

app.post("/api/teachers/attendance/bulk", (req, res) => {
  const { teacher_id, attendance } = req.body;
  if (!teacher_id || !Array.isArray(attendance) || attendance.length === 0) {
    return res.status(400).json({ success: false, message: "Teacher and attendance records are required." });
  }
  if (attendance.some(({ student_id, status }) => !student_id || !["Present", "Absent"].includes(status))) {
    return res.status(400).json({ success: false, message: "Every student must have a valid attendance status." });
  }

  const placeholders = attendance.map(() => "(?, ?, CURDATE(), ?)").join(", ");
  const values = attendance.flatMap(({ student_id, status }) => [student_id, teacher_id, status]);
  db.query(
    `INSERT INTO student_attendance (student_id, teacher_id, attendance_date, status)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE teacher_id = VALUES(teacher_id), status = VALUES(status)`,
    values,
    (error) => {
      if (error) {
        console.error("Bulk attendance save error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to save attendance." });
      }
      res.json({ success: true, message: `Attendance saved for ${attendance.length} students.` });
    }
  );
});

app.get("/api/teachers/attendance/:studentId", (req, res) => {
  db.query(
    `SELECT student_id, attendance_date, status
     FROM student_attendance
     WHERE student_id = ? AND attendance_date = CURDATE()`,
    [req.params.studentId],
    (error, result) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to load attendance." });
      res.json({ success: true, attendance: result[0] || null });
    }
  );
});

app.get("/api/teachers/attendance", (req, res) => {
  db.query(
    "SELECT student_id, attendance_date, status FROM student_attendance WHERE attendance_date = CURDATE()",
    (error, result) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to load attendance." });
      res.json({ success: true, attendance: result });
    }
  );
});

app.get("/api/teachers/timetable", (req, res) => {
  db.query(
    `SELECT id, department, semester, course_code AS code, subject, teacher, day,
      class_time AS time, room, student_count AS students
     FROM timetable_entries
     ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), class_time, id`,
    (error, result) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to load timetable." });
      res.json({ success: true, entries: result });
    }
  );
});

app.post("/api/teachers/timetable", (req, res) => {
  const { department, semester, code, subject, teacher, day, time, room, students } = req.body;
  const studentCount = Number(students);
  if (!department || !semester || !code || !subject || !teacher || !day || !time || !room || !Number.isInteger(studentCount) || studentCount < 0) {
    return res.status(400).json({ success: false, message: "Complete all timetable fields with a valid student count." });
  }
  db.query(
    `INSERT INTO timetable_entries
      (department, semester, course_code, subject, teacher, day, class_time, room, student_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [department.trim(), semester, code.trim(), subject.trim(), teacher.trim(), day, time.trim(), room.trim(), studentCount],
    (error, result) => {
      if (error) {
        console.error("Timetable save error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to save timetable entry." });
      }
      res.status(201).json({ success: true, message: "Class schedule added successfully.", id: result.insertId });
    }
  );
});

app.delete("/api/teachers/timetable/:id", (req, res) => {
  db.query("DELETE FROM timetable_entries WHERE id = ?", [req.params.id], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to delete timetable entry." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Timetable entry not found." });
    res.json({ success: true, message: "Class schedule deleted successfully." });
  });
});

app.get("/api/teachers/students/:studentId", (req, res) => {
  const sql = `
    SELECT student_id, name, email, phone, department, semester, admission_year,
      COALESCE(admission_status, 'Pending') AS status
    FROM students
    WHERE student_id = ?
  `;

  db.query(sql, [req.params.studentId], (err, result) => {
    if (err) {
      console.error("Student detail error:", err.message);
      return res.status(500).json({ success: false, message: "Unable to load student details." });
    }
    if (result.length === 0) return res.status(404).json({ success: false, message: "Student not found." });

    const student = result[0];
    res.json({
      success: true,
      student,
      academic: {
        currentSemester: student.semester,
        academicStatus: "In progress",
        attendance: "Not recorded",
        resultsStatus: student.department === "BCA" ? "Published" : "Not available",
      },
    });
  });
});

// Teacher Results Management APIs
app.get("/api/teachers/results/:studentId/:semester", (req, res) => {
  const semester = Number(req.params.semester);
  if (!Number.isInteger(semester) || semester < 1 || semester > 6) {
    return res.status(400).json({ success: false, message: "Semester must be between 1 and 6." });
  }

  db.query(
    "SELECT subject, marks, grade, status, updated_at FROM student_results WHERE student_id = ? AND semester = ? ORDER BY subject",
    [req.params.studentId, semester],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Unable to load result records." });
      res.json({ success: true, results });
    }
  );
});

app.post("/api/teachers/results", (req, res) => {
  const { student_id, semester, results } = req.body;
  const parsedSemester = Number(semester);

  if (!student_id || !Number.isInteger(parsedSemester) || parsedSemester < 1 || parsedSemester > 6 || !Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ success: false, message: "Student, semester, and subject marks are required." });
  }

  const invalidResult = results.find((item) => !item.subject || !Number.isFinite(Number(item.marks)) || Number(item.marks) < 0 || Number(item.marks) > 100);
  if (invalidResult) return res.status(400).json({ success: false, message: "Enter marks from 0 to 100 for every subject." });

  db.query("SELECT student_id FROM students WHERE student_id = ?", [student_id], (studentError, students) => {
    if (studentError) return res.status(500).json({ success: false, message: "Unable to validate the student." });
    if (students.length === 0) return res.status(404).json({ success: false, message: "Student not found." });

    const values = results.map((item) => [student_id, parsedSemester, item.code || "", item.subject, Number(item.marks), item.grade, "Published"]);
    const sql = `INSERT INTO student_results (student_id, semester, course_code, subject, marks, grade, status)
      VALUES ? ON DUPLICATE KEY UPDATE marks = VALUES(marks), grade = VALUES(grade), status = VALUES(status)`;
    db.query(sql, [values], (saveError) => {
      if (saveError) return res.status(500).json({ success: false, message: "Unable to publish the result." });
      res.json({ success: true, message: "Result published successfully." });
    });
  });
});

// Teacher Fee Management APIs
app.get("/api/teachers/fees", (req, res) => {
  const sql = `
    SELECT s.student_id, s.name, s.department, s.semester,
      COALESCE(f.total_fee, 300000) AS total_fee,
      COALESCE((SELECT SUM(p.amount) FROM student_fee_payments p WHERE p.student_id = s.student_id), 0) AS paid
    FROM students s
    LEFT JOIN student_fee_records f ON f.student_id = s.student_id
    ORDER BY s.name ASC
  `;

  db.query(sql, (err, records) => {
    if (err) {
      console.error("Fee records error:", err.message);
      return res.status(500).json({ success: false, message: "Unable to load fee records." });
    }
    res.json({ success: true, records: records.map(formatFeeRecord) });
  });
});

app.get("/api/teachers/fees/:studentId", (req, res) => {
  const recordSql = `
    SELECT s.student_id, s.name, s.email, s.phone, s.department, s.semester, s.admission_year,
      COALESCE(f.total_fee, 300000) AS total_fee,
      COALESCE((SELECT SUM(p.amount) FROM student_fee_payments p WHERE p.student_id = s.student_id), 0) AS paid
    FROM students s
    LEFT JOIN student_fee_records f ON f.student_id = s.student_id
    WHERE s.student_id = ?
  `;

  db.query(recordSql, [req.params.studentId], (recordError, records) => {
    if (recordError) return res.status(500).json({ success: false, message: "Unable to load the fee record." });
    if (records.length === 0) return res.status(404).json({ success: false, message: "Student fee record not found." });

    db.query(
      `SELECT receipt_no, amount, payment_date, payment_status
       FROM student_fee_payments WHERE student_id = ? ORDER BY payment_date DESC, id DESC`,
      [req.params.studentId],
      (paymentError, payments) => {
        if (paymentError) return res.status(500).json({ success: false, message: "Unable to load payment history." });
        res.json({ success: true, record: formatFeeRecord(records[0]), payments });
      }
    );
  });
});

// Teacher Admission Management APIs
app.get("/api/teachers/admissions", (req, res) => {
  const status = req.query.status || "Pending";
  const allowedStatuses = ["Pending", "Approved", "Rejected", "All"];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid admission status." });

  const admissionFilter = status === "All" ? "WHERE admission_submitted_at IS NOT NULL" : "WHERE admission_submitted_at IS NOT NULL AND admission_status = ?";
  const sql = `SELECT student_id, name, email, phone, department, semester, admission_year,
    date_of_birth, gender, address, guardian_name, guardian_phone, qualification_12th,
    board_12th, marks_12th, passing_year_12th, admission_submitted_at,
    COALESCE(admission_status, 'Pending') AS admission_status
    FROM students ${admissionFilter} ORDER BY admission_year DESC, name ASC`;
  db.query(sql, status === "All" ? [] : [status], (err, applications) => {
    if (err) return res.status(500).json({ success: false, message: "Unable to load admission applications." });
    res.json({ success: true, applications });
  });
});

app.get("/api/teachers/admissions/:studentId", (req, res) => {
  db.query(`SELECT student_id, name, email, phone, department, semester, admission_year,
    date_of_birth, gender, address, guardian_name, guardian_phone, qualification_12th,
    board_12th, marks_12th, passing_year_12th, admission_submitted_at,
    COALESCE(admission_status, 'Pending') AS admission_status
    FROM students WHERE student_id = ?`, [req.params.studentId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Unable to load the application." });
    if (result.length === 0) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, application: result[0] });
  });
});

app.patch("/api/teachers/admissions/:studentId", (req, res) => {
  const { admission_status } = req.body;
  if (!["Approved", "Rejected"].includes(admission_status)) {
    return res.status(400).json({ success: false, message: "Admission status must be Approved or Rejected." });
  }
  db.query("UPDATE students SET admission_status = ? WHERE student_id = ?", [admission_status, req.params.studentId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Unable to update admission status." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Application not found." });
    res.json({ success: true, message: `Application ${admission_status.toLowerCase()} successfully.`, admission_status });
  });
});

// Teacher TC Application Management APIs
app.get("/api/teachers/tc-applications", (req, res) => {
  const status = req.query.status || "Pending";
  const allowedStatuses = ["Pending", "Approved", "Rejected", "All"];
  if (!allowedStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid TC application status." });

  const sql = `
    SELECT t.id, t.student_id, s.name, s.email, s.phone, s.department, s.semester,
      s.admission_year, t.reason, t.application_date,
      t.status
    FROM tc_applications t
    INNER JOIN students s ON s.student_id = t.student_id
    ${status === "All" ? "" : "WHERE t.status = ?"}
    ORDER BY t.application_date DESC, t.id DESC
  `;
  db.query(sql, status === "All" ? [] : [status], (error, applications) => {
    if (error) {
      console.error("TC applications error:", error.message);
      return res.status(500).json({ success: false, message: "Unable to load TC applications." });
    }
    res.json({ success: true, applications });
  });
});

app.get("/api/teachers/tc-applications/:applicationId", (req, res) => {
  const sql = `
    SELECT t.id, t.student_id, s.name, s.email, s.phone, s.department, s.semester,
      s.admission_year, t.reason, t.application_date,
      t.status
    FROM tc_applications t
    INNER JOIN students s ON s.student_id = t.student_id
    WHERE t.id = ?
  `;
  db.query(sql, [req.params.applicationId], (error, applications) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to load the TC application." });
    if (applications.length === 0) return res.status(404).json({ success: false, message: "TC application not found." });
    res.json({ success: true, application: applications[0] });
  });
});

app.patch("/api/teachers/tc-applications/:applicationId", (req, res) => {
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "TC status must be Approved or Rejected." });
  }
  db.query(
    "UPDATE tc_applications SET status = ? WHERE id = ?",
    [status, req.params.applicationId],
    (error, result) => {
      if (error) return res.status(500).json({ success: false, message: "Unable to update the TC application." });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "TC application not found." });
      res.json({ success: true, message: `TC application ${status.toLowerCase()} successfully.`, status });
    }
  );
});

// Teacher Login API
app.post("/api/teachers/login", (req, res) => {
  const { teacher_id, password } = req.body;

  if (!teacher_id || !password) {
    return res.status(400).json({ success: false, message: "Teacher ID and password are required" });
  }

  const sql = `
    SELECT teacher_id, name, email, department, designation
    FROM teachers
    WHERE teacher_id = ? AND password = ?
  `;

  db.query(sql, [teacher_id, password], (err, result) => {
    if (err) {
      console.error("Teacher login error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Unable to sign in. Ensure the teachers table has been created.",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid Teacher ID or Password" });
    }

    res.json({ success: true, message: "Teacher login successful!", teacher: result[0] });
  });
});

app.post("/api/teachers/reset-password", (req, res) => {
  const { teacher_id, email, new_password, confirm_password } = req.body || {};
  if (!teacher_id?.trim() || !email?.trim() || !new_password || !confirm_password) {
    return res.status(400).json({ success: false, message: "Teacher ID, email, and both password fields are required." });
  }
  if (new_password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
  if (new_password !== confirm_password) return res.status(400).json({ success: false, message: "Passwords do not match." });
  db.query("UPDATE teachers SET password = ? WHERE teacher_id = ? AND LOWER(email) = ?", [new_password, teacher_id.trim(), email.trim().toLowerCase()], (error, result) => {
    if (error) return res.status(500).json({ success: false, message: "Unable to reset the teacher password." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Teacher ID and email do not match our records." });
    res.json({ success: true, message: "Password reset successfully. You can now sign in." });
  });
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://0.0.0.0:${PORT}`);
});
