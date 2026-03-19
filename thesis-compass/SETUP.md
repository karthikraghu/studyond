# Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- `@anthropic-ai/sdk` - Claude LLM for profile extraction
- `@pinecone-database/pinecone` - Vector database for semantic matching
- `express` - Backend server
- `pdfjs-dist` - PDF parsing
- `multer` - File upload handling
- Other dependencies

### 2. Environment Configuration

Create a `.env` or `.env.local` file in the project root (copy from `.env.example`):

```bash
# You can use either .env or .env.local
cp .env.example .env
# OR
cp .env.example .env.local

# Then edit the file and add your actual API keys
```

The file should contain:
```env
# Anthropic API Key (required for AI-powered CV extraction)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Pinecone Configuration (required for semantic matching)
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_INDEX_NAME=studyond-brain
```

**Note:** The server supports both `.env` and `.env.local` files. If both exist, `.env.local` takes priority.

**Getting API Keys:**
- **Anthropic**: Sign up at https://console.anthropic.com/
- **Pinecone**: Sign up at https://www.pinecone.io/

**Note:** The system will work without API keys but with reduced functionality:
- Without Anthropic key: Uses heuristic keyword-based CV extraction (less accurate)
- Without Pinecone key: No semantic search (only field-based matching)

### 3. Start the Backend Server

```bash
npx tsx server.ts
```

The server will:
- Start on port 3001
- Initialize Pinecone and create the index if needed
- Index mock topics and supervisors for testing
- Set up API endpoints: `/api/process-cv` and `/api/match-profile`

### 4. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The frontend will start on port 5173 (or next available port).

## Testing the Integration

1. Navigate to http://localhost:5173
2. Start the onboarding flow and select "Student"
3. Upload a CV (PDF or TXT file)
4. The form should auto-fill with extracted profile data
5. Complete the onboarding to test the matching

## API Endpoints

### POST /api/process-cv
Upload and extract profile from CV

**Request:**
- Content-Type: multipart/form-data
- Body: file (max 5MB)

**Response:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "degree": "msc",
    "universityId": "uni-01",
    "skills": ["Python", "Machine Learning"],
    "fieldIds": ["field-03"],
    "objectives": ["thesis", "supervisor"],
    "semanticTags": ["ml-sustainability"]
  },
  "meta": {
    "fileName": "cv.pdf",
    "textLength": 2500
  }
}
```

### POST /api/match-profile
Find matching theses, supervisors, and companies

**Request:**
```json
{
  "profile": { /* StudentProfile object */ },
  "topK": 5
}
```

**Response:**
```json
{
  "matches": [
    {
      "topic": { /* TopicData */ },
      "supervisor": { /* SupervisorData */ },
      "company": { /* CompanyData */ },
      "scores": {
        "overall": 0.85,
        "semantic": 0.90,
        "fieldOverlap": 0.80,
        "degreeMatch": 1.0
      },
      "explanation": "Strong semantic match with AI/ML focus..."
    }
  ],
  "meta": {
    "totalMatches": 5,
    "searchTime": 245
  }
}
```

## Troubleshooting

### Port 3001 already in use
```bash
# Find and kill the process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Pinecone index not found
The server automatically creates the index on startup. If issues persist:
1. Check your Pinecone API key
2. Verify the index name in `.env`
3. Check server logs for initialization errors

### CV upload fails
1. Check file size (max 5MB)
2. Verify file type (PDF or TXT)
3. Check server logs for extraction errors
4. If using LLM extraction, verify ANTHROPIC_API_KEY

### No matches returned
1. Verify Pinecone is initialized (check server startup logs)
2. Ensure mock data was indexed (server logs show "Indexed X topics")
3. Try with different skills/fields in the profile
