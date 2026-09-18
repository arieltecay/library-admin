export interface School {
  id: string;
  name: string;
  code: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolListResponse {
  items: School[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSchoolPayload {
  name: string;
  code: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSchoolPayload {
  name?: string;
  code?: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}
