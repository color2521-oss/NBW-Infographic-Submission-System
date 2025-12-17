import React, { useState, useEffect } from 'react';
import { Bell, Image as ImageIcon, Plus, X, Maximize2, Pin } from 'lucide-react';
import { Announcement } from '../types';
import * as DataService from '../services/dataService';
import Swal from 'sweetalert2';

interface HomeProps {
  isAdmin?: boolean;
}

export const Home: React.FC<HomeProps> = ({ isAdmin }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const data = await DataService.getAnnouncements();
      // Sort: Pinned first, then preserve original order (usually by time added if api returns that way)
      const sortedData = data.sort((a, b) => {
        // If a is pinned and b is not, a comes first (-1)
        if (a.isPinned && !b.isPinned) return -1;
        // If b is pinned and a is not, b comes first (1)
        if (!a.isPinned && b.isPinned) return 1;
        // Otherwise keep original order
        return 0;
      });
      setAnnouncements(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic check for file size (e.g., < 2MB) to prevent Sheet issues
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('ขนาดไฟล์ใหญ่เกินไป', 'กรุณาเลือกรูปภาพขนาดไม่เกิน 2MB', 'warning');
        return;
      }
      try {
        const base64 = await DataService.fileToBase64(file);
        setNewImage(base64);
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถอัปโหลดรูปภาพได้', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
    
    try {
      const ann: Announcement = {
        id: DataService.generateUUID(), // Use safe UUID generator
        title: newTitle,
        content: newContent,
        imageUrl: newImage || undefined,
        date: new Date().toLocaleDateString('th-TH'),
        isPinned: false // Default new posts from this simple form as unpinned
      };
      await DataService.addAnnouncement(ann);
      await fetchAnnouncements();
      
      setShowForm(false);
      setNewTitle('');
      setNewContent('');
      setNewImage(null);
      Swal.fire('สำเร็จ', 'เพิ่มประกาศเรียบร้อย', 'success');
    } catch (error) {
      Swal.fire('Error', 'บันทึกไม่สำเร็จ', 'error');
    }
  };

  const showFullImage = (url: string) => {
    Swal.fire({
      imageUrl: url,
      imageAlt: 'Full size',
      showConfirmButton: false,
      showCloseButton: true,
      background: 'transparent',
      backdrop: 'rgba(0,0,0,0.9)',
      customClass: {
        popup: 'w-auto max-w-full',
        image: 'max-h-[90vh] object-contain rounded-lg shadow-2xl bg-white'
      },
      width: 'auto'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      
      {/* Header / Hero */}
      <div className="text-center py-10 bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nbw-500 to-nbw-600"></div>
        <h1 className="text-2xl md:text-3xl font-bold text-nbw-600 mb-2">ระบบส่งงานนักเรียน</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">ประกาศและประชาสัมพันธ์</h2>
        <p className="text-gray-500">ติดตามข่าวสารรายวิชา อินโฟกราฟิก (ม.5)</p>
        
        {isAdmin && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="mt-6 bg-nbw-600 text-white px-6 py-2 rounded-full font-medium hover:bg-nbw-700 transition shadow-lg flex items-center gap-2 mx-auto"
          >
            <Plus size={18} /> เพิ่มประกาศใหม่
          </button>
        )}
      </div>

      {/* Admin Form */}
      {isAdmin && showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">สร้างประกาศใหม่</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
             <input 
               className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-nbw-500 outline-none" 
               placeholder="หัวข้อประกาศ"
               value={newTitle}
               onChange={e => setNewTitle(e.target.value)}
               required
             />
             <textarea 
               className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-nbw-500 outline-none h-32" 
               placeholder="รายละเอียด..."
               value={newContent}
               onChange={e => setNewContent(e.target.value)}
               required
             />
             <div className="flex items-center gap-4">
               <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-600 text-sm flex items-center gap-2 transition">
                 <ImageIcon size={18} /> เลือกรูปภาพประกอบ
                 <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
               </label>
               {newImage && <span className="text-xs text-green-600 font-bold">เลือกรูปภาพแล้ว</span>}
             </div>
             {newImage && <img src={newImage} alt="preview" className="h-32 object-cover rounded-lg" />}
             
             <button type="submit" className="w-full bg-nbw-600 text-white py-2 rounded-lg font-bold shadow hover:bg-nbw-700">โพสต์ประกาศ</button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nbw-600 mx-auto"></div>
           <p className="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {/* Announcement List */}
      <div className="space-y-6">
        {!loading && announcements.map(ann => (
          <div key={ann.id} className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group ${ann.isPinned ? 'border-2 border-nbw-200 ring-2 ring-nbw-50' : ''}`}>
            {ann.imageUrl && (
              <div 
                className="w-full md:w-56 h-48 md:h-auto flex-shrink-0 bg-gray-100 relative cursor-zoom-in overflow-hidden"
                onClick={() => showFullImage(ann.imageUrl!)}
              >
                <img 
                  src={ann.imageUrl} 
                  alt={ann.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all drop-shadow-md bg-black/40 p-2 rounded-full" size={24} />
                </div>
              </div>
            )}
            <div className="p-6 flex-grow flex flex-col justify-center min-h-[160px] relative">
              {ann.isPinned && (
                <div className="absolute top-4 right-4 text-nbw-500 animate-pulse">
                  <Pin size={20} fill="currentColor" />
                </div>
              )}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3 gap-2 pr-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                   {ann.title}
                </h2>
                <span className="text-xs font-medium bg-nbw-50 text-nbw-600 px-3 py-1 rounded-full whitespace-nowrap w-fit border border-nbw-100">{ann.date}</span>
              </div>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed text-sm md:text-base">{ann.content}</p>
            </div>
          </div>
        ))}

        {!loading && announcements.length === 0 && (
           <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
             <Bell className="mx-auto mb-2 opacity-20" size={48} />
             <p>ยังไม่มีประกาศในขณะนี้</p>
           </div>
        )}
      </div>
    </div>
  );
};