import axios from "axios";
import type { Asset } from "@/types";
// import { mockHODUser, mockEmployeeUser, mockAssets, mockUsers, mockLoginLogs } from "./mockData";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export async function login(email: string, password: string) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('user', JSON.stringify(data.user));
  // The current API does not issue JWTs; keep a lightweight session flag for client routing.
  localStorage.setItem('token', 'session');
  return data;
}

export async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Assets API
export async function fetchAssets() {
  const res = await fetch('/api/assets');
  if (!res.ok) {
    throw new Error('Failed to fetch assets');
  }
  return await res.json();
}

export async function editAsset(id: number, updatedData: Partial<Asset>) {
  const res = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error || 'Failed to edit asset');
  }
  return await res.json();
}

export async function fetchAssetLists() {
  const res = await fetch('/api/assets/lists');
  if (!res.ok) {
    throw new Error('Failed to fetch asset lists');
  }
  return await res.json();
}

type AddAssetPayload = {
  year_of_purchase: number | null;
  item_name: string;
  quantity: number;
  inventory_number: string;
  room_number: string;
  floor_number: string;
  building_block: string;
  remarks: string;
  department_origin: 'own' | 'other';
};

export async function addAsset(assetData: AddAssetPayload) {
  const res = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assetData),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error || 'Failed to add asset');
  }
  return await res.json();
}

// Users API (HOD only)
export async function fetchUsers() {
  const res = await fetch('/api/users');
  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }
  return await res.json();
}

export async function addUser(userData: {
  name: string;
  email: string;
  password: string;
  role: "hod" | "employee";
}) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error || 'Registration failed');
  }
  return await res.json();
}

export async function resetUserPassword(userId: number, newPassword: string) {
  const res = await fetch(`/api/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error || 'Failed to reset password');
  }
  return await res.json();
}

export async function deleteUser(userId: number) {
  const res = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = (await res.json()) as { error?: string };
    throw new Error(body.error || 'Failed to delete user');
  }
  return await res.json();
}

// Logs API (HOD only)
export async function fetchLoginLogs() {
  const res = await fetch('/api/logs');
  if (!res.ok) {
    throw new Error('Failed to fetch login logs');
  }
  return await res.json();
}

export default api; 