import { useEffect, useState } from "react";
import "./App.css";

const departments = [
  { code: "BCA", name: "Computer Applications", details: "Modern computing, programming, and digital systems.", duration: "3 years", eligibility: "10+2 or equivalent", focus: "Programming and digital skills" },
  { code: "B.A.", name: "Arts", details: "Humanities programs that build communication and analysis.", duration: "3 years", eligibility: "10+2 or equivalent", focus: "Humanities and communication" },
  { code: "B.Sc.", name: "Science", details: "Foundational science learning with practical understanding.", duration: "3 years", eligibility: "10+2 science stream", focus: "Scientific learning and practice" },
  { code: "BBA", name: "Business Administration", details: "Management, accounting, and professional skills.", duration: "3 years", eligibility: "10+2 or equivalent", focus: "Management and entrepreneurship" },
];

const services = [
  ["Student Login", "Access student records, notices, attendance, and academic details.", "ST"],
  ["Teacher Login", "Manage classes, student records, assignments, and results.", "TL"],
  ["Admission Form", "Submit registration and admission applications online.", "AF"],
  ["Results", "Check semester updates and examination results.", "RS"],
  ["Fees", "View fee details and complete college payments.", "FE"],
  ["TC Application", "Apply online for Transfer Certificate services.", "TC"],
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const bcaSubjects = [
  "Computer Fundamentals",
  "Programming in C",
  "Mathematics",
  "Digital Electronics",
  "Communication Skills",
];
const bcaTeachers = ["Dr. Anirudh Mehta", "Ms. Kavya Nair", "Dr. Rohan Chatterjee", "Mr. Sameer Kulkarni", "Ms. Nisha Iyer"];
const bcaCourseCodes = ["BCA-101", "BCA-102", "BCA-103", "BCA-104", "BCA-105"];
const TOTAL_COURSE_FEE = 300000;
const SEMESTER_FEE = 50000;
const collegeNotices = [
  { category: "College", title: "Semester classes begin from 06 July 2026", date: "28 June 2026", dateISO: "2026-06-28", priority: "Important" },
  { category: "Exam", title: "Semester examination form submission is now open", date: "24 June 2026", dateISO: "2026-06-24", priority: "Priority" },
  { category: "Admission", title: "BCA admission document verification schedule published", date: "20 June 2026", dateISO: "2026-06-20", priority: "Important" },
  { category: "Fees", title: "Semester fee payment deadline: 15 July 2026", date: "18 June 2026", dateISO: "2026-06-18", priority: "Priority" },
];
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const getGrade = (marks) => {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B+";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  return "D";
};

function App() {
  const [student, setStudent] = useState({
  student_id: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  department: "BCA",
  semester: 1,
  admission_year: 2026
});

const [registerMessage, setRegisterMessage] = useState("");
const [admissionForm, setAdmissionForm] = useState({
  student_id: "", date_of_birth: "", gender: "", address: "", guardian_name: "", guardian_phone: "",
  qualification_12th: "", board_12th: "", marks_12th: "", passing_year_12th: "",
});
const [admissionFormMessage, setAdmissionFormMessage] = useState("");
  const [college, setCollege] = useState(null);

useEffect(() => {
  fetch(`${API_URL}/api/college`)
    .then((response) => response.json())
    .then((data) => {
      setCollege(data);
    })
    .catch((error) => {
      console.error("Backend connection error:", error);
    });
}, []);

const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      `${API_URL}/api/students/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(student)
      }
    );

    const data = await response.json();

    if (data.success) {
      setRegisterMessage("Student registered successfully!");
      setAdmissionForm((form) => ({ ...form, student_id: student.student_id }));
      setPortalMode("student-admission");
      setStudent({
        student_id: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        department: "BCA",
        semester: 1,
        admission_year: 2026
      });
    } else {
      setRegisterMessage(data.message);
    }
  } catch (error) {
    console.error(error);
    setRegisterMessage("Backend connection error");
  }
};

const handleAdmissionSubmit = async (e) => {
  e.preventDefault();
  setAdmissionFormMessage("");
  try {
    const response = await fetch(`${API_URL}/api/students/admission`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admissionForm),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to submit the admission application.");
    setAdmissionFormMessage(data.message);
    setTimeout(() => setPortalMode("student-login"), 900);
  } catch (error) {
    setAdmissionFormMessage(error.message || "Unable to submit the admission application.");
  }
};

const handleAdmissionChange = (e) => {
  setAdmissionForm({ ...admissionForm, [e.target.name]: e.target.value });
};
const handleStudentChange = (e) => {
  setStudent({
    ...student,
    [e.target.name]: e.target.value
  });
};

const [loginData, setLoginData] = useState({
  student_id: "",
  password: ""
});

const [loginMessage, setLoginMessage] = useState("");
const [passwordResetData, setPasswordResetData] = useState({
  student_id: "",
  email: "",
  new_password: "",
  confirm_password: "",
});
const [passwordResetMessage, setPasswordResetMessage] = useState("");
const [passwordResetMode, setPasswordResetMode] = useState(false);
const [loggedInStudent, setLoggedInStudent] = useState(null);
const [resultStatus, setResultStatus] = useState("Not published");
const [results, setResults] = useState([]);
const [admissionStatusLoading, setAdmissionStatusLoading] = useState(false);
const [admissionStatusMessage, setAdmissionStatusMessage] = useState("");
const [studentAttendance, setStudentAttendance] = useState(null);
const [studentAttendanceHistory, setStudentAttendanceHistory] = useState([]);
const [studentAttendanceLoading, setStudentAttendanceLoading] = useState(false);
const [studentAttendanceMessage, setStudentAttendanceMessage] = useState("");
const [activeService, setActiveService] = useState(null);
const [serviceAfterLogin, setServiceAfterLogin] = useState(null);
const [academicCourses, setAcademicCourses] = useState([]);
const [amountPaid, setAmountPaid] = useState(0);
const [paymentHistory, setPaymentHistory] = useState([]);
const [paymentMessage, setPaymentMessage] = useState("");
const [tcReason, setTcReason] = useState("");
const [tcStudentMessage, setTcStudentMessage] = useState("");
const [portalMode, setPortalMode] = useState(null);
const [teacherLoginData, setTeacherLoginData] = useState({ teacher_id: "", password: "" });
const [teacherLoginMessage, setTeacherLoginMessage] = useState("");
const [teacherPasswordResetData, setTeacherPasswordResetData] = useState({
  teacher_id: "",
  email: "",
  new_password: "",
  confirm_password: "",
});
const [teacherPasswordResetMessage, setTeacherPasswordResetMessage] = useState("");
const [teacherPasswordResetMode, setTeacherPasswordResetMode] = useState(false);
const [loggedInTeacher, setLoggedInTeacher] = useState(null);
const [teacherPanel, setTeacherPanel] = useState("overview");
const [attendanceStudents, setAttendanceStudents] = useState([]);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [attendanceSaving, setAttendanceSaving] = useState(false);
const [attendanceMessage, setAttendanceMessage] = useState("");
const [attendanceByStudent, setAttendanceByStudent] = useState({});
const [assignment, setAssignment] = useState({ title: "", dueDate: "" });
const [assignmentMessage, setAssignmentMessage] = useState("");
const [timetableForm, setTimetableForm] = useState({ department: "BCA", day: "Monday", code: "", subject: "", teacher: "", semester: "Semester 1", time: "", room: "", students: "" });
const [timetableMessage, setTimetableMessage] = useState("");
const [timetableLoading, setTimetableLoading] = useState(false);
const [timetableEntries, setTimetableEntries] = useState([]);
const [studentTimetable, setStudentTimetable] = useState([]);
const [studentTimetableMessage, setStudentTimetableMessage] = useState("");
const [noticeForm, setNoticeForm] = useState({ title: "", content: "", category: "College", priority: "Important" });
const [noticeMessage, setNoticeMessage] = useState("");
const [notices, setNotices] = useState(() => collegeNotices.map((notice, index) => ({ ...notice, id: `seed-${index}` })));
const [editingNoticeId, setEditingNoticeId] = useState(null);
const [managedStudents, setManagedStudents] = useState([]);
const [studentSearch, setStudentSearch] = useState("");
const [studentsLoading, setStudentsLoading] = useState(false);
const [studentManagementMessage, setStudentManagementMessage] = useState("");
const [selectedStudent, setSelectedStudent] = useState(null);
const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
const [resultStudents, setResultStudents] = useState([]);
const [resultStudentId, setResultStudentId] = useState("");
const [resultSemester, setResultSemester] = useState("1");
const [teacherMarks, setTeacherMarks] = useState(() => Object.fromEntries(bcaSubjects.map((subject) => [subject, ""])));
const [resultManagementMessage, setResultManagementMessage] = useState("");
const [resultSaving, setResultSaving] = useState(false);
const [existingResult, setExistingResult] = useState(false);
const [admissionApplications, setAdmissionApplications] = useState([]);
const [admissionFilter, setAdmissionFilter] = useState("Pending");
const [selectedApplication, setSelectedApplication] = useState(null);
const [admissionLoading, setAdmissionLoading] = useState(false);
const [admissionMessage, setAdmissionMessage] = useState("");
const [feeRecords, setFeeRecords] = useState([]);
const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);
const [feeLoading, setFeeLoading] = useState(false);
const [feeMessage, setFeeMessage] = useState("");
const [tcApplications, setTcApplications] = useState([]);
const [tcFilter, setTcFilter] = useState("Pending");
const [selectedTcApplication, setSelectedTcApplication] = useState(null);
const [tcLoading, setTcLoading] = useState(false);
const [tcMessage, setTcMessage] = useState("");
const [predictionForm, setPredictionForm] = useState({ attendance: "", previous_marks: "", internal_marks: "" });
const [prediction, setPrediction] = useState(null);
const [predictionMessage, setPredictionMessage] = useState("");
const [predictionLoading, setPredictionLoading] = useState(false);
const [aiAnalytics, setAiAnalytics] = useState(null);
const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState(false);
const [aiAnalyticsMessage, setAiAnalyticsMessage] = useState("");
const [admissionAnalysis, setAdmissionAnalysis] = useState(null);
const [admissionAnalysisLoading, setAdmissionAnalysisLoading] = useState(false);
const [assistantQuestion, setAssistantQuestion] = useState("");
const [assistantAnswer, setAssistantAnswer] = useState("");
const [assistantLoading, setAssistantLoading] = useState(false);

useEffect(() => {
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  if (loggedInStudent?.student_id || loggedInTeacher?.teacher_id) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }
  const scrollToCurrentTarget = () => {
    const targetId = window.location.hash.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };
  scrollToCurrentTarget();
  const handleHashChange = () => {
    scrollToCurrentTarget();
  };
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("pageshow", scrollToCurrentTarget);
  const startupScroll = window.setTimeout(scrollToCurrentTarget, 0);
  return () => {
    window.removeEventListener("hashchange", handleHashChange);
    window.removeEventListener("pageshow", scrollToCurrentTarget);
    window.clearTimeout(startupScroll);
  };
}, [portalMode, activeService, teacherPanel, loggedInStudent?.student_id, loggedInTeacher?.teacher_id]);

const remainingAmount = TOTAL_COURSE_FEE - amountPaid;
const teacherResultTotal = bcaSubjects.reduce((total, subject) => total + (Number(teacherMarks[subject]) || 0), 0);
const teacherResultPercentage = (teacherResultTotal / bcaSubjects.length).toFixed(2);

const handlePublicNavigation = (event, sectionId) => {
  event.preventDefault();
  if (loggedInStudent) {
    setActiveService(null);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return;
  }
  if (loggedInTeacher) {
    setTeacherPanel("overview");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return;
  }
  if (portalMode && !loggedInStudent && !loggedInTeacher) {
    setPortalMode(null);
    setTimeout(() => { window.location.hash = sectionId; }, 0);
    return;
  }
  window.location.hash = sectionId;
};

const loadStudentResults = async (studentProfile) => {
  try {
    const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentProfile.student_id)}/results/${studentProfile.semester}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load results.");
    setResults(data.results);
    setResultStatus(data.results.length > 0 ? "Published" : "Not published");
  } catch (error) {
    setResults([]);
    setResultStatus("Unavailable");
    console.error("Student results error:", error);
  }
};

const loadStudentFees = async (studentProfile) => {
  try {
    const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentProfile.student_id)}/fees`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load fee details.");
    setAmountPaid(Number(data.paid));
    setPaymentHistory(data.payments);
  } catch (error) {
    setAmountPaid(0);
    setPaymentHistory([]);
    setPaymentMessage(error.message || "Unable to load fee details.");
  }
};

