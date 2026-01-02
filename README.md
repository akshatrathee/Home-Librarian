# 📚 BiblioPi: The AI Home Library

**BiblioPi** is a self-hosted "Home Book Library" application designed to run on a **Raspberry Pi**. It replaces spreadsheets and manual entry with AI-powered automation, helping you track reading habits, manage loans, and discover your next favorite book.

![Status](https://img.shields.io/badge/status-production-green)
![Stack](https://img.shields.io/badge/stack-React_Vite_Docker-blue)
![AI](https://img.shields.io/badge/AI-Gemini_%26_Ollama-purple)

---

## ✨ Features

This application includes a comprehensive suite of tools for the modern home librarian:

1.  **Smart Scanning**: Use your phone camera to scan book barcodes (ISBN) for instant addition.
2.  **AI Visual Recognition**: No barcode? Snap a photo of the cover. The AI identifies the book, pulls the summary, and auto-tags it.
3.  **Read Tracking**: Track "Read", "Unread", "DNF", and "Reading" status for every family member individually.
4.  **Family Profiles**: Create profiles for every family member. The app remembers their history, favorites, and reading habits.
5.  **Social Loans**: Loan books to friends with names and dates. The dashboard alerts you when books are overdue.
6.  **Condition Reporting**: Mark books with specific damages (e.g., "Water damage p.40") or general condition (New/Good/Poor).
7.  **Collector Details**: Track First Editions, Autographed copies, and special printings.
8.  **Valuation Tracking**: Logs the purchase price (with date) and uses AI to estimate current market value.
9.  **Precise Location**: Locate any book instantly. Supports hierarchy: Room -> Shelf -> Box.
10. **Visual Location Manager**: Create digital rooms and shelves to map your physical house.
11. **Analytics Dashboard**: Beautiful graphics showing:
    *   Total Books & Total Value
    *   Read counts by family member
    *   Genre & Author breakdowns
    *   Partially read books
12. **AI Profile Suggestions**: "Read Next" suggestions based on books *already in your library* that match the user's past habits.
13. **Smart Buy List**: A monthly "Buy Next" view where AI suggests top 10 books to purchase based on your specific taste and local availability.

---

## 🧠 AI Services Configuration

You can choose between Cloud AI (Google Gemini) or Local AI (Ollama) in the **Settings** menu.

### 1. Google Gemini (Recommended for Pi Zero/3/4)
*   **Pros**: Extremely fast, no RAM usage on Pi, high accuracy.
*   **Cons**: Requires Internet.
*   **API Key**: Get a free key at [aistudio.google.com](https://aistudio.google.com). Set via `API_KEY` env var.

### 2. Ollama (Recommended for Pi 5 / 8GB RAM)
*   **Pros**: 100% Private, Works offline.
*   **Cons**: Slower generation, requires good hardware.
*   **Setup**: Install [Ollama](https://ollama.com) on your Pi or network. No API key required, just the URL (default: `http://localhost:11434`).

### 3. Voice Recognition
*   The app uses the browser's native **Web Speech API** (free, built-in) for voice search. No API key required (unlike OpenAI Whisper).

---

## 🛠️ Installation

### Prerequisites
*   Docker & Docker Compose installed on your Raspberry Pi.

### Deployment
1.  **Clone the repo**:
    ```bash
    git clone https://github.com/your-username/bibliopi.git
    cd bibliopi
    ```

2.  **Set your API Key** (Optional, can be set in UI later):
    Create a `.env` file:
    ```bash
    API_KEY=your_google_api_key
    ```

3.  **Run with Docker**:
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the App**:
    Open your browser to `http://<raspberry-pi-ip>:9090`.

---

## ❓ FAQ

**Q: Is there a better framework than React 18 + Vite for this?**
A: For a self-hosted app on low-power hardware like a Raspberry Pi, **React + Vite** is currently the best choice.
*   **Next.js** requires a Node.js server running 24/7, consuming precious RAM.
*   **React + Vite** compiles to static HTML/JS. The "processing" happens on your phone/laptop, not the Pi. The Pi just serves files (using Nginx), which takes negligible resources.

**Q: How do I backup my data?**
A: Go to the **Maintenance** tab in the app and click "Download Backup". This gives you a JSON file of your entire library, users, and history.

**Q: The camera isn't working?**
A: Browsers require HTTPS to access the camera on mobile devices (unless using localhost). If accessing via IP address, you may need to set up a reverse proxy (like Nginx Proxy Manager) or use Tailscale to get a secure connection.