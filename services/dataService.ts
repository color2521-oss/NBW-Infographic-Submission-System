
import { Student, Assignment, Submission, Announcement, INITIAL_ASSIGNMENTS } from '../types';

// *** สำคัญ: ต้องนำ URL ที่ได้จากการ Deploy "New Deployment" มาวางที่นี่ทุกครั้งที่แก้ไขโค้ด Backend ***
const API_URL = "https://script.google.com/macros/s/AKfycbzUU9cV-wH183mtqy1iNGw-TMDTjS8EIEpyjbLiapdWe-xM6ukkEMQjLN8GfpWZ970jfA/exec";

// ฟังก์ชันสำหรับแปลง URL Google Drive ให้แสดงผลได้
export const formatDriveUrl = (url: string, size: string = 's400'): string => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url; 
  
  const driveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=${size}`;
  }
  return url;
};

// Safe UUID generator
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    
    if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
    }

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Server raw response:", text);
      throw new Error("ระบบตอบกลับไม่ถูกต้อง กรุณาตรวจสอบสิทธิ์การเข้าถึง (Deploy เป็น Public)");
    }

    if (result.status === 'error') {
        throw new Error(result.message);
    }
    return result.data;
  } catch (error: any) {
    console.error(`API Error (${action}):`, error);
    if (action.startsWith('get')) return []; 
    throw error;
  }
};

// --- Students ---
export const getStudents = async (room?: string): Promise<Student[]> => {
  return await apiCall('getStudents', { room });
};

export const registerStudent = async (student: Student): Promise<void> => {
  const safeStudent = {
    studentId: student.studentId, 
    name: student.name,
    number: Number(student.number),
    room: student.room,
    id: student.id || generateUUID(),
  };
  await apiCall('registerStudent', safeStudent);
};

export const deleteStudent = async (studentId: string, room: string): Promise<void> => {
  await apiCall('deleteStudent', { studentId, room });
};

// --- Assignments ---
export const getAssignments = async (): Promise<Assignment[]> => {
  try {
    const fetchedAssignments = await apiCall('getAssignments');
    const safeFetched = Array.isArray(fetchedAssignments) ? fetchedAssignments : [];
    
    const merged = INITIAL_ASSIGNMENTS.map(init => {
      const found = safeFetched.find((f: any) => String(f.id) === String(init.id));
      return found ? { 
        ...init, 
        title: found.title || init.title, 
        maxScore: Number(found.maxScore) || init.maxScore 
      } : init;
    });

    const extras = safeFetched.filter((f: any) => 
      !INITIAL_ASSIGNMENTS.some(i => String(i.id) === String(f.id))
    );

    return [...merged, ...extras].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  } catch (error) {
    return INITIAL_ASSIGNMENTS;
  }
};

export const updateAssignment = async (assignment: Assignment): Promise<void> => {
  const safeAssign = {
    id: assignment.id,
    title: assignment.title,
    maxScore: Number(assignment.maxScore),
    term: assignment.term,
    order: Number(assignment.order)
  };
  await apiCall('updateAssignment', safeAssign);
};

// --- Submissions ---
export const getSubmissions = async (room?: string): Promise<Submission[]> => {
  return await apiCall('getSubmissions', { room });
};

export const submitAssignment = async (submission: Submission, room: string): Promise<void> => {
  const safeSubmission = {
      studentId: submission.studentId,
      assignmentId: submission.assignmentId,
      score: submission.score === null ? null : Number(submission.score),
      imageUrl: submission.imageUrl || '', 
      submittedAt: submission.submittedAt || new Date().toISOString(),
      id: submission.id || generateUUID(),
      room: room
  };
  await apiCall('submitAssignment', safeSubmission);
};

export const gradeSubmission = async (studentId: string, assignmentId: string, score: number, room: string): Promise<void> => {
  await apiCall('gradeSubmission', { studentId, assignmentId, score: Number(score), room });
};

// --- Announcements ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
  const data = await apiCall('getAnnouncements');
  return Array.isArray(data) ? data : [];
};

export const addAnnouncement = async (announcement: Announcement): Promise<void> => {
  const safeAnn = { 
    id: announcement.id || generateUUID(),
    title: announcement.title,
    date: announcement.date || new Date().toLocaleDateString('th-TH'),
    content: announcement.content,
    imageUrl: announcement.imageUrl || '', 
    isPinned: !!announcement.isPinned,
    isHidden: !!announcement.isHidden
  };
  await apiCall('addAnnouncement', safeAnn);
};

export const updateAnnouncement = async (announcement: Announcement): Promise<void> => {
  if (!announcement.id) throw new Error("ID ของประกาศหายไป ไม่สามารถอัปเดตได้");
  
  const safeAnn = { 
    id: announcement.id,
    title: announcement.title,
    date: announcement.date,
    content: announcement.content,
    imageUrl: announcement.imageUrl || '',
    isPinned: !!announcement.isPinned,
    isHidden: !!announcement.isHidden
  };
  await apiCall('updateAnnouncement', safeAnn);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await apiCall('deleteAnnouncement', { id });
};

// --- Utilities ---
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
