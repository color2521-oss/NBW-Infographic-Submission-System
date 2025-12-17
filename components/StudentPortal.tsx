import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Search, Upload, CheckCircle, XCircle, Save, UserPlus, FileText } from 'lucide-react';
import { Student, ROOMS, NUMBERS, Assignment, Submission } from '../types';
import * as DataService from '../services/dataService';

export const StudentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'submit'>('register');

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-xl shadow-sm border flex">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register' ? 'bg-nbw-600 text-white shadow-md' : 'text-gray-500 hover:text-nbw-600'
            }`}
          >
            <div className="flex items-center gap-2"><UserPlus size={16} /> ลงทะเบียน</div>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'submit' ? 'bg-nbw-600 text-white shadow-md' : 'text-gray-500 hover:text-nbw-600'
            }`}
          >
            <div className="flex items-center gap-2"><FileText size={16} /> ส่งงาน / ดูคะแนน</div>
          </button>
        </div>
      </div>

      {activeTab === 'register' ? <RegistrationForm /> : <SubmissionPortal />}
    </div>
  );
};

const RegistrationForm: React.FC = () => {
  const [form, setForm] = useState<Student>({
    id: '',
    studentId: '',
    name: '',
    number: 1,
    room: ROOMS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.studentId.length !== 5) {
      Swal.fire('ข้อผิดพลาด', 'รหัสนักเรียนต้องมี 5 หลัก', 'error');
      return;
    }

    if (!form.name.trim()) {
        Swal.fire('ข้อผิดพลาด', 'กรุณากรอกชื่อ-สกุล', 'error');
        return;
    }

    Swal.fire({
      title: 'กำลังตรวจสอบ...',
      didOpen: () => Swal.showLoading(),
    });

    try {
      // Fetch all students to check for duplicates
      const existingStudents = await DataService.getStudents();
      // Compare as strings to prevent type mismatches
      const isDuplicate = existingStudents.some(s => String(s.studentId).trim() === form.studentId.trim());

      if (isDuplicate) {
        Swal.fire('ข้อผิดพลาด', 'รหัสนักเรียนนี้ได้ลงทะเบียนไปแล้ว', 'error');
        return;
      }
      
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        didOpen: () => Swal.showLoading(),
      });

      const payload: Student = {
        ...form,
        name: form.name.trim(),
        id: DataService.generateUUID(),
        number: Number(form.number)
      };
      
      await DataService.registerStudent(payload);
      Swal.fire('สำเร็จ', 'บันทึกข้อมูลลงทะเบียนเรียบร้อยแล้ว', 'success');
      setForm({ ...form, studentId: '', name: '' });
      
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-lg mx-auto border-t-4 border-nbw-500">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ลงทะเบียนนักเรียน</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัว (5 หลัก)</label>
          <input
            type="text"
            maxLength={5}
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nbw-500 focus:outline-none transition"
            placeholder="เช่น 12345"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nbw-500 focus:outline-none transition"
            placeholder="เด็กชายรักเรียน เพียรศึกษา"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชั้นเรียน</label>
            <select
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nbw-500 focus:outline-none transition"
            >
              {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่</label>
            <select
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nbw-500 focus:outline-none transition"
            >
              {NUMBERS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-nbw-600 to-nbw-500 hover:from-nbw-700 hover:to-nbw-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mt-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Save size={20} /> บันทึกข้อมูล
          </div>
        </button>
      </form>
    </div>
  );
};

const SubmissionPortal: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    Swal.fire({ title: 'กำลังค้นหา...', didOpen: () => Swal.showLoading() });

    try {
      // Fetch all students (backend aggregates) to find by ID
      const students = await DataService.getStudents();
      console.log("Fetched Students:", students); // Debugging

      // Force string comparison to handle cases where Sheet returns number
      const found = students.find(s => String(s.studentId).trim() === searchId.trim());
      
      if (found) {
        setStudent(found);
        await loadData(found);
        Swal.close();
      } else {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูล',
            text: `ไม่พบรหัสนักเรียน: ${searchId} ในระบบ กรุณาลงทะเบียนก่อน`,
            footer: '<a href="#" onclick="document.querySelector(\'button\').click()">ไปที่หน้าลงทะเบียน</a>'
        });
        setStudent(null);
      }
    } catch (err) {
      console.error("Search error:", err);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (currentStudent: Student) => {
    try {
      const [assignData, subData] = await Promise.all([
        DataService.getAssignments(),
        DataService.getSubmissions(currentStudent.room)
      ]);
      setAssignments(assignData);
      // Ensure studentId matching is robust
      setSubmissions(subData.filter(s => String(s.studentId).trim() === String(currentStudent.studentId).trim()));
    } catch (error) {
      console.error("Load data error:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    // Size validation
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('ขนาดไฟล์เกิน 2MB', 'กรุณาลดขนาดภาพก่อนส่ง', 'warning');
      return;
    }

    try {
      Swal.fire({ title: 'กำลังอัปโหลด...', didOpen: () => Swal.showLoading() });
      const base64 = await DataService.fileToBase64(file);
      const submission: Submission = {
        id: DataService.generateUUID(), // Use safe UUID
        studentId: student.studentId,
        assignmentId,
        imageUrl: base64,
        score: null,
        submittedAt: new Date().toISOString()
      };
      
      // Pass room to service
      await DataService.submitAssignment(submission, student.room);
      await loadData(student);
      
      Swal.fire('สำเร็จ', 'ส่งงานเรียบร้อยแล้ว', 'success');

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์', 'error');
    }
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  if (!student) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border-t-4 border-yellow-400">
        <h3 className="text-xl font-bold text-gray-800 mb-4">ค้นหาข้อมูลนักเรียน</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            maxLength={5}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            placeholder="ระบุเลขประจำตัว 5 หลัก"
          />
          <button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">
            <Search size={20} />
          </button>
        </form>
      </div>
    );
  }

  // Calculate stats
  const totalAssignments = assignments.length;
  const submittedCount = submissions.length;
  const progress = totalAssignments === 0 ? 0 : Math.round((submittedCount / totalAssignments) * 100);
  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const maxTotalScore = assignments.reduce((sum, a) => sum + a.maxScore, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-8 border-nbw-600">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
          <p className="text-gray-500">เลขประจำตัว: {student.studentId} | ชั้น: {student.room} | เลขที่: {student.number}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">คะแนนสะสม</div>
          <div className="text-3xl font-bold text-nbw-600">{totalScore} <span className="text-lg text-gray-400">/ {maxTotalScore}</span></div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between text-sm font-medium mb-1 text-gray-600">
          <span>ความคืบหน้าการส่งงาน</span>
          <span>{progress}% ({submittedCount}/{totalAssignments})</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Assignment Lists */}
      <div className="grid md:grid-cols-2 gap-8">
        <AssignmentSection 
          title="ก่อนกลางภาค" 
          assignments={assignments.filter(a => a.term === 'pre-midterm')} 
          getSub={getSubmissionStatus} 
          onUpload={handleFileUpload} 
        />
        <AssignmentSection 
          title="หลังกลางภาค" 
          assignments={assignments.filter(a => a.term === 'post-midterm')} 
          getSub={getSubmissionStatus} 
          onUpload={handleFileUpload} 
        />
      </div>
      
      <div className="flex justify-center mt-4">
        <button onClick={() => setStudent(null)} className="text-gray-500 underline hover:text-red-500">ออกจากระบบ / ค้นหาใหม่</button>
      </div>
    </div>
  );
};

