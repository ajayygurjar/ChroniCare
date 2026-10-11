# 🏥 ChroniCare - Healthcare Management System

> A simple and easy-to-use healthcare platform that connects patients with doctors!

## 🎯 What is ChroniCare?

**ChroniCare** is a web application that helps patients and doctors manage healthcare more easily. Think of it like a digital clinic where:

- 👨‍⚕️ **Doctors** can see their patients, manage appointments, and write prescriptions
- 🙋‍♂️ **Patients** can book appointments, view their medical history, and see prescriptions
- 📅 **Everyone** can use the calendar to schedule and track appointments

### 🌐 **Try it Live!**
**[🚀 Visit ChroniCare →](https://chronicare-ffd95.web.app/)**

**Alternative Link:** [chronicare-ffd95.firebaseapp.com](https://chronicare-ffd95.firebaseapp.com/)

### 🎥 **Watch Demo Video**
**[📹 Watch Full Demo (8 mins)](https://www.loom.com/share/91a6872c5bd64d3ea6c68ea0971aab65)**

---

## ✨ What Can You Do?

### 🙋‍♂️ **As a Patient:**
- ✅ Create your account and login
- 📅 Book appointments with doctors
- 👀 See your upcoming appointments
- 📋 View your medical history
- 💊 Check prescriptions from doctors

### 👨‍⚕️ **As a Doctor:**
- ✅ Create your doctor account
- 👥 See all your patients
- 📅 Manage appointment requests (approve/reject)
- 📝 Add medical notes for patients
- 💊 Write prescriptions for patients

---

## 🛠️ Technologies Used

Don't worry if you don't know all of these - they're just the tools used to build this app:

- **React 19** - Makes the website interactive and fast
- **Node.js (Express) API** - The server that checks who you are and decides what you may see
- **PostgreSQL** - The database that stores everything (accounts, appointments, medical history, prescriptions)
- **Bootstrap 5** - Makes the website look nice and work on phones
- **Redux Toolkit** - Helps manage data across the app efficiently

---

## 🚀 How to Run This Project on Your Computer

### **Step 1: What You Need First**
Before starting, install these on your computer:
- **Node.js 22.18 or newer** (Download from [nodejs.org](https://nodejs.org/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))
- **Docker Desktop** (Download from [docker.com](https://www.docker.com/products/docker-desktop/)) - it runs the database

### **Step 2: Download the Project**
1. Open your terminal/command prompt
2. Type this command and press Enter:
   ```bash
   git clone https://github.com/ajayygurjar/ChroniCare.git
   ```
3. Go into the project folder:
   ```bash
   cd ChroniCare
   ```

### **Step 3: Start the Database and the API (the "back end")**
The website needs the API and the database running. From the project folder:
```bash
docker compose -f infra/docker-compose.yml up -d    # starts PostgreSQL
cd services/core-api
cp .env.example .env
npm install
npm run db:generate                                 # prepares the database code
npm run db:deploy                                   # creates the tables
npm run dev                                         # starts the API on http://localhost:4000
```
Leave that terminal open. (More details: [services/core-api/README.md](../../services/core-api/README.md).)

### **Step 4: Start the Website**
Open a **second** terminal in the project folder and type:
```bash
cd apps/web
npm install
npm run dev
```
*(No settings file is needed: the website forwards its requests to the API on its own.)*

### **Step 5: Open in Browser**
Open the address the terminal prints (usually `http://localhost:5173`; if that port is busy it prints another one).

Click **Create account**, sign up as a patient, and you are in. To try the doctor side, sign up a second account as a doctor.

🎉 **Congratulations! ChroniCare is now running on your computer!**

---

## 📁 Project Structure

```
chronicare/
├── 📁 src/
│   ├── 📁 components/     ← All the webpage pieces
│   │   ├── Auth/         ← Login & Signup pages
│   │   ├── Common/       ← Reusable components
│   │   ├── Doctor/       ← Doctor-specific features
│   │   ├── Patient/      ← Patient-specific features
│   │   ├── Appointments/ ← Booking & calendar
│   │   └── Layout/       ← Header, sidebar, navigation
│   ├── 📁 Pages/         ← Main pages (Dashboard, Contact)
│   ├── 📁 hooks/         ← Reusable code pieces
│   └── 📄 App.jsx        ← Main app file
├── 📁 store/             ← Where app data is managed
├── 📁 utils/             ← Helper tools and functions
└── 📄 package.json       ← List of project dependencies
```

---

## 🎮 How to Use the App

### **🔐 Creating Accounts**

**For testing, load the demo accounts into your local database** (in `services/core-api`, run `npm run db:seed`):

**Patient Demo Account:**
- Email: `demo.patient@example.com`
- Password: `Demo-password-1`

**Doctor Demo Account:**
- Email: `demo.doctor@example.com` 
- Password: `Demo-password-1`

*(They come with a few sample appointments, a record and a prescription. They only exist on your own computer.)*

**Or Create Your Own Account:**

1. **For Patients:**
   - Click "Sign Up"
   - Choose "Patient" as your role
   - Fill in your details (name, date of birth, contact info)
   - Click "Create Account"

2. **For Doctors:**
   - Click "Sign Up" 
   - Choose "Doctor" as your role
   - Add your specialization (like "Cardiologist", "General Physician")
   - Fill in experience years
   - Click "Create Account"

### **📅 Booking Appointments (Patients)**
1. Login to your patient account
2. Go to "Appointments" from sidebar
3. Click "Book New Appointment"
4. Choose a doctor from the dropdown
5. Pick a date and time
6. Write reason for visit
7. Click "Book Appointment"
8. Wait for doctor to confirm!

### **👨‍⚕️ Managing Appointments (Doctors)**
1. Login to your doctor account
2. Go to "Appointments" from sidebar
3. You'll see appointment requests from patients
4. Click "Confirm" to approve or "Cancel" to reject
5. Mark completed appointments as "Complete"

### **📋 Medical Records**
- **Patients:** Add your own medical history in "Medical History" section
- **Doctors:** View patient history and add prescriptions when treating them

---

## 🔧 Common Issues & Solutions

### **❌ Problem: "npm install" doesn't work**
**✅ Solution:** Make sure you have Node.js installed. Download it from [nodejs.org](https://nodejs.org/)

### **❌ Problem: "Cannot reach the server" or the page keeps loading**
**✅ Solution:** 
1. Make sure the API is running (Step 3). Open `http://localhost:4000/ready` - it should say `ready`
2. If it says the database is unavailable, start it: `docker compose -f infra/docker-compose.yml up -d`
3. Open browser developer tools (F12) to see error messages

### **❌ Problem: The API says the database is not reachable**
**✅ Solution:** 
1. Make sure Docker Desktop is running
2. Check `services/core-api/.env` - it should match `.env.example`
3. Run `npm run db:deploy` in `services/core-api` to create the tables

### **❌ Problem: Can't login**
**✅ Solution:**
1. Make sure you created the account with the correct role (Patient/Doctor) and picked the same role on the login screen
2. Check if email and password are correct (passwords are at least 8 characters)
3. After many wrong attempts the API pauses logins for a few minutes

### **❌ Problem: Appointments not showing**
**✅ Solution:**
1. Make sure you're logged in with the correct account
2. Check if appointments were created with the right user ID
3. Refresh the page and try again

---

## 🎯 Key Features Explained

### **📊 Dashboard**
- Shows welcome message with your name
- Displays your important information at a glance
- Quick access to main features
- Statistics about your appointments

### **📅 Appointments System**
- **Calendar View:** See appointments like a real calendar
- **List View:** See all appointments in a simple list
- **Status Colors:** 
  - 🟢 Green = Confirmed
  - 🟡 Yellow = Pending 
  - 🔴 Red = Cancelled
  - 🔵 Blue = Completed

### **📋 Medical History**
- Patients can add their own medical records
- Doctors can see patient history when treating them
- All records are saved in the PostgreSQL database; a doctor can only open patients who have an appointment with them
- Include diagnosis, notes, and dates

### **💊 Prescriptions**
- Doctors can write digital prescriptions
- Patients can see all their prescriptions
- Includes medicine name, timing, and meal instructions
- Shows which doctor prescribed what medicine

---

## 📱 Mobile Friendly

ChroniCare works great on mobile phones and tablets:
- **Responsive design** that adapts to your screen size
- **Touch-friendly buttons** easy to tap
- **Mobile navigation** with hamburger menu
- **Optimized forms** that work well on mobile keyboards

Test it on your phone: [chronicare-ffd95.web.app](https://chronicare-ffd95.web.app/)

---

## 🚀 Deployment

The website is a static build, hosted on **Firebase Hosting** which provides:
- ⚡ **Fast loading** with global CDN
- 🔒 **HTTPS security** by default  
- 🌐 **Custom domain** support
- 📊 **Analytics** and monitoring

**Live URLs:**
- Primary: [chronicare-ffd95.web.app](https://chronicare-ffd95.web.app/)
- Alternative: [chronicare-ffd95.firebaseapp.com](https://chronicare-ffd95.firebaseapp.com/)

> ⚠️ **The live site is the earlier version, which still talks to Firebase.** The current code needs the
> Node.js API and PostgreSQL, so do **not** run `firebase deploy` for this version until the API is hosted
> somewhere and `/api` on your domain is forwarded to it (the plan: a gateway in front of both).

---

## 🎓 What You Can Learn from This Project

**Beginner Level:**
- ✅ How to build a complete web application
- ✅ User authentication (login/signup)
- ✅ Database operations (save/retrieve data)
- ✅ Responsive design (works on phones and computers)

**Intermediate Level:**
- ✅ React Hooks and state management
- ✅ Redux for complex state handling
- ✅ Talking to a REST API with token-based sign-in
- ✅ Component-based architecture

**Advanced Level:**
- ✅ Real-world project structure
- ✅ Role-based authentication
- ✅ API integration patterns
- ✅ Production deployment

---

## 🤝 Need Help?

### **If You're Stuck:**
1. **Read the error message carefully** - it often tells you what's wrong
2. **Check the browser console** (Press F12 → Console tab)
3. **Google the error** - someone else probably had the same problem
4. **Try the demo accounts** provided above to test functionality

### **Great Resources for Help:**
- [React Documentation](https://react.dev/) - Official React guide
- [Express](https://expressjs.com/) and [Prisma](https://www.prisma.io/docs) - the API and its database layer
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - the database
- [Stack Overflow](https://stackoverflow.com/) - Programming Q&A
- [MDN Web Docs](https://developer.mozilla.org/) - Web development reference

---

## 🎉 Project Highlights

This ChroniCare project demonstrates:

- ✅ **Full-stack development** with modern tools
- ✅ **Real-world problem solving** in healthcare
- ✅ **Professional code organization** 
- ✅ **Responsive design** for all devices
- ✅ **Secure authentication** and data handling
- ✅ **A real back end**: Node.js API, PostgreSQL, role-based access rules and automated tests
- ✅ **User-friendly interface** for both patients and doctors

**Perfect for showing employers what you can build!** 💼

---

## 📝 Project Checklist

Use this checklist to make sure everything works:

- [ ] ✅ Website loads at [chronicare-ffd95.web.app](https://chronicare-ffd95.web.app/)
- [ ] 👤 Can create patient account
- [ ] 👨‍⚕️ Can create doctor account  
- [ ] 🔐 Login works for both roles
- [ ] 📅 Patients can book appointments
- [ ] ✅ Doctors can confirm appointments
- [ ] 📋 Medical history shows correctly
- [ ] 💊 Prescription system works
- [ ] 📱 Website works on mobile phones
- [ ] 🌐 All pages load properly

---

## 📊 Technical Specifications

- **Frontend Framework:** React 19.1.0
- **State Management:** Redux Toolkit 2.8.2
- **Styling:** Bootstrap 5.3.7
- **Backend:** Node.js 22, Express 5, Prisma 7 (`services/core-api`)
- **Database:** PostgreSQL 17
- **Authentication:** short-lived JWT access tokens and a rotating httpOnly refresh cookie
- **Hosting:** Firebase Hosting (website only)
- **Build Tool:** Vite 7.0.4

---

<div align="center">
  <h3>🌟 Thank you for checking out ChroniCare! 🌟</h3>
  <p>This project represents modern healthcare management built with cutting-edge web technologies.</p>
  <p><strong>🚀 Visit the live app: <a href="https://chronicare-ffd95.web.app/">chronicare-ffd95.web.app</a></strong></p>
  
  <br>
  
  <p><em>Made with ❤️ for better healthcare management</em></p>
  
  <p>
    <strong>Star this project if you found it helpful! ⭐</strong>
  </p>
</div>