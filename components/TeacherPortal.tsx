
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Users, FileEdit, BarChart2, CheckSquare, Save, Trash2, Edit2, Plus, X, Bell, Image as ImageIcon, Pin, FileSpreadsheet, Copy, Maximize2, UserCog, Hash, GraduationCap, EyeOff, Eye, Loader2, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as DataService from '../services/dataService';
import { Student, Assignment, Submission, ROOMS, NUMBERS, Announcement } from '../types';

// Helper function สำหรับเตรียมรหัสนักเรียนให้เป็นรูปแบบ 5 หลักที่ถูกต้องเสมอ
const normalizeStudentId = (id: any): string => {
  return String(id || '').trim().padStart(5, '0');
};

export const TeacherPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const checkLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2521') {
      setIsAuthenticated(true);
      Swal.fire({ icon: 'success', title: 'ยินดีต้อนรับ', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire('รหัสผ่านผิด', 'กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-4 border-red-500">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4"><Users className="text-red-500" size={32} /></div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">สำหรับครูผู้สอน</h2>
          <form onSubmit={checkLogin} className="space-y-4">
            <input type="password" placeholder="รหัสผ่าน" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border overflow-x-auto">
         {[
           { id: 'dashboard', label: 'ภาพรวม', icon: BarChart2 },
           { id: 'students', label: 'จัดการนักเรียน', icon: Users },
           { id: 'assignments', label: 'จัดการงาน', icon: FileEdit },
           { id: 'grading', label: 'ตรวจงาน', icon: CheckSquare },
           { id: 'summary', label: 'สรุปคะแนนรายห้อง', icon: FileSpreadsheet },
           { id: 'announcements', label: 'จัดการประกาศ', icon: Bell },
           { id: 'settings', label: 'ตั้งค่าระบบ', icon: UserCog },
         ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-nbw-900 text-white shadow-lg transform scale-105' : 'text-gray-600 hover:bg-gray-100'}`}>
             <tab.icon size={16} /> {tab.label}
           </button>
         ))}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[500px]">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'students' && <StudentManager />}
        {activeTab === 'assignments' && <AssignmentManager />}
        {activeTab === 'grading' && <GradingSystem />}
        {activeTab === 'summary' && <ScoreSummary />}
        {activeTab === 'announcements' && <AnnouncementManager />}
        {activeTab === 'settings' && <SystemSettingsManager />}
      </div>
    </div>
  );
};

