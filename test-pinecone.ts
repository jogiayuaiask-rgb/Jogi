import { Pinecone } from "@pinecone-database/pinecone";
const pc = new Pinecone();
const index = pc.Index("jogi-ayu-knowledge-base");
index.upsert({ records: [{ id: "1", values: [1,2,3] }] }); 
