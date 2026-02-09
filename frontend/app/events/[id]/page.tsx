'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

export default function EventDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasReserved, setHasReserved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (e) {
        console.error("Invalid token", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Impossible de charger les détails de l\'événement.');
      } finally {
        setLoading(false);
      }
    };

    const checkReservation = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:8000/reservations/my-reservations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const myReservations = response.data;
            const isReserved = myReservations.some((res: any) => 
                res.event.id === Number(id) && 
                (res.status === 'PENDING' || res.status === 'CONFIRMED')
            );
            if (isReserved) {
                setHasReserved(true);
            }
        } catch (err) {
            console.error('Error checking reservation status:', err);
        }
    };

    fetchEvent();
    checkReservation();
  }, [id]);

  const handleReservation = async () => {
    if (!confirm('Voulez-vous confirmer votre réservation pour cet événement ?')) {
        return;
    }

    const token = localStorage.getItem('token');
    
    setReservationLoading(true);

    try {
        await axios.post('http://localhost:8000/reservations', 
            { eventId: Number(id) },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Votre réservation a été prise en compte avec succès ! (Statut: PENDING)');
        setEvent((prev: any) => ({ ...prev, capacity: prev.capacity - 1 }));
        setHasReserved(true);
    } catch (err: any) {
        console.error('Reservation error:', err);
        if (err.response && err.response.data && err.response.data.message) {
             alert(`Erreur: ${err.response.data.message}`);
        } else {
             alert('Une erreur est survenue lors de la réservation.');
        }
    } finally {
        setReservationLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl text-gray-600">Chargement...</div>;
  if (error) return <div className="text-center py-20 text-red-600 font-semibold">{error}</div>;
  if (!event) return <div className="text-center py-20 text-gray-500">Événement introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Image */}
        <div className="relative h-96 w-full">
            <img 
                src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'} 
                alt={event.title} 
                className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
                <Link href="/" className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg transition duration-200 font-medium flex items-center gap-2">
                    ← Retour
                </Link>
            </div>
        </div>

        {/* Content */}
        <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                    <p className="text-lg text-blue-600 font-medium">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="block text-sm text-blue-600 uppercase font-bold tracking-wide">Places disponibles</span>
                    <span className="block text-2xl font-bold text-blue-900 text-center">
                        {event.capacity > 0 ? event.capacity : 'Pas de place'}
                    </span>
                </div>
            </div>

            <div className="prose max-w-none text-gray-600 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">À propos de cet événement</h3>
                <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
            </div>

            {/* Reservation Message Area */}
            <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-lg font-medium">{event.location}</span>
                    </div>

                    {userRole === 'participant' ? (
                        <button 
                            onClick={handleReservation}
                            disabled={reservationLoading || event.status !== 'PUBLISHED' || event.capacity <= 0 || hasReserved}
                            className={`text-lg font-bold py-4 px-12 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5
                                ${reservationLoading ? 'bg-gray-400 cursor-not-allowed' : 
                                event.status !== 'PUBLISHED' ? 'bg-gray-300 cursor-not-allowed text-gray-500' :
                                hasReserved ? 'bg-green-600 cursor-not-allowed text-white' :
                                event.capacity <= 0 ? 'bg-red-500 cursor-not-allowed text-white' :
                                'bg-blue-600 hover:bg-blue-700 hover:shadow-xl text-white'}`}
                        >
                            {reservationLoading ? 'Traitement...' : 
                            event.status !== 'PUBLISHED' ? 'Non disponible' :
                            hasReserved ? 'Déjà réservé' :
                            event.capacity <= 0 ? 'pas de place' :
                            'Réserver ma place'}
                        </button>
                    ) : (
                        <div className="bg-gray-100 px-6 py-3 rounded-lg text-gray-600 text-sm">
                            {userRole ? 'Réservation réservée aux participants' : 'Connectez-vous en tant que participant pour réserver'}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

