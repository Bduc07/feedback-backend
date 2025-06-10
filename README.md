
# Feedback System Backend

This backend handles secure and efficient feedback management for the application with the following features:

### Key Features

- **Password Hashing:** User passwords are securely hashed before storing in the database to ensure data safety.
- **Private Routing:** Protected API routes that require authentication to access, ensuring only authorized users can perform certain actions.
- **Role-Based Login:** Different user roles (e.g., admin, student) have controlled access to features based on their permissions.
- **User Login and Enrollment:** Users can register, login, and enroll in courses or feedback sessions securely.
- **Feedback Management:** Supports creating, submitting, and managing feedback from users with proper validation and storage.

### Technologies Used

- Node.js & Express.js for server-side logic.
- Secure authentication with hashed passwords.
- Middleware for role-based access control.
- Database integration for user and feedback data.

---

This backend ensures secure and organized handling of user feedback, tailored by user roles and permissions.
