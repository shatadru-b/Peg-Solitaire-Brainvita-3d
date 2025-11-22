# Glassy Brainvita 3D

A stunning 3D implementation of the classic Peg Solitaire (Brainvita) game built with React, Three.js, and React Three Fiber.

## 🎮 Features

- **3D Graphics**: Realistic glass marbles with refraction and a procedurally generated wooden board.
- **Interactive Gameplay**: Click-to-move mechanics with valid move highlighting.
- **Undo/Redo**: Full history support to step backward and forward through moves.
- **PWA Support**: Installable as a native-like app on Android and iOS.
- **Glassmorphism UI**: Modern, sleek interface overlay.

## 🚀 How to Run

This project uses ES Modules and Import Maps via CDN. No complex build step (like Webpack or Vite) is strictly required to view the development version, but it must be served via a local web server to handle module loading correctly.

### Option 1: VS Code Live Server
1. Open the project folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and select "Open with Live Server".

### Option 2: Node.js Serve
```bash
npx serve .
```

### Option 3: Python
```bash
# Python 3
python -m http.server 8000
```

## 📱 Installation (Android/iOS)
1. Open the hosted URL on your mobile browser.
2. Select "Add to Home Screen" or "Install App" from the browser menu.
3. Launch from your home screen for a full-screen experience.

## 🛠️ Tech Stack
- **React 19**
- **Three.js**
- **React Three Fiber**
- **Tailwind CSS** (via CDN)
