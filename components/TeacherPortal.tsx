import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Users, FileEdit, BarChart2, CheckSquare, Save, Trash2, Edit2, Plus, X, Bell, Image as ImageIcon, Pin, FileSpreadsheet, Copy, Maximize2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as DataService from '../services/dataService';
import { Student, Assignment, Submission, ROOMS, Announcement } from '../types';

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
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
               activeTab === tab.id 
               ? 'bg-gray-800 text-white shadow' 
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
                    <td className="px-4 py-3 text-center border-l font-bold text-blue-700">{total}</td>
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
      html: `<input id="swal-name" class="swal2-input" value="${student.name}"><input id="swal-number" class="swal2-input" type="number" value="${student.number}">`,
      preConfirm: () => ({ name: (document.getElementById('swal-name') as HTMLInputElement).value, number: Number((document.getElementById('swal-number') as HTMLInputElement).value) })
    });
    if (formValues) {
      await DataService.registerStudent({ ...student, ...formValues });
      fetchStudents();
      Swal.fire('สำเร็จ', 'แก้ไขเรียบร้อย', 'success');
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({ title: 'ลบข้อมูล?', icon: 'warning', showCancelButton: true }).then(async (r) => {
      if (r.isConfirmed) { await DataService.deleteStudent(id, filterRoom); fetchStudents(); }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">จัดการข้อมูลนักเรียน</h3>
        <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="border rounded-lg px-3 py-2">
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100"><tr><th className="p-4">เลขที่</th><th className="p-4">ชื่อ-สกุล</th><th className="p-4 text-right">จัดการ</th></tr></thead>
        <tbody>
          {students.sort((a,b)=>a.number-b.number).map(s => (
            <tr key={s.id} className="border-b">
              <td className="p-4">{s.number}</td><td className="p-4">{s.name}</td>
              <td className="p-4 text-right flex justify-end gap-2">
                <button onClick={() => handleEdit(s)} className="text-blue-500"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(s.studentId)} className="text-red-500"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      title: 'แก้ไขข้อมูลภาระงาน',
      html: `
        <div class="text-left mb-1 font-bold text-gray-700">ชื่อภาระงาน:</div>
        <input id="swal-title" class="swal2-input w-full mb-4" style="margin-top: 0;" value="${assign.title}" placeholder="ชื่อภาระงาน">
        <div class="text-left mb-1 font-bold text-gray-700">คะแนนเต็ม:</div>
        <input id="swal-score" type="number" class="swal2-input w-full" style="margin-top: 0;" value="${assign.maxScore}" placeholder="คะแนนเต็ม">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const score = (document.getElementById('swal-score') as HTMLInputElement).value;
        if (!title || !score) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
          return false;
        }
        return { title, maxScore: Number(score) };
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        await DataService.updateAssignment({ ...assign, ...formValues });
        await fetchAssignments();
        Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
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
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nbw-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <div key={a.id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-nbw-100 flex items-center justify-center text-nbw-600 font-bold">
                  {a.order}
                </div>
                <div>
                  <div className="font-bold text-gray-800 group-hover:text-nbw-600 transition-colors">{a.title}</div>
                  <div className="text-sm text-gray-500">
                    คะแนนเต็ม: <span className="font-bold text-nbw-600">{a.maxScore}</span> 
                    <span className="mx-2">|</span>
                    {a.term === 'pre-midterm' ? 'ก่อนกลางภาค' : 'หลังกลางภาค'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(a)} 
                className="p-2 text-gray-400 hover:text-nbw-600 hover:bg-nbw-50 rounded-xl transition-all"
                title="แก้ไขภาระงาน"
              >
                <Edit2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
        <p className="font-bold mb-1">คำแนะนำ:</p>
        <p>การแก้ไขชื่อภาระงานหรือคะแนนเต็มจะส่งผลต่อการแสดงผลในหน้าสรุปคะแนนและหน้านักเรียนทันที ข้อมูลจะถูกบันทึกลงในชีท Assignments โดยใช้ ID ของงานเป็นตัวอ้างอิง</p>
      </div>
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
      ]);
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
        return DataService.gradeSubmission(sid, aid, v, room);
      }));
      await fetchData(); 
      setTempScores({}); 
      Swal.fire('สำเร็จ', 'บันทึกคะแนนเรียบร้อยแล้ว', 'success');
    } catch (err) {
      Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  };

  const showFullImage = (url: string) => {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'ผลงานนักเรียน',
      showConfirmButton: false,
      showCloseButton: true,
      background: 'white',
      backdrop: 'rgba(0,0,0,0.8)',
      width: '80%',
      customClass: {
        image: 'max-h-[85vh] object-contain rounded-lg shadow-2xl'
      }
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
          <button 
            onClick={save} 
            disabled={Object.keys(tempScores).length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow transition-all ${
              Object.keys(tempScores).length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} /> บันทึกทั้งหมด
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">กำลังโหลดข้อมูลการส่งงาน...</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 w-16 text-center">เลขที่</th>
                <th className="p-4 min-w-[150px]">ชื่อ-สกุล</th>
                {assignments.map(a => (
                  <th key={a.id} className="p-4 border-l min-w-[120px] text-center">
                    <div className="text-xs uppercase opacity-60 mb-1">Max: {a.maxScore}</div>
                    <div className="font-bold truncate max-w-[100px] mx-auto" title={a.title}>{a.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.length === 0 ? (
                <tr><td colSpan={assignments.length + 2} className="p-10 text-center text-gray-400">ไม่พบข้อมูลนักเรียนในห้องนี้</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center font-medium text-gray-500">{s.number}</td>
                  <td className="p-4 font-semibold text-gray-800">{s.name}</td>
                  {assignments.map(a => {
                    const sub = submissions.find(x => x.studentId === s.studentId && x.assignmentId === a.id);
                    const key = `${s.studentId}::${a.id}`;
                    return (
                      <td key={a.id} className="p-4 border-l">
                         <div className="flex flex-col items-center gap-3">
                           {/* ส่วนแสดงรูปภาพที่นักเรียนส่ง */}
                           {sub?.imageUrl ? (
                             <div className="relative group">
                               <img 
                                 src={sub.imageUrl} 
                                 className="h-12 w-12 object-cover rounded shadow-sm border border-gray-200 cursor-pointer hover:scale-110 transition-transform" 
                                 onClick={() => showFullImage(sub.imageUrl)}
                                 title="คลิกเพื่อดูรูปขนาดเต็ม"
                               />
                               <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Maximize2 size={8} />
                               </div>
                             </div>
                           ) : (
                             <div className="h-12 w-12 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-300" title="ยังไม่ส่งงาน">
                               <ImageIcon size={16} />
                             </div>
                           )}

                           {/* ส่วนกรอกคะแนน */}
                           <div className="flex items-center gap-1">
                             <input 
                               type="number" 
                               max={a.maxScore}
                               min={0}
                               className={`w-14 border rounded-lg text-center py-1 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                                 tempScores[key] !== undefined ? 'bg-yellow-50 border-yellow-300 text-blue-700' : 'bg-white text-gray-700'
                               }`} 
                               value={tempScores[key] !== undefined ? tempScores[key] : (sub?.score ?? '')}
                               onChange={e => setTempScores({...tempScores, [key]: Number(e.target.value)})}
                               placeholder="-"
                             />
                           </div>
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
  const [form, setForm] = useState<{ id?: string, title: string, content: string, imageUrl: string | null, isPinned: boolean, date: string }>({
    title: '', content: '', imageUrl: null, isPinned: false, date: ''
  });

  const fetch = async () => {
    const data = await DataService.getAnnouncements();
    setAnnouncements(data.sort((a,b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1));
  };
  useEffect(() => { fetch(); }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('ขนาดไฟล์ใหญ่เกินไป', 'กรุณาเลือกรูปภาพขนาดไม่เกิน 2MB เพื่อการบันทึกข้อมูลที่เสถียร', 'warning');
        return;
      }
      try {
        const base64 = await DataService.fileToBase64(file);
        setForm({...form, imageUrl: base64});
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถประมวลผลรูปภาพได้', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }
    
    setLoading(true);
    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', didOpen: () => Swal.showLoading() });
    
    const ann: Announcement = {
      id: form.id || DataService.generateUUID(),
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || '', 
      date: form.date || new Date().toLocaleDateString('th-TH'),
      isPinned: form.isPinned
    };

    try {
      if (isEditing) await DataService.updateAnnouncement(ann);
      else await DataService.addAnnouncement(ann);
      
      setForm({ title: '', content: '', imageUrl: null, isPinned: false, date: '' });
      setIsEditing(false);
      await fetch();
      Swal.fire('สำเร็จ', 'บันทึกประกาศเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลลงตารางได้ กรุณาตรวจสอบการเชื่อมต่อ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const edit = (a: Announcement) => {
    setForm({ 
      id: a.id, 
      title: a.title, 
      content: a.content, 
      imageUrl: a.imageUrl || null, 
      isPinned: a.isPinned || false, 
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
        fetch(); 
        Swal.fire('สำเร็จ', 'ลบประกาศแล้ว', 'success');
      }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl border h-fit shadow-sm sticky top-4">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          {isEditing ? <Edit2 className="text-nbw-500"/> : <Plus className="text-green-500"/>}
          {isEditing ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อประกาศ</label>
            <input className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-nbw-500 outline-none" placeholder="หัวข้อ..." value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea className="w-full border rounded-lg p-2 h-32 focus:ring-2 focus:ring-nbw-500 outline-none" placeholder="เนื้อหา..." value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
          </div>
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-lg border hover:bg-gray-100 transition">
            <input type="checkbox" className="w-4 h-4 text-nbw-600 rounded" checked={form.isPinned} onChange={e=>setForm({...form, isPinned:e.target.checked})} />
            <span className="text-sm font-medium flex items-center gap-1"><Pin size={14} className="text-nbw-500"/> ปักหมุดประกาศนี้ไว้ด้านบนสุด</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพประกอบ (แนะนำไม่เกิน 2MB)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-nbw-50 text-nbw-600 border border-nbw-100 px-4 py-2 rounded-lg text-sm hover:bg-nbw-100 transition flex items-center gap-2">
                <ImageIcon size={18} /> เลือกรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
              {form.imageUrl && <span className="text-xs text-green-600 font-bold">พร้อมอัปโหลด</span>}
            </div>
          </div>
          {form.imageUrl && (
            <div className="relative inline-block mt-2">
              <img src={form.imageUrl} className="h-40 rounded-lg border shadow-md object-cover"/>
              <button type="button" onClick={()=>setForm({...form, imageUrl:null})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition">
                <X size={14}/>
              </button>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <button type="submit" disabled={loading} className={`flex-1 text-white py-2.5 rounded-lg font-bold shadow transition disabled:opacity-50 ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {isEditing ? 'บันทึกการแก้ไข' : 'โพสต์ประกาศ'}
            </button>
            {isEditing && (
              <button type="button" onClick={()=>{setIsEditing(false); setForm({title:'', content:'', imageUrl:null, isPinned:false, date:''})}} className="px-4 border rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 font-medium">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700">ประกาศทั้งหมด ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">ยังไม่มีประกาศในขณะนี้</div>
        ) : announcements.map(a => (
          <div key={a.id} className={`p-4 bg-white rounded-xl border flex gap-4 hover:shadow-md transition ${a.isPinned ? 'ring-2 ring-blue-100 border-blue-200' : 'border-gray-100'}`}>
            {a.imageUrl ? (
              <img src={a.imageUrl} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border bg-gray-50"/>
            ) : (
              <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 border flex items-center justify-center text-gray-300">
                <ImageIcon size={32} />
              </div>
            )}
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-gray-800 truncate flex items-center gap-1">
                  {a.isPinned && <Pin size={14} className="text-nbw-500" fill="currentColor"/>}
                  {a.title}
                </h4>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>edit(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="แก้ไข"><Edit2 size={16}/></button>
                  <button onClick={()=>del(a.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="ลบ"><Trash2 size={16}/></button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{a.date}</p>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{a.content}</p>
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
    Promise.all([DataService.getStudents(), DataService.getSubmissions(), DataService.getAssignments()]).then(([students, subs, assigns]) => {
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
          <Bar dataKey="submitted" name="ส่งแล้ว" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