const generateRandomCourseAttendance = () => Math.floor(Math.random() * 31) + 65;

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      `${API_URL}/api/students/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setLoginMessage(
        data.message ||
          "Login service is unavailable. Please restart the backend server and try again."
      );
      return;
    }

    if (data.success) {
      setLoggedInStudent(data.student);
      const nextService = serviceAfterLogin;
      setServiceAfterLogin(null);
      setActiveService(nextService);
      setAmountPaid(0);
      setPaymentHistory([]);
      setPaymentMessage("");
      setAcademicCourses(data.student.department === "BCA" ? bcaSubjects.map((subject, index) => ({ subject, code: bcaCourseCodes[index], teacher: bcaTeachers[index], attendance: generateRandomCourseAttendance() })) : []);
      loadStudentResults(data.student);
      loadStudentFees(data.student);
      loadStudentTimetable(data.student);
      setLoginMessage("Login successful! Welcome " + data.student.name);
    } else {
      setLoginMessage(data.message);
    }
  }
   catch (error) {
    console.error("Student login error:", error);
    setLoginMessage("Cannot reach the backend. Ensure it is running on port 5000.");
  }
};

const handlePasswordReset = async (e) => {
  e.preventDefault();
  setPasswordResetMessage("");

  if (passwordResetData.new_password !== passwordResetData.confirm_password) {
    setPasswordResetMessage("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/students/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordResetData),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      setPasswordResetMessage(data.message || "Unable to reset your password.");
      return;
    }

    setLoginData({ student_id: passwordResetData.student_id, password: "" });
    setPasswordResetData({ student_id: "", email: "", new_password: "", confirm_password: "" });
    setPasswordResetMode(false);
    setLoginMessage(data.message);
  } catch (error) {
    console.error("Password reset error:", error);
    setPasswordResetMessage("Cannot reach the backend. Ensure it is running on port 5000.");
  }
};

const handleLogout = () => {
  setLoggedInStudent(null);
  setPortalMode(null);
  setActiveService(null);
  setResults([]);
  setAcademicCourses([]);
  setStudentTimetable([]);
  setStudentTimetableMessage("");
  setAmountPaid(0);
  setPaymentHistory([]);
  setPaymentMessage("");
  setResultStatus("Not published");
  setLoginData({ student_id: "", password: "" });
  setLoginMessage("");
};

const handleTeacherLogin = async (e) => {
  e.preventDefault();
  setTeacherLoginMessage("");

  try {
    const response = await fetch(`${API_URL}/api/teachers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teacherLoginData),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      setTeacherLoginMessage(
        response.status === 404
          ? "Teacher login is unavailable. Restart the backend server, then try again."
          : data.message || "Unable to sign in. Please try again."
      );
      return;
    }

    setLoggedInTeacher(data.teacher);
    setTeacherLoginMessage("");
  } catch (error) {
    console.error("Teacher login error:", error);
    setTeacherLoginMessage("Cannot reach the backend. Ensure it is running on port 5000.");
  }
};

const handleTeacherPasswordReset = async (e) => {
  e.preventDefault();
  setTeacherPasswordResetMessage("");
  if (teacherPasswordResetData.new_password !== teacherPasswordResetData.confirm_password) {
    setTeacherPasswordResetMessage("Passwords do not match.");
    return;
  }
  try {
    const response = await fetch(`${API_URL}/api/teachers/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(teacherPasswordResetData),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to reset the password.");
    setTeacherLoginData({ teacher_id: teacherPasswordResetData.teacher_id, password: "" });
    setTeacherPasswordResetData({ teacher_id: "", email: "", new_password: "", confirm_password: "" });
    setTeacherPasswordResetMode(false);
    setTeacherLoginMessage(data.message);
  } catch (error) {
    setTeacherPasswordResetMessage(error.message || "Unable to reset the password.");
  }
};

const handleTeacherLogout = () => {
  setLoggedInTeacher(null);
  setPortalMode(null);
  setTeacherLoginData({ teacher_id: "", password: "" });
  setTeacherPanel("overview");
  setTimetableEntries([]);
  setTimetableMessage("");
  setAssignmentMessage("");
  setManagedStudents([]);
  setSelectedStudent(null);
  setFeeRecords([]);
  setSelectedFeeStudent(null);
  setTcApplications([]);
  setSelectedTcApplication(null);
};

const loadManagedStudents = async (search = "") => {
  setStudentsLoading(true);
  setStudentManagementMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/students?search=${encodeURIComponent(search)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load student records.");
    setManagedStudents(data.students);
  } catch (error) {
    console.error("Student directory error:", error);
    setStudentManagementMessage(error.message || "Unable to load student records.");
  } finally {
    setStudentsLoading(false);
  }
};

const openStudentManagement = () => {
  setTeacherPanel("students");
  setSelectedStudent(null);
  loadManagedStudents(studentSearch);
};

const openAttendancePanel = async () => {
  setTeacherPanel("attendance");
  setAttendanceLoading(true);
  setAttendanceMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/students`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load students.");
    setAttendanceStudents(data.students);
    const attendanceResponse = await fetch(`${API_URL}/api/teachers/attendance`);
    const attendanceData = await attendanceResponse.json().catch(() => ({}));
    if (!attendanceResponse.ok || !attendanceData.success) throw new Error(attendanceData.message || "Unable to load attendance.");
    const savedByStudent = Object.fromEntries(attendanceData.attendance.map((record) => [record.student_id, record.status]));
    setAttendanceByStudent(Object.fromEntries(data.students.map((student) => [student.student_id, savedByStudent[student.student_id] || "Present"])));
  } catch (error) {
    setAttendanceMessage(error.message || "Unable to load students.");
  } finally {
    setAttendanceLoading(false);
  }
};

const handleRandomizeAttendance = () => {
  if (!attendanceStudents.length) {
    setAttendanceMessage("No students are available to randomize.");
    return;
  }

  const randomized = Object.fromEntries(
    attendanceStudents.map((student) => [student.student_id, Math.random() < 0.8 ? "Present" : "Absent"])
  );

  setAttendanceByStudent((previous) => ({ ...previous, ...randomized }));
  setAttendanceMessage("Attendance randomized for all students. Review and save when ready.");
};

const handleSaveAllAttendance = async () => {
  if (!loggedInTeacher?.teacher_id) {
    setAttendanceMessage("Teacher session expired. Please sign in again.");
    return;
  }
  const records = attendanceStudents.map((student) => ({ student_id: student.student_id, status: attendanceByStudent[student.student_id] || "Present" }));
  if (records.length === 0) {
    setAttendanceMessage("No students are available to save.");
    return;
  }
  setAttendanceSaving(true);
  setAttendanceMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/attendance/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacher_id: loggedInTeacher.teacher_id, attendance: records }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || `Attendance save failed (${response.status}).`);
    setAttendanceMessage(data.message);
  } catch (error) {
    setAttendanceMessage(error.message || "Cannot reach the backend. Ensure it is running on port 5000.");
  } finally {
    setAttendanceSaving(false);
  }
};

const viewStudentDetails = async (studentId) => {
  setStudentDetailsLoading(true);
  setStudentManagementMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/students/${encodeURIComponent(studentId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load student details.");
    setSelectedStudent(data);
  } catch (error) {
    console.error("Student detail error:", error);
    setStudentManagementMessage(error.message || "Unable to load student details.");
  } finally {
    setStudentDetailsLoading(false);
  }
};

const loadTeacherResult = async (studentId, semester) => {
  if (!studentId) return;
  setResultManagementMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/results/${encodeURIComponent(studentId)}/${semester}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load result details.");
    const savedMarks = Object.fromEntries(data.results.map((item) => [item.subject, String(item.marks)]));
    setTeacherMarks(Object.fromEntries(bcaSubjects.map((subject) => [subject, savedMarks[subject] || ""])));
    setExistingResult(data.results.length > 0);
  } catch (error) {
    setResultManagementMessage(error.message || "Unable to load result details.");
  }
};

const openResultsManagement = async () => {
  setTeacherPanel("results-management");
  setResultManagementMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/students`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load students.");
    setResultStudents(data.students);
  } catch (error) {
    setResultManagementMessage(error.message || "Unable to load students.");
  }
};

const handlePublishResult = async (e) => {
  e.preventDefault();
  const marksAreComplete = bcaSubjects.every((subject) => teacherMarks[subject] !== "" && Number(teacherMarks[subject]) >= 0 && Number(teacherMarks[subject]) <= 100);
  if (!resultStudentId || !marksAreComplete) {
    setResultManagementMessage("Select a student and enter marks from 0 to 100 for every subject.");
    return;
  }
  setResultSaving(true);
  setResultManagementMessage("");
  const resultEntries = bcaSubjects.map((subject) => ({ subject, marks: Number(teacherMarks[subject]), grade: getGrade(Number(teacherMarks[subject])) }));
  try {
    const response = await fetch(`${API_URL}/api/teachers/results`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: resultStudentId, semester: Number(resultSemester), results: resultEntries }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to publish the result.");
    setExistingResult(true);
    setResultManagementMessage(data.message);
  } catch (error) {
    setResultManagementMessage(error.message || "Unable to publish the result.");
  } finally {
    setResultSaving(false);
  }
};

const loadAdmissions = async (status = admissionFilter) => {
  setAdmissionLoading(true);
  setAdmissionMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/admissions?status=${encodeURIComponent(status)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load admission applications.");
    setAdmissionApplications(data.applications);
  } catch (error) {
    setAdmissionMessage(error.message || "Unable to load admission applications.");
  } finally {
    setAdmissionLoading(false);
  }
};

const openAdmissions = () => {
  setTeacherPanel("admissions");
  setSelectedApplication(null);
  loadAdmissions(admissionFilter);
};

const loadFeeRecords = async () => {
  setFeeLoading(true);
  setFeeMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/fees`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load fee records.");
    setFeeRecords(data.records);
  } catch (error) {
    console.error("Fee records error:", error);
    setFeeMessage(error.message || "Unable to load fee records.");
  } finally {
    setFeeLoading(false);
  }
};

const openFeeManagement = () => {
  setTeacherPanel("fees-management");
  setSelectedFeeStudent(null);
  loadFeeRecords();
};

const viewFeeDetails = async (studentId) => {
  setFeeLoading(true);
  setFeeMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/fees/${encodeURIComponent(studentId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load payment history.");
    setSelectedFeeStudent(data);
  } catch (error) {
    setFeeMessage(error.message || "Unable to load payment history.");
  } finally {
    setFeeLoading(false);
  }
};

const loadTcApplications = async (status = tcFilter) => {
  setTcLoading(true);
  setTcMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/tc-applications?status=${encodeURIComponent(status)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load TC applications.");
    setTcApplications(data.applications);
  } catch (error) {
    setTcMessage(error.message || "Unable to load TC applications.");
  } finally {
    setTcLoading(false);
  }
};

const openTcManagement = () => {
  setTeacherPanel("tc-applications");
  setSelectedTcApplication(null);
  loadTcApplications(tcFilter);
};

const viewTcApplication = async (applicationId) => {
  setTcLoading(true);
  setTcMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/tc-applications/${applicationId}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load the TC application.");
    setSelectedTcApplication(data.application);
  } catch (error) {
    setTcMessage(error.message || "Unable to load the TC application.");
  } finally {
    setTcLoading(false);
  }
};

const updateTcStatus = async (applicationId, status) => {
  setTcLoading(true);
  setTcMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/tc-applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to update the TC application.");
    setSelectedTcApplication(null);
    setTcMessage(data.message);
    loadTcApplications(tcFilter);
  } catch (error) {
    setTcMessage(error.message || "Unable to update the TC application.");
    setTcLoading(false);
  }
};

useEffect(() => {
  if (!loggedInTeacher || teacherPanel !== "tc-applications") return undefined;
  const refreshTcApplications = () => loadTcApplications(tcFilter);
  const refreshTimer = setInterval(refreshTcApplications, 5000);
  return () => clearInterval(refreshTimer);
}, [loggedInTeacher, teacherPanel, tcFilter]);

const viewApplication = async (studentId) => {
  setAdmissionLoading(true);
  setAdmissionMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/admissions/${encodeURIComponent(studentId)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load the application.");
    setSelectedApplication(data.application);
    setAdmissionAnalysis(null);
  } catch (error) {
    setAdmissionMessage(error.message || "Unable to load the application.");
  } finally {
    setAdmissionLoading(false);
  }
};

