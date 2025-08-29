'use client';
import useSWR from 'swr';
import { api } from './api';
export const useGet = <T>(path: string) => useSWR<T>(path, (p) => api<T>(p));
