import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  Users, FileEdit, BarChart2, CheckSquare, Save, Trash2, Edit2, Plus, X, Bell, Image as ImageIcon, Pin, FileSpreadsheet, Copy
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
  useEffect(() => { DataService.getAssignments().then(setAssignments); }, []);
  return (
    <div>
      <h3 className="text-xl font-bold mb-6">จัดการงาน</h3>
      <div className="space-y-2">
        {assignments.map(a => (
          <div key={a.id} className="p-4 border rounded-lg flex justify-between">
            <span>{a.title} ({a.maxScore} คะแนน)</span>
          </div>
        ))}
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
  
  const fetchData = async () => {
    const [s, a, sub] = await Promise.all([DataService.getStudents(room), DataService.getAssignments(), DataService.getSubmissions(room)]);
    setStudents(s.sort((a,b)=>a.number-b.number)); setAssignments(a); setSubmissions(sub);
  };
  useEffect(() => { fetchData(); }, [room]);

  const save = async () => {
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
    await Promise.all(Object.entries(tempScores).map(([k, v]) => {
      const [sid, aid] = k.split('::');
      return DataService.gradeSubmission(sid, aid, v, room);
    }));
    fetchData(); setTempScores({}); Swal.fire('สำเร็จ', 'บันทึกแล้ว', 'success');
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h3 className="text-xl font-bold">ตรวจงาน</h3>
        <div className="flex gap-2">
          <select value={room} onChange={e=>setRoom(e.target.value)} className="border rounded px-2">{ROOMS.map(r=><option key={r} value={r}>{r}</option>)}</select>
          <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded">บันทึกทั้งหมด</button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr><th className="p-2">เลขที่</th><th className="p-2">ชื่อ</th>{assignments.map(a=><th key={a.id} className="p-2 border-l">{a.title}</th>)}</tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-2 text-center">{s.number}</td><td className="p-2">{s.name}</td>
                {assignments.map(a => {
                  const sub = submissions.find(x => x.studentId === s.studentId && x.assignmentId === a.id);
                  const key = `${s.studentId}::${a.id}`;
                  return (
                    <td key={a.id} className="p-2 border-l text-center">
                       <input type="number" className="w-12 border rounded text-center" 
                         value={tempScores[key] !== undefined ? tempScores[key] : (sub?.score ?? '')}
                         onChange={e => setTempScores({...tempScores, [key]: Number(e.target.value)})}
                       />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      const base64 = await DataService.fileToBase64(file);
      setForm({...form, imageUrl: base64});
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
    
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
      Swal.fire('สำเร็จ', 'บันทึกเรียบร้อย', 'success');
    } catch (err) {
      Swal.fire('Error', 'บันทึกไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const edit = (a: Announcement) => {
    setForm({ id: a.id, title: a.title, content: a.content, imageUrl: a.imageUrl || null, isPinned: a.isPinned || false, date: a.date });
    setIsEditing(true);
  };

  const del = (id: string) => {
    Swal.fire({ title: 'ลบ?', icon: 'warning', showCancelButton: true }).then(async (r) => {
      if (r.isConfirmed) { await DataService.deleteAnnouncement(id); fetch(); }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl border h-fit shadow-sm">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          {isEditing ? <Edit2 className="text-blue-500"/> : <Plus className="text-green-500"/>}
          {isEditing ? 'แก้ไขประกาศ' : 'เพิ่มประกาศ'}
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full border rounded p-2" placeholder="หัวข้อ" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          <textarea className="w-full border rounded p-2 h-32" placeholder="เนื้อหา" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required />
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border">
            <input type="checkbox" checked={form.isPinned} onChange={e=>setForm({...form, isPinned:e.target.checked})} />
            <span className="text-sm">ปักหมุดประกาศ</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded text-sm hover:bg-gray-200">
              <ImageIcon size={18} className="inline mr-2" /> เลือกรูปภาพ
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
            {form.imageUrl && <span className="text-xs text-green-600 font-bold">มีรูปภาพ</span>}
          </div>
          {form.imageUrl && <div className="relative inline-block"><img src={form.imageUrl} className="h-20 rounded border"/><button type="button" onClick={()=>setForm({...form, imageUrl:null})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 bg-nbw-600 text-white py-2 rounded font-bold hover:bg-nbw-700 disabled:opacity-50">บันทึก</button>
            {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setForm({title:'', content:'', imageUrl:null, isPinned:false, date:''})}} className="px-4 border rounded">ยกเลิก</button>}
          </div>
        </form>
      </div>
      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a.id} className={`p-4 bg-white rounded-xl border flex gap-4 ${a.isPinned ? 'ring-2 ring-blue-100' : ''}`}>
            {a.imageUrl && <img src={a.imageUrl} className="w-20 h-20 object-cover rounded"/>}
            <div className="flex-grow">
              <div className="flex justify-between">
                <h4 className="font-bold flex items-center gap-1">{a.isPinned && <Pin size={14} className="text-blue-500"/>}{a.title}</h4>
                <div className="flex gap-1">
                  <button onClick={()=>edit(a)} className="p-1 text-blue-500"><Edit2 size={14}/></button>
                  <button onClick={()=>del(a.id)} className="p-1 text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{a.date}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{a.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([DataService.getStudents(), DataService.getSubmissions(), DataService.getAssignments()]).then(([students, subs, assigns]) => {
      const stats = ROOMS.map(r => ({
        name: r.split('/')[1],
        total: students.filter(s=>s.room===r).length * assigns.length,
        submitted: subs.filter(sub => students.filter(s=>s.room===r).some(s=>s.studentId===sub.studentId)).length
      }));
      setData(stats);
    });
  }, []);
  return (
    <div className="h-80 w-full">
      <h3 className="text-xl font-bold mb-6">สรุปการส่งงาน</h3>
      <ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Legend/><Bar dataKey="total" name="งานทั้งหมด" fill="#e5e7eb"/><Bar dataKey="submitted" name="ส่งแล้ว" fill="#0ea5e9"/></BarChart></ResponsiveContainer>
    </div>
  );
}
