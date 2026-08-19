const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const backendIntegrations = `
// ============================================================================
// MULTI-DATABASE BACKEND SYSTEM INTEGRATIONS (STUBS)
// Required by Architecture: Pinecone, Firebase, MongoDB, Neon Base, Gemini API
// ============================================================================

// 1. Pinecone Vector DB Stub
class PineconeClientStub {
  constructor(apiKey) { this.apiKey = apiKey; }
  index(name) { return { upsert: async () => {}, query: async () => [] }; }
}
const pinecone = new PineconeClientStub(process.env.PINECONE_API_KEY || 'mock');

// 2. MongoDB Document Metadata Stub
class MongoClientStub {
  constructor(uri) { this.uri = uri; }
  db(name) { return { collection: (name) => ({ insertOne: async () => {}, find: () => ({ toArray: async () => [] }) }) }; }
}
const mongoClient = new MongoClientStub(process.env.MONGO_URI || 'mock');

// 3. Neon Serverless Postgres Stub
const neonSqlStub = (query, params) => Promise.resolve([]);
const neonDb = { select: () => ({ from: () => Promise.resolve([]) }) }; // Drizzle mock

// 4. Firebase is integrated on the client-side via src/lib/firebase.ts
// ============================================================================
`;

code = code.replace("import path from \"path\";\n\nconst app = express();", "import path from \"path\";\n\n" + backendIntegrations + "\nconst app = express();");

fs.writeFileSync('server.ts', code);
