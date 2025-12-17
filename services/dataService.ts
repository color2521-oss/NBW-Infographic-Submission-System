import { Student, Assignment, Submission, Announcement, INITIAL_ASSIGNMENTS } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbygpzpaBq41GI4w6uRELdW5YnD7I5DDOgAbhVZPIV074lUrjSUNVE0KsAF8TyWTtpP5/exec";

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
    // console.log(`Calling ${action} with payload:`, payload); 
    const response = await fetch(API_URL, {
      redirect: "follow",
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, payload }),
    });
    
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    return result.data;
  } catch (error) {
    console.error(`Error in ${action}:`, error);
    if (action.startsWith('get')) return []; 
    throw error;
  }
};

// --- Students ---
export const getStudents = async (room?: string): Promise<Student[]> => {
  return await apiCall('getStudents', { room });
};

export const registerStudent = async (student: Student): Promise<void> => {
  // STRICT ORDER: studentId (Col A), name (Col B), number (Col C), room (Col D), id (Col E)
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

    // Merge strategy: Use fetched data to override initial data
    // This fixes the bug where assignments 2-6 disappear if only assignment 1 exists in the Sheet
    const merged = INITIAL_ASSIGNMENTS.map(init => {
      const found = safeFetched.find((f: Assignment) => f.id === init.id);
      return found ? { ...init, ...found } : init;
    });

    // Include any new assignments created dynamically (if any)
    const extras = safeFetched.filter((f: Assignment) => 
      !INITIAL_ASSIGNMENTS.some(i => i.id === f.id)
    );

    return [...merged, ...extras].sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error getting assignments, falling back to initial", error);
    return INITIAL_ASSIGNMENTS;
  }
};

export const updateAssignment = async (assignment: Assignment): Promise<void> => {
  // Ensure strict field order for Sheet consistency
  // order: id, title, maxScore, term, order
  const safeAssign = {
    id: assignment.id,
    title: assignment.title,
    maxScore: assignment.maxScore,
    term: assignment.term,
    order: assignment.order
  };
  await apiCall('updateAssignment', safeAssign);
};

export const deleteAssignment = async (id: string): Promise<void> => {
  await apiCall('deleteAssignment', { id });
};

// --- Submissions ---
export const getSubmissions = async (room?: string): Promise<Submission[]> => {
  return await apiCall('getSubmissions', { room });
};

export const submitAssignment = async (submission: Submission, room: string): Promise<void> => {
  // STRICT ORDER: studentId, assignmentId, score, imageUrl, submittedAt, id
  const safeSubmission = {
      studentId: submission.studentId,
      assignmentId: submission.assignmentId,
      score: submission.score,
      imageUrl: submission.imageUrl || '', // Handle null/undefined
      submittedAt: submission.submittedAt,
      id: submission.id || generateUUID(),
      room: room
  };
  await apiCall('submitAssignment', safeSubmission);
};

export const gradeSubmission = async (studentId: string, assignmentId: string, score: number, room: string): Promise<void> => {
  await apiCall('gradeSubmission', { studentId, assignmentId, score, room });
};

// --- Announcements ---
export const getAnnouncements = async (): Promise<Announcement[]> => {
  return await apiCall('getAnnouncements');
};

export const addAnnouncement = async (announcement: Announcement): Promise<void> => {
  // STRICT ORDER: title, date, content, imageUrl, id, isPinned
  const safeAnn = { 
    title: announcement.title,
    date: announcement.date,
    content: announcement.content,
    imageUrl: announcement.imageUrl || '', 
    id: announcement.id || generateUUID(),
    isPinned: announcement.isPinned || false 
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
    isPinned: announcement.isPinned || false
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