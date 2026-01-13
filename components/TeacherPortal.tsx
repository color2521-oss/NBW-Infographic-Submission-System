
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
      const [allStudents, allAssigns, allSubs] = await Promise.all([DataService.getStudents(room), DataService.getAssignments(), DataService.getSubmissions(room)]);
      setStudents(allStudents.sort((a,b) => a.number - b.number));
      setAssignments(allAssigns);
      setSubmissions(allSubs);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [room]);
  const copyColumnScores = (assignmentId: string, title: string) => {
    const scores = students.map(std => {
      const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assignmentId);
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
                    <div className="flex flex-col items-center"><span className="truncate w-full font-bold">{a.title}</span><button onClick={() => copyColumnScores(a.id, a.title)} className="mt-1 bg-white border px-2 py-0.5 rounded text-xs hover:bg-green-50">Copy</button></div>
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
        <select id="swal-room" class="swal2-input">${ROOMS.map(r => `<option value="${r}" ${r === student.room ? 'selected' : ''}>${r}</option>`).join('')}</select>
        <select id="swal-number" class="swal2-input">${NUMBERS.map(n => `<option value="${n}" ${n === student.number ? 'selected' : ''}>${n}</option>`).join('')}</select>
      `,
      showCancelButton: true,
      preConfirm: () => ({
        studentId: (document.getElementById('swal-studentId') as HTMLInputElement).value,
        name: (document.getElementById('swal-name') as HTMLInputElement).value,
        room: (document.getElementById('swal-room') as HTMLSelectElement).value,
        number: Number((document.getElementById('swal-number') as HTMLSelectElement).value)
      })
    });
    if (formValues) {
      await DataService.registerStudent({ ...student, ...formValues });
      fetchStudents();
    }
  };
  const handleDelete = (id: string) => {
    Swal.fire({ title: 'ลบข้อมูลนักเรียน?', icon: 'warning', showCancelButton: true }).then(async (r) => {
      if (r.isConfirmed) { await DataService.deleteStudent(id, filterRoom); fetchStudents(); }
    });
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><Users className="text-nbw-600" /> จัดการนักเรียน</h3>
        <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-nbw-500 outline-none">
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {loading ? <div className="text-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nbw-500 mx-auto"></div></div> : (
        <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr><th className="p-4 w-16 text-center font-bold">เลขที่</th><th className="p-4 w-32 font-bold">รหัสประจำตัว</th><th className="p-4 font-bold">ชื่อ-นามสกุล</th><th className="p-4 w-24 text-center font-bold">ห้อง</th><th className="p-4 w-32 text-right font-bold">จัดการ</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.sort((a,b)=>a.number-b.number).map(s => (
                <tr key={s.id} className="hover:bg-nbw-50"><td className="p-4 text-center font-bold">{s.number}</td><td className="p-4 font-mono">{s.studentId}</td><td className="p-4 font-semibold">{s.name}</td><td className="p-4 text-center">{s.room}</td><td className="p-4 text-right flex justify-end gap-1"><button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-nbw-600"><Edit2 size={18} /></button><button onClick={() => handleDelete(s.studentId)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button></td></tr>
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
  const fetchAssignments = async () => {
    const data = await DataService.getAssignments();
    setAssignments(data);
  };
  useEffect(() => { fetchAssignments(); }, []);
  const handleEdit = async (assign: Assignment) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขภาระงาน',
      html: `<input id="swal-title" class="swal2-input" value="${assign.title}"><input id="swal-score" type="number" class="swal2-input" value="${assign.maxScore}">`,
      showCancelButton: true,
      preConfirm: () => ({ title: (document.getElementById('swal-title') as HTMLInputElement).value, maxScore: Number((document.getElementById('swal-score') as HTMLInputElement).value) })
    });
    if (formValues) { await DataService.updateAssignment({ ...assign, ...formValues }); fetchAssignments(); }
  };
  return (
    <div className="grid gap-4">
      {assignments.map(a => (
        <div key={a.id} className="p-5 border rounded-2xl flex justify-between items-center bg-white shadow-sm hover:shadow-md">
          <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-nbw-50 flex items-center justify-center text-nbw-600 font-bold text-lg">{a.order}</div><div><div className="font-bold text-gray-800 text-lg">{a.title}</div><div className="text-sm text-gray-400">เต็ม {a.maxScore} | {a.term}</div></div></div>
          <button onClick={() => handleEdit(a)} className="p-3 text-gray-400 hover:text-nbw-600 hover:bg-nbw-100 rounded-2xl"><Edit2 size={20} /></button>
        </div>
      ))}
    </div>
  );
};

const GradingSystem: React.FC = () => {
  const [room, setRoom] = useState(ROOMS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tempScores, setTempScores] = useState<Record<string, number>>({});
  const fetchData = async () => {
    const [s, a, sub] = await Promise.all([DataService.getStudents(room), DataService.getAssignments(), DataService.getSubmissions(room)]);
    setStudents(s.sort((a,b)=>a.number-b.number)); setAssignments(a); setSubmissions(sub);
  };
  useEffect(() => { fetchData(); }, [room]);
  const save = async () => {
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
    try {
      await Promise.all(Object.entries(tempScores).map(([k, v]) => {
        const [sid, aid] = k.split('::');
        return DataService.gradeSubmission(sid, aid, v, room);
      }));
      await fetchData(); setTempScores({});
      Swal.fire('สำเร็จ', 'บันทึกเรียบร้อย', 'success');
    } catch (err) { Swal.fire('Error', 'ผิดพลาด', 'error'); }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><CheckSquare className="text-blue-600" /> ตรวจงาน</h3>
        <div className="flex gap-2">
          <select value={room} onChange={e=>setRoom(e.target.value)} className="border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none">{ROOMS.map(r=><option key={r} value={r}>{r}</option>)}</select>
          <button onClick={save} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">บันทึกทั้งหมด</button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-xl shadow-sm"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-4 w-16 text-center">เลขที่</th><th className="p-4 min-w-[150px]">ชื่อ-สกุล</th>{assignments.map(a => <th key={a.id} className="p-4 border-l min-w-[100px] text-center">{a.title}</th>)}</tr></thead><tbody className="divide-y">{students.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="p-4 text-center">{s.number}</td><td className="p-4 font-semibold">{s.name}</td>{assignments.map(a => { const sub = submissions.find(x => x.studentId === s.studentId && x.assignmentId === a.id); const key = `${s.studentId}::${a.id}`; return (<td key={a.id} className="p-4 border-l text-center"><div className="flex flex-col items-center gap-2">{sub?.imageUrl && (<img src={DataService.formatDriveUrl(sub.imageUrl)} className="h-10 w-10 object-cover rounded cursor-pointer" onClick={() => Swal.fire({ html: `<img src="${DataService.formatDriveUrl(sub.imageUrl, 's1000')}" style="width:100%">`, showConfirmButton: false })} />)}<input type="number" className="w-14 border rounded text-center py-1 text-xs" value={tempScores[key] !== undefined ? tempScores[key] : (sub?.score ?? '')} onChange={e => setTempScores({...tempScores, [key]: Number(e.target.value)})} placeholder="-" /></div></td>); })}</tr>))}</tbody></table></div>
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
      <div className={`bg-white p-6 rounded-2xl border-2 h-fit shadow-sm sticky top-4 ${isEditing ? 'border-nbw-500' : 'border-nbw-50'}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">{isEditing ? <Edit2 className="text-nbw-500" /> : <Plus className="text-green-500" />} {isEditing ? 'แก้ไขประกาศ' : 'สร้างประกาศ'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-nbw-500 outline-none" placeholder="หัวข้อ" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          <textarea className="w-full border rounded-xl px-4 py-2 h-28 focus:ring-2 focus:ring-nbw-500 outline-none" placeholder="เนื้อหา" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer bg-nbw-50/50 p-2.5 rounded-xl border border-nbw-100"><input type="checkbox" className="w-5 h-5" checked={form.isPinned} onChange={e=>setForm({...form, isPinned:e.target.checked})} /><span className="text-sm font-bold flex items-center gap-2"><Pin size={16}/> ปักหมุด</span></label>
            <label className="flex items-center gap-3 cursor-pointer bg-red-50/50 p-2.5 rounded-xl border border-red-100"><input type="checkbox" className="w-5 h-5" checked={form.isHidden} onChange={e=>setForm({...form, isHidden:e.target.checked})} /><span className="text-sm font-bold flex items-center gap-2"><EyeOff size={16}/> ซ่อน</span></label>
          </div>
          <label className="w-full flex items-center justify-center gap-2 cursor-pointer bg-white text-nbw-600 border-2 border-dashed border-nbw-300 py-3 rounded-xl text-sm font-bold hover:border-nbw-500"><ImageIcon size={18} /> {form.imageUrl ? 'เปลี่ยนรูป' : 'เลือกรูป'}<input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) setForm({...form, imageUrl: await DataService.fileToBase64(f)}); }} /></label>
          {form.imageUrl && <img src={DataService.formatDriveUrl(form.imageUrl)} className="max-h-40 mx-auto rounded-lg object-contain border" />}
          <button type="submit" disabled={loading} className={`w-full text-white py-3 rounded-xl font-bold shadow-lg ${isEditing ? 'bg-nbw-900' : 'bg-nbw-600'}`}>{isEditing ? 'อัปเดตประกาศ' : 'โพสต์ประกาศ'}</button>
          {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setForm({id:'',title:'',content:'',imageUrl:null,isPinned:false,isHidden:false,date:''})}} className="w-full text-gray-400 mt-2 hover:underline">ยกเลิก</button>}
        </form>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 ml-1"><Bell className="text-nbw-500" /> รายการประกาศ</h3>
        {announcements.map(a => {
          const isPinned = DataService.parseBool(a.isPinned);
          const isHidden = DataService.parseBool(a.isHidden);
          return (
            <div key={a.id} className={`bg-white rounded-2xl border shadow-sm flex group overflow-hidden ${isPinned ? 'border-nbw-300' : 'border-gray-100'}`}>
              <div className="w-24 h-24 sm:w-32 bg-gray-50 flex-shrink-0 border-r">{a.imageUrl ? <img src={DataService.formatDriveUrl(a.imageUrl)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>}</div>
              <div className="p-4 flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1"><h4 className={`font-bold truncate flex items-center gap-1.5 ${isHidden ? 'text-gray-400' : 'text-gray-800'}`}>{isPinned && <Pin size={14} fill="currentColor" className="text-nbw-500"/>}{isHidden && <EyeOff size={14} className="text-red-400"/>} {a.title}</h4><div className="flex gap-1"><button onClick={()=>edit(a)} className="text-blue-500 p-1 hover:bg-blue-50 rounded"><Edit2 size={16}/></button><button onClick={async ()=>{ if((await Swal.fire({title:'ลบประกาศ?', showCancelButton:true})).isConfirmed) { await DataService.deleteAnnouncement(a.id); fetchAnnouncements(); } }} className="text-red-400 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button></div></div>
                <p className="text-[10px] font-black text-nbw-600 uppercase mb-1">{a.date} {isHidden && <span className="text-red-500 ml-2">(ซ่อนอยู่)</span>}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{a.content}</p>
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
  useEffect(() => {
    Promise.all([DataService.getStudents(), DataService.getSubmissions(), DataService.getAssignments()]).then(([students, subs, assigns]) => {
      setData(ROOMS.map(r => ({ name: r.split('/')[1], total: students.filter(s=>s.room===r).length * assigns.length, submitted: subs.filter(sub => students.filter(s=>s.room===r).some(s=>s.studentId===sub.studentId)).length })));
    });
  }, []);
  return (
    <div className="h-80 w-full"><h3 className="text-xl font-bold mb-6 text-gray-800">สรุปการส่งงานรวมทุกห้อง</h3><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="total" name="จำนวนที่ต้องส่ง" fill="#e5e7eb" /><Bar dataKey="submitted" name="ส่งแล้ว" fill="#0284c7" /></BarChart></ResponsiveContainer></div>
  );
}
