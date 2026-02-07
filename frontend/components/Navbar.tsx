'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Hide Navbar on Admin Dashboard
  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, [pathname]); // Ce useEffect se déclenche à chaque changement de route

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link href="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">YouEvent</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/" className="py-4 px-2 text-green-500 border-b-4 border-green-500 font-semibold ">Home</Link>
              <a href="#" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Events</a>
              {user && (
                 <Link href="/dashboard" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">Mon Espace</Link>
              )}
              {user && user.role === 'admin' && (
                 <Link href="/admin" className="py-4 px-2 text-red-500 font-semibold hover:text-red-700 transition duration-300">Admin</Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3 ">
            {user ? (
               <>
                 <span className="py-2 px-2 font-medium text-gray-700 hidden lg:block">Bonjour, {user.name}</span>
                 <Link href="/dashboard" className="py-2 px-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-400 transition duration-300">Dashboard</Link>
                 <button onClick={handleLogout} className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300">Déconnexion</button>
               </>
            ) : (
              <>
                <Link href="/login" className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300">Log In</Link>
                <Link href="/register" className="py-2 px-2 font-medium text-white bg-green-500 rounded hover:bg-green-400 transition duration-300">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

