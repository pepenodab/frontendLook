
# LookApp Frontend

This is the frontend for LookApp, built using **Expo (SDK 53)** with **TypeScript**. It’s structured using the `/app` folder and uses Expo Router.

## 🚀 Getting Started

Follow these steps to get the project up and running locally:

### 1. Clone the repo

```bash
git clone -b development https://github.com/pepenodab/frontendLook.git
cd frontendLook
```

> Make sure you're on the `development` branch — that’s where all the current work happens.

### 2. Install dependencies

Just run:

```bash
npm install
```

(or `yarn` if that’s your thing)

### 3. Start the app

Use the Expo CLI to launch the app:

```bash
npx expo start
```

That will open a browser window where you can choose to run the app on your phone (via QR code), an emulator, or in a web browser.

## 📱 Requirements

- Node.js (v18 or newer recommended)
- Expo CLI (`npm install -g expo-cli`)
- A phone with the **Expo Go** app (or an Android/iOS emulator)

## 🛠 Project Structure

This project uses **Expo Router**, so routing is handled by the files inside the `/app` directory. For example:

- `/app/login` → login screen
- `/app/register` → register screen
- `/app/home` → main screen after login
