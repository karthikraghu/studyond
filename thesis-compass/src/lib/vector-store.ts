/**
 * Vector Store — Pinecone Serverless Integration
 *
 * Uses Pinecone cloud vector DB with built-in inference API
 * for semantic embeddings (multilingual-e5-large).
 */

import { Pinecone, Index, RecordMetadata } from '@pinecone-database/pinecone';

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface DocumentMetadata extends RecordMetadata {
  text?: string;
  payload?: string;
  type?: string;
}

export class VectorStore {
  private pc: Pinecone | null = null;
  private index: Index<DocumentMetadata> | null = null;
  private indexName: string;
  private model: string;
  private logged = false;

  constructor(indexName = 'studyond-brain', model = 'multilingual-e5-large') {
    this.indexName = indexName;
    this.model = model;
  }

  async init(): Promise<void> {
    console.log('Connecting to Pinecone...');
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) throw new Error('Missing PINECONE_API_KEY in environment');

    this.pc = new Pinecone({ apiKey });

    const indexes = await this.pc.listIndexes();
    const exists = indexes.indexes?.find(i => i.name === this.indexName);

    if (!exists) {
      console.log(`Creating Pinecone index '${this.indexName}'...`);
      await this.pc.createIndex({
        name: this.indexName,
        dimension: 1024,
        metric: 'cosine',
        spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
      });
      await this.waitForIndexReady();
    }

    this.index = this.pc.index<DocumentMetadata>(this.indexName);
    console.log('✓ Connected to Pinecone');
  }

  private async waitForIndexReady(maxWaitSeconds = 120): Promise<void> {
    if (!this.pc) throw new Error('Pinecone not initialized');
    
    const start = Date.now();
    while (Date.now() - start < maxWaitSeconds * 1000) {
      try {
        const desc = await this.pc.describeIndex(this.indexName);
        if (desc.status?.ready) return;
      } catch {
        // Index not ready yet
      }
      await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error('Index creation timeout');
  }

  async countDocuments(): Promise<number> {
    if (!this.index) return 0;
    try {
      const stats = await this.index.describeIndexStats();
      return stats.totalRecordCount || 0;
    } catch {
      return 0;
    }
  }

  private async embed(text: string): Promise<number[]> {
    if (!this.pc) throw new Error('Pinecone not initialized');
    
    const result = await this.pc.inference.embed(
      this.model,
      [text],
      { inputType: 'passage', truncate: 'END' }
    );

    // Extract values and convert to plain array
    const rawValues = result[0].values;
    const values = Array.from(rawValues as Iterable<number>);

    if (!this.logged) {
      console.log('✓ Got embedding with', values.length, 'dimensions');
      this.logged = true;
    }

    return values;
  }

  async addDocument(
    id: string, 
    text: string, 
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.index) await this.init();
    if (!this.index) throw new Error('Failed to initialize index');
    if (!text?.trim()) return;

    const values = await this.embed(text);

    await this.index.upsert([{
      id,
      values,
      metadata: { 
        text: text.substring(0, 40000), 
        payload: JSON.stringify(metadata),
        type: (metadata.type as string) || 'unknown'
      }
    }]);
  }

  async search(queryText: string, topK = 5): Promise<VectorSearchResult[]> {
    if (!this.index) return [];

    const queryVector = await this.embed(queryText);
    if (!queryVector) return [];

    const results = await this.index.query({
      vector: queryVector,
      topK,
      includeMetadata: true
    });

    return (results.matches || []).map(r => ({
      id: r.id,
      score: r.score || 0,
      metadata: r.metadata?.payload ? JSON.parse(r.metadata.payload as string) : {}
    }));
  }

  async indexTopicsAndSupervisors(
    topics: Array<{ id: string; title: string; description: string; fieldIds: string[]; companyId?: string | null }>,
    supervisors: Array<{ id: string; firstName: string; lastName: string; title: string; researchInterests: string[]; fieldIds: string[] }>,
    companies: Array<{ id: string; name: string }>,
    fields: Array<{ id: string; name: string }>
  ): Promise<{ topicsIndexed: number; supervisorsIndexed: number }> {
    if (!this.index) await this.init();
    
    const expectedCount = topics.length + supervisors.length;
    const currentCount = await this.countDocuments();
    
    if (currentCount >= expectedCount) {
      console.log(`✅ Vector store already populated with ${currentCount} items. Skipping indexing.`);
      return { topicsIndexed: 0, supervisorsIndexed: 0 };
    }

    console.log(`📊 Indexing ${topics.length} topics and ${supervisors.length} supervisors...`);

    let topicsIndexed = 0;
    for (const topic of topics) {
      const companyName = topic.companyId
        ? companies.find(c => c.id === topic.companyId)?.name || ''
        : '';
      const fieldNames = (topic.fieldIds || [])
        .map(fid => fields.find(f => f.id === fid)?.name || '')
        .join(' ');
      const text = `${topic.title} ${topic.description} ${companyName} ${fieldNames}`;
      
      if (text.trim().length > 0) {
        await this.addDocument(`topic-${topic.id}`, text, { type: 'topic', ...topic });
        topicsIndexed++;
        if (topicsIndexed % 10 === 0) {
          console.log(`  Indexed ${topicsIndexed}/${topics.length} topics...`);
        }
      }
    }

    let supervisorsIndexed = 0;
    for (const sup of supervisors) {
      const fieldNames = (sup.fieldIds || [])
        .map(fid => fields.find(f => f.id === fid)?.name || '')
        .join(' ');
      const text = `${sup.title} ${sup.firstName} ${sup.lastName} ${sup.researchInterests.join(' ')} ${fieldNames}`;
      
      if (text.trim().length > 0) {
        await this.addDocument(`supervisor-${sup.id}`, text, { type: 'supervisor', ...sup });
        supervisorsIndexed++;
      }
    }

    console.log(`✅ Indexed ${topicsIndexed} topics and ${supervisorsIndexed} supervisors`);
    return { topicsIndexed, supervisorsIndexed };
  }
}

// Singleton instance
let vectorStoreInstance: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (!vectorStoreInstance) {
    vectorStoreInstance = new VectorStore(
      process.env.PINECONE_INDEX_NAME || 'studyond-brain'
    );
  }
  return vectorStoreInstance;
}

export async function initVectorStore(): Promise<VectorStore> {
  const store = getVectorStore();
  await store.init();
  return store;
}
