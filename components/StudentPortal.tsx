

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Search, Upload, CheckCircle, XCircle, Save, UserPlus, FileText, Loader2, Maximize2, Image as ImageIcon } from 'lucide-react';
import { Student, ROOMS, NUMBERS, Assignment, Submission } from '../types';
import * as DataService from '../services/dataService';

export const StudentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'submit'>('register');

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-xl shadow-sm border flex gap-1">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'register' ? 'bg-nbw-600 text-white shadow' : 'text-gray-500 hover:text-nbw-600'
            }`}
          >
            <div className="flex items-center gap-2"><UserPlus size={16} /> ลงทะเบียน</div>
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'submit' ? 'bg-nbw-600 text-white shadow' : 'text-gray-500 hover:text-nbw-600'
            }`}
          >
            <div className="flex items-center gap-2"><FileText size={16} /> ส่งงาน / ดูคะแนน</div>
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'register' ? <RegistrationForm /> : <SubmissionPortal />}
      </div>
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

    Swal.fire({ title: 'กำลังตรวจสอบ...', didOpen: () => Swal.showLoading() });

    try {
      const existingStudents = await DataService.getStudents();
      const isDuplicate = existingStudents.some(s => String(s.studentId).trim() === form.studentId.trim());

      if (isDuplicate) {
        Swal.fire('ข้อผิดพลาด', 'รหัสนักเรียนนี้ได้ลงทะเบียนไปแล้ว', 'error');
        return;
      }
      
      const payload: Student = {
        ...form,
        name: form.name.trim(),
        id: DataService.generateUUID(),
        number: Number(form.number)
      };
      
      await DataService.registerStudent(payload);
      Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ',
        text: 'ข้อมูลของคุณถูกบันทึกเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false
      });
      setForm({ ...form, studentId: '', name: '' });
      
    } catch (error: any) {
      Swal.fire('Error', error.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-lg mx-auto border-t-4 border-nbw-500">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="text-nbw-500" /> ลงทะเบียนนักเรียนใหม่
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวนักเรียน (5 หลัก)</label>
          <input
            type="text"
            maxLength={5}
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value.replace(/\D/g, '') })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nbw-500 outline-none transition-all"
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nbw-500 outline-none transition-all"
            placeholder="ไม่ต้องใส่คำนำหน้า"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชั้นเรียน</label>
            <select
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nbw-500 outline-none"
            >
              {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่</label>
            <select
              value={form.number}
              onChange={(e) => setForm({ ...form, number: Number(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nbw-500 outline-none"
            >
              {NUMBERS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-nbw-600 hover:bg-nbw-700 text-white font-bold py-3 rounded-lg shadow transition-all mt-4 flex items-center justify-center gap-2"
        >
          <Save size={18} /> บันทึกข้อมูล
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
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.length !== 5) {
      Swal.fire('แจ้งเตือน', 'กรุณาระบุรหัสประจำตัว 5 หลัก', 'warning');
      return;
    }
    setLoading(true);
    Swal.fire({ title: 'กำลังค้นหา...', didOpen: () => Swal.showLoading() });

    try {
      const students = await DataService.getStudents();
      const found = students.find(s => String(s.studentId).trim() === searchId.trim());
      
      if (found) {
        setStudent(found);
        await loadData(found);
        Swal.close();
      } else {
        Swal.fire('ไม่พบข้อมูล', `ไม่พบรหัสนักเรียน: ${searchId} กรุณาตรวจสอบรหัสหรือลงทะเบียนใหม่`, 'warning');
      }
    } catch (err: any) {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อระบบได้', 'error');
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
      setSubmissions(subData.filter(s => String(s.studentId).trim() === String(currentStudent.studentId).trim()));
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('ขนาดไฟล์เกิน 2MB', 'กรุณาลดขนาดภาพก่อนส่ง', 'warning');
      return;
    }

    try {
      setIsUploading(assignmentId);
      Swal.fire({ title: 'กำลังอัปโหลด...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

      const base64 = await DataService.fileToBase64(file);
      const submission: Submission = {
        id: DataService.generateUUID(),
        studentId: student.studentId,
        assignmentId,
        imageUrl: base64, 
        score: null,
        submittedAt: new Date().toISOString()
      };
      
      await DataService.submitAssignment(submission, student.room);
      await loadData(student);
      
      Swal.fire({ icon: 'success', title: 'ส่งงานสำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (error: any) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งงานได้', 'error');
    } finally {
      setIsUploading(null);
    }
  };

  const showFullImage = (url: string) => {
    const formattedUrl = DataService.formatDriveUrl(url, 's1000');
    Swal.fire({
      html: `
        <div style="padding: 10px;">
          <img src="${formattedUrl}" referrerpolicy="no-referrer" style="width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px;" />
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '90%',
      background: '#fff',
    });
  };

  if (!student) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto text-center border-t-4 border-nbw-500">
        <div className="bg-nbw-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
           <Search className="text-nbw-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">เข้าสู่ระบบนักเรียน</h3>
        <p className="text-gray-500 text-sm mb-6">ระบุรหัสประจำตัว 5 หลักเพื่อตรวจสอบงาน</p>
        <form onSubmit={handleSearch} className="space-y-3">
          <input
            type="text"
            maxLength={5}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-nbw-500 outline-none text-center text-2xl font-bold tracking-widest"
            placeholder="00000"
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-nbw-600 hover:bg-nbw-700 text-white py-3 rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    );
  }

  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const maxScore = assignments.reduce((sum, a) => sum + a.maxScore, 0);

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-nbw-600">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{student.name} ({student.room})</h2>
          <p className="text-gray-500 text-sm">เลขประจำตัว: {student.studentId} | เลขที่: {student.number}</p>
        </div>
        <div className="bg-nbw-600 text-white px-6 py-3 rounded-xl text-center shadow-md">
          <div className="text-xs opacity-80 uppercase font-bold">คะแนนรวม</div>
          <div className="text-2xl font-bold">{totalScore} / {maxScore}</div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 ml-1">
          <FileText size={18} className="text-nbw-500" /> รายการภาระงานของคุณ
        </h3>
        
        {assignments.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center text-gray-400 border border-dashed">ยังไม่มีข้อมูลภาระงานในระบบ</div>
        ) : assignments.map(assign => {
          const sub = submissions.find(s => s.assignmentId === assign.id);
          const isThisUploading = isUploading === assign.id;
          
          return (
            <div key={assign.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${sub ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <h4 className="font-bold text-gray-800">{assign.title}</h4>
                  </div>
                  <div className="text-xs text-gray-400 font-medium ml-4">
                    คะแนนเต็ม {assign.maxScore} | {assign.term === 'pre-midterm' ? 'ก่อนกลางภาค' : 'หลังกลางภาค'}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {sub ? (
                    <div className="flex-grow md:flex-grow-0 flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle size={16} />
                      <span className="text-sm font-bold">ส่งแล้ว {sub.score !== null ? `(${sub.score} คะแนน)` : ''}</span>
                    </div>
                  ) : (
                    <div className="flex-grow md:flex-grow-0 flex items-center gap-2 bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg border border-gray-100">
                      <XCircle size={16} />
                      <span className="text-sm font-medium">ยังไม่ส่งงาน</span>
                    </div>
                  )}

                  <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                    isThisUploading ? 'bg-gray-100 text-gray-400' : 'bg-nbw-50 text-nbw-600 hover:bg-nbw-100'
                  }`}>
                    {isThisUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {sub ? 'ส่งใหม่' : 'ส่งงาน'}
                    {/* // Fix: Changed 'onUpload' to 'handleFileUpload' to match the function definition at line 191 */}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, assign.id)} disabled={!!isThisUploading} />
                  </label>
                </div>
              </div>

              {sub?.imageUrl && (
                <div className="bg-gray-50 p-4 border-t border-gray-50 flex items-center gap-4">
                  <div className="relative group cursor-zoom-in" onClick={() => showFullImage(sub.imageUrl)}>
                    <img 
                      src={DataService.formatDriveUrl(sub.imageUrl)} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-lg border bg-white group-hover:opacity-80 transition-opacity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={16} className="text-nbw-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    <p className="font-bold text-gray-500">ผลงานล่าสุดของคุณ</p>
                    <p>ส่งเมื่อ: {new Date(sub.submittedAt).toLocaleString('th-TH')}</p>
                    <button onClick={() => showFullImage(sub.imageUrl)} className="text-nbw-600 mt-1 hover:underline flex items-center gap-1 font-bold">คลิกเพื่อดูรูปใหญ่</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <button onClick={() => setStudent(null)} className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors">
          ออกจากระบบ / ค้นหาคนอื่น
        </button>
      </div>
    </div>
  );
};
