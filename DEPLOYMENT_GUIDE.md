# Step-by-Step Cloud Deployment Guide

This guide walks you through deploying the complete **Three-Tier Student Information Management System** across **MongoDB Atlas**, **Render**, and **Netlify** using your GitHub account (`harshalgaulkar`).

---

## 📋 Phase 1: MongoDB Atlas Setup (`harshalgaulkar43@gmail.com`)

1. **Log in / Sign Up:**
   - Go to [https://cloud.mongodb.com](https://cloud.mongodb.com).
   - Sign in using **`harshalgaulkar43@gmail.com`**.

2. **Create a Free Cluster (M0 Sandbox):**
   - Click **Create Database**.
   - Select **M0 Free Tier**.
   - Cloud Provider: **AWS**, Region: (choose nearest, e.g., `ap-south-1` Mumbai).
   - Cluster Name: `Cluster0` (or `StudentCluster`).
   - Click **Create Deployment**.

3. **Configure Database User:**
   - In **Security > Database Access**:
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g., `harshal_admin` (or `harshal`).
   - Password: Choose a strong password (note it down safely).
   - Role: **Read and write to any database** (or Atlas admin).
   - Click **Add User**.

4. **Configure Network Access (IP Whitelist):**
   - In **Security > Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) — required because Render cloud IP addresses change dynamically.
   - Click **Confirm**.

5. **Obtain Connection String:**
   - Go to **Database > Clusters**.
   - Click **Connect** next to your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```text
     mongodb+srv://harshal_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```
   - Update it to specify the `studentDB` database:
     ```text
     mongodb+srv://harshal_admin:<password>@cluster0.abcde.mongodb.net/studentDB?retryWrites=true&w=majority
     ```

---

## 🐙 Phase 2: Push Project to GitHub (`harshalgaulkar`)

1. Ensure the code is committed locally (this project is configured for your personal account `harshalgaulkar` and not any organization).
2. Create a new repository on your GitHub account:
   - Go to [https://github.com/new](https://github.com/new).
   - Repository name: `three-tier-student-management`
   - Description: `Design and Deployment of a Three-Tier Web Application Using Netlify, Render, and MongoDB Atlas`
   - Visibility: **Public**
   - Do NOT initialize with README (we already have a complete one).
3. Push using your Git terminal:
   ```bash
   git remote add origin https://github.com/harshalgaulkar/three-tier-student-management.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Phase 3: Deploy Backend on Render (Tier 2 - Application Layer)

1. **Sign in to Render:**
   - Go to [https://dashboard.render.com](https://dashboard.render.com).
   - Sign in with your GitHub account (`harshalgaulkar`).

2. **Create New Web Service:**
   - Click **New +** > **Web Service**.
   - Select **Build and deploy from a Git repository**.
   - Connect your repository: `harshalgaulkar/three-tier-student-management`.

3. **Configure Service Details:**
   - **Name:** `student-management-api`
   - **Region:** Singapore / Frankfurt / Oregon (nearest to user).
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

4. **Add Environment Variables:**
   Under **Environment Variables**, add:
   - `MONGODB_URI`: `<Your MongoDB connection string from Phase 1>`
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `*` (or update after Netlify deployment in Phase 4).

5. **Deploy:**
   - Click **Create Web Service**.
   - Render will build and deploy the service.
   - Once completed, copy your public backend URL:
     `https://student-management-api.onrender.com`

---

## 🌐 Phase 4: Deploy Frontend on Netlify (Tier 1 - Presentation Layer)

1. **Sign in to Netlify:**
   - Go to [https://app.netlify.com](https://app.netlify.com).
   - Sign in with your GitHub account.

2. **Import Repository:**
   - Click **Add new site** > **Import an existing project**.
   - Select **GitHub** and authorize access to `harshalgaulkar/three-tier-student-management`.

3. **Configure Build Settings:**
   - **Branch to deploy:** `main`
   - **Base directory:** `frontend`
   - **Build command:** *(leave empty)*
   - **Publish directory:** `frontend` (or `.` when base directory is `frontend`).

4. **Deploy Site:**
   - Click **Deploy site**.
   - Netlify will assign a public domain, e.g., `https://student-management-harshal.netlify.app`.

5. **Connect Frontend to Render Backend:**
   - Open your deployed Netlify site in a browser.
   - Click **API Config** in the top right navbar.
   - Enter your Render backend URL (e.g., `https://student-management-api.onrender.com`).
   - Click **Save URL** and **Test Connection**.

6. **Lock Down Backend CORS (Recommended for Production):**
   - In Render Dashboard > your service > **Environment Variables**:
   - Update `FRONTEND_URL` to your exact Netlify domain:
     `https://student-management-harshal.netlify.app`
   - Save changes to automatically redeploy Render.

---

## 🧪 Phase 5: Verification & End-to-End Test Cases

| Test Case | Action | Input Data | Expected Result |
| :--- | :--- | :--- | :--- |
| **Test Case 1** | Add Student | `ID: ST101`, `Name: Rahul Sharma`, `Department: Computer Science`, `Sem: 5`, `Contact: 9876543210` | "Student added successfully" toast, record appears in directory. |
| **Test Case 2** | Display Students | Reload page or click **Refresh** | All student records loaded from MongoDB Atlas via Render API. |
| **Test Case 3** | Search Student | Type `ST101` in the search bar | Table filters in real-time showing Rahul Sharma. |
| **Test Case 4** | Update Student | Click **Edit** icon, change `Semester` to `6` | "Student updated successfully", semester displays `Sem 6`. |
| **Test Case 5** | Delete Student | Click **Delete** icon, confirm deletion | "Student deleted successfully", record removed from table. |
| **Test Case 6** | MongoDB Atlas Verification | Open Atlas > Collections > `studentDB.students` | Confirm records reflect operations made from Netlify UI. |
