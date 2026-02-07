'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/events/published');
        setEvents(response.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="text-center py-10">Chargement des événements...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Événements à venir</h1>
      {events.length === 0 ? (
        <p className="text-center text-gray-500">Aucun événement à venir pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'} 
                    alt={event.title} 
                    className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{event.title}</h2>
                <div className="text-sm text-gray-500 mb-2 truncate">{event.description}</div>
                <p className="text-gray-600 mb-1"><span className="font-bold">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4"><span className="font-bold">Lieu:</span> {event.location}</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                    Voir détails
                </button>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
}
