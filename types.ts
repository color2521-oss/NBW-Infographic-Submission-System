export interface Student {
  id: string;
  studentId: string; // 5 digits
  name: string;
  number: number; // 1-40
  room: string; // M.5/1 - M.5/13
}

export interface Assignment {
  id: string;
  title: string;
  maxScore: number;
  term: 'pre-midterm' | 'post-midterm';
  order: number;
}

export interface Submission {
  id: string;
  studentId: string;
  assignmentId: string;
  imageUrl: string;
  score: number | null; // null means not graded
  submittedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: string;
  isPinned?: boolean;
}

export const ROOMS = Array.from({ length: 13 }, (_, i) => `ม.5/${i + 1}`);
export const NUMBERS = Array.from({ length: 40 }, (_, i) => i + 1);

// Initial seeding data for assignments as per requirements
export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'pre-1', title: 'งานชิ้นที่ 1 (ก่อนกลางภาค)', maxScore: 5, term: 'pre-midterm', order: 1 },
  { id: 'pre-2', title: 'งานชิ้นที่ 2 (ก่อนกลางภาค)', maxScore: 10, term: 'pre-midterm', order: 2 },
  { id: 'pre-3', title: 'งานชิ้นที่ 3 (ก่อนกลางภาค)', maxScore: 10, term: 'pre-midterm', order: 3 },
  { id: 'post-1', title: 'งานชิ้นที่ 4 (หลังกลางภาค)', maxScore: 5, term: 'post-midterm', order: 4 },
  { id: 'post-2', title: 'งานชิ้นที่ 5 (หลังกลางภาค)', maxScore: 10, term: 'post-midterm', order: 5 },
  { id: 'post-3', title: 'งานชิ้นที่ 6 (หลังกลางภาค)', maxScore: 10, term: 'post-midterm', order: 6 },
];