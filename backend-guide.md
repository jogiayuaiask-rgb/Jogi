# JOGI Ayu AI - Backend Integration Guide

This guide outlines the architecture and steps required to integrate the requested backend services (Pinecone, Firebase, MongoDB, Neon, and Gemini API) into the JOGI Ayu AI platform.

## Architecture Overview

The system uses a multi-database architecture for different storage needs:
1. **Firebase Firestore & Auth**: User authentication, chat history persistence, and real-time frontend syncing.
2. **MongoDB**: Document metadata storage, ingestion logs, and complex JSON structured data.
3. **Neon (PostgreSQL)**: Transactional data, user subscriptions, admin roles, and structured relational queries.
4. **Pinecone**: Vector database for storing document chunk embeddings (RAG).
5. **Google Gemini API**: LLM for text generation (Chat) and text embeddings for Pinecone indexing.

## 1. Firebase Integration
Used for auth and chat logs.
- Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
- Enable Authentication and Firestore.
- In `src/lib/firebase.ts`, the app connects to Firestore using `jogi_chat_logs` collection.
- Ensure your `firebase_config` is set properly.

## 2. Pinecone (Vector DB)
Used for RAG search.
- Go to [Pinecone Console](https://app.pinecone.io/) and create an index with dimension `768` (matching Gemini embeddings).
- Install SDK: `npm install @pinecone-database/pinecone`
- In `server.ts`, initialize:
  ```typescript
  import { Pinecone } from '@pinecone-database/pinecone';
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index('jogi-ayu-knowledge');
  ```

## 3. MongoDB (Document Metadata)
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Install SDK: `npm install mongodb`
- Use MongoDB to store the raw document text and ingestion event history instead of in-memory stores.
  ```typescript
  import { MongoClient } from 'mongodb';
  const client = new MongoClient(process.env.MONGO_URI);
  const db = client.db('jogi_ayu');
  ```

## 4. Neon (PostgreSQL)
- Create a project on [Neon](https://neon.tech/).
- Install Drizzle ORM and Postgres SDK: `npm install drizzle-orm @neondatabase/serverless`
- Use Neon to store users, admin permissions, and billing info.
  ```typescript
  import { neon } from '@neondatabase/serverless';
  import { drizzle } from 'drizzle-orm/neon-http';
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  ```

## 5. Google Cloud & Gemini API
- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Enable the Gemini API.
- Set `GEMINI_API_KEY` in your `.env`.
- Note: The app's `server.ts` is already fully wired to use `@google/genai` for chat responses and embeddings.

## Environment Variables
Create a `.env` file in the root directory:
```env
# AI Models
GEMINI_API_KEY=your_gemini_key

# Vector DB
PINECONE_API_KEY=your_pinecone_key

# NoSQL & Realtime
FIREBASE_API_KEY=...
MONGO_URI=mongodb+srv://...

# Relational DB
DATABASE_URL=postgres://... (neon)
```