const openAiAnalytics = async () => {
  setTeacherPanel("ai-analytics");
  setAiAnalyticsLoading(true);
  setAiAnalyticsMessage("");
  try {
    const response = await fetch(`${API_URL}/api/ml/analytics`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load AI analytics.");
    setAiAnalytics(data);
  } catch (error) {
    setAiAnalyticsMessage(error.message || "Unable to load AI analytics.");
  } finally {
    setAiAnalyticsLoading(false);
  }
};

const analyzeAdmission = async () => {
  if (!selectedApplication) return;
  setAdmissionAnalysisLoading(true);
  setAdmissionMessage("");
  try {
    const response = await fetch(`${API_URL}/api/ml/admissions/${encodeURIComponent(selectedApplication.student_id)}/analyze`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to analyze this application.");
    setAdmissionAnalysis(data);
  } catch (error) {
    setAdmissionMessage(error.message || "Unable to analyze this application.");
  } finally {
    setAdmissionAnalysisLoading(false);
  }
};

const askCollegeAssistant = async (e) => {
  e.preventDefault();
  if (!assistantQuestion.trim() || !loggedInStudent) return;
  setAssistantLoading(true);
  setAssistantAnswer("");
  try {
    const response = await fetch(`${API_URL}/api/ml/assistant/${encodeURIComponent(loggedInStudent.student_id)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: assistantQuestion }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "The college assistant could not answer right now.");
    setAssistantAnswer(data.answer);
  } catch (error) {
    setAssistantAnswer(error.message || "The college assistant could not answer right now.");
  } finally {
    setAssistantLoading(false);
  }
};

const updateAdmissionStatus = async (studentId, admission_status) => {
  setAdmissionLoading(true);
  setAdmissionMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/admissions/${encodeURIComponent(studentId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ admission_status }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to update the application.");
    setAdmissionMessage(data.message);
    setSelectedApplication(null);
    loadAdmissions(admissionFilter);
  } catch (error) {
    setAdmissionMessage(error.message || "Unable to update the application.");
  } finally {
    setAdmissionLoading(false);
  }
};

const openPortal = (mode) => {
  setPortalMode(mode === "student" ? "student-choice" : mode);
};

const openResults = () => {
  if (!loggedInStudent) {
    setServiceAfterLogin("results");
    openPortal("student-login");
    return;
  }
  setActiveService("results");
};

const openFees = () => {
  if (!loggedInStudent) {
    setServiceAfterLogin("fees");
    openPortal("student-login");
    return;
  }
  setActiveService("fees");
};
const openTc = () => {
  if (!loggedInStudent) {
    setServiceAfterLogin("tc");
    openPortal("student-login");
    return;
  }
  setActiveService("tc");
};
const loadAdmissionStatus = async () => {
  setAdmissionStatusLoading(true);
  setAdmissionStatusMessage("");
  try {
    const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(loggedInStudent.student_id)}/admission-status`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load admission status.");
    setLoggedInStudent((currentStudent) => ({ ...currentStudent, ...data.status }));
    setAdmissionStatusMessage("Admission status updated.");
  } catch (error) {
    setAdmissionStatusMessage(error.message || "Unable to load admission status.");
  } finally {
    setAdmissionStatusLoading(false);
  }
};

const loadStudentAttendance = async () => {
  setStudentAttendanceLoading(true);
  setStudentAttendanceMessage("");
  try {
    const studentId = encodeURIComponent(loggedInStudent.student_id);
    const [summaryResponse, historyResponse] = await Promise.all([
      fetch(`${API_URL}/api/students/${studentId}/attendance`),
      fetch(`${API_URL}/api/students/${studentId}/attendance/history`),
    ]);
    const summaryData = await summaryResponse.json().catch(() => ({}));
    const historyData = await historyResponse.json().catch(() => ({}));
    if (!summaryResponse.ok || !summaryData.success) throw new Error(summaryData.message || "Unable to load attendance.");
    if (!historyResponse.ok || !historyData.success) throw new Error(historyData.message || "Unable to load attendance history.");
    setStudentAttendance(summaryData.attendance);
    setStudentAttendanceHistory(historyData.history);
  } catch (error) {
    setStudentAttendanceMessage(error.message || "Unable to load attendance.");
  } finally {
    setStudentAttendanceLoading(false);
  }
};

const loadStudentTimetable = async (studentProfile = loggedInStudent) => {
  if (!studentProfile?.student_id) return;
  setStudentTimetableMessage("");
  try {
    const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(studentProfile.student_id)}/timetable`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load timetable.");
    setStudentTimetable(data.entries);
  } catch (error) {
    setStudentTimetable([]);
    setStudentTimetableMessage(error.message || "Unable to load timetable.");
  }
};

const loadTimetable = async () => {
  setTimetableLoading(true);
  setTimetableMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/timetable`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to load timetable.");
    setTimetableEntries(data.entries);
  } catch (error) {
    setTimetableMessage(error.message || "Unable to load timetable.");
  } finally {
    setTimetableLoading(false);
  }
};

const handleAddTimetableClass = async (e) => {
  e.preventDefault();
  setTimetableLoading(true);
  setTimetableMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/timetable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(timetableForm),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to save timetable entry.");
    setTimetableForm({ department: "BCA", day: "Monday", code: "", subject: "", teacher: "", semester: "Semester 1", time: "", room: "", students: "" });
    setTimetableMessage(data.message);
    await loadTimetable();
  } catch (error) {
    setTimetableMessage(error.message || "Unable to save timetable entry.");
  } finally {
    setTimetableLoading(false);
  }
};

const handleDeleteTimetableClass = async (entryId) => {
  setTimetableLoading(true);
  setTimetableMessage("");
  try {
    const response = await fetch(`${API_URL}/api/teachers/timetable/${entryId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete timetable entry.");
    setTimetableMessage(data.message);
    await loadTimetable();
  } catch (error) {
    setTimetableMessage(error.message || "Unable to delete timetable entry.");
  } finally {
    setTimetableLoading(false);
  }
};

useEffect(() => {
  if (!loggedInTeacher?.teacher_id || teacherPanel !== "classes") return;
  let active = true;
  fetch(`${API_URL}/api/teachers/timetable`)
    .then((response) => response.json().then((data) => ({ response, data })))
    .then(({ response, data }) => {
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load timetable.");
      if (active) setTimetableEntries(data.entries);
    })
    .catch((error) => { if (active) setTimetableMessage(error.message || "Unable to load timetable."); })
    .finally(() => { if (active) setTimetableLoading(false); });
  return () => { active = false; };
}, [teacherPanel, loggedInTeacher?.teacher_id]);

useEffect(() => {
  if (!loggedInStudent?.student_id || activeService !== "academic") return;
  let active = true;
  fetch(`${API_URL}/api/students/${encodeURIComponent(loggedInStudent.student_id)}/timetable`)
    .then((response) => response.json().then((data) => ({ response, data })))
    .then(({ response, data }) => {
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to load timetable.");
      if (active) setStudentTimetable(data.entries);
    })
    .catch((error) => { if (active) setStudentTimetableMessage(error.message || "Unable to load timetable."); });
  return () => { active = false; };
}, [activeService, loggedInStudent?.student_id, loggedInStudent?.department, loggedInStudent?.semester]);

const loadNotices = async () => {
  try {
    const response = await fetch(`${API_URL}/api/notices`);
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.success) setNotices(data.notices);
  } catch (error) { console.error("Notice loading error:", error); }
};

const handlePublishNotice = async (e) => {
  e.preventDefault();
  const url = editingNoticeId ? `${API_URL}/api/teachers/notices/${editingNoticeId}` : `${API_URL}/api/teachers/notices`;
  try {
    const response = await fetch(url, { method: editingNoticeId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(noticeForm) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to save notice.");
    setEditingNoticeId(null);
    setNoticeForm({ title: "", content: "", category: "College", priority: "Important" });
    setNoticeMessage(data.message);
    await loadNotices();
  } catch (error) { setNoticeMessage(error.message || "Unable to save notice."); }
};

const handleEditNotice = (notice) => {
  setEditingNoticeId(notice.id);
  setNoticeForm({
    title: notice.title,
    content: notice.content || "",
    category: notice.category,
    priority: notice.priority,
  });
  setNoticeMessage("");
};

const handleDeleteNotice = async (noticeId) => {
  try {
    const response = await fetch(`${API_URL}/api/teachers/notices/${noticeId}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to delete notice.");
    if (editingNoticeId === noticeId) { setEditingNoticeId(null); setNoticeForm({ title: "", content: "", category: "College", priority: "Important" }); }
    setNoticeMessage(data.message);
    await loadNotices();
  } catch (error) { setNoticeMessage(error.message || "Unable to delete notice."); }
};

useEffect(() => { loadNotices(); }, []);

const handleDownloadSyllabus = () => {
  const syllabus = [
    "K.B. College, Bermo", "BCA Semester Syllabus", "",
    ...academicCourses.map((course) => `${course.code} - ${course.subject} (${course.teacher})`),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([syllabus], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "KB-College-BCA-Syllabus.txt";
  link.click();
  URL.revokeObjectURL(url);
};

const handlePayNow = async () => {
  if (remainingAmount <= 0) return;

  const payment = Math.min(SEMESTER_FEE, remainingAmount);
  try {
    const response = await fetch(`${API_URL}/api/students/${encodeURIComponent(loggedInStudent.student_id)}/fees/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: payment }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to record payment.");
    await loadStudentFees(loggedInStudent);
    setPaymentMessage(`${formatCurrency(payment)} payment recorded successfully.`);
  } catch (error) {
    setPaymentMessage(error.message || "Unable to record payment.");
  }
};

const handleTcApplication = async (e) => {
  e.preventDefault();
  setTcStudentMessage("");
  try {
    const response = await fetch(`${API_URL}/api/students/tc-applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: loggedInStudent.student_id, reason: tcReason }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to submit the TC application.");
    setTcReason("");
    setLoggedInStudent((currentStudent) => ({ ...currentStudent, tc_status: "Pending" }));
    setTcStudentMessage(data.message);
  } catch (error) {
    setTcStudentMessage(error.message || "Unable to submit the TC application.");
  }
};

const handlePerformancePrediction = async (e) => {
  e.preventDefault();
  setPrediction(null);
  setPredictionMessage("");
  setPredictionLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/ml/predict-performance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(predictionForm),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to generate a prediction.");
    setPrediction(data);
  } catch (error) {
    setPredictionMessage(error.message || "Unable to generate a prediction.");
  } finally {
    setPredictionLoading(false);
  }
};

const studentDashboard = loggedInStudent && (
  <main className="student-dashboard">
    <section className="dashboard-welcome">
      <div>
        <p className="eyebrow">Student dashboard</p>
        <h1>Welcome back, {loggedInStudent.name.split(" ")[0]}!</h1>
        <p>Here is a quick overview of your academic profile at K.B. College, Bermo.</p>
      </div>
      <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
    </section>

    <section className="dashboard-grid" aria-label="Student information">
      <article className="profile-card dashboard-card">
        <div className="student-avatar" aria-hidden="true">{loggedInStudent.name.charAt(0).toUpperCase()}</div>
        <div>
          <p className="card-label">Student profile</p>
          <h2>{loggedInStudent.name}</h2>
          <p className="student-id">ID: {loggedInStudent.student_id}</p>
        </div>
        <dl className="profile-details">
          <div><dt>Email address</dt><dd>{loggedInStudent.email}</dd></div>
          <div><dt>Admission year</dt><dd>{loggedInStudent.admission_year}</dd></div>
        </dl>
      </article>

      <div className="dashboard-summary">
        <article className="summary-card"><span>Program</span><strong>{loggedInStudent.department}</strong><small>Current course</small></article>
        <article className="summary-card"><span>Semester</span><strong>{loggedInStudent.semester}</strong><small>Academic semester</small></article>
        <article className="summary-card"><span>Admission status</span><strong className={`admission-dashboard-status ${String(loggedInStudent.admission_status || "Not submitted").toLowerCase()}`}>{loggedInStudent.admission_submitted_at ? loggedInStudent.admission_status : "Not submitted"}</strong><small>{loggedInStudent.admission_submitted_at ? "Application review" : "Submit admission form"}</small></article>
        <article className="summary-card result-status-card"><span>Results status</span><strong>{resultStatus}</strong><small>Current semester</small></article>
      </div>
    </section>

    <section className="dashboard-card dashboard-services">
      <div className="dashboard-section-heading">
        <div><p className="eyebrow">Quick access</p><h2>Student services</h2></div>
        <span>More services coming soon</span>
      </div>
      <div className="quick-links">
        <button type="button" onClick={() => { setActiveService("academic"); loadStudentTimetable(); }}><b>Academic</b><span>View course details</span></button>
        <button type="button" onClick={() => { setActiveService("attendance"); loadStudentAttendance(); }}><b>Attendance</b><span>View attendance summary</span></button>
        <button type="button" onClick={openResults}><b>Results</b><span>Check examination results</span></button>
        <button type="button" onClick={openFees}><b>Fees</b><span>View fee information</span></button>
        <button type="button" onClick={() => { setActiveService("admission-status"); loadAdmissionStatus(); }}><b>Admission Status</b><span>Check application review</span></button>
        <button type="button" onClick={() => setActiveService("tc")}><b>TC Application</b><span>Apply for transfer certificate</span></button>
        <button type="button" onClick={() => setActiveService("notices")}><b>Notices</b><span>Read college updates</span></button>
        <button type="button" onClick={() => { setActiveService("assistant"); setAssistantAnswer(""); }}><b>College Assistant</b><span>Ask about your college account</span></button>
      </div>
    </section>

    {activeService === "results" && (
      <section id="results-section" className="dashboard-card results-panel" aria-labelledby="results-title">
        <div className="dashboard-section-heading">
          <div>
            <p className="eyebrow">Examination</p>
            <h2 id="results-title">My results</h2>
          </div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        <div className="results-student-info">
          <span><b>Student:</b> {loggedInStudent.name}</span>
          <span><b>Course:</b> {loggedInStudent.department}</span>
          <span><b>Semester:</b> {loggedInStudent.semester}</span>
        </div>
        {results.length > 0 ? (
          <>
            <div className="results-table-wrap">
              <table className="results-table">
                <thead><tr><th>Subject</th><th>Maximum marks</th><th>Marks obtained</th><th>Grade</th></tr></thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.subject}><td>{result.subject}</td><td>100</td><td>{result.marks}</td><td><span className="grade-pill">{result.grade}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="result-total">
              <span>Total: <b>{results.reduce((total, result) => total + result.marks, 0)} / {results.length * 100}</b></span>
              <span>Percentage: <b>{(results.reduce((total, result) => total + result.marks, 0) / results.length).toFixed(2)}%</b></span>
              <span className="results-status">{resultStatus}</span>
            </div>
          </>
        ) : (
          <div className="results-empty-state">
            <div className="results-icon" aria-hidden="true">R</div>
            <div><h3>Results are not available</h3><p>No published results are available for this semester.</p></div>
            <span className="results-status">{resultStatus}</span>
          </div>
        )}
      </section>
    )}

    {activeService === "fees" && (
      <section id="fees-section" className="dashboard-card fees-panel" aria-labelledby="fees-title">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">Fee management</p><h2 id="fees-title">My fee details</h2></div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        <div className="fee-overview">
          <article><span>Total course fee</span><strong>{formatCurrency(TOTAL_COURSE_FEE)}</strong><small>BCA program • 6 semesters</small></article>
          <article><span>Semester fee</span><strong>{formatCurrency(SEMESTER_FEE)}</strong><small>Per semester installment</small></article>
          <article className="paid-fee"><span>Amount paid</span><strong>{formatCurrency(amountPaid)}</strong><small>Payments recorded this session</small></article>
          <article className="due-fee"><span>Remaining amount</span><strong>{formatCurrency(remainingAmount)}</strong><small>Balance for complete course</small></article>
        </div>
        <div className="fee-action-bar">
          <div><span>Payment status</span><strong className={remainingAmount === 0 ? "payment-complete" : "payment-pending"}>{remainingAmount === 0 ? "Fully paid" : amountPaid > 0 ? "Partially paid" : "Payment pending"}</strong></div>
          <button className="pay-now-button" type="button" onClick={handlePayNow} disabled={remainingAmount === 0}>{remainingAmount === 0 ? "Course fee paid" : `Pay now ${formatCurrency(Math.min(SEMESTER_FEE, remainingAmount))}`}</button>
        </div>
        {paymentMessage && <p className="payment-message" role="status">{paymentMessage}</p>}
        <div className="payment-history">
          <div className="history-heading"><h3>Payment history</h3><span>{paymentHistory.length} payment{paymentHistory.length === 1 ? "" : "s"}</span></div>
          {paymentHistory.length > 0 ? (
            <div className="history-list">
              {paymentHistory.map((payment) => <div className="history-item" key={payment.id}><div><strong>{payment.id}</strong><span>{payment.date}</span></div><b>{formatCurrency(payment.amount)}</b><em>{payment.status}</em></div>)}
            </div>
          ) : <p className="no-payment-history">No payments have been recorded yet.</p>}
        </div>
      </section>
    )}

    {activeService === "notices" && (
      <section className="dashboard-card notices-panel" aria-labelledby="notices-title">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">College updates</p><h2 id="notices-title">Latest notices</h2></div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        <p className="notices-intro">Stay informed about academic, examination, admission, and fee-related updates.</p>
        <div className="notices-list">
          {notices.map((notice) => (
            <article className="notice-item" key={notice.title}>
              <div className={`notice-category ${notice.category.toLowerCase()}`}>{notice.category}</div>
              <div className="notice-content"><h3>{notice.title}</h3>{notice.content && <p>{notice.content}</p>}<time dateTime={notice.dateISO}>Published: {notice.date}</time></div>
              <span className={`priority-label ${notice.priority.toLowerCase()}`}>{notice.priority}</span>
            </article>
          ))}
        </div>
      </section>
    )}
    {activeService === "assistant" && (
      <section className="dashboard-card assistant-panel" aria-labelledby="assistant-title">
        <div className="dashboard-section-heading"><div><p className="eyebrow">AI student support</p><h2 id="assistant-title">College Assistant</h2></div><button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button></div>
        <p className="prediction-intro">Ask about your attendance, next class, fee status, TC application, or published results.</p>
        <form className="assistant-form" onSubmit={askCollegeAssistant}><input value={assistantQuestion} onChange={(e) => setAssistantQuestion(e.target.value)} placeholder="e.g. What is my attendance?" aria-label="Question for the college assistant" /><button className="teacher-primary" type="submit" disabled={assistantLoading}>{assistantLoading ? "Checking..." : "Ask assistant"}</button></form>
        <div className="assistant-suggestions"><button type="button" onClick={() => setAssistantQuestion("What is my attendance?")}>My attendance</button><button type="button" onClick={() => setAssistantQuestion("What is my next class?")}>Next class</button><button type="button" onClick={() => setAssistantQuestion("What is my fee status?")}>Fee status</button><button type="button" onClick={() => setAssistantQuestion("How do I apply for TC?")}>TC application</button></div>
        {assistantAnswer && <div className="assistant-answer" role="status"><b>College Assistant</b><p>{assistantAnswer}</p></div>}
      </section>
    )}
    {activeService === "admission-status" && (
      <section className="dashboard-card status-panel" aria-labelledby="admission-status-title">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">Student services</p><h2 id="admission-status-title">Admission status</h2></div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        <div className="tc-status-banner">
          <span>Application status</span>
          <strong className={`admission-dashboard-status ${String(loggedInStudent.admission_status || "Not submitted").toLowerCase()}`}>{loggedInStudent.admission_submitted_at ? loggedInStudent.admission_status : "Not submitted"}</strong>
          <small>{loggedInStudent.admission_submitted_at ? "Your application is being reviewed by the college." : "Submit the admission form to start your application."}</small>
        </div>
        <button className="teacher-primary" type="button" onClick={loadAdmissionStatus} disabled={admissionStatusLoading}>{admissionStatusLoading ? "Checking..." : "Refresh status"}</button>
        {admissionStatusMessage && <p className="register-message" role="status">{admissionStatusMessage}</p>}
      </section>
    )}

    {activeService === "attendance" && (
      <section className="dashboard-card status-panel" aria-labelledby="student-attendance-title">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">Student services</p><h2 id="student-attendance-title">My attendance</h2></div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        {studentAttendanceLoading ? <p className="directory-state">Loading attendance...</p> : studentAttendance ? <div className="dashboard-summary attendance-summary"><article className="summary-card"><span>Total classes</span><strong>{studentAttendance.total_classes}</strong><small>Recorded classes</small></article><article className="summary-card"><span>Present</span><strong>{studentAttendance.present}</strong><small>Classes attended</small></article><article className="summary-card"><span>Absent</span><strong>{studentAttendance.absent}</strong><small>Classes missed</small></article><article className="summary-card result-status-card"><span>Attendance %</span><strong>{studentAttendance.percentage}%</strong><small>Overall attendance</small></article></div> : <p className="directory-state">No attendance records found.</p>}
        <div className="attendance-history"><div className="academic-block-heading"><h3>Date-wise history</h3><span>{studentAttendanceHistory.length} record{studentAttendanceHistory.length === 1 ? "" : "s"}</span></div>{studentAttendanceHistory.length > 0 ? <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>{studentAttendanceHistory.map((record) => <tr key={`${record.date}-${record.status}`}><td>{record.date}</td><td><span className={`admission-status ${record.status.toLowerCase()}`}>{record.status}</span></td></tr>)}</tbody></table></div> : <p className="directory-state">No attendance history found.</p>}</div>
        {studentAttendanceMessage && <p className="login-message" role="status">{studentAttendanceMessage}</p>}
        <button className="teacher-primary" type="button" onClick={loadStudentAttendance} disabled={studentAttendanceLoading}>{studentAttendanceLoading ? "Refreshing..." : "Refresh attendance"}</button>
      </section>
    )}

    {activeService === "tc" && (
      <section className="dashboard-card tc-student-panel" aria-labelledby="tc-student-title">
        <div className="dashboard-section-heading"><div><p className="eyebrow">Student services</p><h2 id="tc-student-title">Transfer certificate application</h2></div><button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button></div>
        <div className="tc-status-banner"><span>Application status</span><strong className={`admission-dashboard-status ${String(loggedInStudent.tc_status || "Not submitted").toLowerCase()}`}>{loggedInStudent.tc_status || "Not submitted"}</strong><small>{loggedInStudent.tc_status === "Approved" ? "Your request has been approved." : loggedInStudent.tc_status === "Rejected" ? "Please contact the college office for more information." : loggedInStudent.tc_status === "Pending" ? "Your request is awaiting teacher review." : "Submit a request for your transfer certificate."}</small></div>
        <p className="notices-intro">Submit a request for your transfer certificate. Your application will be reviewed by the college.</p>
        <form className="tc-application-form" onSubmit={handleTcApplication}>
          <label className="form-field"><span>Reason for application</span><textarea value={tcReason} onChange={(e) => setTcReason(e.target.value)} placeholder="Enter the reason for requesting your transfer certificate" rows="5" required /></label>
          <button className="teacher-primary" type="submit">Submit TC application</button>
        </form>
        {tcStudentMessage && <p className="register-message" role="status">{tcStudentMessage}</p>}
      </section>
    )}

    {activeService === "academic" && (
      <section className="dashboard-card academic-panel" aria-labelledby="academic-title">
        <div className="dashboard-section-heading">
          <div><p className="eyebrow">Academic overview</p><h2 id="academic-title">{loggedInStudent.department} academic details</h2></div>
          <button className="close-results" type="button" onClick={() => setActiveService(null)}>Close</button>
        </div>
        {academicCourses.length > 0 || studentTimetable.length > 0 ? <>
          <div className="academic-summary">
            <article><span>Current semester</span><strong>Semester {loggedInStudent.semester}</strong><small>BCA program</small></article>
            {academicCourses.length > 0 && <article><span>Average attendance</span><strong>{Math.round(academicCourses.reduce((total, course) => total + course.attendance, 0) / academicCourses.length)}%</strong><small>Across all subjects</small></article>}
            <article><span>Classes this week</span><strong>{studentTimetable.length}</strong><small>Published classes</small></article>
          </div>
          <div className="academic-block">
            <div className="academic-block-heading"><h3>Class timetable</h3><span>Regular class schedule</span></div>
            {studentTimetableMessage && <p className="no-payment-history">{studentTimetableMessage}</p>}
            {!studentTimetableMessage && studentTimetable.length === 0 && <p className="no-payment-history">No timetable has been published for your semester yet.</p>}
            {studentTimetable.length > 0 && <div className="timetable-wrap"><table className="timetable"><thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Teacher</th><th>Room</th></tr></thead><tbody>{studentTimetable.map((entry) => <tr key={entry.id}><td>{entry.day}</td><td>{entry.time}</td><td>{entry.code ? `${entry.code} - ` : ""}{entry.subject}</td><td>{entry.teacher}</td><td>{entry.room}</td></tr>)}</tbody></table></div>}
          </div>
          {academicCourses.length > 0 && <div className="academic-block">
            <div className="academic-block-heading"><h3>Subjects &amp; course details</h3><button className="download-syllabus" type="button" onClick={handleDownloadSyllabus}>Download syllabus</button></div>
            <div className="course-list">{academicCourses.map((course) => <article className="course-item" key={course.code}><span className="course-code">{course.code}</span><div><h4>{course.subject}</h4><p>Teacher: {course.teacher}</p></div><div className="attendance"><span>Attendance</span><strong>{course.attendance}%</strong></div></article>)}</div>
          </div>}
          {academicCourses.length > 0 && <div className="academic-block semester-record">
            <div className="academic-block-heading"><h3>Semester-wise academic record</h3><span>Academic progress</span></div>
            <div className="semester-list">{[1, 2, 3, 4, 5, 6].map((semester) => <div key={semester} className={semester === Number(loggedInStudent.semester) ? "current-semester" : semester < Number(loggedInStudent.semester) ? "completed-semester" : "upcoming-semester"}><b>Semester {semester}</b><span>{semester === Number(loggedInStudent.semester) ? "In progress" : semester < Number(loggedInStudent.semester) ? "Completed" : "Upcoming"}</span></div>)}</div>
          </div>}
        </> : <p className="no-payment-history">No academic timetable has been published for your semester yet.</p>}
      </section>
    )}
  </main>
);

const teacherDashboard = loggedInTeacher && (
  <main className="teacher-dashboard">
    <section className="dashboard-welcome teacher-welcome">
      <div>
        <p className="eyebrow">Teacher dashboard</p>
        <h1>Good day, {loggedInTeacher.name}.</h1>
        <p>{loggedInTeacher.designation || "Faculty member"} · {loggedInTeacher.department} Department</p>
      </div>
      <button className="logout-button" type="button" onClick={handleTeacherLogout}>Log out</button>
    </section>

    <section className="teacher-metrics" aria-label="Teaching summary">
      <article><span>Assigned classes</span><strong>{timetableEntries.length}</strong><small>From timetable</small></article>
      <article><span>Total students</span><strong>{timetableEntries.reduce((total, item) => total + Number(item.students || 0), 0)}</strong><small>Across your classes</small></article>
      <article><span>Today's classes</span><strong>3</strong><small>Monday schedule</small></article>
      <article><span>Attendance rate</span><strong>92%</strong><small>This month</small></article>
    </section>

    <section className="dashboard-card teacher-tools">
      <div className="dashboard-section-heading"><div><p className="eyebrow">Teaching tools</p><h2>Manage your work</h2></div></div>
      <div className="quick-links teacher-quick-links">
        <button type="button" onClick={openStudentManagement}><b>Students</b><span>Search student records</span></button>
        <button type="button" onClick={openAdmissions}><b>Admissions</b><span>Review applications</span></button>
        <button type="button" onClick={openResultsManagement}><b>Results</b><span>Publish student results</span></button>
        <button type="button" onClick={openFeeManagement}><b>Fees</b><span>Review student payments</span></button>
        <button type="button" onClick={openTcManagement}><b>TC Applications</b><span>Review transfer requests</span></button>
        <button type="button" onClick={() => setTeacherPanel("classes")}><b>Timetable</b><span>Manage class schedule</span></button>
        <button type="button" onClick={openAttendancePanel}><b>Attendance</b><span>Mark class attendance</span></button>
        <button type="button" onClick={openAiAnalytics}><b>AI Analytics</b><span>View student risk insights</span></button>
        <button type="button" onClick={() => { setTeacherPanel("ai-prediction"); setPrediction(null); setPredictionMessage(""); }}><b>AI Predictor</b><span>Forecast student performance</span></button>
        <button type="button" onClick={() => setTeacherPanel("assignments")}><b>Assignments</b><span>Publish student work</span></button>
        <button type="button" onClick={() => setTeacherPanel("notices")}><b>Notices</b><span>View college updates</span></button>
      </div>
    </section>

    {teacherPanel === "fees-management" && <section className="dashboard-card teacher-panel fees-management-panel">
      <div className="dashboard-section-heading">
        <div><p className="eyebrow">Fee management</p><h2>{selectedFeeStudent ? "Student payment history" : "Student fee records"}</h2></div>
        {selectedFeeStudent && <button className="close-results" type="button" onClick={() => setSelectedFeeStudent(null)}>Back to fee records</button>}
      </div>
      {feeMessage && <p className="login-message">{feeMessage}</p>}
      {feeLoading ? <p className="directory-state">Loading fee records...</p> : selectedFeeStudent ? <div className="fee-student-details">
        <section className="student-detail-hero"><div className="student-avatar" aria-hidden="true">{selectedFeeStudent.record.name.charAt(0).toUpperCase()}</div><div><p className="card-label">Student fee account</p><h3>{selectedFeeStudent.record.name}</h3><span>{selectedFeeStudent.record.student_id} · {selectedFeeStudent.record.department}</span></div><span className={`admission-status ${selectedFeeStudent.record.status.toLowerCase()}`}>{selectedFeeStudent.record.status}</span></section>
        <div className="fee-detail-summary"><article><span>Total fee</span><strong>{formatCurrency(selectedFeeStudent.record.total_fee)}</strong></article><article><span>Fee paid</span><strong>{formatCurrency(selectedFeeStudent.record.paid)}</strong></article><article><span>Remaining</span><strong>{formatCurrency(selectedFeeStudent.record.remaining)}</strong></article></div>
        <div className="payment-history teacher-payment-history"><div className="history-heading"><h3>Complete payment history</h3><span>{selectedFeeStudent.payments.length} payment{selectedFeeStudent.payments.length === 1 ? "" : "s"}</span></div>{selectedFeeStudent.payments.length > 0 ? <div className="history-list">{selectedFeeStudent.payments.map((payment) => <div className="history-item" key={payment.receipt_no}><div><strong>{payment.receipt_no}</strong><span>{new Date(payment.payment_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div><b>{formatCurrency(Number(payment.amount))}</b><em>{payment.payment_status}</em></div>)}</div> : <p className="no-payment-history">No payments have been recorded for this student.</p>}</div>
      </div> : feeRecords.length > 0 ? <div className="student-table-wrap"><table className="student-table fee-table"><thead><tr><th>Student</th><th>Department</th><th>Total fee</th><th>Fee paid</th><th>Remaining</th><th>Status</th><th>Action</th></tr></thead><tbody>{feeRecords.map((record) => <tr key={record.student_id}><td><b>{record.name}</b><small>{record.student_id}</small></td><td>{record.department}</td><td>{formatCurrency(record.total_fee)}</td><td>{formatCurrency(record.paid)}</td><td>{formatCurrency(record.remaining)}</td><td><span className={`admission-status ${record.status.toLowerCase()}`}>{record.status}</span></td><td><button className="view-student-button" type="button" onClick={() => viewFeeDetails(record.student_id)}>View</button></td></tr>)}</tbody></table></div> : <p className="directory-state">No student fee records found.</p>}
    </section>}

    {teacherPanel === "ai-analytics" && <section className="dashboard-card teacher-panel analytics-panel">
      <div className="dashboard-section-heading"><div><p className="eyebrow">AI student analytics</p><h2>Early-warning dashboard</h2></div><button className="close-results" type="button" onClick={openAiAnalytics} disabled={aiAnalyticsLoading}>{aiAnalyticsLoading ? "Refreshing..." : "Refresh"}</button></div>
      {aiAnalyticsMessage && <p className="login-message">{aiAnalyticsMessage}</p>}
      {aiAnalyticsLoading ? <p className="directory-state">Analysing student data...</p> : aiAnalytics && <><div className="ai-metrics"><article><span>Students analyzed</span><strong>{aiAnalytics.summary.students_analyzed}</strong></article><article><span>Attendance risk</span><strong>{aiAnalytics.summary.attendance_risk}</strong><small>Below {aiAnalytics.thresholds.attendance_percentage}%</small></article><article><span>Performance risk</span><strong>{aiAnalytics.summary.performance_risk}</strong><small>Below {aiAnalytics.thresholds.performance_marks}%</small></article><article><span>Good performance</span><strong>{aiAnalytics.summary.good_performance}</strong></article><article><span>Needs attention</span><strong>{aiAnalytics.summary.needs_attention}</strong></article></div><div className="ai-insights"><h3>AI insights</h3><ul>{aiAnalytics.insights.map((insight) => <li key={insight}>{insight}</li>)}</ul></div>{aiAnalytics.risk_students.length > 0 && <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Student</th><th>Department</th><th>Attendance</th><th>Average marks</th><th>Risk</th></tr></thead><tbody>{aiAnalytics.risk_students.map((student) => <tr key={student.student_id}><td><b>{student.name}</b><small>{student.student_id}</small></td><td>{student.department}</td><td>{student.attendance_percentage === null ? "Not recorded" : `${student.attendance_percentage}%`}</td><td>{student.average_marks === null ? "Not published" : `${student.average_marks}%`}</td><td><span className="student-status">{student.attendance_risk && student.performance_risk ? "Attendance + performance" : student.attendance_risk ? "Attendance" : "Performance"}</span></td></tr>)}</tbody></table></div>}</>}
    </section>}

    {teacherPanel === "tc-applications" && <section className="dashboard-card teacher-panel tc-management-panel">
      <div className="dashboard-section-heading"><div><p className="eyebrow">Transfer certificate management</p><h2>{selectedTcApplication ? "TC application details" : "Pending TC requests"}</h2></div>{selectedTcApplication && <button className="close-results" type="button" onClick={() => setSelectedTcApplication(null)}>Back to requests</button>}</div>
      {tcMessage && <p className="login-message">{tcMessage}</p>}
      {tcLoading ? <p className="directory-state">Loading TC applications...</p> : selectedTcApplication ? <div className="tc-application-details">
        <section className="student-detail-hero"><div className="student-avatar" aria-hidden="true">{selectedTcApplication.name.charAt(0).toUpperCase()}</div><div><p className="card-label">Transfer certificate request</p><h3>{selectedTcApplication.name}</h3><span>{selectedTcApplication.student_id} · {selectedTcApplication.department}</span></div><span className={`admission-status ${selectedTcApplication.status.toLowerCase()}`}>{selectedTcApplication.status}</span></section>
        <div className="student-detail-grid"><article><h3>Student information</h3><dl><div><dt>Student ID</dt><dd>{selectedTcApplication.student_id}</dd></div><div><dt>Email address</dt><dd>{selectedTcApplication.email}</dd></div><div><dt>Phone number</dt><dd>{selectedTcApplication.phone || "Not provided"}</dd></div></dl></article><article><h3>Academic information</h3><dl><div><dt>Department</dt><dd>{selectedTcApplication.department}</dd></div><div><dt>Current semester</dt><dd>Semester {selectedTcApplication.semester}</dd></div><div><dt>Admission year</dt><dd>{selectedTcApplication.admission_year}</dd></div></dl></article><article><h3>Application details</h3><dl><div><dt>TC ID</dt><dd>TC-{String(selectedTcApplication.id).padStart(4, "0")}</dd></div><div><dt>Applied date</dt><dd>{new Date(selectedTcApplication.application_date).toLocaleDateString("en-IN")}</dd></div><div><dt>Reason</dt><dd>{selectedTcApplication.reason}</dd></div><div><dt>Current status</dt><dd>{selectedTcApplication.status}</dd></div></dl></article></div>
        {selectedTcApplication.status === "Pending" && <div className="detail-admission-actions"><button className="approve-button" type="button" onClick={() => updateTcStatus(selectedTcApplication.id, "Approved")}>Approve request</button><button className="reject-button" type="button" onClick={() => updateTcStatus(selectedTcApplication.id, "Rejected")}>Reject request</button></div>}
      </div> : <><div className="admission-filter"><label>Show <select value={tcFilter} onChange={(e) => { const status = e.target.value; setTcFilter(status); loadTcApplications(status); }}><option>Pending</option><option>Approved</option><option>Rejected</option><option value="All">All requests</option></select></label><span>{tcApplications.length} request{tcApplications.length === 1 ? "" : "s"}</span></div>{tcApplications.length > 0 ? <div className="student-table-wrap"><table className="student-table tc-table"><thead><tr><th>TC ID</th><th>Student ID</th><th>Name</th><th>Department</th><th>Reason</th><th>Applied date</th><th>Status</th><th>Actions</th></tr></thead><tbody>{tcApplications.map((application) => <tr key={application.id}><td><b>TC-{String(application.id).padStart(4, "0")}</b></td><td>{application.student_id}</td><td>{application.name}</td><td>{application.department}</td><td>{application.reason}</td><td>{new Date(application.application_date).toLocaleDateString("en-IN")}</td><td><span className={`admission-status ${application.status.toLowerCase()}`}>{application.status}</span></td><td><div className="admission-actions"><button className="view-student-button" type="button" onClick={() => viewTcApplication(application.id)}>View</button>{application.status === "Pending" && <><button className="approve-button" type="button" onClick={() => updateTcStatus(application.id, "Approved")}>Approve</button><button className="reject-button" type="button" onClick={() => updateTcStatus(application.id, "Rejected")}>Reject</button></>}</div></td></tr>)}</tbody></table></div> : <p className="directory-state">No {tcFilter.toLowerCase()} TC requests found.</p>}</>}
    </section>}

    {teacherPanel === "admissions" && <section className="dashboard-card teacher-panel admissions-panel">
      <div className="dashboard-section-heading"><div><p className="eyebrow">Admission management</p><h2>{selectedApplication ? "Student application" : "Pending applications"}</h2></div>{selectedApplication && <button className="close-results" type="button" onClick={() => setSelectedApplication(null)}>Back to applications</button>}</div>
      {!selectedApplication ? <>
        <div className="admission-filter"><label>Show <select value={admissionFilter} onChange={(e) => { const status = e.target.value; setAdmissionFilter(status); loadAdmissions(status); }}><option>Pending</option><option>Approved</option><option>Rejected</option><option value="All">All applications</option></select></label><span>{admissionApplications.length} application{admissionApplications.length === 1 ? "" : "s"}</span></div>
        {admissionMessage && <p className="login-message">{admissionMessage}</p>}
        {admissionLoading ? <p className="directory-state">Loading applications...</p> : admissionApplications.length > 0 ? <div className="student-table-wrap"><table className="student-table admission-table"><thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Semester</th><th>Admission year</th><th>Status</th><th>Actions</th></tr></thead><tbody>{admissionApplications.map((application) => <tr key={application.student_id}><td><b>{application.student_id}</b></td><td>{application.name}</td><td>{application.email}</td><td>{application.phone}</td><td>{application.department}</td><td>Semester {application.semester}</td><td>{application.admission_year}</td><td><span className={`admission-status ${application.admission_status.toLowerCase()}`}>{application.admission_status}</span></td><td><div className="admission-actions"><button className="view-student-button" type="button" onClick={() => viewApplication(application.student_id)}>View</button>{application.admission_status === "Pending" && <><button className="approve-button" type="button" onClick={() => updateAdmissionStatus(application.student_id, "Approved")}>Approve</button><button className="reject-button" type="button" onClick={() => updateAdmissionStatus(application.student_id, "Rejected")}>Reject</button></>}</div></td></tr>)}</tbody></table></div> : <p className="directory-state">No {admissionFilter.toLowerCase()} applications found.</p>}
      </> : <div className="application-details"><section className="student-detail-hero"><div className="student-avatar" aria-hidden="true">{selectedApplication.name.charAt(0).toUpperCase()}</div><div><p className="card-label">Admission application</p><h3>{selectedApplication.name}</h3><span>{selectedApplication.student_id}</span></div><span className={`admission-status ${selectedApplication.admission_status.toLowerCase()}`}>{selectedApplication.admission_status}</span></section><div className="student-detail-grid"><article><h3>Personal details</h3><dl><div><dt>Email address</dt><dd>{selectedApplication.email}</dd></div><div><dt>Phone number</dt><dd>{selectedApplication.phone}</dd></div><div><dt>Date of birth</dt><dd>{selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString("en-IN") : "Not provided"}</dd></div><div><dt>Gender</dt><dd>{selectedApplication.gender || "Not provided"}</dd></div><div><dt>Address</dt><dd>{selectedApplication.address || "Not provided"}</dd></div></dl></article><article><h3>Course selection</h3><dl><div><dt>Department</dt><dd>{selectedApplication.department}</dd></div><div><dt>Semester</dt><dd>Semester {selectedApplication.semester}</dd></div><div><dt>Admission year</dt><dd>{selectedApplication.admission_year}</dd></div></dl></article><article><h3>12th qualification</h3><dl><div><dt>Qualification</dt><dd>{selectedApplication.qualification_12th || "Not provided"}</dd></div><div><dt>Board</dt><dd>{selectedApplication.board_12th || "Not provided"}</dd></div><div><dt>Marks</dt><dd>{selectedApplication.marks_12th === null || selectedApplication.marks_12th === undefined ? "Not provided" : `${selectedApplication.marks_12th}%`}</dd></div><div><dt>Passing year</dt><dd>{selectedApplication.passing_year_12th || "Not provided"}</dd></div><div><dt>Guardian</dt><dd>{selectedApplication.guardian_name || "Not provided"} · {selectedApplication.guardian_phone || "No phone"}</dd></div></dl></article></div><section className="application-status-card"><h3>Application status</h3><p>Current status: <b>{selectedApplication.admission_status}</b></p>{selectedApplication.admission_status === "Pending" && <div className="detail-admission-actions"><button className="approve-button" type="button" onClick={() => updateAdmissionStatus(selectedApplication.student_id, "Approved")}>Approve application</button><button className="reject-button" type="button" onClick={() => updateAdmissionStatus(selectedApplication.student_id, "Rejected")}>Reject application</button></div>}</section><section className="admission-ai-card"><div><p className="card-label">AI admission analysis</p><h3>Academic profile</h3><p>Uses submitted 12th marks as an advisory screening signal. Faculty retain the final decision.</p></div><button className="teacher-primary" type="button" onClick={analyzeAdmission} disabled={admissionAnalysisLoading}>{admissionAnalysisLoading ? "Analysing..." : "Analyze application"}</button>{admissionAnalysis && <div className="admission-analysis-result"><strong>{admissionAnalysis.profile}</strong><span>Marks: {admissionAnalysis.marks}% · Suggested screening threshold: {admissionAnalysis.suggested_threshold}%</span><p>{admissionAnalysis.recommendation}</p><small>{admissionAnalysis.decision_note}</small></div>}</section></div>}
      {admissionLoading && selectedApplication && <p className="directory-state">Loading application...</p>}
    </section>}

    {teacherPanel === "results-management" && <section className="dashboard-card teacher-panel results-management-panel">
      <div className="dashboard-section-heading"><div><p className="eyebrow">Results management</p><h2>Enter and publish results</h2></div><span>{existingResult ? "Editing published result" : "New result"}</span></div>
      <form onSubmit={handlePublishResult}>
        <div className="result-selection">
          <label className="form-field"><span>Student</span><select value={resultStudentId} onChange={(e) => { const studentId = e.target.value; setResultStudentId(studentId); setExistingResult(false); setTeacherMarks(Object.fromEntries(bcaSubjects.map((subject) => [subject, ""]))); loadTeacherResult(studentId, resultSemester); }} required><option value="">Select a student</option>{resultStudents.map((student) => <option key={student.student_id} value={student.student_id}>{student.student_id} - {student.name}</option>)}</select></label>
          <label className="form-field"><span>Semester</span><select value={resultSemester} onChange={(e) => { const semester = e.target.value; setResultSemester(semester); setExistingResult(false); setTeacherMarks(Object.fromEntries(bcaSubjects.map((subject) => [subject, ""]))); loadTeacherResult(resultStudentId, semester); }}>{[1, 2, 3, 4, 5, 6].map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select></label>
        </div>
        {resultManagementMessage && <p className="login-message">{resultManagementMessage}</p>}
        <div className="result-entry-wrap"><table className="result-entry-table"><thead><tr><th>Subject</th><th>Maximum marks</th><th>Marks obtained</th><th>Grade</th></tr></thead><tbody>{bcaSubjects.map((subject) => <tr key={subject}><td>{subject}</td><td>100</td><td><input type="number" min="0" max="100" step="0.01" value={teacherMarks[subject]} onChange={(e) => setTeacherMarks({ ...teacherMarks, [subject]: e.target.value })} placeholder="Enter marks" required /></td><td><span className="grade-pill">{teacherMarks[subject] === "" ? "-" : getGrade(Number(teacherMarks[subject]))}</span></td></tr>)}</tbody></table></div>
        <div className="teacher-result-summary"><div><span>Total marks</span><strong>{teacherResultTotal} / {bcaSubjects.length * 100}</strong></div><div><span>Percentage</span><strong>{teacherResultPercentage}%</strong></div><div><span>Overall grade</span><strong>{getGrade(Number(teacherResultPercentage))}</strong></div><button className="teacher-primary" type="submit" disabled={resultSaving}>{resultSaving ? "Saving..." : existingResult ? "Update result" : "Publish result"}</button></div>
      </form>
    </section>}

    {teacherPanel === "ai-prediction" && <section className="dashboard-card teacher-panel prediction-panel">
      <div className="dashboard-section-heading"><div><p className="eyebrow">AI/ML insight</p><h2>Student performance predictor</h2></div><span>Random forest model</span></div>
      <p className="prediction-intro">Enter the current academic indicators to receive an early performance category and a practical next step. This supports teacher judgement; it does not replace it.</p>
      <form className="assignment-form" onSubmit={handlePerformancePrediction}>
        <div className="form-grid">
          <label className="form-field"><span>Attendance (%)</span><input type="number" min="0" max="100" step="0.1" value={predictionForm.attendance} onChange={(e) => setPredictionForm({ ...predictionForm, attendance: e.target.value })} placeholder="e.g. 85" required /></label>
          <label className="form-field"><span>Previous marks (%)</span><input type="number" min="0" max="100" step="0.1" value={predictionForm.previous_marks} onChange={(e) => setPredictionForm({ ...predictionForm, previous_marks: e.target.value })} placeholder="e.g. 72" required /></label>
          <label className="form-field"><span>Internal marks (out of 30)</span><input type="number" min="0" max="30" step="0.1" value={predictionForm.internal_marks} onChange={(e) => setPredictionForm({ ...predictionForm, internal_marks: e.target.value })} placeholder="e.g. 22" required /></label>
        </div>
        <button className="teacher-primary" type="submit" disabled={predictionLoading}>{predictionLoading ? "Analysing..." : "Generate prediction"}</button>
      </form>
      {predictionMessage && <p className="login-message">{predictionMessage}</p>}
      {prediction && <section className={`prediction-result ${prediction.prediction.toLowerCase()}`} aria-live="polite"><span>Predicted performance</span><strong>{prediction.prediction}</strong><p>{prediction.confidence}% model confidence</p><small>{prediction.recommendation}</small></section>}
    </section>}

    {teacherPanel === "students" && <section className="dashboard-card teacher-panel student-management-panel">
      <div className="dashboard-section-heading">
        <div><p className="eyebrow">Student management</p><h2>{selectedStudent ? "Student details" : "Student directory"}</h2></div>
        {selectedStudent && <button className="close-results" type="button" onClick={() => setSelectedStudent(null)}>Back to directory</button>}
      </div>
      {!selectedStudent ? <>
        <form className="student-search" onSubmit={(e) => { e.preventDefault(); loadManagedStudents(studentSearch); }}>
          <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search by Student ID or name" aria-label="Search by Student ID or name" />
          <button className="teacher-primary" type="submit">Search</button>
          {studentSearch && <button className="clear-search" type="button" onClick={() => { setStudentSearch(""); loadManagedStudents(""); }}>Clear</button>}
        </form>
        {studentManagementMessage && <p className="login-message">{studentManagementMessage}</p>}
        {studentsLoading ? <p className="directory-state">Loading student records...</p> : managedStudents.length > 0 ? <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Semester</th><th>Admission year</th><th>Status</th><th>Action</th></tr></thead><tbody>{managedStudents.map((student) => <tr key={student.student_id}><td><b>{student.student_id}</b></td><td>{student.name}</td><td>{student.email}</td><td>{student.department}</td><td>Semester {student.semester}</td><td>{student.admission_year}</td><td><span className="student-status">{student.status}</span></td><td><button className="view-student-button" type="button" onClick={() => viewStudentDetails(student.student_id)}>View details</button></td></tr>)}</tbody></table></div> : <p className="directory-state">No student records found. Register students through the student portal to see them here.</p>}
      </> : <div className="student-details">
        <section className="student-detail-hero"><div className="student-avatar" aria-hidden="true">{selectedStudent.student.name.charAt(0).toUpperCase()}</div><div><p className="card-label">Student profile</p><h3>{selectedStudent.student.name}</h3><span>{selectedStudent.student.student_id}</span></div><span className="student-status">{selectedStudent.student.status}</span></section>
        <div className="student-detail-grid"><article><h3>Personal information</h3><dl><div><dt>Email address</dt><dd>{selectedStudent.student.email}</dd></div><div><dt>Phone number</dt><dd>{selectedStudent.student.phone || "Not provided"}</dd></div></dl></article><article><h3>Enrollment information</h3><dl><div><dt>Department</dt><dd>{selectedStudent.student.department}</dd></div><div><dt>Current semester</dt><dd>Semester {selectedStudent.student.semester}</dd></div><div><dt>Admission year</dt><dd>{selectedStudent.student.admission_year}</dd></div></dl></article><article><h3>Academic information</h3><dl><div><dt>Academic status</dt><dd>{selectedStudent.academic.academicStatus}</dd></div><div><dt>Attendance</dt><dd>{selectedStudent.academic.attendance}</dd></div><div><dt>Results</dt><dd>{selectedStudent.academic.resultsStatus}</dd></div></dl></article></div>
      </div>}
      {studentDetailsLoading && <p className="directory-state">Loading student details...</p>}
    </section>}

    {teacherPanel === "classes" && <section className="dashboard-card teacher-panel"><div className="dashboard-section-heading"><div><p className="eyebrow">Timetable management</p><h2>Class schedule</h2></div></div>{timetableLoading && <p className="directory-state">Loading timetable...</p>}<form className="assignment-form timetable-form" onSubmit={handleAddTimetableClass}><div className="form-grid"><label className="form-field"><span>Department</span><select value={timetableForm.department} onChange={(e) => setTimetableForm({ ...timetableForm, department: e.target.value })}><option>BCA</option><option>B.A.</option><option>B.Sc.</option><option>BBA</option></select></label><label className="form-field"><span>Semester</span><select value={timetableForm.semester} onChange={(e) => setTimetableForm({ ...timetableForm, semester: e.target.value })}>{[1, 2, 3, 4, 5, 6].map((semester) => <option key={semester}>Semester {semester}</option>)}</select></label><label className="form-field"><span>Subject</span><input value={timetableForm.subject} onChange={(e) => setTimetableForm({ ...timetableForm, subject: e.target.value })} placeholder="e.g. Database Management" required /></label><label className="form-field"><span>Teacher</span><input value={timetableForm.teacher} onChange={(e) => setTimetableForm({ ...timetableForm, teacher: e.target.value })} placeholder="e.g. Dr. Rajesh Kumar" required /></label><label className="form-field"><span>Day</span><select value={timetableForm.day} onChange={(e) => setTimetableForm({ ...timetableForm, day: e.target.value })}><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option></select></label><label className="form-field"><span>Time</span><input value={timetableForm.time} onChange={(e) => setTimetableForm({ ...timetableForm, time: e.target.value })} placeholder="e.g. 10:00 - 11:00" required /></label><label className="form-field"><span>Room</span><input value={timetableForm.room} onChange={(e) => setTimetableForm({ ...timetableForm, room: e.target.value })} placeholder="e.g. 103" required /></label><label className="form-field"><span>Course code</span><input value={timetableForm.code} onChange={(e) => setTimetableForm({ ...timetableForm, code: e.target.value })} placeholder="e.g. BCA-204" required /></label><label className="form-field"><span>Students</span><input type="number" min="0" value={timetableForm.students} onChange={(e) => setTimetableForm({ ...timetableForm, students: e.target.value })} placeholder="e.g. 40" required /></label></div><button className="teacher-primary" type="submit" disabled={timetableLoading}>{timetableLoading ? "Saving..." : "Add Class Schedule"}</button></form>{timetableMessage && <p className="register-message" role="status">{timetableMessage}</p>}<div className="teacher-class-list">{timetableEntries.map((item, index) => <article key={`${item.id || item.code}-${index}`}><span className="course-code">{item.code || item.id}</span><div><h3>{item.subject}</h3><p>{item.department} · {item.semester} · {item.day}</p><small>Teacher: {item.teacher || "Assigned faculty"}</small></div><div><b>{item.time}</b><small>Room {item.room} · {item.students} students</small><button className="reject-button" type="button" onClick={() => handleDeleteTimetableClass(item.id)} disabled={timetableLoading}>Delete</button></div></article>)}</div></section>}

    {teacherPanel === "attendance" && <section className="dashboard-card teacher-panel"><div className="dashboard-section-heading"><div><p className="eyebrow">Daily attendance</p><h2>Mark attendance</h2></div><span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div>{attendanceLoading ? <p className="directory-state">Loading students...</p> : attendanceStudents.length > 0 ? <><div className="attendance-list">{attendanceStudents.map((student) => <label key={student.student_id}><span><b>{student.name}</b><small>{student.student_id} · {student.department}</small></span><select value={attendanceByStudent[student.student_id] || "Present"} onChange={(e) => setAttendanceByStudent({ ...attendanceByStudent, [student.student_id]: e.target.value })}><option>Present</option><option>Absent</option></select></label>)}</div><div className="teacher-result-summary"><button className="teacher-primary" type="button" onClick={handleRandomizeAttendance}>Randomize attendance</button><button className="teacher-primary" type="button" onClick={handleSaveAllAttendance} disabled={attendanceSaving}>{attendanceSaving ? "Saving..." : "Save attendance"}</button></div></> : <p className="directory-state">No students found.</p>}{attendanceMessage && <p className="register-message" role="status">{attendanceMessage}</p>}</section>}

    {teacherPanel === "assignments" && <section className="dashboard-card teacher-panel"><div className="dashboard-section-heading"><div><p className="eyebrow">Course work</p><h2>Create an assignment</h2></div></div><form className="assignment-form" onSubmit={(e) => { e.preventDefault(); setAssignmentMessage(`“${assignment.title}” has been published for students.`); setAssignment({ title: "", dueDate: "" }); }}><label className="form-field"><span>Assignment title</span><input value={assignment.title} onChange={(e) => setAssignment({ ...assignment, title: e.target.value })} placeholder="e.g. C programming fundamentals" required /></label><label className="form-field"><span>Due date</span><input type="date" value={assignment.dueDate} onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })} required /></label><button className="teacher-primary" type="submit">Publish assignment</button></form>{assignmentMessage && <p className="register-message">{assignmentMessage}</p>}</section>}

    {teacherPanel === "notices" && <section className="dashboard-card notices-panel"><div className="dashboard-section-heading"><div><p className="eyebrow">College updates</p><h2>Notice management</h2></div></div><form className="assignment-form notice-form" onSubmit={handlePublishNotice}><label className="form-field"><span>Notice title</span><input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} placeholder="e.g. Semester examination form submission" required /></label><label className="form-field"><span>Notice content</span><textarea value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} placeholder="Write the notice details" rows="4" required /></label><div className="form-grid"><label className="form-field"><span>Category</span><select value={noticeForm.category} onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}><option>College</option><option>Exam</option><option>Admission</option><option>Fees</option></select></label><label className="form-field"><span>Priority</span><select value={noticeForm.priority} onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}><option>Important</option><option>Priority</option><option>General</option></select></label></div><button className="teacher-primary" type="submit">{editingNoticeId ? "Update Notice" : "Publish Notice"}</button>{editingNoticeId && <button className="clear-search" type="button" onClick={() => { setEditingNoticeId(null); setNoticeForm({ title: "", content: "", category: "College", priority: "Important" }); }}>Cancel edit</button>}</form>{noticeMessage && <p className="register-message" role="status">{noticeMessage}</p>}<div className="notices-list"><div className="academic-block-heading"><h3>Latest notices</h3><span>College updates</span></div>{notices.map((notice) => <article className="notice-item" key={notice.id}><div className={`notice-category ${notice.category.toLowerCase()}`}>{notice.category}</div><div className="notice-content"><h3>{notice.title}</h3>{notice.content && <p>{notice.content}</p>}<time dateTime={notice.dateISO}>Published: {notice.date}</time></div><span className={`priority-label ${notice.priority.toLowerCase()}`}>{notice.priority}</span><div className="admission-actions"><button className="view-student-button" type="button" onClick={() => handleEditNotice(notice)}>Edit</button><button className="reject-button" type="button" onClick={() => handleDeleteNotice(notice.id)}>Delete</button></div></article>)}</div></section>}
  </main>
);

