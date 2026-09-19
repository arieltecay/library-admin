import type { School, CreateSchoolPayload, UpdateSchoolPayload } from '../../api/schools';

export type { School, CreateSchoolPayload, UpdateSchoolPayload };

export interface SchoolFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface SchoolListResponse {
  items: School[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PosLoginUrl {
  url: string;
  slug: string;
}