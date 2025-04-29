# Novel By You - AI Interactive Novel Generator

An AI-based interactive novel generator that allows users to choose different styles and then decide the story's direction by selecting plot branches.

## Project Features

- Multiple Novel Styles: Wuxia, Sci-Fi Exploration, Fantasy Magic, Mystery Thriller, etc.
- Rich Interactive Choices: Users can make choices within the story, influencing its development.
- Smooth User Experience: Beautiful interface, seamless story transitions.
- History Tracking: Saves the user's reading history within the current session for easy review or continuation.

## New Features

### 1. Keyword-Based AI Response Parsing

- Modified AI interaction logic, no longer relying on strict JSON format.
- Uses keywords (`novelstory:`, `options:`, `structure_thinking:`, `preference_thinking:`) and specific delimiters (`.`) to extract content from AI responses.
- Implemented robust parsing logic capable of handling various potential AI output formats.

### 2. Novel Structure Thinking

- After the user selects a style, the system generates an initial novel structure outline.
- When the user's choice count reaches a threshold (default is 5), the AI analyzes the current plot and adjusts the subsequent structure.
- The structure outline is kept within the current session and provided to the AI for reference during story continuation.

### 3. User Preference Analysis

- The system records all user choices within the current session and analyzes user preferences after reaching the threshold.
- The AI can adjust subsequent plots and options based on the analysis results to better align the story with user preferences.
- Preference analysis results are currently logged to the console (for debugging purposes only).

## Tech Stack

- Frontend: React, TailwindCSS, Zustand
- AI: Configurable AI Service (e.g., Gemini, OpenAI, Groq, etc.)

## Installation and Setup

1.  **Clone the Project**
    ```bash
    git clone https://github.com/TangQi001/novel_by_you.git
    cd novel_by_you
    ```

2.  **Install Dependencies**
    Using `pnpm` is recommended:
    ```bash
    pnpm install
    ```
    Alternatively, use `npm` or `yarn`:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    *   Copy the environment variable template file:
        ```bash
        cp .env.example .env.local
        ```
    *   Edit the `.env.local` file and fill in **all required** AI service configuration details. Refer to the comments within the file for guidance:
        *   `VITE_AI_API_KEY`: Your AI service API key.
        *   `VITE_AI_CREATIVE_MODEL_NAME` / `ENDPOINT`: AI model name and API endpoint for the "Creative" style.
        *   `VITE_AI_PRECISE_MODEL_NAME` / `ENDPOINT`: AI model name and API endpoint for the "Precise" style.
        *   `VITE_AI_BALANCED_MODEL_NAME` / `ENDPOINT`: AI model name and API endpoint for the "Balanced" style.
        *   `VITE_STRUCTURE_THINKING_THRESHOLD` (Optional): Threshold for triggering structure thinking, defaults to 5.

4.  **Run the Development Server**
    ```bash
    pnpm dev
    # or
    npm run dev
    # or
    yarn dev
    ```
    The application will start locally, typically at `http://localhost:5173`.

## Core Features

- 🎭 Multiple Novel Styles: Choose from various genres like Wuxia, Sci-Fi, Fantasy, Mystery, etc.
- 🔄 Interactive Storytelling: Every choice impacts the story's direction.
- 💾 Session History: Automatically saves reading history within the current browser session.
- 🌓 Dark/Light Theme: Switch themes for a comfortable reading experience.
- 📱 Responsive Design: Works perfectly on various device sizes.

## Tech Stack (Detailed)

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI (Potentially used for primitives)
- **Icons**: Lucide React
- **Type Checking**: TypeScript

## Project Structure

```
src/
├── components/      # React components
├── data/           # Static data (e.g., novel style definitions)
├── lib/            # Utility libraries (Supabase client removed)
├── services/       # Service layer (e.g., AI interaction logic)
├── store/          # State management (Zustand stores)
├── types/          # TypeScript type definitions
└── App.tsx         # Main application component
└── main.tsx        # Application render entry point
└── index.css       # Global CSS
```

## Deployment

The project can be deployed using Vercel, Netlify, or other platforms supporting Vite applications.

**Build Command**: `npm run build` (or `pnpm build`, `yarn build`)
**Output Directory**: `dist`

Ensure all required environment variables (mainly AI service related) are correctly configured on the deployment platform.

## Contribution Guide

1. Fork the project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)