'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function EventDetail() {
  const params = useParams();
  const id = params?.id;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    fetchEvent();
  }, [id]);

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
                    <span className="block text-sm text-blue-600 uppercase font-bold tracking-wide">Places restantes</span>
                    <span className="block text-2xl font-bold text-blue-900 text-center">{event.capacity}</span>
                </div>
            </div>

            <div className="prose max-w-none text-gray-600 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">À propos de cet événement</h3>
                <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-lg font-medium">{event.location}</span>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                        Réserver ma place
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
