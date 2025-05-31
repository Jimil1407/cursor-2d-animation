# Bolt - 2D Animation Platform

Bolt is a modern web application that enables users to create and manage 2D animations. The platform consists of a React-based frontend, a Python backend, and Firebase integration for data management.

## Project Structure

```
bolt/
├── frontend/           # React + TypeScript frontend application
├── backend/           # Python FastAPI backend
└── firebase/          # Firebase configuration and rules
```

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Firebase account
- Docker (optional, for containerized deployment)

## Frontend Setup

The frontend is built with React, TypeScript, and Vite.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Backend Setup

The backend is built with Python and FastAPI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python main.py
   ```

The backend API will be available at `http://localhost:8000`

## Firebase Setup

1. Create a new Firebase project in the Firebase Console
2. Download your service account key and place it in the backend directory as `serviceAccountKey.json`
3. Update the Firebase configuration in `backend/firebase_config.py`

## Key Features

- 2D Animation Creation
- Real-time Preview
- Animation Export
- User Authentication
- Project Management
- Payment Integration (Razorpay)

## API Documentation

### Main Endpoints

- `POST /api/animation/create` - Create a new animation
- `GET /api/animation/{id}` - Get animation details
- `PUT /api/animation/{id}` - Update animation
- `DELETE /api/animation/{id}` - Delete animation

For detailed API documentation, visit `http://localhost:8000/docs` when the backend server is running.

## Development

### Frontend Development

The frontend uses:
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- ESLint for code linting

### Backend Development

The backend uses:
- FastAPI for the web framework
- Firebase for authentication and database
- Manim for animation generation
- LLM integration for enhanced features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 