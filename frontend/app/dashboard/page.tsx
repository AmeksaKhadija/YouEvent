'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch user reservations
    const fetchReservations = async () => {
        try {
            const res = await axios.get('http://localhost:8000/reservations/my-reservations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(res.data);
        } catch (err) {
            console.error('Erreur loading reservations', err);
        }
    };
    fetchReservations();

  }, [router]);

  const handleCancelReservation = async (reservationId: number) => {
    if(!confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) return;

    try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:8000/reservations/${reservationId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Mettre à jour la liste locale
        setReservations(reservations.map(r => 
            r.id === reservationId ? { ...r, status: 'CANCELED' } : r
        ));
        alert('Réservation annulée avec succès');
    } catch (err) {
        console.error('Erreur cancel', err);
        alert('Impossible d\'annuler la réservation');
    }
  };

  if (!user) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Mon Espace Personnel</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Information Utilisateur</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails personnels et préférences.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Rôle</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.role || 'Utilisateur'}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Mes Réservations</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Liste des événements auxquels vous êtes inscrit.</p>
        </div>
        <div className="border-t border-gray-200">
             {reservations.length === 0 ? (
                 <div className="px-4 py-5 text-gray-500 text-center">Vous n'avez pas de réservations.</div>
             ) : (
                <ul className="divide-y divide-gray-200">
                    {reservations.map((reservation) => (
                        <li key={reservation.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                            <div>
                                <h4 className="text-lg font-bold text-gray-800">{reservation.event?.title}</h4>
                                <div className="text-sm text-gray-500">
                                    Date: {reservation.event?.date ? new Date(reservation.event.date).toLocaleDateString() : 'N/A'} - 
                                    Lieu: {reservation.event?.location}
                                </div>
                                <div className="mt-2">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                          reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                          reservation.status === 'CANCELED' ? 'bg-gray-100 text-gray-800' :
                                          'bg-red-100 text-red-800'}`}>
                                         {reservation.status}
                                     </span>
                                </div>
                            </div>
                            <div>
                                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                                    <button 
                                        onClick={() => initCancelReservation(reservation.id)}
                                        className="text-red-600 hover:text-red-900 font-bold px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition"
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
             )}
        </div>
      </div>
    </div>
  );
}
