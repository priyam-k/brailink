import { documents, type Document, type InsertDocument } from "@shared/schema";

export interface IStorage {
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  updateDocument(id: number, doc: Partial<Document>): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private currentId: number;

  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const document: Document = {
      ...doc,
      id,
      status: "pending",
      isProcessed: false,
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async updateDocument(id: number, doc: Partial<Document>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...doc };
    this.documents.set(id, updated);
    return updated;
  }

  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
}

export const storage = new MemStorage();
