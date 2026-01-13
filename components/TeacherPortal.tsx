
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Users, FileEdit, BarChart2, CheckSquare, Save, Trash2, Edit2, Plus, X, Bell, Image as ImageIcon, Pin, FileSpreadsheet, Copy, Maximize2, UserCog, Hash, GraduationCap, EyeOff, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as DataService from '../services/dataService';
import { Student, Assignment, Submission, ROOMS, NUMBERS, Announcement } from '../types';

export const TeacherPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const checkLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2521') {
      setIsAuthenticated(true);
      Swal.fire({
        icon: 'success',
        title: 'ยินดีต้อนรับ',
        text: 'เข้าสู่ระบบครูผู้สอน',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire('รหัสผ่านผิด', 'กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border-t-4 border-red-500">
          <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
             <Users className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">สำหรับครูผู้สอน</h2>
          <form onSubmit={checkLogin} className="space-y-4">
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
               activeTab === tab.id 
               ? 'bg-nbw-900 text-white shadow-lg transform scale-105' 
               : 'text-gray-600 hover:bg-gray-100'
             }`}
           >
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
      const [allStudents, allAssigns, allSubs] = await Promise.all([
          DataService.getStudents(room),
          DataService.getAssignments(),
          DataService.getSubmissions(room)
      ]);
      setStudents(allStudents.sort((a,b) => a.number - b.number));
      setAssignments(allAssigns);
      setSubmissions(allSubs);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [room]);

  const copyColumnScores = (assignmentId: string, title: string) => {
    const scoresToCopy = students.map(std => {
      const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assignmentId);
      return sub?.score !== null && sub?.score !== undefined ? sub.score : ''; 
    });
    const textToCopy = scoresToCopy.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, icon: 'success', title: `คัดลอกคะแนน "${title}" เรียบร้อย` });
    });
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
                      const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assign.id);
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
      title: 'แก้ไขข้อมูลนักเรียน',
      html: `
        <input id="swal-studentId" maxLength="5" class="swal2-input" value="${student.studentId}" placeholder="รหัส 5 หลัก">
        <input id="swal-name" class="swal2-input" value="${student.name}" placeholder="ชื่อ-สกุล">
        <select id="swal-room" class="swal2-input">
          ${ROOMS.map(r => `<option value="${r}" ${r === student.room ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
        <select id="swal-number" class="swal2-input">
          ${NUMBERS.map(n => `<option value="${n}" ${n === student.number ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        return {
          studentId: (document.getElementById('swal-studentId') as HTMLInputElement).value,
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          room: (document.getElementById('swal-room') as HTMLSelectElement).value,
          number: Number((document.getElementById('swal-number') as HTMLSelectElement).value)
        };
      }
    });

    if (formValues) {
      await DataService.registerStudent({ ...student, ...formValues });
      fetchStudents();
      Swal.fire('สำเร็จ', 'อัปเดตข้อมูลนักเรียนแล้ว', 'success');
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({ 
      title: 'ลบข้อมูลนักเรียน?', 
      text: 'ข้อมูลการส่งงานและคะแนนของนักเรียนคนนี้จะถูกลบออกด้วย',
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    }).then(async (r) => {
      if (r.isConfirmed) { 
        await DataService.deleteStudent(id, filterRoom); 
        fetchStudents(); 
        Swal.fire('สำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
           <Users className="text-nbw-600" /> จัดการข้อมูลนักเรียน
        </h3>
        <div className="flex gap-2 w-full md:w-auto">
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-nbw-500 outline-none flex-grow md:flex-grow-0">
            {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={fetchStudents} className="p-2 bg-nbw-50 text-nbw-600 rounded-lg hover:bg-nbw-100 transition-colors" title="รีเฟรช">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nbw-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">กำลังโหลดข้อมูลนักเรียน...</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 w-16 text-center font-bold text-gray-500">เลขที่</th>
                <th className="p-4 w-32 font-bold text-gray-500">รหัสประจำตัว</th>
                <th className="p-4 font-bold text-gray-500">ชื่อ-นามสกุล</th>
                <th className="p-4 w-24 text-center font-bold text-gray-500">ห้อง</th>
                <th className="p-4 w-32 text-right font-bold text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">ยังไม่มีข้อมูลนักเรียนในห้องนี้</td></tr>
              ) : students.sort((a,b)=>a.number-b.number).map(s => (
                <tr key={s.id} className="hover:bg-nbw-50 transition-colors group">
                  <td className="p-4 text-center font-bold text-nbw-600">{s.number}</td>
                  <td className="p-4 font-mono text-gray-600">{s.studentId}</td>
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-500 font-bold">{s.room}</span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-1">
                    <button 
                      onClick={() => handleEdit(s)} 
                      className="p-2 text-gray-400 hover:text-nbw-600 hover:bg-nbw-50 rounded-xl transition-all"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(s.studentId)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="ลบนักเรียน"
                    >
                      <Trash2 size={18} />
                    </button>
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
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAssignments();
      setAssignments(data);
    } catch (error) {
      Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลภาระงานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleEdit = async (assign: Assignment) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขภาระงาน',
      html: `
        <input id="swal-title" class="swal2-input" value="${assign.title}" placeholder="ชื่อภาระงาน">
        <input id="swal-score" type="number" class="swal2-input" value="${assign.maxScore}" placeholder="คะแนนเต็ม">
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        return {
          title: (document.getElementById('swal-title') as HTMLInputElement).value,
          maxScore: Number((document.getElementById('swal-score') as HTMLInputElement).value)
        };
      }
    });

    if (formValues) {
      await DataService.updateAssignment({ ...assign, ...formValues });
      fetchAssignments();
      Swal.fire('สำเร็จ', 'อัปเดตภาระงานแล้ว', 'success');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <FileEdit className="text-nbw-600" /> จัดการภาระงาน
        </h3>
        <button onClick={fetchAssignments} className="text-sm text-nbw-600 hover:underline">รีเฟรชข้อมูล</button>
      </div>
      
      {loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nbw-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <div key={a.id} className="p-5 border rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-nbw-50 flex items-center justify-center text-nbw-600 font-bold text-lg">
                  {a.order}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">{a.title}</div>
                  <div className="text-sm text-gray-400 font-medium">คะแนนเต็ม {a.maxScore} | {a.term === 'pre-midterm' ? 'ก่อนกลางภาค' : 'หลังกลางภาค'}</div>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(a)} 
                className="p-3 bg-gray-50 text-gray-400 hover:text-nbw-600 hover:bg-nbw-100 rounded-2xl transition-all"
                title="แก้ไขภาระงาน"
              >
                <Edit2 size={20} />
              </button>
            </div>
          ))}
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
  const [tempScores, setTempScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, a, sub] = await Promise.all([
        DataService.getStudents(room), 
        DataService.getAssignments(), 
        DataService.getSubmissions(room)
      ]) as [Student[], Assignment[], Submission[]];
      setStudents(s.sort((a,b)=>a.number-b.number)); 
      setAssignments(a); 
      setSubmissions(sub);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchData(); }, [room]);

  const save = async () => {
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
    try {
      await Promise.all(Object.entries(tempScores).map(([k, v]) => {
        const [sid, aid] = k.split('::');
        return DataService.gradeSubmission(sid, aid, v as number, room);
      }));
      await fetchData(); 
      setTempScores({}); 
      Swal.fire('สำเร็จ', 'บันทึกคะแนนเรียบร้อยแล้ว', 'success');
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const showFullImage = (url: string) => {
    const formattedUrl = DataService.formatDriveUrl(url, 's1000');
    Swal.fire({
      html: `<img src="${formattedUrl}" referrerpolicy="no-referrer" style="width: 100%; border-radius: 8px;" />`,
      showConfirmButton: false,
      showCloseButton: true,
      width: '80%'
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CheckSquare className="text-blue-600" /> ตรวจงานและให้คะแนน
        </h3>
        <div className="flex gap-2 w-full md:w-auto">
          <select value={room} onChange={e=>setRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">
            {ROOMS.map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={save} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all flex items-center gap-2">
            <Save size={18} /> บันทึกทั้งหมด
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 w-16 text-center">เลขที่</th>
                <th className="p-4 min-w-[150px]">ชื่อ-สกุล</th>
                {assignments.map(a => <th key={a.id} className="p-4 border-l min-w-[100px] text-center">{a.title}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center font-medium text-gray-500">{s.number}</td>
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  {assignments.map(a => {
                    const sub = submissions.find(x => x.studentId === s.studentId && x.assignmentId === a.id);
                    const key = `${s.studentId}::${a.id}`;
                    return (
                      <td key={a.id} className="p-4 border-l text-center">
                         <div className="flex flex-col items-center gap-2">
                           {sub?.imageUrl ? (
                             <img 
                               src={DataService.formatDriveUrl(sub.imageUrl)} 
                               referrerPolicy="no-referrer"
                               className="h-10 w-10 object-cover rounded shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                               onClick={() => showFullImage(sub.imageUrl)}
                             />
                           ) : <div className="h-10 w-10 bg-gray-50 border border-dashed rounded flex items-center justify-center text-gray-300"><ImageIcon size={14} /></div>}
                           <input 
                             type="number" 
                             className="w-14 border rounded text-center py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
                             value={tempScores[key] !== undefined ? tempScores[key] : (sub?.score ?? '')}
                             onChange={e => setTempScores({...tempScores, [key]: Number(e.target.value)})}
                             placeholder="-"
                           />
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
  
  const [form, setForm] = useState<{ 
    id: string, 
    title: string, 
    content: string, 
    imageUrl: string | null, 
    isPinned: boolean, 
    isHidden: boolean,
    date: string 
  }>({
    id: '', title: '', content: '', imageUrl: null, isPinned: false, isHidden: false, date: ''
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await DataService.getAnnouncements();
      setAnnouncements(data.sort((a,b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('ขนาดไฟล์ใหญ่เกินไป', 'กรุณาเลือกรูปภาพขนาดไม่เกิน 2MB', 'warning');
        return;
      }
      try {
        const base64 = await DataService.fileToBase64(file);
        setForm(prev => ({ ...prev, imageUrl: base64 }));
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถประมวลผลรูปภาพได้', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกหัวข้อและเนื้อหาประกาศ', 'warning');
      return;
    }
    
    setLoading(true);
    Swal.fire({ 
      title: isEditing ? 'กำลังอัปเดตประกาศ...' : 'กำลังบันทึกประกาศ...', 
      didOpen: () => Swal.showLoading(), 
      allowOutsideClick: false 
    });
    
    const annData: Announcement = {
      id: isEditing ? form.id : DataService.generateUUID(),
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || '', 
      date: isEditing && form.date ? form.date : new Date().toLocaleDateString('th-TH'),
      isPinned: form.isPinned,
      isHidden: form.isHidden
    };

    try {
      if (isEditing) {
        await DataService.updateAnnouncement(annData);
      } else {
        await DataService.addAnnouncement(annData);
      }
      
      resetForm();
      await fetchAnnouncements();
      Swal.fire({ 
        icon: 'success', 
        title: isEditing ? 'อัปเดตประกาศสำเร็จ' : 'โพสต์ประกาศสำเร็จ', 
        timer: 1500, 
        showConfirmButton: false 
      });
    } catch (err: any) {
      console.error("Save Announcement Error:", err);
      Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้: ' + (err.message || 'Unknown Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: '', title: '', content: '', imageUrl: null, isPinned: false, isHidden: false, date: '' });
    setIsEditing(false);
  };

  const edit = (a: Announcement) => {
    setForm({ 
      id: a.id, 
      title: a.title, 
      content: a.content, 
      imageUrl: a.imageUrl || null, 
      isPinned: !!a.isPinned, 
      isHidden: !!a.isHidden,
      date: a.date 
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = (id: string) => {
    Swal.fire({ 
      title: 'ลบประกาศ?', 
      text: 'คุณต้องการลบประกาศนี้ใช่หรือไม่',
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33'
    }).then(async (r) => {
      if (r.isConfirmed) { 
        Swal.fire({ title: 'กำลังลบ...', didOpen: () => Swal.showLoading() });
        await DataService.deleteAnnouncement(id); 
        await fetchAnnouncements(); 
        Swal.fire('สำเร็จ', 'ลบประกาศแล้ว', 'success');
      }
    });
  };

  const showFullImage = (url: string) => {
    const formattedUrl = DataService.formatDriveUrl(url, 's1000');
    Swal.fire({
      html: `<img src="${formattedUrl}" referrerpolicy="no-referrer" style="width: 100%; border-radius: 12px;" />`,
      showConfirmButton: false,
      showCloseButton: true,
      background: 'transparent',
      width: '90%'
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* ส่วนฟอร์มประกาศ */}
      <div className={`bg-white p-6 rounded-2xl border-2 h-fit shadow-sm sticky top-4 transition-all ${isEditing ? 'border-nbw-500 ring-4 ring-nbw-50' : 'border-nbw-50'}`}>
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-xl font-bold flex items-center gap-2">
            {isEditing ? <Edit2 className="text-nbw-500" size={24}/> : <Plus className="text-green-500" size={24}/>}
            {isEditing ? 'กำลังแก้ไขประกาศ' : 'สร้างประกาศใหม่'}
          </h3>
          {isEditing && (
             <button onClick={resetForm} className="text-gray-400 hover:text-red-500 p-2 hover:bg-gray-100 rounded-full transition-all">
               <X size={20}/>
             </button>
          )}
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">หัวข้อประกาศ</label>
            <input 
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-nbw-500 outline-none transition-all font-medium" 
              placeholder="หัวข้อประกาศ..." 
              value={form.title} 
              onChange={e=>setForm({...form, title:e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">เนื้อหาประกาศ</label>
            <textarea 
              className="w-full border rounded-xl px-4 py-2 h-28 focus:ring-2 focus:ring-nbw-500 outline-none transition-all font-medium leading-relaxed" 
              placeholder="พิมพ์เนื้อหาที่ต้องการประกาศ..." 
              value={form.content} 
              onChange={e=>setForm({...form, content:e.target.value})} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer bg-nbw-50/50 p-2.5 rounded-xl border border-nbw-100 hover:bg-nbw-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-nbw-600 rounded focus:ring-nbw-500" checked={form.isPinned} onChange={e=>setForm({...form, isPinned:e.target.checked})} />
              <span className="text-sm font-bold text-nbw-700 flex items-center gap-2"><Pin size={16}/> ปักหมุด</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer bg-red-50/50 p-2.5 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-red-600 rounded focus:ring-red-500" checked={form.isHidden} onChange={e=>setForm({...form, isHidden:e.target.checked})} />
              <span className="text-sm font-bold text-red-700 flex items-center gap-2"><EyeOff size={16}/> ซ่อน</span>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">รูปภาพประกอบ</label>
              {form.imageUrl && (
                <button type="button" onClick={()=>setForm({...form, imageUrl:null})} className="text-[10px] text-red-500 font-bold hover:underline">ลบรูปออก</button>
              )}
            </div>
            <label className="w-full flex items-center justify-center gap-2 cursor-pointer bg-white text-nbw-600 border-2 border-dashed border-nbw-300 py-3 rounded-xl text-sm hover:border-nbw-500 hover:bg-nbw-50 transition-all font-bold group">
              <ImageIcon size={18} className="group-hover:scale-110 transition-transform" /> {form.imageUrl ? 'เปลี่ยนรูปภาพ' : 'คลิกเพื่อเลือกรูปภาพ'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </div>
          
          {/* ส่วนแสดงตัวอย่างรูปภาพที่สมส่วนและเล็กลง */}
          {form.imageUrl && (
            <div className="relative mt-1 group border-2 border-nbw-100 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-40 shadow-inner">
              <img 
                key={form.imageUrl} 
                src={DataService.formatDriveUrl(form.imageUrl)} 
                referrerPolicy="no-referrer" 
                className="max-w-full max-h-40 object-contain transition-all group-hover:brightness-95"
                alt="preview"
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button 
              type="submit" 
              disabled={loading} 
              className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1 ${isEditing ? 'bg-nbw-900 hover:bg-black' : 'bg-nbw-600 hover:bg-nbw-700'}`}
            >
              {isEditing ? 'อัปเดตประกาศเดี๋ยวนี้' : 'โพสต์ประกาศใหม่'}
            </button>
          </div>
        </form>
      </div>

      {/* ส่วนรายการประกาศ */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 ml-1">
          <Bell className="text-nbw-500" size={20}/> รายการประกาศ ({announcements.length})
        </h3>
        {loading && !isEditing ? (
          <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-medium">ยังไม่มีประกาศ</div>
        ) : announcements.map(a => (
          <div key={a.id} className={`bg-white rounded-2xl border shadow-sm flex flex-col sm:flex-row group overflow-hidden transition-all hover:shadow-md ${a.isPinned ? 'border-nbw-300 ring-2 ring-nbw-50' : 'border-gray-100'} ${isEditing && form.id === a.id ? 'opacity-40 border-nbw-500 ring-4' : ''}`}>
            <div 
              className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 bg-gray-50 relative cursor-zoom-in group overflow-hidden border-b sm:border-b-0 sm:border-r"
              onClick={() => a.imageUrl && showFullImage(a.imageUrl)}
            >
              {a.imageUrl ? (
                <img src={DataService.formatDriveUrl(a.imageUrl)} referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="thumb" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
              )}
            </div>

            <div className="p-4 flex-grow min-w-0 relative">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className={`font-bold text-gray-800 truncate flex items-center gap-1.5 pr-2 ${a.isHidden ? 'text-gray-400' : ''}`}>
                  {a.isPinned && <Pin size={14} className="text-nbw-500" fill="currentColor"/>}
                  {a.isHidden && <EyeOff size={14} className="text-red-400"/>}
                  {a.title}
                </h4>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>edit(a)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข"><Edit2 size={18}/></button>
                  <button onClick={()=>del(a.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all" title="ลบ"><Trash2 size={18}/></button>
                </div>
              </div>
              <p className="text-[10px] font-black text-nbw-600 uppercase tracking-widest mb-1.5">{a.date} {a.isHidden && <span className="text-red-500 ml-2">(ซ่อนอยู่)</span>}</p>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">{a.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      DataService.getStudents(), 
      DataService.getSubmissions(), 
      DataService.getAssignments()
    ]).then((results) => {
      const students = results[0] as Student[];
      const subs = results[1] as Submission[];
      const assigns = results[2] as Assignment[];
      
      const stats = ROOMS.map(r => ({
        name: r.split('/')[1],
        total: students.filter(s=>s.room===r).length * assigns.length,
        submitted: subs.filter(sub => students.filter(s=>s.room===r).some(s=>s.studentId===sub.studentId)).length
      }));
      setData(stats);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div className="text-center py-20 text-gray-400">กำลังประมวลผลข้อมูล...</div>;
  
  return (
    <div className="h-80 w-full">
      <h3 className="text-xl font-bold mb-6 text-gray-800">สรุปการส่งงานรวมทุกห้อง</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            cursor={{ fill: 'transparent' }}
          />
          <Legend />
          <Bar dataKey="total" name="จำนวนที่ต้องส่ง" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
          <Bar dataKey="submitted" name="ส่งแล้ว" fill="#0284c7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
