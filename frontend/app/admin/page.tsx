'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState<any>(null);
  
  const pathname = usePathname();

  useEffect(() => {
    const initDashboard = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        router.push('/login');
        return;
      }
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      try {
        // 1. Verify Admin Access
        await axios.get('http://localhost:8000/auth/admin-only', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuthorized(true);

        // 2. Fetch Events
        const eventsResponse = await axios.get('http://localhost:8000/events');
        setEvents(eventsResponse.data);

      } catch (err: any) {
        console.error(err);
        if (err.response) {
            if (err.response.status === 401) {
                // Token invalide ou expiré : on nettoie et redirige
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
            } else if (err.response.status === 403) {
                // Accès interdit (Rôle insuffisant)
                alert("Accès refusé. Vous n'avez pas les droits d'administrateur.");
                router.push('/');
            }
        }
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const deleteEvent = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.filter(e => e.id !== id));
        } catch (err) {
            console.error('Erreur suppression', err);
            alert('Erreur lors de la suppression');
        }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  if (!authorized) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-10 transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <Link href="/" className="text-2xl font-bold tracking-wider hover:text-blue-400 transition-colors">
            YouEvent
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Tableau de Bord */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             Tableau de Bord
          </button>

          {/* Événements */}
          <button 
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Événements
          </button>

          {/* Profil */}
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
             Mon Profil
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            
            {/* VIEW: DASHBOARD / STATS */}
            {activeTab === 'dashboard' && (
                <div>
                     <h2 className="text-3xl font-bold text-gray-800 mb-8">Tableau de Bord</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Stat Card 1 */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">Total Événements</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                                </div>
                            </div>
                        </div>
                        
                         {/* Stat Card 2 */}
                         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                             <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">Événements Publiés</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'PUBLISHED').length}</p>
                                </div>
                             </div>
                        </div>

                         {/* Stat Card 3 */}
                         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                             <div className="flex items-center">
                                <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">En Attente</p>
                                    <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.status === 'DRAFT' || !e.status).length}</p>
                                </div>
                             </div>
                        </div>
                     </div>
                     
                     <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Activité Récente</h3>
                        <p className="text-gray-500">Aucune activité récente à afficher pour le moment.</p>
                     </div>
                </div>
            )}

            {/* VIEW: EVENTS */}
            {activeTab === 'events' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">Gestion des Événements</h2>
                            <p className="text-gray-500 mt-1">Gérez la liste de tous les événements créés.</p>
                        </div>
                        <button 
                            onClick={() => router.push('/admin/events/create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center transform transition hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Créer un événement
                        </button>
                    </div>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        {events.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                Aucun événement trouvé. Cliquez sur "Créer un événement" pour commencer.
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre / Description</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacité</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {events.map((event) => (
                                        <tr key={event.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{event.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500">{new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {event.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {event.capacity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 
                                                    event.status === 'CANCELED' ? 'bg-red-100 text-red-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {event.status || 'DRAFT'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {event.status === 'PUBLISHED' ? (
                                                    <span 
                                                        className="text-gray-400 cursor-not-allowed mr-4" 
                                                        title="Impossible de modifier un événement publié"
                                                    >
                                                        Modifier
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        Modifier
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: PROFILE */}
            {activeTab === 'profile' && (
                <div>
                     <h2 className="text-3xl font-bold text-gray-800 mb-8">Mon Profil</h2>
                     <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                        {user ? (
                           <form onSubmit={(e) => { e.preventDefault(); alert('Fonctionnalité en cours de développement'); }}>
                               <div className="mb-4">
                                   <label className="block text-gray-700 text-sm font-bold mb-2">Nom Complet</label>
                                   <input type="text" defaultValue={user.name} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                               </div>
                               <div className="mb-4">
                                   <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                   <input type="email" defaultValue={user.email} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled />
                                   <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié.</p>
                               </div>
                               <div className="mb-6">
                                   <label className="block text-gray-700 text-sm font-bold mb-2">Nouveau Mot de passe (Optionnel)</label>
                                   <input type="password" placeholder="********" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                               </div>
                               <div className="flex items-center justify-between">
                                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                                        Mettre à jour
                                    </button>
                               </div>
                           </form>
                        ) : (
                            <p>Chargement du profil...</p>
                        )}
                     </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}

