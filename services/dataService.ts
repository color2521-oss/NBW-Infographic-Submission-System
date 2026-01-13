
import { Student, Assignment, Submission, Announcement, INITIAL_ASSIGNMENTS } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbzUU9cV-wH183mtqy1iNGw-TMDTjS8EIEpyjbLiapdWe-xM6ukkEMQjLN8GfpWZ970jfA/exec";

// Utility สำหรับแปลงค่าจาก Spreadsheet (ที่อาจเป็น String "TRUE"/"FALSE") ให้เป็น Boolean ของจริง
export const parseBool = (val: any): boolean => {
  if (val === true || val === 'true' || val === 'TRUE' || val === 1 || val === '1') return true;
  return false;
};

export const formatDriveUrl = (url: string, size: string = 's400'): string => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url; 
  const driveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=${size}`;
  }
  return url;
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const apiCall = async (action: string, payload: any = {}): Promise<any> => {
  try {
    const response = await fetch(API_URL, {
      redirect: "follow",
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload }),
    });
    if (!response.ok) throw new Error(`Server status ${response.status}`);
    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error("ระบบตอบกลับไม่ถูกต้อง กรุณาตรวจสอบการ Deploy (New Deployment)");
    }
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  } catch (error: any) {
    console.error(`API Error (${action}):`, error);
    if (action.startsWith('get')) return []; 
    throw error;
  }
};

export const getStudents = async (room?: string): Promise<Student[]> => await apiCall('getStudents', { room });
export const registerStudent = async (student: Student): Promise<void> => {
  await apiCall('registerStudent', { ...student, id: student.id || generateUUID(), number: Number(student.number) });
};
export const deleteStudent = async (studentId: string, room: string): Promise<void> => await apiCall('deleteStudent', { studentId, room });

export const getAssignments = async (): Promise<Assignment[]> => {
  try {
    const fetched = await apiCall('getAssignments');
    const safeFetched = Array.isArray(fetched) ? fetched : [];
    const merged = INITIAL_ASSIGNMENTS.map(init => {
      const found = safeFetched.find((f: any) => String(f.id) === String(init.id));
      return found ? { ...init, title: found.title || init.title, maxScore: Number(found.maxScore) || init.maxScore } : init;
    });
    const extras = safeFetched.filter((f: any) => !INITIAL_ASSIGNMENTS.some(i => String(i.id) === String(f.id)));
    return [...merged, ...extras].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  } catch (error) { return INITIAL_ASSIGNMENTS; }
};

export const updateAssignment = async (assignment: Assignment): Promise<void> => {
  await apiCall('updateAssignment', { ...assignment, maxScore: Number(assignment.maxScore), order: Number(assignment.order) });
};

export const getSubmissions = async (room?: string): Promise<Submission[]> => await apiCall('getSubmissions', { room });
export const submitAssignment = async (submission: Submission, room: string): Promise<void> => {
  await apiCall('submitAssignment', { ...submission, score: submission.score === null ? null : Number(submission.score), id: submission.id || generateUUID(), room });
};
export const gradeSubmission = async (studentId: string, assignmentId: string, score: number, room: string): Promise<void> => {
  await apiCall('gradeSubmission', { studentId, assignmentId, score: Number(score), room });
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const data = await apiCall('getAnnouncements');
  return Array.isArray(data) ? data : [];
};

export const addAnnouncement = async (announcement: Announcement): Promise<void> => {
  await apiCall('addAnnouncement', { 
    ...announcement, 
    id: announcement.id || generateUUID(),
    isPinned: announcement.isPinned === true, // ส่งค่า boolean บริสุทธิ์
    isHidden: announcement.isHidden === true  // ส่งค่า boolean บริสุทธิ์
  });
};

export const updateAnnouncement = async (announcement: Announcement): Promise<void> => {
  if (!announcement.id) throw new Error("ID Missing");
  await apiCall('updateAnnouncement', { 
    ...announcement, 
    isPinned: announcement.isPinned === true, 
    isHidden: announcement.isHidden === true 
  });
};

export const deleteAnnouncement = async (id: string): Promise<void> => await apiCall('deleteAnnouncement', { id });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
