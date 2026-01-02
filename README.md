# 📚 Home Librarian: The AI Home Library

**Home Librarian** is a self-hosted "Home Book Library" application designed to run on a **Raspberry Pi**. It replaces spreadsheets and manual entry with AI-powered automation, helping you track reading habits, manage loans, and discover your next favorite book.

![Status](https://img.shields.io/badge/status-production-green)
![Stack](https://img.shields.io/badge/stack-React_Vite_Docker-blue)
![AI](https://img.shields.io/badge/AI-Gemini_%26_Ollama-purple)

---

## 🏗️ Tech Stack & Versions

We use the latest stable versions of modern web technologies to ensure performance on low-power devices.

*   **Runtime**: Docker Compose V2 & Node.js 20 (Alpine)
*   **Frontend**: React 18.3+
*   **Build Tool**: Vite 5.4+
*   **Language**: TypeScript 5.5+
*   **Styling**: Tailwind CSS 3.4+
*   **Server**: Nginx (Alpine)
*   **AI SDK**: Google GenAI SDK (`@google/genai`) v0.2+

---

## ✨ Features

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
11. **Analytics Dashboard**: Beautiful graphics showing stats by genre, author, value, and reading habits.
12. **AI Profile Suggestions**: "Read Next" suggestions based on books *already in your library*.
13. **Smart Buy List**: Monthly "Buy Next" view where AI suggests books to purchase based on your taste.

---

## 🧠 AI Services Configuration

### 1. Google Gemini (Recommended)
*   **Pros**: Extremely fast, no RAM usage on Pi, high accuracy.
*   **Setup**: Get a free key at [aistudio.google.com](https://aistudio.google.com) and set `API_KEY` in your `.env` file.

### 2. Ollama (Local LLM)
*   **Pros**: 100% Private, Works offline.
*   **Setup**: Install [Ollama](https://ollama.com). Point the app to your Ollama URL (default `http://localhost:11434`).
*   **Recommended Models**: `llama3.2`, `mistral`, or `gemma2` (optimized for Pi 5 / 8GB RAM).

---

## 🛠️ Installation

### Prerequisites
*   Docker Desktop or Docker Engine + Docker Compose Plugin (V2).

### Deployment

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/your-username/home-librarian.git
    cd home-librarian
    ```

2.  **Configure Environment**:
    Create your environment file:
    ```bash
    cp .env.example .env
    # Edit .env and add your API_KEY
    ```

3.  **Run with Docker Compose**:
    ```bash
    docker compose up -d --build
    ```

4.  **Access the App**:
    Open your browser to `http://<raspberry-pi-ip>:9090`.

---

## 🔒 Remote Access (Tailscale)

For secure access outside your home without opening ports or configuring complex VPNs:

1.  **Install Tailscale on your Raspberry Pi**:
    ```bash
    curl -fsSL https://tailscale.com/install.sh | sh
    sudo tailscale up
    ```

2.  **Install Tailscale on your Client (Phone/Laptop)**:
    Download the Tailscale app from the App Store or tailscale.com.

3.  **Access the App**:
    Find your Pi's "Tailscale IP" (usually `100.x.y.z`) in the Tailscale dashboard.
    Open `http://100.x.y.z:9090` in your browser.

4.  **Important Note for Cameras**:
    Modern browsers (Chrome/Safari) block camera access on "insecure" origins (http:// not localhost).
    To fix this via Tailscale, use **Tailscale Serve** to get a valid HTTPS certificate:
    ```bash
    sudo tailscale serve --bg --https=443 localhost:9090
    ```
    Now you can access via `https://your-pi-name.tailscale.net`.

---

## ❓ FAQ

**Q: Why use Nginx?**
A: Nginx serves the static React files extremely efficiently and handles Gzip compression, which is crucial for loading the app quickly on mobile networks.

**Q: How do I backup my data?**
A: Go to the **Maintenance** tab in the app and click "Download Backup". This gives you a JSON file of your entire library.
