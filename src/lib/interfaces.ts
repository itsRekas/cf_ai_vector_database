export interface Env {
    VECTOR_KV: KVNamespace;
    AI: any;
}

export interface InsertRequest {
  id: string;
  text: string;
}

export interface QueryRequest {
  text: string;
  top_k?: number;
}

export interface DeleteRequest {
  id: string;
}