const studentPortalChoice = (
  <section id="portal-access" className="student-choice-section" aria-labelledby="student-choice-title">
    <div className="student-choice-shell">
      <div className="student-choice-heading">
        <p className="eyebrow">Student portal</p>
        <h2 id="student-choice-title">How would you like to continue?</h2>
        <p>Sign in to access your student dashboard. New students can create an account through the Admission Form.</p>
      </div>
      <div className="student-choice-grid">
        <article><div className="choice-icon" aria-hidden="true">SI</div><h3>Student login</h3><p>Access your academic details, results, fees, notices, and services.</p><button className="login-button" type="button" onClick={() => setPortalMode("student-login")}>Sign in to student portal</button></article>
      </div>
    </div>
  </section>
);

const loginForm = (
  <section id="portal-access" className="login-section" aria-labelledby="login-title">
    <div className="login-shell">
      <div className="login-intro">
        <span className="login-kicker">K.B. College, Bermo</span>
        <div className="login-symbol" aria-hidden="true">KB</div>
        <h2>Welcome to your student portal.</h2>
        <p>Access your academic profile, semester results, college notices, and services in one place.</p>
        <div className="login-features">
          <span>Academic details</span>
          <span>Results &amp; updates</span>
          <span>Secure access</span>
        </div>
      </div>

      {passwordResetMode ? <form onSubmit={handlePasswordReset} className="login-form">
        <div className="login-heading">
          <p className="eyebrow">Student account recovery</p>
          <h2 id="login-title">Forgot your password?</h2>
          <p>Enter your Student ID and registered email address to continue.</p>
        </div>
        <label className="login-field">
          <span>Student ID</span>
          <input
            type="text"
            value={passwordResetData.student_id}
            onChange={(e) => setPasswordResetData({ ...passwordResetData, student_id: e.target.value })}
            placeholder="Enter your student ID"
            required
          />
        </label>
        <label className="login-field">
          <span>Registered email</span>
          <input
            type="email"
            value={passwordResetData.email}
            onChange={(e) => setPasswordResetData({ ...passwordResetData, email: e.target.value })}
            placeholder="Enter your registered email"
            required
          />
        </label>
        <label className="login-field">
          <span>New password</span>
          <input
            type="password"
            value={passwordResetData.new_password}
            onChange={(e) => setPasswordResetData({ ...passwordResetData, new_password: e.target.value })}
            placeholder="Enter a new password"
            minLength="6"
            required
          />
        </label>
        <label className="login-field">
          <span>Confirm new password</span>
          <input
            type="password"
            value={passwordResetData.confirm_password}
            onChange={(e) => setPasswordResetData({ ...passwordResetData, confirm_password: e.target.value })}
            placeholder="Re-enter your new password"
            minLength="6"
            required
          />
        </label>
        <button className="login-button" type="submit">Reset Password <span aria-hidden="true">→</span></button>
        {passwordResetMessage && <p className="login-message" role="status">{passwordResetMessage}</p>}
        <button className="forgot-password-link" type="button" onClick={() => { setPasswordResetMode(false); setPasswordResetMessage(""); }}>Back to student login</button>
      </form> : <form onSubmit={handleLogin} className="login-form">
        <div className="login-heading">
          <p className="eyebrow">Student login</p>
          <h2 id="login-title">Sign in to continue</h2>
          <p>Use the credentials created during registration.</p>
        </div>
        <label className="login-field">
          <span>Student ID</span>
          <input
            type="text"
            name="student_id"
            placeholder="Enter your student ID"
            value={loginData.student_id}
            onChange={(e) => setLoginData({ ...loginData, student_id: e.target.value })}
            required
          />
        </label>
        <label className="login-field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
        </label>
        <button className="login-button" type="submit">Sign in to dashboard <span aria-hidden="true">→</span></button>
        <button className="forgot-password-link" type="button" onClick={() => { setPasswordResetMode(true); setLoginMessage(""); }}>Forgot password?</button>
        <p className="login-security">Your account is protected with secure student access.</p>
        {loginMessage && <p className="login-message" role="status">{loginMessage}</p>}
      </form>}
    </div>
  </section>
);
const teacherLoginForm = (
  <section id="portal-access" className="login-section teacher-login-section" aria-labelledby="teacher-login-title">
    <div className="login-shell">
      <div className="login-intro">
        <span className="login-kicker">K.B. College, Bermo</span>
        <div className="login-symbol" aria-hidden="true">KB</div>
        <h2>Welcome to your faculty portal.</h2>
        <p>Plan classes, mark attendance, publish assignments, and stay connected with your department.</p>
        <div className="login-features"><span>Class management</span><span>Student attendance</span><span>Academic updates</span></div>
      </div>
      {teacherPasswordResetMode ? <form onSubmit={handleTeacherPasswordReset} className="login-form">
        <div className="login-heading"><p className="eyebrow">Faculty account recovery</p><h2 id="teacher-login-title">Forgot your password?</h2><p>Enter your Teacher ID and registered email address to continue.</p></div>
        <label className="login-field"><span>Teacher ID</span><input type="text" value={teacherPasswordResetData.teacher_id} onChange={(e) => setTeacherPasswordResetData({ ...teacherPasswordResetData, teacher_id: e.target.value })} placeholder="e.g. TCH-001" required /></label>
        <label className="login-field"><span>Registered email</span><input type="email" value={teacherPasswordResetData.email} onChange={(e) => setTeacherPasswordResetData({ ...teacherPasswordResetData, email: e.target.value })} placeholder="Enter your registered email" required /></label>
        <label className="login-field"><span>New password</span><input type="password" value={teacherPasswordResetData.new_password} onChange={(e) => setTeacherPasswordResetData({ ...teacherPasswordResetData, new_password: e.target.value })} placeholder="Enter a new password" minLength="6" required /></label>
        <label className="login-field"><span>Confirm new password</span><input type="password" value={teacherPasswordResetData.confirm_password} onChange={(e) => setTeacherPasswordResetData({ ...teacherPasswordResetData, confirm_password: e.target.value })} placeholder="Re-enter your new password" minLength="6" required /></label>
        <button className="login-button" type="submit">Reset Password <span aria-hidden="true">→</span></button>
        {teacherPasswordResetMessage && <p className="login-message" role="status">{teacherPasswordResetMessage}</p>}
        <button className="forgot-password-link" type="button" onClick={() => { setTeacherPasswordResetMode(false); setTeacherPasswordResetMessage(""); }}>Back to teacher login</button>
      </form> : <form onSubmit={handleTeacherLogin} className="login-form">
        <div className="login-heading"><p className="eyebrow">Teacher login</p><h2 id="teacher-login-title">Sign in to continue</h2><p>Use your college-issued faculty credentials.</p></div>
        <label className="login-field"><span>Teacher ID</span><input type="text" value={teacherLoginData.teacher_id} onChange={(e) => setTeacherLoginData({ ...teacherLoginData, teacher_id: e.target.value })} placeholder="e.g. TCH-001" required /></label>
        <label className="login-field"><span>Password</span><input type="password" value={teacherLoginData.password} onChange={(e) => setTeacherLoginData({ ...teacherLoginData, password: e.target.value })} placeholder="Enter your password" required /></label>
        <button className="login-button" type="submit">Sign in to dashboard <span aria-hidden="true">→</span></button>
        <button className="forgot-password-link" type="button" onClick={() => { setTeacherPasswordResetMode(true); setTeacherLoginMessage(""); }}>Forgot Password?</button>
        <p className="login-security">Your account is protected with secure faculty access.</p>
        {teacherLoginMessage && <p className="login-message" role="status">{teacherLoginMessage}</p>}
      </form>}
    </div>
  </section>
);
const admissionFormView = (
  <section className="registration-section admission-form-section" aria-labelledby="admission-form-title">
    <div className="registration-shell">
      <aside className="registration-aside">
        <span className="registration-badge">Admission application</span>
        <div className="registration-mark" aria-hidden="true">KB</div>
        <p className="registration-college-name">Krishna Ballav College, Bermo</p>
        <h2>Complete your application.</h2>
        <p>Provide your personal and 12th qualification details for teacher review.</p>
        <ul><li><span>1</span> Add personal details</li><li><span>2</span> Enter qualification marks</li><li><span>3</span> Submit for review</li></ul>
      </aside>
      <form onSubmit={handleAdmissionSubmit} className="registration-form">
        <div className="form-heading"><p className="eyebrow">Student admission</p><h2 id="admission-form-title">Fill admission form</h2><p>Registered student: <b>{admissionForm.student_id}</b></p></div>
        <div className="form-grid">
          <label className="form-field"><span>Date of birth <b>*</b></span><input type="date" name="date_of_birth" value={admissionForm.date_of_birth} onChange={handleAdmissionChange} required /></label>
          <label className="form-field"><span>Gender <b>*</b></span><select name="gender" value={admissionForm.gender} onChange={handleAdmissionChange} required><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
          <label className="form-field form-field-wide"><span>Full address <b>*</b></span><input type="text" name="address" value={admissionForm.address} onChange={handleAdmissionChange} placeholder="House number, locality, district, state" required /></label>
          <label className="form-field"><span>Parent / guardian name <b>*</b></span><input type="text" name="guardian_name" value={admissionForm.guardian_name} onChange={handleAdmissionChange} required /></label>
          <label className="form-field"><span>Guardian phone <b>*</b></span><input type="tel" name="guardian_phone" value={admissionForm.guardian_phone} onChange={handleAdmissionChange} required /></label>
          <label className="form-field"><span>12th qualification <b>*</b></span><input type="text" name="qualification_12th" value={admissionForm.qualification_12th} onChange={handleAdmissionChange} placeholder="e.g. Intermediate / 12th" required /></label>
          <label className="form-field"><span>12th board <b>*</b></span><input type="text" name="board_12th" value={admissionForm.board_12th} onChange={handleAdmissionChange} placeholder="e.g. JAC / CBSE" required /></label>
          <label className="form-field"><span>12th marks (%) <b>*</b></span><input type="number" name="marks_12th" min="0" max="100" step="0.01" value={admissionForm.marks_12th} onChange={handleAdmissionChange} required /></label>
          <label className="form-field"><span>12th passing year <b>*</b></span><input type="number" name="passing_year_12th" min="2000" max="2035" value={admissionForm.passing_year_12th} onChange={handleAdmissionChange} required /></label>
        </div>
        <button className="register-button" type="submit">Submit admission application <span aria-hidden="true">→</span></button>
        {admissionFormMessage && <p className="register-message" role="status">{admissionFormMessage}</p>}
      </form>
    </div>
  </section>
);
const registrationForm = (
  <section id="portal-access" className="registration-section" aria-labelledby="registration-title">
    <div className="registration-shell">
      <aside className="registration-aside">
        <span className="registration-badge">2026–27 Admissions</span>
        <div className="registration-mark" aria-hidden="true">KB</div>
        <p className="registration-college-name">Krishna Ballav College, Bermo</p>
        <h2>Your journey starts here.</h2>
        <p>Create your student profile to begin your admission journey with K.B. College, Bermo.</p>
        <ul>
          <li><span>1</span> Fill in your academic details</li>
          <li><span>2</span> Submit your registration</li>
          <li><span>3</span> Receive admission updates</li>
        </ul>
        <div className="registration-help"><strong>Need help?</strong><br />Visit the college admission office.</div>
      </aside>

      <form onSubmit={handleRegister} className="registration-form">
        <div className="form-heading">
          <p className="eyebrow">Student portal</p>
          <h2 id="registration-title">Create student account</h2>
          <p>Enter your details below. Fields marked with <b>*</b> are required.</p>
        </div>

        <div className="form-grid">
          <label className="form-field">
            <span>Student ID <b>*</b></span>
            <input type="text" name="student_id" placeholder="e.g. KB2026001" value={student.student_id} onChange={handleStudentChange} required />
          </label>
          <label className="form-field">
            <span>Full name <b>*</b></span>
            <input type="text" name="name" placeholder="Enter your full name" value={student.name} onChange={handleStudentChange} required />
          </label>
          <label className="form-field">
            <span>Email address <b>*</b></span>
            <input type="email" name="email" placeholder="you@example.com" value={student.email} onChange={handleStudentChange} required />
          </label>
          <label className="form-field">
            <span>Phone number <b>*</b></span>
            <input type="tel" name="phone" placeholder="10-digit mobile number" value={student.phone} onChange={handleStudentChange} required />
          </label>
          <label className="form-field form-field-wide">
            <span>Create password <b>*</b></span>
            <input type="password" name="password" placeholder="Choose a secure password" value={student.password} onChange={handleStudentChange} required />
          </label>
          <label className="form-field">
            <span>Department <b>*</b></span>
            <select name="department" value={student.department} onChange={handleStudentChange}>
              <option value="BCA">BCA — Computer Applications</option>
              <option value="B.A.">B.A. — Arts</option>
              <option value="B.Sc.">B.Sc. — Science</option>
              <option value="BBA">BBA — Business Administration</option>
            </select>
          </label>
          <label className="form-field">
            <span>Semester <b>*</b></span>
            <input type="number" name="semester" min="1" max="6" value={student.semester} onChange={handleStudentChange} required />
          </label>
          <label className="form-field form-field-wide">
            <span>Admission year <b>*</b></span>
            <input type="number" name="admission_year" min="2020" max="2035" value={student.admission_year} onChange={handleStudentChange} required />
          </label>
        </div>

        <button className="register-button" type="submit">Create my student account <span aria-hidden="true">→</span></button>
        <p className="form-note">Your information is used only for college registration and admission communication.</p>
        {registerMessage && <p className="register-message" role="status">{registerMessage}</p>}
      </form>
    </div>
  </section>
);
  return (
    <div className="app">
      
      <header className="header">
        <a className="brand" href="#home" onClick={(event) => handlePublicNavigation(event, "home")} aria-label="K.B. College home">
          <span className="logo-box">
            <img src="/image/logo.jpg" alt="K.B. College Logo" />
          </span>

          <span>
            <strong>K.B. College, Bermo</strong>
            <small>Krishna Ballav College</small>
          </span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#home" onClick={(event) => handlePublicNavigation(event, "home")}>Home</a>
          <a href="#about" onClick={(event) => handlePublicNavigation(event, "about")}>About</a>
          <a href="#departments" onClick={(event) => handlePublicNavigation(event, "departments")}>Departments</a>
          <a href="#services" onClick={(event) => handlePublicNavigation(event, "services")}>Services</a>
          <a href="#admission" onClick={(event) => handlePublicNavigation(event, "admission")}>Admission</a>
          <a href="#services" onClick={(event) => handlePublicNavigation(event, "services")}>More</a>
        </nav>
      </header>
      {loggedInTeacher ? teacherDashboard : loggedInStudent ? studentDashboard : portalMode === "teacher" ? teacherLoginForm : portalMode === "student-choice" ? studentPortalChoice : portalMode === "student-login" ? loginForm : portalMode === "student-register" ? registrationForm : portalMode === "student-admission" ? admissionFormView : null}

      {!loggedInTeacher && !loggedInStudent && !portalMode && <>
      <main>
        <section id="home" className="hero">
          <img
            src="/image/events03.jpg"
            alt="K.B. College Bermo campus"
            className="hero-image"
          />
          {college && (
  <div className="backend-info">
    <h3>{college.fullName}</h3>
    <p>Established: {college.established}</p>
    <p>Location: {college.location}</p>
    <p>University: {college.university}</p>
  </div>
)}

          <div className="hero-content">
            <p className="eyebrow">Established 1964</p>
            <h1>K.B. College, Bermo</h1>
            <p className="hero-text">
              K.B. College, Bermo is a co-educational government constituent college in Jarangdih Colliery, Bokaro, Jharkhand, affiliated with Binod Bihari Mahto Koylanchal University, Dhanbad. Explore admissions, departments, notices, results, fees, facilities, and academic services.
            </p>

            <div className="hero-actions">
              <button type="button" className="main-button" onClick={() => openPortal("student-register")}>
                Apply for Admission
              </button>
              <a href="#services" onClick={(event) => handlePublicNavigation(event, "services")} className="ghost-button">
                View Services
              </a>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="College highlights">
          <div>
            <strong>60+</strong>
            <span>Years of academics</span>
          </div>
          <div>
            <strong>4</strong>
            <span>Core departments</span>
          </div>
          <div>
            <strong>24x7</strong>
            <span>Digital access</span>
          </div>
        </section>

        <section className="notice-strip" aria-label="Important updates">
          <strong>Important Updates</strong>
          <span>Admission, results, fee payment, and TC application services are available online.</span>
        </section>

        <section id="about" className="about section">
          <div className="section-heading">
            <p className="eyebrow">About the college</p>
            <h2>Krishna Ballav College, Bermo</h2>
          </div>

          <div className="about-container">
            <div className="about-image">
              <img src="/image/collage.jpg" alt="K.B. College building" />
            </div>

            <div className="about-text">
              <h3>A constituent college serving Bokaro district</h3>
              <p>
                Krishna Ballav College, Bermo, popularly known as K.B. College,
                Bermo, is a co-educational government constituent college
                located at Jarangdih Colliery in Bokaro, Jharkhand.
              </p>
              <p>
                The college is affiliated with Binod Bihari Mahto Koylanchal
                University, Dhanbad, and supports academic services through a
                simple digital portal.
              </p>
            </div>
          </div>
        </section>

        <section id="departments" className="departments section">
          <div className="section-heading">
            <p className="eyebrow">Programs</p>
            <h2>Our Departments</h2>
          </div>

          <div className="department-grid">
            {departments.map((department) => (
              <article className="department-card" key={department.code}>
                <div className="icon">{department.code}</div>
                <h3>{department.name}</h3>
                <p>{department.details}</p>
                <dl className="department-info">
                  <div><dt>Duration</dt><dd>{department.duration}</dd></div>
                  <div><dt>Eligibility</dt><dd>{department.eligibility}</dd></div>
                  <div><dt>Focus</dt><dd>{department.focus}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="services section">
          <div className="section-heading">
            <p className="eyebrow">Portal services</p>
            <h2>Student & Teacher Services</h2>
          </div>

          <div className="service-grid">
            {services.map(([title, details, code]) => (
              <article className="service-card" key={title}>
                <div className="service-icon">{code}</div>
                <h3>{title}</h3>
                <p>{details}</p>
                <button type="button" onClick={() => title === "Teacher Login" ? openPortal("teacher") : title === "Student Login" ? openPortal("student") : title === "TC Application" ? openTc() : title === "Results" ? openResults() : title === "Fees" ? openFees() : title === "Admission Form" ? openPortal("student-register") : undefined}>{title}</button>
              </article>
            ))}
          </div>
        </section>

        <section id="admission" className="admission">
          <div>
            <p className="eyebrow">Admissions open</p>
            <h2>Start your online admission application</h2>
            <p>
              Submit your registration details and track admission updates from
              the college portal.
            </p>
          </div>

          <button type="button" onClick={() => openPortal("student-register")}>Start Application</button>
        </section>
      </main>

      <footer>
        <h2>K.B. College, Bermo</h2>
        <p>Krishna Ballav College, Bermo | Jarangdih Colliery, Bokaro, Jharkhand</p>
        <p>&copy; 2026 K.B. College Bermo. College Management Portal.</p>
        <p>Developed by Manish Kr Mahto.</p>
      </footer>
      </>}
    </div>
  );
}

export default App;
