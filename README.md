# **Attendance Dashboard Application**

A highly responsive and professional React-based web application for managing and analyzing employee attendance data. This app allows users to upload attendance records, process them seamlessly, and visualize attendance statistics through dynamic charts and data tables.

---

## **Features**
- 📂 **File Upload**:
  - Supports `.dat` for attendance logs.
  - Supports `.xlsx` for employee code and name mapping.
- 📊 **Data Visualization**:
  - **Pie Charts**: Show attendance vs. absence breakdown.
  - **Bar Charts**: Visualize daily attendance statistics.
- 📑 **Dynamic Tables**:
  - Detailed, sortable, and paginated attendance tables.
- 📋 **Excel Export**:
  - Download processed data and analysis reports as `.xlsx` files.
- ⚡ **Responsive Design**:
  - Fully optimized for all screen sizes (mobile, tablet, and desktop).
- 🟢 **Modern UI**:
  - Built with Material-UI for a clean and user-friendly interface.

---

## **Technologies Used**
- **React.js**: Core framework for building the UI.
- **Material-UI**: For creating polished and responsive components.
- **Recharts**: For beautiful, interactive charts.
- **XLSX.js**: To parse and generate Excel files.
- **FileSaver.js**: To enable file downloads in the browser.

---

## **Installation and Setup**

Follow the steps below to set up and run the project locally:

### 1. **Clone the Repository**
```bash
git clone https://github.com/seifmoustafa/Attendance.git
cd Attendance
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Run the Application**
```bash
npm start
```
The application will be available at `http://localhost:3000`.

---

## **Usage**

### **1. Upload Files**
- **Attendance File (.dat)**: Contains timestamped attendance logs.
- **Employee Codes File (.xlsx)**: Contains mappings of employee codes to names.

### **2. Process Files**
Click the **Process Files** button to:
- Parse uploaded files and clean data.
- Compute attendance statistics (e.g., work hours, absences, single-entry days).
- Generate data for tables and charts.

### **3. View Results**
- **Dashboard Cards**: Summary of attendance, absences, and other key metrics.
- **Charts**: Visual breakdowns of attendance data.
- **Tables**: Detailed, row-by-row attendance information.

### **4. Export Results**
- Download processed attendance data and analysis as Excel files.

---

## **Screenshots**

### **Dashboard Overview**
![Dashboard](https://via.placeholder.com/800x400)  
_Interactive dashboard showcasing attendance statistics._

### **File Upload Section**
![File Upload](https://via.placeholder.com/800x400)  
_Upload `.dat` and `.xlsx` files for data processing._

### **Charts**
![Charts](https://via.placeholder.com/800x400)  
_Dynamic pie and bar charts visualizing attendance data._

---

## **Data File Formats**

### **1. Attendance File (.dat)**
Expected format:
```plaintext
12345 2024-12-01 08:00:00
12345 2024-12-01 20:00:00
23456 2024-12-01 07:30:00
```
- `12345`: Employee code.
- `2024-12-01`: Date.
- `08:00:00`: Check-in/check-out time.

### **2. Employee Codes File (.xlsx)**
Expected columns:
| **Code**  | **Name**       |
|-----------|----------------|
| 12345     | John Doe       |
| 23456     | Jane Smith     |

---

## **Folder Structure**

```plaintext
src/
├── components/           # Reusable React components
├── assets/               # Images, icons, and static assets
├── utils/                # Helper functions (file parsing, grouping, etc.)
├── App.js                # Main app component
├── index.js              # Entry point
├── styles/               # Custom styles
└── README.md             # Documentation
```

---

## **Contributing**

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add a concise description of your changes"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request on the GitHub repository.

---

## **Author**

- **Seif Moustafa**  
  - GitHub: [github.com/seifmoustafa](https://github.com/seifmoustafa)  
  - Email: [seif.moustafa516@gmail.com](mailto:seif.moustafa516@gmail.com)  
  - LinkedIn: [linkedin.com/in/seif-moustafa-60115f/](https://www.linkedin.com/in/seif-moustafa-60115f/)

---

## **Support**

For any issues, please [open an issue](https://github.com/seifmoustafa/Attendance/issues) on GitHub.  
Feel free to connect via [LinkedIn](https://www.linkedin.com/in/seif-moustafa-60115f/) for further inquiries or collaboration.

---

## **License**
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
