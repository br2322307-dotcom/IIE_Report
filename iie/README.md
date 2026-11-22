# IIE Report - Project Blueprint

## 1. Overview
This is a full-stack web application designed for students to report campus and technical issues, and for administrators to manage and resolve them. The project is split into two main sections:
- **Frontend**: A React application powered by Vite.
- **Backend**: A Python Flask REST API connected to a MongoDB database.

## 2. File Structure & Connectivity

### Frontend (`/frontend`)
The frontend is built with React and manages the user interface, navigation, and state.

* **`vite.config.js`**: The configuration file for Vite. 
  * **Connection**: It sets up a proxy so that any API request to `/api` is seamlessly forwarded to the Flask backend running on `http://127.0.0.1:5000`. This solves Cross-Origin Resource Sharing (CORS) issues and connects the frontend and backend during development.
* **`src/main.jsx`**: The entry point for the React application. It mounts the `App` component to the HTML.
* **`src/App.jsx`**: The main router and state manager. 
  * **Connection**: It fetches session data from `/api/auth/me` (Flask) to check if the user is logged in. Based on the response, it uses `react-router-dom` to route the user to `/login`, `/student/dashboard`, or `/admin/dashboard` based on their role.
* **`src/index.css`**: Contains all the global styles and CSS variables used across all pages and components.
* **`src/components/Background.jsx`**: A reusable decorative grid background component using `styled-components`.

#### Pages (`src/pages/`)
* **`Home.jsx`**: The landing page displaying the project title and buttons to navigate to the Login page.
* **`Login.jsx`**: The authentication page. 
  * **Connection**: Sends user credentials (user_id and password) to the Flask backend (`POST /api/login`). On success, it updates the global user state in `App.jsx` and redirects the user to their respective dashboard.
* **`StudentDashboard.jsx`**: The workspace for students. 
  * **Connection**: Fetches issues from `GET /api/student/dashboard`. 
  * Allows creating new issues via `POST /api/issues`.
  * Allows deleting issues via `DELETE /api/issues/<id>`.
  * Allows confirming or rejecting issue fixes via `POST /api/issues/<id>/verify`.
* **`AdminDashboard.jsx`**: The workspace for admins.
  * **Connection**: Fetches all issues from `GET /api/admin/dashboard`.
  * Allows updating the status of any issue via `PUT /api/issues/<id>/status`.

### Backend (`/backend`)
The backend is built with Python Flask and handles business logic, security, and database operations.

* **`app.py`**: The main server file containing all API endpoints (Routes).
  * **Connection**: Receives HTTP requests from the React frontend, interacts with the MongoDB database to read/write data, and returns JSON responses back to the frontend. Manages secure user sessions.
* **`database/db.py`**: The database configuration file.
  * **Connection**: Connects to the MongoDB cluster using credentials from `.env`. Defines the `users_collection` and `issues_collection` which are imported by `app.py`. Also contains an initialization function to insert dummy data for testing.
* **`database/mongo.py`**: A small standalone script.
  * **Connection**: Used strictly for testing if the MongoDB server is reachable (pings the database).
* **`.env`** (Not visible in code, but used): Stores the secret `MONGODB_URI` so it isn't hardcoded in the script.

## 3. Data Flow Example (How they work together)
When a student creates a new issue, here is how the files talk to each other step-by-step:
1. User clicks "Submit" on the form inside **`StudentDashboard.jsx`**.
2. React sends a `POST` request with the form JSON data to `/api/issues`.
3. The Vite Proxy in **`vite.config.js`** catches the `/api` request and forwards it to the Flask server on port 5000.
4. **`app.py`** receives the request at `@app.route('/api/issues')`, validates the user's session securely, and extracts the data.
5. **`app.py`** uses the collection imported from **`database/db.py`** to insert the new document into the MongoDB database.
6. Flask returns a `{'success': True}` JSON response back to React.
7. **`StudentDashboard.jsx`** receives the success response and triggers a UI update to show the new issue instantly.