const AssignmentSection: React.FC<{
  title: string;
  assignments: Assignment[];
  getSub: (id: string) => Submission | undefined;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
}> = ({ title, assignments, getSub, onUpload }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 font-bold text-gray-700">
        {title}
      </div>
      <div className="divide-y divide-gray-100">
        {assignments.map(assign => {
          const submission = getSub(assign.id);
          return (
            <div key={assign.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-800">{assign.title}</div>
                <div className="text-xs font-bold bg-gray-200 px-2 py-1 rounded text-gray-600">{assign.maxScore} คะแนน</div>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {submission ? (
                    <>
                      <CheckCircle className="text-green-500" size={20} />
                      <span className="text-sm font-medium text-green-600">ส่งแล้ว</span>
                      {submission.score !== null && (
                         <span className="text-sm font-bold ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                           ได้ {submission.score} คะแนน
                         </span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-400" size={20} />
                      <span className="text-sm text-red-500">ยังไม่ส่ง</span>
                    </>
                  )}
                </div>

                <label className="cursor-pointer bg-white border border-gray-300 hover:border-nbw-500 hover:text-nbw-600 text-gray-600 px-3 py-1.5 rounded-lg text-sm shadow-sm transition-all flex items-center gap-2">
                  <Upload size={16} />
                  <span>{submission ? 'ส่งใหม่' : 'อัปโหลด'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, assign.id)} />
                </label>
              </div>
              {submission?.imageUrl && (
                 <div className="mt-2">
                    <img src={submission.imageUrl} alt="preview" className="h-16 w-16 object-cover rounded border" />
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};