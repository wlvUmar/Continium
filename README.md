# Continuum - Goal Tracker

Frontend project for goal and time tracking application.

## 🚀 Quick Start

1. Open `index.html` in your browser
2. Navigate to `#/login` to see login page
3. Navigate to `#/app` to see dashboard

## 📁 Project Structure

```
continuum-project/
├── css/
│   └── styles.css       # All styles
├── js/
│   ├── router.js        # Hash router implementation
│   └── app.js           # Main application logic
├── assets/              # Images, icons, etc.
├── index.html           # Entry point
└── README.md            # This file
```

## 🛣️ Routes

- `#/login` - Login page
- `#/app` - Dashboard
- `#/goal/:id` - Goal details (dynamic route)

## 🔧 Router Usage

```javascript
// Register a route
router.on('/your-route', () => {
    // Your handler code
});

// Navigate programmatically
router.navigate('/your-route');

// Dynamic routes with parameters
router.on('/goal/:id', (params) => {
    console.log(params.id); // Access route parameter
});
```

## 📝 Development

For local development:
1. Use a local server (e.g., `python -m http.server 8000`)
2. Or use Live Server extension in VS Code
3. Open browser to `http://localhost:8000`

## 🎨 Customization

- Edit `css/styles.css` for styling
- Edit `js/app.js` for route handlers
- Edit `js/router.js` if you need to modify routing logic

## ✅ Features

- ✅ Hash-based routing
- ✅ Dynamic route parameters
- ✅ Clean folder structure
- ✅ Responsive design
- ✅ Basic layout containers

## 📦 No Build Required

This is a vanilla JavaScript project - no npm, webpack, or build tools needed!
Just open `index.html` and start coding.
