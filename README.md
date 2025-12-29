# Student Management System Frontend

This project is a frontend application for managing student information. It allows users to view, add, edit, and delete student records. The application is built using HTML, CSS, and JavaScript.

## Project Structure

```
student-management-frontend
├── src
│   ├── index.html          # Main entry point of the application
│   ├── css
│   │   └── styles.css      # Styles for the application
│   ├── js
│   │   └── app.js          # JavaScript for handling user interactions
│   ├── components
│   │   ├── header.html      # Header section of the application
│   │   ├── student-list.html # Displays the list of students
│   │   └── student-form.html # Form for adding/updating student details
│   └── data
│       └── students.json    # Sample student data in JSON format
├── package.json             # npm configuration file
├── .gitignore               # Files and directories to ignore in version control
└── README.md                # Documentation for the project
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd student-management-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Open the application:**
   Open `src/index.html` in your web browser to view the application.

## Usage

- **View Students:** The application displays a list of students with their details.
- **Add Student:** Use the form to add a new student to the list.
- **Edit Student:** Click on the edit option next to a student to update their information.
- **Delete Student:** Remove a student from the list using the delete option.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.