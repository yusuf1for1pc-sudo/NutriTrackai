# 🥗 NutriTrack AI  
### AI-Powered Food Calorie Tracker with RPG-Style Interface

NutriTrack AI is an interactive web application that estimates **calories and nutritional values from food images** using **AI-powered image analysis**. The application presents results through a **gamified RPG-style user interface**, transforming nutrition tracking into an engaging and immersive experience.

---

## 📌 Project Overview

NutriTrack AI allows users to upload images of their meals, which are analyzed using an AI vision model to identify food items and estimate calorie values. Instead of displaying plain numerical data, the application visualizes nutrition information using RPG-inspired elements such as progress bars and levels, improving user motivation and usability.

This project demonstrates the integration of modern frontend technologies with AI-based image analysis in a real-world health-tech use case.

🔗 Live Demo: https://nutri-trackai.vercel.app  
⚠️ Note: Authentication and backend services (Supabase) are paused in the live demo due to free-tier limitations. The application flow, UI design, and features can be fully experienced in local setup.

---

## 🎮 RPG-Style UI Concept

- Gamified progress indicators for daily calorie intake  
- Health and energy bars mapped to nutritional values  
- Level-based visualization to encourage healthy eating habits  
- Interactive and immersive UI design inspired by RPG mechanics  

---

## 🛠 Tech Stack

- **React** – Component-based frontend development  
- **TypeScript** – Type-safe application logic  
- **Vite** – Fast build tool and development server  
- **Tailwind CSS** – Utility-first responsive styling  
- **shadcn/ui** – Reusable and accessible UI components  
- **Google Gemini Vision API** – Image-based food analysis and calorie estimation  

---

## ⚙️ How It Works

1. User uploads a food image  
2. The image is processed using the Gemini Vision API  
3. AI identifies food items and estimates calorie values  
4. Nutrition data is mapped to RPG-style UI elements  
5. User progress updates dynamically  

---

## 🚀 Features

- Image-based calorie estimation using AI  
- RPG-style gamified user interface  
- Real-time nutrition feedback  
- Responsive and mobile-friendly design  
- Clean and scalable frontend architecture  

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run
```
git clone <YOUR_GITHUB_REPO_URL>
cd nutri-track-ai
npm install
npm run dev
The application will run at:

http://localhost:5173
🔐 Environment Variables
Create a .env file in the root directory:

VITE_GEMINI_API_KEY=your_api_key_here
```
🚀 Deployment
```
The project can be deployed on platforms such as:

Vercel

Netlify
```
Build command:
```
npm run build
```
👥 Team
```
This project was developed as a collaborative team project by:

Mohammed Yusuf Sayed

Kartik Mailaram

Ritesh Zagade
```
📄 License
```
This project is intended for educational and portfolio purposes.

This project is intended for educational and portfolio purposes.
