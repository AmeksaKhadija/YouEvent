'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8000/auth/admin-only', {
          headers: {
            Authorization: `Bearer ${token}` // Envoi du token pour authentification
          }
        });
        setData(response.data);
      } catch (err: any) {
        console.error(err);
        if (err.response && err.response.status === 403) {
           setError('Accès refusé : Vous n\'avez pas les droits administrateur.');
        } else if (err.response && err.response.status === 401) {
           router.push('/login');
        } else {
           setError('Une erreur est survenue.');
        }
      }
    };

    fetchAdminData();
  }, [router]);

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Erreur! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
                <div className="text-center">
                    <button onClick={() => router.push('/')} className="text-blue-500 hover:text-blue-700">Retour à l'accueil</button>
                </div>
            </div>
        </div>
    );
  }

  if (!data) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Panneau d'administration</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Zone Sécurisée</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Accessible uniquement aux administrateurs.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
             <div className="p-4">
                 <p className="text-green-600 font-bold text-xl">{data.message}</p>
                 <div className="mt-4 bg-gray-100 p-4 rounded">
                     <pre>{JSON.stringify(data.user, null, 2)}</pre>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
}
