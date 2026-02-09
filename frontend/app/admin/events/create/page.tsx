'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    location: '',
    capacity: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);
      if (file) {
          formDataToSend.append('image', file);
      }

      await axios.post('http://localhost:8000/events', formDataToSend, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });

      // Redirection immédiate vers le dashboard après succès
      router.push('/admin?tab=events');
      
    } catch (err: any) {
      console.error(err);
      if (err.response) {
          setError(err.response.data.message || 'Erreur lors de la création de l\'événement.');
      } else {
          setError('Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Créer un nouvel événement</h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    {success}
                </div>
            )}

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Titre de l'événement
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                    Image de l'événement (optionnel)
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                        Date et Heure
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="date"
                        name="date"
                        type="datetime-local"
                        required
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
                
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
                        Capacité Max
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        required
                        value={formData.capacity}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                    Lieu
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                />
            </div>

            <div className="flex items-center justify-between pt-4">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                    type="submit"
                >
                    Créer l'événement (Brouillon)
                </button>
            </div>
            <div className="text-center mt-4">
                 <button type="button" onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-700">
                     Retour au Dashboard Admin
                 </button>
            </div>
        </form>
      </div>
    </div>
  );
}
