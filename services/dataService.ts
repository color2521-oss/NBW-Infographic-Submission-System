
import { Student, Assignment, Submission, Announcement, INITIAL_ASSIGNMENTS } from '../types';

// *** สำคัญ: ต้องนำ URL ที่ได้จากการ Deploy "New Deployment" มาวางที่นี่ทุกครั้งที่แก้ไขโค้ด Backend ***
const API_URL = "https://script.google.com/macros/s/AKfycbzUU9cV-wH183mtqy1iNGw-TMDTjS8EIEpyjbLiapdWe-xM6ukkEMQjLN8GfpWZ970jfA/exec";

// ฟังก์ชันสำหรับแปลง URL Google Drive ให้แสดงผลได้
// size: 'w400' สำหรับพรีวิวทั่วไป, 'w1000' สำหรับดูรูปใหญ่
export const formatDriveUrl = (url: string, size: string = 'w400'): string => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url; // ถ้าเป็น Base64 ให้ใช้ตรงๆ
  
  const driveIdMatch = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    // ใช้ thumbnail API ของ Google Drive
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
      if (text.includes("DriveApp") || text.includes("permission") || text.includes("ไม่ได้รับอนุญาต")) {
          throw new Error("❌ ตรวจพบปัญหาเรื่องสิทธิ์: กรุณาเข้าไปใน Apps Script แล้วกด Run (เรียกใช้งาน) ฟังก์ชันใดก็ได้หนึ่งครั้ง เพื่อกดยอมรับสิทธิ์ (Allow) เข้าถึง Google Drive แล้วทำการ Deploy ใหม่ครับ");
      }
      throw new Error("ระบบตอบกลับไม่เป็น JSON (อาจเกิดจาก Script Error หรือสิทธิ์การเข้าถึง)");
    }

    if (result.status === 'error') {
        if (result.message.includes("DriveApp") || result.message.includes("permission")) {
            throw new Error("❌ สิทธิ์การใช้งาน Google Drive ไม่เพียงพอ: กรุณากดเรียกใช้งาน (Run) ในหน้า Apps Script เพื่ออนุญาตสิทธิ์การเข้าถึงข้อมูล");
        }
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
    title: announcement.title,
    date: announcement.date,
    content: announcement.content,
    imageUrl: announcement.imageUrl || '', 
    id: announcement.id || generateUUID(),
    isPinned: !!announcement.isPinned 
  };
  await apiCall('addAnnouncement', safeAnn);
};

export const updateAnnouncement = async (announcement: Announcement): Promise<void> => {
  const safeAnn = { 
    title: announcement.title,
    date: announcement.date,
    content: announcement.content,
    imageUrl: announcement.imageUrl || '',
    id: announcement.id,
    isPinned: !!announcement.isPinned
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
