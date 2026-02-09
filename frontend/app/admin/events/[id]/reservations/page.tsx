'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface Reservation {
  id: number;
  status: string;
  number_of_tickets: number;
  created_at: string;
  user: User;
}

export default function EventReservations({ params }: { params: { id: string } }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/reservations/event/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - simplifiée pour cet exemple, ou réutiliser le layout admin */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white transition-transform duration-300 ease-in-out z-30 transform translate-x-0 hidden md:block">
            <div className="flex items-center justify-center h-16 border-b border-indigo-800 bg-indigo-950">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <nav className="mt-6 px-4 space-y-2">
              <a href="/admin" className="flex items-center px-4 py-3 text-gray-100 hover:bg-indigo-800 rounded-lg transition-colors">
                <span className="font-medium">Tableau de bord</span>
              </a>
            </nav>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
          <button onClick={() => router.back()} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Retour aux événements
          </button>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Réservations de l'événement #{params.id}
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                {reservations.length} Réservations
              </span>
            </div>

            {loading ? (
               <div className="flex justify-center p-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
            ) : reservations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p>Aucune réservation pour cet événement.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-sm font-semibold text-gray-600">ID</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Utilisateur</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Email</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Places</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 text-sm text-gray-600">#{res.id}</td>
                        <td className="py-4 text-sm font-medium text-gray-800">{res.user.full_name}</td>
                        <td className="py-4 text-sm text-gray-600">{res.user.email}</td>
                        <td className="py-4 text-sm text-gray-600">{res.number_of_tickets}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {new Date(res.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                            res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