const ScoreSummary: React.FC = () => {
  const [room, setRoom] = useState(ROOMS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([DataService.getStudents(room), DataService.getAssignments(), DataService.getSubmissions(room)]);
      const [allStudents, allAssigns, allSubs] = results as [Student[], Assignment[], Submission[]];
      setStudents(allStudents.sort((a,b) => a.number - b.number));
      setAssignments(allAssigns);
      setSubmissions([...allSubs].reverse());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [room]);

  const copyColumnScores = (assignmentId: string, title: string) => {
    const scores = students.map(std => {
      // ใช้ normalizeStudentId เพื่อให้การค้นหาแม่นยำที่สุด
      const sub = submissions.find(s => 
        normalizeStudentId(s.studentId) === normalizeStudentId(std.studentId) && 
        String(s.assignmentId).trim() === String(assignmentId).trim()
      );
      return sub?.score !== null && sub?.score !== undefined ? sub.score : ''; 
    }).join('\n');
    navigator.clipboard.writeText(scores).then(() => Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, icon: 'success', title: `คัดลอกคะแนนเรียบร้อย` }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileSpreadsheet className="text-green-600" /> สรุปคะแนนรายห้อง</h3>
        <select value={room} onChange={(e) => setRoom(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-green-500 outline-none">
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {loading ? ( <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div></div> ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-4 w-16 text-center border-b">เลขที่</th>
                <th className="px-4 py-4 w-48 border-b">ชื่อ-สกุล</th>
                {assignments.map(a => (
                  <th key={a.id} className="px-2 py-2 text-center border-l border-b min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="truncate w-full font-bold">{a.title}</span>
                      <button onClick={() => copyColumnScores(a.id, a.title)} className="mt-1 bg-white border px-2 py-0.5 rounded text-xs hover:bg-green-50">Copy</button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 w-24 text-center border-l border-b font-bold">รวม</th>
              </tr>
            </thead>
            <tbody>
              {students.map((std) => {
                let total = 0;
                return (
                  <tr key={std.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{std.number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{std.name}</td>
                    {assignments.map(assign => {
                      const sub = submissions.find(s => 
                        normalizeStudentId(s.studentId) === normalizeStudentId(std.studentId) && 
                        String(s.assignmentId).trim() === String(assign.id).trim()
                      );
                      if (typeof sub?.score === 'number') total += sub.score;
                      return <td key={assign.id} className="px-2 py-3 text-center border-l">{sub?.score ?? '-'}</td>;
                    })}
                    <td className="px-4 py-3 text-center border-l font-bold text-nbw-600">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterRoom, setFilterRoom] = useState(ROOMS[0]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const data = await DataService.getStudents(filterRoom);
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, [filterRoom]);

  const handleEdit = async (student: Student) => {
    const { value: formValues } = await Swal.fire({
      title: '<h3 class="text-xl font-bold text-nbw-600">แก้ไขข้อมูลนักเรียน</h3>',
      html: `
        <div class="text-left space-y-4 p-2">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">เลขประจำตัวนักเรียน (5 หลัก)</label>
            <input id="swal-studentId" maxLength="5" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 focus:ring-4 focus:ring-nbw-50 outline-none transition-all font-mono text-lg" value="${student.studentId}" placeholder="00000">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">ชื่อ - นามสกุล</label>
            <input id="swal-name" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 focus:ring-4 focus:ring-nbw-50 outline-none transition-all font-medium" value="${student.name}" placeholder="ชื่อ-สกุล">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">ชั้นเรียน</label>
              <select id="swal-room" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 focus:ring-4 focus:ring-nbw-50 outline-none transition-all">
                ${ROOMS.map(r => `<option value="${r}" ${r === student.room ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1 tracking-wider">เลขที่</label>
              <select id="swal-number" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 focus:ring-4 focus:ring-nbw-50 outline-none transition-all">
                ${NUMBERS.map(n => `<option value="${n}" ${n === student.number ? 'selected' : ''}>${n}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#94a3b8',
      focusConfirm: false,
      padding: '2rem',
      customClass: { popup: 'rounded-3xl shadow-2xl', confirmButton: 'rounded-xl font-bold px-8 py-3', cancelButton: 'rounded-xl font-bold px-8 py-3' },
      preConfirm: () => {
        const sid = (document.getElementById('swal-studentId') as HTMLInputElement).value;
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const room = (document.getElementById('swal-room') as HTMLSelectElement).value;
        const num = (document.getElementById('swal-number') as HTMLSelectElement).value;
        if (!sid || sid.length !== 5) { Swal.showValidationMessage('กรุณาระบุรหัสประจำตัวให้ครบ 5 หลัก'); return false; }
        if (!name.trim()) { Swal.showValidationMessage('กรุณาระบุชื่อ-นามสกุล'); return false; }
        return { studentId: sid, name: name.trim(), room: room, number: Number(num) };
      }
    });
    if (formValues) {
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      try {
        await DataService.registerStudent({ ...student, ...formValues });
        await fetchStudents();
        Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
      } catch (err) { Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error'); }
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({ 
      title: 'ลบข้อมูลนักเรียน?', 
      text: 'ข้อมูลคะแนนและการส่งงานทั้งหมดจะถูกลบออกด้วย',
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    }).then(async (r) => {
      if (r.isConfirmed) { 
        Swal.fire({ title: 'กำลังลบ...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
        await DataService.deleteStudent(id, filterRoom); 
        await fetchStudents();
        Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Users className="text-nbw-600" /> จัดการนักเรียน</h3>
        <div className="flex gap-2">
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-nbw-500 outline-none font-medium">
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={fetchStudents} className="p-2 bg-nbw-50 text-nbw-600 rounded-lg hover:bg-nbw-100 transition-colors"><RefreshCw size={20} /></button>
        </div>
      </div>
      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin h-10 w-10 text-nbw-500 mx-auto" /></div> : (
        <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr><th className="p-4 w-16 text-center font-bold text-gray-500">เลขที่</th><th className="p-4 w-32 font-bold text-gray-500">รหัสประจำตัว</th><th className="p-4 font-bold text-gray-500">ชื่อ-นามสกุล</th><th className="p-4 w-24 text-center font-bold text-gray-500">ห้อง</th><th className="p-4 w-32 text-right font-bold text-gray-500">จัดการ</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (<tr><td colSpan={5} className="p-10 text-center text-gray-400">ยังไม่มีข้อมูลนักเรียนในห้องนี้</td></tr>) : students.sort((a,b)=>a.number-b.number).map(s => (
                <tr key={s.id} className="hover:bg-nbw-50 transition-colors">
                  <td className="p-4 text-center font-bold text-nbw-600">{s.number}</td>
                  <td className="p-4 font-mono text-gray-600">{s.studentId}</td>
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="p-4 text-center"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-bold">{s.room}</span></td>
                  <td className="p-4 text-right flex justify-end gap-1">
                    <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-nbw-600 hover:bg-nbw-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(s.studentId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AssignmentManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAssignments();
      setAssignments(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleEdit = async (assign?: Assignment) => {
    const isNew = !assign;
    const { value: formValues } = await Swal.fire({
      title: `<h3 class="text-xl font-bold text-nbw-600">${isNew ? 'เพิ่มภาระงานใหม่' : 'แก้ไขภาระงาน'}</h3>`,
      html: `
        <div class="text-left space-y-4 p-2">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">ชื่อภาระงาน</label>
            <input id="swal-title" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 outline-none transition-all font-medium" value="${assign?.title || ''}" placeholder="ระบุชื่อผลงาน">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">คะแนนเต็ม</label>
              <input id="swal-score" type="number" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 outline-none transition-all font-bold" value="${assign?.maxScore || 10}" placeholder="คะแนน">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">ลำดับที่</label>
              <input id="swal-order" type="number" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 outline-none transition-all font-bold" value="${assign?.order || (assignments.length + 1)}" placeholder="ลำดับ">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1 tracking-wider">ภาคเรียน</label>
            <select id="swal-term" class="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 outline-none transition-all font-medium">
              <option value="pre-midterm" ${assign?.term === 'pre-midterm' ? 'selected' : ''}>ก่อนกลางภาค</option>
              <option value="post-midterm" ${assign?.term === 'post-midterm' ? 'selected' : ''}>หลังกลางภาค</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึกข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#0284c7',
      focusConfirm: false,
      padding: '2rem',
      customClass: { popup: 'rounded-3xl shadow-2xl', confirmButton: 'rounded-xl font-bold px-8 py-3', cancelButton: 'rounded-xl font-bold px-8 py-3' },
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const score = (document.getElementById('swal-score') as HTMLInputElement).value;
        const term = (document.getElementById('swal-term') as HTMLSelectElement).value;
        const order = (document.getElementById('swal-order') as HTMLInputElement).value;
        if (!title.trim()) { Swal.showValidationMessage('กรุณาระบุชื่อภาระงาน'); return false; }
        return { 
          title: title.trim(), 
          maxScore: Number(score), 
          term: term as 'pre-midterm' | 'post-midterm', 
          order: Number(order),
          id: assign?.id || DataService.generateUUID()
        };
      }
    });

    if (formValues) {
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
      try {
        await DataService.updateAssignment(formValues);
        await fetchAssignments();
        Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'บันทึกภาระงานเรียบร้อยแล้ว', timer: 1500, showConfirmButton: false });
      } catch (err) { Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error'); }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><FileEdit className="text-nbw-600" /> จัดการภาระงาน</h3>
        <button onClick={() => handleEdit()} className="bg-nbw-600 hover:bg-nbw-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95">
          <Plus size={18} /> เพิ่มภาระงานใหม่
        </button>
      </div>

      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin h-10 w-10 text-nbw-500 mx-auto" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map(a => (
            <div key={a.id} className="p-5 border-2 border-gray-100 rounded-2xl flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-all hover:border-nbw-100 group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-nbw-50 flex items-center justify-center text-nbw-600 font-bold border border-nbw-100">{a.order}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(a)} className="p-2 text-gray-400 hover:text-nbw-600 hover:bg-nbw-50 rounded-lg transition-all" title="แก้ไข"><Edit2 size={16} /></button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{a.title}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${a.term === 'pre-midterm' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                    {a.term === 'pre-midterm' ? 'ก่อนกลางภาค' : 'หลังกลางภาค'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-400 font-medium">คะแนนเต็ม</span>
                  <span className="text-lg font-black text-nbw-600">{a.maxScore}</span>
                </div>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl text-gray-400 font-medium">ยังไม่มีภาระงานในระบบ</div>}
        </div>
      )}
    </div>
  );
};

const GradingSystem: React.FC = () => {
  const [room, setRoom] = useState(ROOMS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tempScores, setTempScores] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all([
        DataService.getStudents(room),
        DataService.getAssignments(),
        DataService.getSubmissions(room)
      ]);
      const [s, a, sub] = results as [Student[], Assignment[], Submission[]];
      setStudents(s.sort((a,b)=>a.number-b.number));
      setAssignments(a);
      setSubmissions([...sub].reverse());
      setTempScores({}); 
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => { fetchData(); }, [room]);

  const save = async () => {
    const entries = Object.entries(tempScores);
    if (entries.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'คุณยังไม่ได้กรอกคะแนนใหม่', 'info');
      return;
    }

    setIsSaving(true);
    Swal.fire({
      title: 'กำลังบันทึกคะแนน...',
      html: `กรุณารอสักครู่ กำลังบันทึกข้อมูล <b>0</b> จาก ${entries.length} รายการ`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      let count = 0;
      for (const [key, value] of entries) {
        const [sid, aid] = key.split('::');
        const scoreNum = value === '' ? 0 : Number(value);
        
        await DataService.gradeSubmission(sid.trim(), aid.trim(), scoreNum, room);
        
        count++;
        Swal.update({
          html: `กรุณารอสักครู่ กำลังบันทึกข้อมูล <b>${count}</b> จาก ${entries.length} รายการ`
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      await fetchData(); 
      Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ', text: `บันทึกคะแนนเรียบร้อยแล้ว`, timer: 2000, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกคะแนนได้ กรุณาตรวจสอบการ Deploy ของ Google Script', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><CheckSquare className="text-blue-600" /> ตรวจงานและให้คะแนน</h3>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={fetchData} disabled={isSaving || isLoading} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} /></button>
          <select value={room} disabled={isSaving || isLoading} onChange={e=>setRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium flex-grow md:flex-grow-0">
            {ROOMS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={save} disabled={isSaving || isLoading || Object.keys(tempScores).length === 0} className={`flex-grow md:flex-grow-0 px-6 py-2 rounded-lg font-bold shadow transition-all flex items-center justify-center gap-2 ${isSaving || isLoading || Object.keys(tempScores).length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'}`}>{isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} บันทึก ({Object.keys(tempScores).length})</button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} /><p className="text-gray-400">กำลังโหลดข้อมูล...</p></div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 w-16 text-center border-b font-bold">เลขที่</th>
                <th className="p-4 min-w-[150px] border-b font-bold">ชื่อ-สกุล</th>
                {assignments.map(a => <th key={a.id} className="p-4 border-l border-b min-w-[100px] text-center font-bold">{a.title}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 text-center font-bold text-gray-400 group-hover:text-blue-500">{s.number}</td>
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  {assignments.map(a => { 
                    // ใช้ normalizeStudentId เพื่อแก้ไขปัญหา Matching รหัสนักเรียนที่มีเลข 0 นำหน้า
                    const sub = submissions.find(x => 
                      normalizeStudentId(x.studentId) === normalizeStudentId(s.studentId) && 
                      String(x.assignmentId).trim() === String(a.id).trim()
                    ); 
                    const key = `${s.studentId}::${a.id}`; 
                    const hasTemp = tempScores[key] !== undefined;
                    const displayValue = hasTemp ? tempScores[key] : (sub?.score ?? '');

                    return (
                      <td key={a.id} className={`p-4 border-l text-center transition-colors ${hasTemp ? 'bg-yellow-50/50' : ''}`}>
                        <div className="flex flex-col items-center gap-2">
                          {sub?.imageUrl ? (
                            <div className="relative group/img cursor-pointer" onClick={() => Swal.fire({ html: `<div class="p-2"><img src="${DataService.formatDriveUrl(sub.imageUrl, 's1000')}" referrerpolicy="no-referrer" style="width:100%; border-radius:12px;"></div>`, showConfirmButton: false, showCloseButton: true, width: '80%' })}>
                              <img src={DataService.formatDriveUrl(sub.imageUrl)} referrerPolicy="no-referrer" className="h-10 w-10 object-cover rounded shadow-sm hover:scale-110 transition-transform border-2 border-white ring-1 ring-gray-200" />
                              <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                            </div>
                          ) : (
                            <div className="h-10 w-10 bg-gray-50 border border-dashed rounded flex items-center justify-center text-gray-200"><ImageIcon size={14} /></div>
                          )}
                          <input type="number" className={`w-14 border-2 rounded text-center py-1 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all ${hasTemp ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 bg-white text-gray-700'}`} value={displayValue} onChange={e => setTempScores({...tempScores, [key]: e.target.value})} placeholder="-" min="0" max={a.maxScore} />
                        </div>
                      </td>
                    ); 
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{ id: string, title: string, content: string, imageUrl: string | null, isPinned: boolean, isHidden: boolean, date: string }>({ id: '', title: '', content: '', imageUrl: null, isPinned: false, isHidden: false, date: '' });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAnnouncements();
      setAnnouncements(data.sort((a,b) => {
        const aPinned = DataService.parseBool(a.isPinned);
        const bPinned = DataService.parseBool(b.isPinned);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      }));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAnnouncements(); }, []);

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-nbw-600 underline hover:text-nbw-800 break-all transition-colors"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    Swal.fire({ title: 'กำลังประมวลผล...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
    const annData: Announcement = { ...form, id: isEditing ? form.id : DataService.generateUUID(), imageUrl: form.imageUrl || '', date: isEditing && form.date ? form.date : new Date().toLocaleDateString('th-TH') };
    try {
      if (isEditing) await DataService.updateAnnouncement(annData);
      else await DataService.addAnnouncement(annData);
      setForm({ id: '', title: '', content: '', imageUrl: null, isPinned: false, isHidden: false, date: '' });
      setIsEditing(false);
      await fetchAnnouncements();
      Swal.fire({ icon: 'success', title: 'สำเร็จ', timer: 1500, showConfirmButton: false });
    } catch (err) { Swal.fire('Error', 'ผิดพลาด', 'error'); } finally { setLoading(false); }
  };

  const edit = (a: Announcement) => {
    setForm({ id: a.id, title: a.title, content: a.content, imageUrl: a.imageUrl || null, isPinned: DataService.parseBool(a.isPinned), isHidden: DataService.parseBool(a.isHidden), date: a.date });
    setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className={`bg-white p-6 rounded-2xl border-2 h-fit shadow-sm sticky top-4 transition-all ${isEditing ? 'border-nbw-500' : 'border-nbw-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">{isEditing ? <Edit2 className="text-nbw-500" /> : <Plus className="text-green-500" />} {isEditing ? 'แก้ไขประกาศ' : 'สร้างประกาศใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full border-2 rounded-xl px-4 py-2 focus:border-nbw-500 outline-none transition-all font-medium" placeholder="หัวข้อ" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          <textarea className="w-full border-2 rounded-xl px-4 py-2 h-28 focus:border-nbw-500 outline-none transition-all font-medium" placeholder="เนื้อหา" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer bg-nbw-50/50 p-2.5 rounded-xl border border-nbw-100 hover:bg-nbw-50 transition-colors"><input type="checkbox" className="w-5 h-5" checked={form.isPinned} onChange={e=>setForm({...form, isPinned:e.target.checked})} /><span className="text-sm font-bold flex items-center gap-2 tracking-wide"><Pin size={16}/> ปักหมุด</span></label>
            <label className="flex items-center gap-3 cursor-pointer bg-red-50/50 p-2.5 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"><input type="checkbox" className="w-5 h-5" checked={form.isHidden} onChange={e=>setForm({...form, isHidden:e.target.checked})} /><span className="text-sm font-bold flex items-center gap-2 tracking-wide"><EyeOff size={16}/> ซ่อน</span></label>
          </div>
          <label className="w-full flex items-center justify-center gap-2 cursor-pointer bg-white text-nbw-600 border-2 border-dashed border-nbw-300 py-3 rounded-xl text-sm font-bold hover:border-nbw-500 transition-all group"><ImageIcon size={18} className="group-hover:scale-110 transition-transform" /> {form.imageUrl ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}<input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setForm({...form, imageUrl: await DataService.fileToBase64(f)}); }} /></label>
          {form.imageUrl && <div className="relative border-2 border-gray-100 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2"><img src={DataService.formatDriveUrl(form.imageUrl)} className="max-h-40 rounded-lg object-contain" /></div>}
          <button type="submit" disabled={loading} className={`w-full text-white py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all ${isEditing ? 'bg-nbw-900' : 'bg-nbw-600'}`}>{isEditing ? 'อัปเดตประกาศเดี๋ยวนี้' : 'โพสต์ประกาศ'}</button>
          {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setForm({id:'',title:'',content:'',imageUrl:null,isPinned:false,isHidden:false,date:''})}} className="w-full text-gray-400 mt-2 text-sm font-medium hover:text-red-500 transition-colors">ยกเลิกการแก้ไข</button>}
        </form>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 ml-1"><Bell className="text-nbw-500" /> รายการประกาศทั้งหมด ({announcements.length})</h3>
        {announcements.map(a => {
          const isPinned = DataService.parseBool(a.isPinned);
          const isHidden = DataService.parseBool(a.isHidden);
          return (
            <div key={a.id} className={`bg-white rounded-2xl border shadow-sm flex group overflow-hidden transition-all hover:shadow-md ${isPinned ? 'border-nbw-300 ring-2 ring-nbw-50' : 'border-gray-100'}`}>
              <div className="w-24 h-24 sm:w-32 bg-gray-50 flex-shrink-0 border-r overflow-hidden">{a.imageUrl ? <img src={DataService.formatDriveUrl(a.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>}</div>
              <div className="p-4 flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1"><h4 className={`font-bold truncate flex items-center gap-1.5 ${isHidden ? 'text-gray-400' : 'text-gray-800'}`}>{isPinned && <Pin size={14} fill="currentColor" className="text-nbw-500"/>}{isHidden && <EyeOff size={14} className="text-red-400"/>} {a.title}</h4><div className="flex gap-1"><button onClick={()=>edit(a)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข"><Edit2 size={16}/></button><button onClick={async ()=>{ if((await Swal.fire({title:'ลบประกาศ?', text: 'คุณต้องการลบประกาศนี้ใช่หรือไม่', icon:'warning', showCancelButton:true, confirmButtonColor: '#ef4444'})).isConfirmed) { await DataService.deleteAnnouncement(a.id); fetchAnnouncements(); } }} className="text-red-400 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="ลบ"><Trash2 size={16}/></button></div></div>
                <p className="text-[10px] font-black text-nbw-600 uppercase tracking-widest mb-1">{a.date} {isHidden && <span className="text-red-500 ml-2">(ซ่อนอยู่)</span>}</p>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {renderTextWithLinks(a.content)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([DataService.getStudents(), DataService.getSubmissions(), DataService.getAssignments()]).then((results) => {
      const [students, subs, assigns] = results as [Student[], Submission[], Assignment[]];
      setData(ROOMS.map(r => ({ 
        name: r.split('/')[1], 
        total: students.filter(s=>s.room===r).length * (Array.isArray(assigns) ? assigns.length : 0), 
        submitted: subs.filter(sub => students.filter(s=>s.room===r).some(s=>normalizeStudentId(s.studentId)===normalizeStudentId(sub.studentId))).length 
      })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 text-nbw-500 mx-auto" /></div>;

  return (
    <div className="h-80 w-full"><h3 className="text-xl font-bold mb-6 text-gray-800">สรุปการส่งงานรวมทุกห้อง</h3><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} /><Legend /><Bar dataKey="total" name="จำนวนที่ต้องส่ง" fill="#e5e7eb" radius={[4, 4, 0, 0]} /><Bar dataKey="submitted" name="ส่งแล้ว" fill="#0284c7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
  );
}

const SystemSettingsManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      const status = await DataService.getSystemStatus();
      setIsOpen(status);
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const toggleStatus = async () => {
    const newStatus = !isOpen;
    setIsSaving(true);
    try {
      await DataService.updateSystemStatus(newStatus);
      setIsOpen(newStatus);
      Swal.fire({
        icon: 'success',
        title: newStatus ? 'เปิดระบบเรียบร้อย' : 'ปิดระบบเรียบร้อย',
        text: newStatus ? 'นักเรียนสามารถส่งงานได้ตามปกติ' : 'นักเรียนจะไม่สามารถส่งงานใหม่ได้',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการตั้งค่าได้', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h3 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-2">
        <UserCog className="text-nbw-600" /> ตั้งค่าระบบรับส่งงาน
      </h3>

      {loading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-nbw-500 mx-auto" />
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-3xl border-2 border-nbw-50 shadow-inner">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isOpen ? 'bg-green-100 text-green-600 scale-110' : 'bg-red-100 text-red-600'}`}>
              {isOpen ? <RefreshCw size={48} className="animate-spin-slow" /> : <X size={48} />}
            </div>

            <div>
              <h4 className={`text-2xl font-black mb-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? 'ระบบกำลังเปิดรับงาน' : 'ระบบปิดรับงานแล้ว'}
              </h4>
              <p className="text-gray-500 text-sm">
                {isOpen 
                  ? 'นักเรียนทุกคนสามารถลงทะเบียนและส่งงานได้ตามปกติ' 
                  : 'นักเรียนจะไม่สามารถกดปุ่มส่งงานหรือลงทะเบียนใหม่ได้'}
              </p>
            </div>

            <button
              onClick={toggleStatus}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 ${
                isOpen 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-green-100'
              }`}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : (isOpen ? <X size={24} /> : <CheckSquare size={24} />)}
              {isOpen ? 'ปิดระบบรับงานเดี๋ยวนี้' : 'เปิดระบบรับงานเดี๋ยวนี้'}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
        <Bell className="text-blue-500 flex-shrink-0" size={20} />
        <p className="text-xs text-blue-700 leading-relaxed">
          <b>คำแนะนำ:</b> เมื่อปิดระบบ ปุ่ม "ส่งงาน" ในหน้าของนักเรียนจะถูกปิดการใช้งาน และจะมีข้อความแจ้งเตือนว่าระบบปิดรับงานแล้ว
        </p>
      </div>
    </div>
  );
};
