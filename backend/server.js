const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const session = require("express-session");
const sessionFileStore = require("session-file-store")(session);

const studentRoutes = require("./routes/studentRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const classRoutes = require("./routes/classRoutes.js");
const subjectRoutes = require("./routes/subjectRoutes.js");
const courseRoutes = require("./routes/courseRoutes.js");
const parentRoutes = require("./routes/parentRoutes.js");
const timetableRoutes = require("./routes/timetableRoutes.js");
const teacherRoutes = require("./routes/teacherRoutes.js");
const classroomRoutes = require("./routes/classroomRoutes.js");
const inscriptionRoutes = require("./routes/inscriptionRoutes");
const deleteExpiredInscriptions = require("./controllers/inscriptionControllers.js");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes.js");
const eventRoutes = require("./routes/eventRoutes");
const announcementRoutes = require("./routes/announcementRoutes.js");
const absenceRoutes = require("./routes/absenceRoutes.js");
const attendanceReportRoutes = require("./routes/attendanceReportRoutes.js");
const gradeRoutes = require("./routes/gradeRoutes.js");
const bulletinRoutes = require("./routes/bulletinRoutes.js");
const performanceReportRoutes = require("./routes/performanceReportRoutes.js");
const financialReportRoutes = require("./routes/financialReportRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const paiementRoutes = require("./routes/paiementRoutes.js");

require("dotenv").config();
require("./config/connect.js");
const cron = require("node-cron");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

app.use(session({
  store: new sessionFileStore({
    path: './sessions', 
    ttl: 86400 
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/students", studentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/inscriptions", inscriptionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/absences", absenceRoutes);
app.use("/api/attendancereports", attendanceReportRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/bulletins", bulletinRoutes);
app.use("/api/performancereports", performanceReportRoutes);
app.use("/api/financialreports", financialReportRoutes);
app.use("/api/dashboards", dashboardRoutes);
app.use("/api/paiements", paiementRoutes);

app.use(express.static('public'));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("sendMessage", (message) => {
    io.emit("newMessage", message);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
