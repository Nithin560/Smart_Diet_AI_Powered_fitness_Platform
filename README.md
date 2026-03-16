# Smart Food Diet System 🥗✨

A premium, AI-powered nutrition platform that provides personalized meal and workout recommendations based on your health goals and local weather conditions.

## Features
- **Smart Health Score**: Proprietary algorithm evaluating your daily plan alignment.
- **AI Recommendations**: Personalized meal suggestions (Veg/Non-Veg).
- **Weather Integration**: Dynamic plan adjustments based on local environmental factors.
- **Premium UI**: Modern glassmorphism design with Framer Motion animations.
- **Progress Tracking**: Visual charts for weight and nutrient intake.
- **Grocery List**: Auto-generated shopping lists from your meal plan.

---

## Getting Started 🚀

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB instance (Local or Atlas)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` (Create if missing):
   ```env
   MONGO_URI=your_mongodb_uri
   SECRET_KEY=your_secret_key
   WEATHER_API_KEY=your_openweather_key
   GEMINI_API_KEY=your_google_ai_key
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## Algorithm: Smart Health Score 🧠
Our unique algorithm evaluates your daily plan across 4 dimensions:
1. **Calorie Precision**: How close you are to your TDEE target.
2. **Protein Saturation**: Meeting muscle recovery requirements.
3. **Weather Bio-reactivity**: Adjusting nutrients for hydration or thermogenesis.
4. **Workout Balance**: Ensuring the plan fuels the specific muscle groups targeted.

---

## Project Structure
- `backend/`: FastAPI server, MongoDB models, and Recommendation services.
- `frontend/`: React components, Framer Motion animations, and Recharts visualization.
- `database/`: Seed data and MongoDB connection logic.
