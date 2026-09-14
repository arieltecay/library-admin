export interface Pos {
  id: string;
  name: string;
  code: string;
  school: string;
  active: boolean;
  createdAt: string;
}

export interface PosListResponse {
  items: Pos[];
  total: number;
}

export interface CreatePosPayload {
  name: string;
  code: string;
}

export interface UpdatePosPayload {
  name?: string;
  active?: boolean;
}
