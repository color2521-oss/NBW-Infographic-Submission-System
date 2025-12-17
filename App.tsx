import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { StudentPortal } from './components/StudentPortal';
import { TeacherPortal } from './components/TeacherPortal';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        isTeacherMode={currentPage === 'teacher'} 
      />
      
      <main className="flex-grow py-8">
        {currentPage === 'home' && <Home isAdmin={false} />}
        {currentPage === 'student' && <StudentPortal />}
        {currentPage === 'teacher' && <TeacherPortal />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
