import React from 'react';
import { Home, Users, Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setPage: (page: string) => void;
  isTeacherMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setPage, isTeacherMode }) => {
  const navItems = [
    { id: 'home', label: 'หน้าแรก', icon: Home },
    { id: 'student', label: 'ระบบนักเรียน', icon: Users },
    { id: 'teacher', label: 'ระบบครู / ตั้งค่า', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setPage('home')}>
            <div className="w-12 h-12 relative overflow-hidden">
               <img src="https://img5.pic.in.th/file/secure-sv1/nw_logo-removebg.png" alt="NBW Logo" className="object-contain w-full h-full drop-shadow-sm" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-nbw-900 leading-tight">โรงเรียนหนองบัวแดงวิทยา</h1>
              <p className="text-xs text-nbw-600 font-medium">รายวิชา อินโฟกราฟิก (ม.5)</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center gap-2">
             {navItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => setPage(item.id)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                   currentPage === item.id 
                   ? 'bg-nbw-50 text-nbw-600 shadow-inner' 
                   : 'text-gray-500 hover:text-nbw-600 hover:bg-gray-50'
                 }`}
               >
                 <item.icon size={18} />
                 <span className="hidden sm:inline">{item.label}</span>
               </button>
             ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
