import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function App() {
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [codesFile, setCodesFile] = useState(null);
  const [attendanceResult, setAttendanceResult] = useState([]);
  const [analysisResult, setAnalysisResult] = useState([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const COLORS = ["#4caf50", "#f44336", "#ff9800", "#2196f3"];

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const processFiles = async () => {
    try {
      if (!attendanceFile || !codesFile) {
        setNotification({
          open: true,
          message: "Please upload both files!",
          severity: "error",
        });
        return;
      }
      setLoading(true);

      const codesData = await readExcelFile(codesFile);

      const columns = Object.keys(codesData[0] || {});
      const codeColumn = columns.find(
        (col) => col.includes("كود") || col.toLowerCase().includes("code")
      );
      const nameColumn = columns.find(
        (col) => col.includes("اسم") || col.toLowerCase().includes("name")
      );

      if (!codeColumn || !nameColumn) {
        setNotification({
          open: true,
          message: "Could not find required columns: 'الكود' or 'الاسم'.",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const cleanCodesData = codesData.map((entry) => ({
        الكود: parseInt(entry[codeColumn], 10) || "Unknown Code",
        الاسم: entry[nameColumn]?.toString().trim() || "Unknown Name",
      }));

      const attendanceData = await readDatFile(attendanceFile);

      const processedData = processAttendanceData(
        attendanceData,
        cleanCodesData
      );

      setAttendanceResult(processedData.data);
      setAnalysisResult(processedData.analysis);
      setTotalAttendance(processedData.totalAttendance);

      exportToExcel(processedData.data, "Processed_Attendance.xlsx");
      exportToExcel(processedData.analysis, "Attendance_Analysis.xlsx");

      setNotification({
        open: true,
        message: "Files processed successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error processing files:", error);
      setNotification({
        open: true,
        message: "Failed to process files.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        resolve(jsonData);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const readDatFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split("\n");
        const data = lines
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 3) {
              const employeeCode = parseInt(parts[0], 10);
              const timestamp = new Date(`${parts[1]}T${parts[2]}`);
              return { EmployeeCode: employeeCode, Timestamp: timestamp };
            }
            return null;
          })
          .filter((item) => item !== null);
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processAttendanceData = (attendanceData, codesData) => {
    const groupedData = groupBy(attendanceData, "EmployeeCode");

    const results = [];
    const analysis = [];

    for (const [code, records] of Object.entries(groupedData)) {
      const employeeInfo =
        codesData.find((entry) => entry["الكود"] === parseInt(code, 10)) || {};
      const groupedByDate = groupBy(records, (record) =>
        record.Timestamp.getHours() < 8
          ? new Date(record.Timestamp.setDate(record.Timestamp.getDate() - 1))
              .toISOString()
              .split("T")[0]
          : record.Timestamp.toISOString().split("T")[0]
      );

      Object.entries(groupedByDate).forEach(([date, dayRecords]) => {
        if (dayRecords.length >= 2) {
          const firstEntry = dayRecords.reduce((a, b) =>
            a.Timestamp < b.Timestamp ? a : b
          );
          const lastExit = dayRecords.reduce((a, b) =>
            a.Timestamp > b.Timestamp ? a : b
          );

          const durationHours = Math.abs(
            (lastExit.Timestamp - firstEntry.Timestamp) / 36e5
          );
          const shiftType =
            firstEntry.Timestamp.getHours() < 20 &&
            firstEntry.Timestamp.getHours() >= 8
              ? "صباحي"
              : "مسائي";

          // احتساب الحضور أو الغياب
          const isAbsent = durationHours < 8;

          results.push({
            الكود: code,
            الاسم: employeeInfo["الاسم"] || "Unknown",
            التاريخ: date,
            "وقت الدخول": firstEntry.Timestamp.toLocaleTimeString(),
            "وقت الخروج": lastExit.Timestamp.toLocaleTimeString(),
            "نوع الشيفت": shiftType,
            "عدد ساعات العمل": durationHours.toFixed(2),
            الحالة: isAbsent ? "غياب" : "حضور", // إضافة الحالة
          });
        }
      });

      const uniqueDates = Object.keys(groupedByDate);
      const singleEntries = uniqueDates.filter(
        (date) => groupedByDate[date].length === 1
      );

      analysis.push({
        الكود: code,
        الاسم: employeeInfo["الاسم"] || "Unknown",
        "عدد أيام الحضور": uniqueDates.length,
        "عدد أيام الغياب": 30 - uniqueDates.length,
        "عدد الأيام ببصمة واحدة": singleEntries.length,
      });
    }

    const totalAttendance = analysis.reduce(
      (sum, employee) => sum + employee["عدد أيام الحضور"],
      0
    );

    return {
      data: results,
      analysis: analysis,
      totalAttendance: totalAttendance,
    };
  };

  const groupBy = (array, key) =>
    array.reduce((result, currentValue) => {
      const groupKey =
        typeof key === "function" ? key(currentValue) : currentValue[key];
      (result[groupKey] = result[groupKey] || []).push(currentValue);
      return result;
    }, {});

  const exportToExcel = (data, fileName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      fileName
    );
  };

  return (
    <Box
      sx={{
        padding: 4,
        background: "linear-gradient(to bottom, #f5f7fa, #c3cfe2)",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2c3e50" }}
      >
        Attendance Dashboard
      </Typography>
      <Grid container spacing={4}>
        {/* File Upload and Process Section */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 4, padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload and Process Files
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Attendance File (.dat)
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, setAttendanceFile)}
                  />
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Codes File (Excel)
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleFileChange(e, setCodesFile)}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={processFiles}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AnalyticsIcon />
                  }
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? "Processing..." : "Process Files"}
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Dashboard */}
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Card sx={{ boxShadow: 4, padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Total Attendance</Typography>
                <Typography variant="h4" color="primary">
                  {totalAttendance}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ boxShadow: 4, padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Absent Days</Typography>
                <Typography variant="h4" color="error">
                  {analysisResult.reduce(
                    (sum, e) => sum + e["عدد أيام الغياب"],
                    0
                  )}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ boxShadow: 4, padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Single Entry Days</Typography>
                <Typography variant="h4" color="warning">
                  {analysisResult.reduce(
                    (sum, e) => sum + e["عدد الأيام ببصمة واحدة"],
                    0
                  )}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ boxShadow: 4, padding: 2, textAlign: "center" }}>
                <Typography variant="h6">Total Absences</Typography>
                <Typography variant="h4" color="error">
                  {
                    attendanceResult.filter((e) => e["الحالة"] === "غياب")
                      .length
                  }
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ boxShadow: 4, padding: 2, textAlign: "center"}}>
                <Typography variant="h6">Total Present</Typography>
                <Typography variant="h4" color="success">
                  {
                    attendanceResult.filter((e) => e["الحالة"] === "حضور")
                    .length
                    }
                    
                </Typography>
              </Card>

            </Grid>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4, padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance vs Absence
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "عدد الحضور",
                      value: attendanceResult.filter(
                        (e) => e["الحالة"] === "حضور"
                      ).length,
                    },
                    {
                      name: "عدد الغياب",
                      value: attendanceResult.filter(
                        (e) => e["الحالة"] === "غياب"
                      ).length,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 4, padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Work Hours
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(groupBy(attendanceResult, "التاريخ")).map(
                  ([date, records]) => ({
                    التاريخ: date,
                    الحضور: records.length,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="التاريخ" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="الحضور" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        {/* Data Table */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: 4, padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Attendance Details
            </Typography>
            <DataGrid
              rows={attendanceResult.map((entry, index) => ({
                id: index,
                ...entry,
              }))}
              columns={[
                { field: "الكود", headerName: "Code", width: 100 },
                { field: "الاسم", headerName: "Name", width: 200 },
                { field: "التاريخ", headerName: "Date", width: 150 },
                { field: "وقت الدخول", headerName: "Check-In", width: 150 },
                { field: "وقت الخروج", headerName: "Check-Out", width: 150 },
                { field: "نوع الشيفت", headerName: "Shift Type", width: 120 },
                {
                  field: "عدد ساعات العمل",
                  headerName: "Work Hours",
                  width: 150,
                },
                { field: "الحالة", headerName: "Status", width: 100 }, // عمود جديد للحالة
              ]}
              autoHeight
              pageSize={5}
              disableSelectionOnClick
            />
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
