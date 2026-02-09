import React from 'react';

const events = [
  { id: 1, title: 'Concert de Jazz', date: '2023-12-25', location: 'Paris', image: 'https://images.unsplash.com/photo-1459749411177-287ce63e3ba6?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Conférence Tech', date: '2024-01-15', location: 'Lyon', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Atelier Cuisine', date: '2024-02-10', location: 'Bordeaux', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=800' },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Événements à venir</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{event.title}</h2>
              <p className="text-gray-600 mb-2"><span className="font-bold">Date:</span> {event.date}</p>
              <p className="text-gray-600 mb-4"><span className="font-bold">Lieu:</span> {event.location}</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300">
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
