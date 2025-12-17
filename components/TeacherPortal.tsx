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
              placeholder="รหัสผ่าน (12345)"
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
      {/* Teacher Navigation */}
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

// --- Sub-components for Teacher Portal ---

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

  useEffect(() => {
    fetchData();
  }, [room]);

  const copyColumnScores = (assignmentId: string, title: string) => {
    // Get scores sorted by student number (same as table display)
    const scoresToCopy = students.map(std => {
      const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assignmentId);
      // Return score or empty string if null/undefined. 
      // Using empty string allows pasting into Excel without overwriting with "0" if that's preferred, 
      // or change to '0' if you want explicit zeros.
      return sub?.score !== null && sub?.score !== undefined ? sub.score : ''; 
    });

    const textToCopy = scoresToCopy.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: `คัดลอกคะแนน "${title}" เรียบร้อย`
      });
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="text-green-600" /> สรุปคะแนนรายห้อง
        </h3>
        <select 
          value={room} 
          onChange={(e) => setRoom(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
        >
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">กำลังประมวลผล...</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-4 bg-gray-200 w-16 text-center border-b border-gray-300">เลขที่</th>
                <th className="px-4 py-4 bg-gray-200 w-48 border-b border-gray-300">ชื่อ-สกุล</th>
                {assignments.map(a => (
                  <th key={a.id} className="px-2 py-2 bg-gray-50 min-w-[120px] text-center border-l border-b border-gray-200 relative group">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="truncate w-full font-bold text-gray-700" title={a.title}>{a.title}</span>
                      <span className="text-[10px] text-gray-400">({a.maxScore} คะแนน)</span>
                      <button 
                        onClick={() => copyColumnScores(a.id, a.title)}
                        className="mt-1 flex items-center gap-1 bg-white border border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300 px-2 py-0.5 rounded text-xs transition-all shadow-sm active:scale-95"
                        title="คัดลอกคะแนนทั้งคอลัมน์"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 bg-gray-200 w-24 text-center border-l border-b border-gray-300 font-bold text-gray-800">รวมคะแนน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length > 0 ? (
                students.map((std) => {
                  let totalScore = 0;
                  return (
                    <tr key={std.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-center text-gray-900 bg-gray-50/50">{std.number}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{std.name}</td>
                      {assignments.map(assign => {
                        const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assign.id);
                        const score = sub?.score;
                        if (typeof score === 'number') totalScore += score;
                        
                        return (
                          <td key={assign.id} className="px-2 py-3 text-center border-l border-gray-100">
                             {score !== null && score !== undefined ? (
                               <span className={`font-medium ${score >= (assign.maxScore / 2) ? 'text-green-600' : 'text-red-500'}`}>
                                 {score}
                               </span>
                             ) : (
                               <span className="text-gray-300">-</span>
                             )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center border-l border-gray-200 bg-gray-50 font-bold text-blue-700">
                        {totalScore}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={assignments.length + 3} className="px-6 py-10 text-center text-gray-400">
                    ไม่พบข้อมูลนักเรียนในห้อง {room}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-xs text-gray-400 text-right">
        * ปุ่ม Copy จะคัดลอกคะแนนทั้งหมดในคอลัมน์นั้น (เรียงตามเลขที่) เพื่อนำไปวางใน Excel/Sheets
      </div>
    </div>
  );
};

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filterRoom, setFilterRoom] = useState(ROOMS[0]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    // Fetch students specific to the filtered room
    const data = await DataService.getStudents(filterRoom);
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, [filterRoom]); // Re-fetch when room changes

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "การกระทำนี้ไม่สามารถเรียกคืนได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({title: 'กำลังลบ...', didOpen: () => Swal.showLoading()});
        await DataService.deleteStudent(id, filterRoom);
        await fetchStudents();
        Swal.fire('ลบแล้ว!', 'ข้อมูลถูกลบเรียบร้อย', 'success');
      }
    });
  };

  const handleEdit = async (student: Student) => {
    const { value: formValues } = await Swal.fire({
      title: 'แก้ไขข้อมูลนักเรียน',
      html: `
        <div class="text-left mb-2 space-y-3 p-2">
            <div>
                <label class="text-sm text-gray-600 font-medium">ชื่อ-สกุล</label>
                <input id="swal-name" class="swal2-input w-full m-0 h-10 px-3 border rounded text-base" placeholder="ชื่อ-สกุล" value="${student.name}">
            </div>
            <div>
                <label class="text-sm text-gray-600 font-medium">เลขที่</label>
                <input id="swal-number" class="swal2-input w-full m-0 h-10 px-3 border rounded text-base" type="number" placeholder="เลขที่" value="${student.number}">
            </div>
            <div>
                <label class="text-sm text-gray-600 font-medium">ห้อง</label>
                <select id="swal-room" class="swal2-input w-full m-0 h-10 px-3 border rounded text-base">
                    ${ROOMS.map(r => `<option value="${r}" ${r === student.room ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const number = (document.getElementById('swal-number') as HTMLInputElement).value;
        const room = (document.getElementById('swal-room') as HTMLSelectElement).value;
        if (!name || !number || !room) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
          return null;
        }
        return { name, number: Number(number), room };
      }
    });

    if (formValues) {
      Swal.fire({title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading()});
      
      // If room changed, we need to delete from old room and add to new room
      if (formValues.room !== student.room) {
          await DataService.deleteStudent(student.studentId, student.room);
          await DataService.registerStudent({ ...student, ...formValues });
      } else {
          await DataService.registerStudent({ ...student, ...formValues });
      }
      
      await fetchStudents();
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขเรียบร้อย',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">จัดการข้อมูลนักเรียน</h3>
        <select 
          value={filterRoom} 
          onChange={(e) => setFilterRoom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">เลขประจำตัว</th>
                <th className="px-6 py-3">เลขที่</th>
                <th className="px-6 py-3">ชื่อ-สกุล</th>
                <th className="px-6 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students
                .sort((a,b) => a.number - b.number)
                .map((student) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4">{student.number}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                          >
                            <Edit2 size={16} /> แก้ไข
                          </button>
                          <button 
                            onClick={() => handleDelete(student.studentId)}
                            className="text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={16} /> ลบ
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">ไม่มีข้อมูลนักเรียนในห้องนี้</td>
                </tr>
              )}
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
    const data = await DataService.getAssignments();
    setAssignments(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Simplified editing - in a real app would be a modal
  const handleEditTitle = async (assign: Assignment) => {
    const { value: newTitle } = await Swal.fire({
      title: 'แก้ไขชื่องาน',
      input: 'text',
      inputValue: assign.title,
      showCancelButton: true,
      inputValidator: (value) => !value ? 'กรุณาใส่ชื่อ' : null
    });

    if (newTitle) {
      Swal.fire({title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading()});
      await DataService.updateAssignment({ ...assign, title: newTitle });
      await fetchAssignments();
      Swal.fire('สำเร็จ', 'แก้ไขเรียบร้อย', 'success');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">จัดการงานที่มอบหมาย</h3>
      {loading ? (
        <div className="text-center py-4">กำลังโหลด...</div>
      ) : (
        <div className="space-y-4">
            {assignments.map(assign => (
            <div key={assign.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition bg-gray-50">
                <div>
                <div className="font-bold text-gray-800">{assign.title}</div>
                <div className="text-xs text-gray-500 uppercase mt-1">
                    {assign.term === 'pre-midterm' ? 'ก่อนกลางภาค' : 'หลังกลางภาค'} • {assign.maxScore} คะแนน
                </div>
                </div>
                <div className="flex gap-2">
                <button 
                    onClick={() => handleEditTitle(assign)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                >
                    <Edit2 size={18} />
                </button>
                </div>
            </div>
            ))}
        </div>
      )}
      <div className="mt-6 text-sm text-gray-400 text-center">
        * โครงสร้างคะแนนถูกกำหนดไว้แล้วตามหลักสูตร (แก้ไขชื่อได้เท่านั้น)
      </div>
    </div>
  );
};

const GradingSystem: React.FC = () => {
  const [room, setRoom] = useState(ROOMS[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Local state for grading inputs before save
  const [tempScores, setTempScores] = useState<Record<string, number>>({});

  const fetchData = async () => {
    setLoading(true);
    // Fetch data specifically for this room
    const [allStudents, allAssigns, allSubs] = await Promise.all([
        DataService.getStudents(room),
        DataService.getAssignments(),
        DataService.getSubmissions(room)
    ]);
    
    setStudents(allStudents.sort((a,b) => a.number - b.number));
    setAssignments(allAssigns);
    setSubmissions(allSubs);
    setTempScores({}); // Reset temp scores on room change
    setLoading(false);
  };

  // When room changes, fetch data
  useEffect(() => {
    fetchData();
  }, [room]);

  const handleScoreChange = (submissionKey: string, val: string, max: number) => {
    let num = parseFloat(val);
    if (isNaN(num)) return; // Allow empty typing but handle logic carefully
    if (num < 0) num = 0;
    if (num > max) num = max;
    setTempScores(prev => ({ ...prev, [submissionKey]: num }));
  };

  const saveScores = () => {
    Swal.fire({
      title: 'กำลังบันทึกคะแนน...',
      didOpen: () => Swal.showLoading(),
    });
    
    // Process sequentially or parallel
    // We pass 'room' to gradeSubmission so GAS knows which sheet to update
    const promises = Object.entries(tempScores).map(([key, score]) => {
        const [studentId, assignmentId] = key.split('::');
        return DataService.gradeSubmission(studentId, assignmentId, score as number, room);
    });

    Promise.all(promises).then(() => {
        fetchData(); // Refresh
        Swal.fire('สำเร็จ', 'บันทึกคะแนนเรียบร้อยแล้ว', 'success');
    }).catch(err => {
        Swal.fire('ข้อผิดพลาด', 'บันทึกไม่สำเร็จบางรายการ', 'error');
    });
  };

  const showImage = (url: string, title: string) => {
    Swal.fire({
      title: title,
      imageUrl: url,
      imageAlt: 'Assignment Image',
      width: '80%',
      showCloseButton: true,
      confirmButtonText: 'ปิด'
    });
  };

  // Calculate total possible score
  const totalMaxScore = assignments.reduce((acc, curr) => acc + curr.maxScore, 0);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <h3 className="text-xl font-bold text-gray-800 whitespace-nowrap">ตรวจงาน / ให้คะแนน</h3>
           <select 
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="border-gray-300 rounded-lg px-3 py-2 border shadow-sm w-full md:w-48"
           >
             {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
           </select>
        </div>
        <button 
          onClick={saveScores}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition"
        >
          <Save size={18} /> บันทึกทั้งหมด
        </button>
      </div>
        
      {loading ? (
          <div className="py-20 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
      ) : (
      <div className="overflow-x-auto border rounded-xl shadow-inner max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 bg-gray-200 w-20">เลขที่</th>
              <th className="px-4 py-3 bg-gray-200 w-48">ชื่อ-สกุล</th>
              {assignments.map(a => (
                <th key={a.id} className="px-2 py-3 bg-gray-200 min-w-[140px] text-center border-l border-gray-300">
                  <div className="truncate w-24 mx-auto" title={a.title}>{a.title}</div>
                  <div className="text-[10px] text-gray-500">({a.maxScore} คะแนน)</div>
                </th>
              ))}
              <th className="px-2 py-3 bg-nbw-100 w-16 text-center border-l border-gray-300 font-bold text-gray-800">รวม</th>
              <th className="px-2 py-3 bg-nbw-100 w-16 text-center border-l border-gray-300 font-bold text-gray-800">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map(std => {
              // Calculate real-time totals
              let currentTotal = 0;
              
              return (
                <tr key={std.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-center">{std.number}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{std.name}</td>
                  {assignments.map(assign => {
                    const sub = submissions.find(s => s.studentId === std.studentId && s.assignmentId === assign.id);
                    const key = `${std.studentId}::${assign.id}`;
                    // Use temp score if editing, else stored score, else ''
                    const displayScore = tempScores[key] !== undefined ? tempScores[key] : (sub?.score ?? '');
                    
                    // Add to total (treat empty/null as 0 for sum)
                    currentTotal += (typeof displayScore === 'number' ? displayScore : 0);

                    return (
                      <td key={assign.id} className="px-2 py-3 border-l border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col items-center gap-2">
                          {sub?.imageUrl ? (
                            <img 
                              src={sub.imageUrl} 
                              className="w-12 h-12 object-cover rounded cursor-pointer border hover:scale-110 transition shadow-sm"
                              onClick={() => showImage(sub.imageUrl, `${std.name} - ${assign.title}`)}
                              title="คลิกเพื่อดูภาพใหญ่"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-300 text-xs">
                              ไม่มีงาน
                            </div>
                          )}
                          <input 
                            type="number" 
                            className={`w-16 text-center border rounded px-1 py-0.5 focus:ring-2 focus:ring-blue-500 outline-none ${sub?.score !== null ? 'bg-green-50 border-green-200' : ''}`}
                            placeholder="คะแนน"
                            min="0"
                            max={assign.maxScore}
                            value={displayScore}
                            onChange={(e) => handleScoreChange(key, e.target.value, assign.maxScore)}
                          />
                        </div>
                      </td>
                    );
                  })}
                  
                  {/* Total Column */}
                  <td className="px-2 py-3 border-l border-gray-200 bg-blue-50 text-center font-bold text-blue-700 text-base">
                    {currentTotal}
                  </td>
                  
                  {/* Percentage Column */}
                  <td className="px-2 py-3 border-l border-gray-200 bg-blue-50 text-center font-bold text-blue-700 text-base">
                    {totalMaxScore > 0 ? ((currentTotal / totalMaxScore) * 100).toFixed(1) : 0}%
                  </td>
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

const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<{ id?: string, title: string, content: string, imageUrl: string | null, isPinned: boolean }>({
    title: '', content: '', imageUrl: null, isPinned: false
  });
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const data = await DataService.getAnnouncements();
    // Sort pins locally for display in admin too
    const sorted = data.sort((a,b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1);
    setAnnouncements(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) {
          Swal.fire('Warning', 'File is too large (>2MB)', 'warning');
          return;
      }
      try {
        const base64 = await DataService.fileToBase64(file);
        setForm(prev => ({ ...prev, imageUrl: base64 }));
      } catch (err) {
        Swal.fire('Error', 'อัปโหลดรูปภาพไม่สำเร็จ', 'error');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      Swal.fire('แจ้งเตือน', 'กรุณากรอกหัวข้อและรายละเอียด', 'warning');
      return;
    }

    Swal.fire({title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading()});

    const ann: Announcement = {
      id: form.id || crypto.randomUUID(),
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl || undefined,
      date: new Date().toLocaleDateString('th-TH'),
      isPinned: form.isPinned
    };

    if (isEditing) {
      await DataService.updateAnnouncement(ann);
      Swal.fire('สำเร็จ', 'แก้ไขประกาศเรียบร้อย', 'success');
    } else {
      await DataService.addAnnouncement(ann);
      Swal.fire('สำเร็จ', 'เพิ่มประกาศเรียบร้อย', 'success');
    }

    resetForm();
    await fetchAnnouncements();
  };

  const handleEdit = (ann: Announcement) => {
    setForm({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      imageUrl: ann.imageUrl || null,
      isPinned: ann.isPinned || false
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบประกาศนี้ใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({title: 'กำลังลบ...', didOpen: () => Swal.showLoading()});
        await DataService.deleteAnnouncement(id);
        await fetchAnnouncements();
        Swal.fire('ลบแล้ว', 'ประกาศถูกลบเรียบร้อย', 'success');
      }
    });
  };

  const resetForm = () => {
    setForm({ title: '', content: '', imageUrl: null, isPinned: false });
    setIsEditing(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border h-fit sticky top-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          {isEditing ? <Edit2 size={24} className="text-blue-500"/> : <Plus size={24} className="text-green-500"/>}
          {isEditing ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อประกาศ</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="หัวข้อ..."
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-32"
              placeholder="เนื้อหาประกาศ..."
              value={form.content}
              onChange={e => setForm({...form, content: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
             <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border hover:bg-gray-100 transition">
                <input 
                   type="checkbox" 
                   checked={form.isPinned}
                   onChange={e => setForm({...form, isPinned: e.target.checked})}
                   className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                   <Pin size={16} /> ปักหมุดประกาศนี้ไว้บนสุด
                </span>
             </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพประกอบ (ขนาดเล็ก/เหมาะสม)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition">
                  <ImageIcon size={18} /> เลือกรูปภาพ
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                {form.imageUrl && <span className="text-xs text-green-600 font-medium">เลือกแล้ว</span>}
              </div>
            </div>
          </div>
          
          {form.imageUrl && (
            <div className="mt-2 relative inline-block">
              <img src={form.imageUrl} alt="Preview" className="h-20 w-auto object-cover rounded border" />
              <button 
                type="button" 
                onClick={() => setForm({...form, imageUrl: null})}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
             <button type="submit" className={`flex-1 py-2 rounded-lg font-bold text-white shadow transition ${isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
               {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มประกาศ'}
             </button>
             {isEditing && (
               <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium">
                 ยกเลิก
               </button>
             )}
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">รายการประกาศทั้งหมด ({announcements.length})</h3>
        {loading ? (
             <div className="text-center py-10">กำลังโหลด...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
            ยังไม่มีประกาศ
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition ${ann.isPinned ? 'ring-2 ring-blue-100' : ''}`}>
              <div className="flex">
                {ann.imageUrl && (
                   <div className="w-24 h-auto bg-gray-100 flex-shrink-0">
                     <img src={ann.imageUrl} className="w-full h-full object-cover" alt="thumb" />
                   </div>
                )}
                <div className="p-4 flex-grow">
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="font-bold text-gray-800 flex items-center gap-2">
                          {ann.isPinned && <Pin size={14} className="text-blue-500" fill="currentColor"/>}
                          {ann.title}
                       </h4>
                       <span className="text-xs text-gray-500">{ann.date}</span>
                     </div>
                     <div className="flex gap-1">
                       <button onClick={() => handleEdit(ann)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(ann.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ann.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<{name: string, submitted: number, total: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
        setLoading(true);
        // This aggregation might be slow as it fetches data for all rooms
        // Ideally we move this aggregation to GAS, but for now we do it client side or fetch all
        const [students, submissions, assignments] = await Promise.all([
            DataService.getStudents(), // Fetch all
            DataService.getSubmissions(), // Fetch all
            DataService.getAssignments()
        ]);
        
        const assignmentsCount = assignments.length;

        const stats = ROOMS.map(room => {
            const roomStudents = students.filter(s => s.room === room);
            const expected = roomStudents.length * assignmentsCount;
            const actual = submissions.filter(sub => roomStudents.some(s => s.studentId === sub.studentId)).length;
            
            return {
                name: room.split('/')[1],
                submitted: actual,
                total: expected
            };
        });
        setData(stats);
        setLoading(false);
    };
    loadStats();
  }, []);

  if (loading) {
      return <div className="text-center py-10">กำลังโหลดสรุปผล...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">รายงานสรุปการส่งงาน</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" label={{ value: 'ห้อง ม.5 / ...', position: 'insideBottom', offset: -5 }} />
            <YAxis />
            <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="total" name="จำนวนงานที่ต้องส่ง" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="submitted" name="ส่งแล้ว" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}