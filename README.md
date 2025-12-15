# 🏠 Open House Registration App

A modern, professional real estate open house registration system built with React and Firebase. Streamline your open house events with real-time guest tracking, broker information capture, and comprehensive admin management.

![Open House App](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-9.0+-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### **Public Registration Interface**
- 📋 Clean, mobile-responsive registration form
- 👤 Guest information capture (name, email, phone)
- 🏢 Buyer representation tracking
- 🚫 Do-Not-Call registry compliance
- 🎨 Customizable branding with logo and property photos
- 📧 Automated confirmation messages

### **Admin Dashboard**
- 📊 Real-time guest list with Firebase sync
- ✏️ Edit/delete guest records
- 📥 CSV export for CRM integration
- ⚙️ Complete settings customization
- 🖼️ Image upload with automatic compression
- 🔒 Password-protected admin access

### **Broker Information Tracking**
- 📝 Capture buyer's agent details
- 🏢 Company name and broker information
- 💼 Agency agreement status tracking
- 📋 Notes field for additional context

### **Design & UX**
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Modern gradient backgrounds
- 🌙 Professional Sotheby's-inspired aesthetic
- ⚡ Fast, optimized performance
- ♿ Accessible form controls

## 🛠️ Tech Stack

- **Frontend**: React 18.x
- **Backend**: Firebase Firestore (NoSQL database)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Hosting**: Vercel (recommended) / Firebase Hosting

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 16+ installed
- npm or yarn package manager
- A Firebase account (free tier works!)
- Basic knowledge of React

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Veobit/open-house-app.git
cd open-house-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Get your Firebase config credentials
5. Create a `.env.local` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Update Firebase Configuration

Edit `src/firebase.js` to use environment variables:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### 5. Run the Development Server
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📁 Project Structure
```
open-house-app/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main application component
│   ├── firebase.js         # Firebase configuration
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── .gitignore
├── package.json
└── README.md
```

## 🎯 Usage

### **For Guests (Public View)**

1. Navigate to the app URL
2. Fill out the registration form
3. Select Do-Not-Call status
4. Indicate buyer representation status
5. If represented, provide broker details
6. Submit registration
7. Receive confirmation message

### **For Realtors (Admin View)**

1. Click "Admin" button (top-right)
2. Enter password: `admin123` (default)
3. Access the admin dashboard
4. **Settings**: Customize welcome message, property address, upload logo/photos
5. **Guest List**: View, edit, or delete registrations
6. **Export**: Download guest list as CSV

## ⚙️ Configuration Options

### **Admin Settings**

- **Welcome Message**: Customize the greeting text
- **Property Address**: Display the property location
- **Logo**: Upload your brokerage logo (auto-compressed)
- **Realtor Photo**: Add your professional headshot
- **House Photo**: Background image for registration page
- **Realtor Name**: Display your name
- **Realtor Email**: Contact information
- **Email Template**: Customize confirmation message

### **Security**

⚠️ **Change the default admin password!**

In `src/App.js`, find the `handleAdminLogin` function and update:
```javascript
if (loginPassword === 'YOUR_NEW_PASSWORD') {
```

## 📤 Deployment

### **Deploy to Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard under Settings → Environment Variables.

### **Deploy to Firebase Hosting**
```bash
npm run build
firebase init hosting
firebase deploy
```

## 🔐 Firebase Security Rules

Add these security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /guests/{guest} {
      allow read, write: if true;
    }
    match /settings/{setting} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Note**: These rules allow public access. For production, implement proper authentication.

## 📊 Data Structure

### **Guest Document**
```javascript
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "(555) 123-4567",
  doNotCall: "No",
  hasAgencyAgreement: "Yes",
  brokerName: "Jane Smith",
  companyName: "ABC Realty",
  notes: "",
  timestamp: "2024-12-14T10:30:00.000Z"
}
```

### **Settings Document**
```javascript
{
  welcomeMessage: "Welcome to Our Open House!",
  propertyAddress: "123 Main St, City, State",
  logo: "base64_encoded_image",
  realtorPhoto: "base64_encoded_image",
  housePhoto: "base64_encoded_image",
  realtorName: "Your Name",
  realtorEmail: "you@example.com",
  emailTemplate: "Thank you for registering..."
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Kire Angjushev**
- GitHub: [@Veobit](https://github.com/Veobit)
- Organization: Veobit

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Firebase](https://firebase.google.com/)

## 📞 Support

For support, email kire.angjushev@veobit.com or create an issue in this repository.

---

**⭐ If you find this project helpful, please give it a star!**

Made with ❤️ for real estate professionals




# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
