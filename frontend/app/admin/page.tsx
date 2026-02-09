'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reservations, setReservations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // States for viewing reservations of a specific event
  const [viewReservationsEventId, setViewReservationsEventId] = useState<number | null>(null);
  const [eventReservations, setEventReservations] = useState<any[]>([]);
  const [loadingEventReservations, setLoadingEventReservations] = useState(false);

  useEffect(() => {
    if (activeTab === 'reservations' && authorized) {
        fetchReservations();
    }
  }, [activeTab, authorized]);

  const fetchReservations = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/reservations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setReservations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchEventReservations = async (eventId: number) => {
      setLoadingEventReservations(true);
      try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:8000/reservations/event/${eventId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setEventReservations(res.data);
      } catch (err) {
          console.error("Error fetching event reservations:", err);
          alert("Impossible de récupérer les réservations pour cet événement.");
      } finally {
          setLoadingEventReservations(false);
      }
  };

  const updateReservationStatus = async (id: number, status: string) => {
    if(!confirm(`Changer le statut en ${status} ?`)) return;
    try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:8000/reservations/${id}/status`, 
            { status },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchReservations();
    } catch (err) { alert('Erreur lors de la mise à jour'); }
  };

  const [user, setUser] = useState<any>(null);
  
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId === null) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
         setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

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

        // 3. Fetch Stats
        try {
            const statsRes = await axios.get('http://localhost:8000/stats/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);
        } catch (sErr) {
            console.error("Failed to fetch stats", sErr);
        }

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
                showModal('Accès refusé', "Vous n'avez pas les droits d'administrateur.", 'error', () => router.push('/'));
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

  const publishEvent = async (id: number) => {
    if (confirm('Voulez-vous vraiment publier cet événement ? Il sera visible par tous.')) {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8000/events/${id}/publish`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.map(e => e.id === id ? { ...e, status: 'PUBLISHED' } : e));
        } catch (err) {
            console.error('Erreur publication', err);
            alert('Erreur lors de la publication');
        }
    }
  };

  const cancelEvent = async (id: number) => {
    if (confirm('Voulez-vous vraiment annuler cet événement ?')) {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8000/events/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.map(e => e.id === id ? { ...e, status: 'CANCELED' } : e));
        } catch (err) {
            console.error('Erreur annulation', err);
            alert('Erreur lors de l\'annulation');
        }
    }
  };

  const toggleDropdown = (id: number) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
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

          {/* Réservations */}
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'reservations' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
             <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
             Réservations
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
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Users Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                             <div className="flex items-center">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">Utilisateurs</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.totalUsers : '-'}</p>
                                </div>
                             </div>
                        </div>

                        {/* Events Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">Événements</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.totalEvents : '-'}</p>
                                    <p className="text-xs text-green-600 font-semibold">{stats ? stats.publishedEvents : 0} Publiés</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Reservations Stats */}
                         <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
                             <div className="flex items-center">
                                <div className="p-3 rounded-full bg-teal-100 text-teal-500 mr-4">
                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm font-medium uppercase">Réservations</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats ? stats.totalReservations : '-'}</p>
                                    <div className="flex space-x-2 text-xs font-semibold">
                                        <span className="text-green-600">{stats ? stats.confirmedReservations : 0} Confirmées</span>
                                        <span className="text-yellow-600">{stats ? stats.pendingReservations : 0} En attente</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                     </div>
                     
                     <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu rapide</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 mt-4">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: stats && stats.totalEvents > 0 ? `${(stats.publishedEvents / stats.totalEvents) * 100}%` : '0%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">Taux de publication des événements ({stats ? Math.round((stats.publishedEvents / stats.totalEvents) * 100) : 0}%)</p>
                     </div>
                </div>
            )}

            {/* VIEW: EVENTS */}
            {activeTab === 'events' && (
                <div>
                  {viewReservationsEventId ? (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                             <div className="flex justify-between items-center mb-6">
                                <button 
                                    onClick={() => setViewReservationsEventId(null)}
                                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                                >
                                    &larr; Retour à la liste des événements
                                </button>
                                <h3 className="text-xl font-bold text-gray-800">Réservations (Événement #{viewReservationsEventId})</h3>
                             </div>

                             {loadingEventReservations ? (
                                 <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
                             ) : (
                                 <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
                                         <thead className="bg-gray-50">
                                             <tr>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Places</th>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                             </tr>
                                         </thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                                             {eventReservations.length === 0 ? (
                                                 <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune réservation pour cet événement.</td></tr>
                                             ) : (
                                                 eventReservations.map((res) => (
                                                     <tr key={res.id} className="hover:bg-gray-50">
                                                         <td className="px-6 py-4 text-sm text-gray-500">#{res.id}</td>
                                                         <td className="px-6 py-4 text-sm font-medium text-gray-900">{res.user?.full_name || res.user?.name}</td>
                                                         <td className="px-6 py-4 text-sm text-gray-500">{res.user?.email}</td>
                                                         <td className="px-6 py-4 text-sm text-gray-500 font-mono">{res.number_of_tickets}</td>
                                                         <td className="px-6 py-4 text-sm text-gray-500">{new Date(res.created_at).toLocaleDateString()}</td>
                                                         <td className="px-6 py-4">
                                                             <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                                ${(res.status || '').toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                                                  (res.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                                  'bg-red-100 text-red-800'}`}>
                                                                 {res.status}
                                                             </span>
                                                         </td>
                                                     </tr>
                                                 ))
                                             )}
                                         </tbody>
                                    </table>
                                 </div>
                             )}
                        </div>
                    ) : (
                    <>
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

                    <div className="bg-white shadow-md rounded-lg overflow-visible">
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
                                                <div className="relative inline-block text-left dropdown-container">
                                                    <button 
                                                        onClick={() => toggleDropdown(event.id)}
                                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                        </svg>
                                                    </button>

                                                    {openDropdownId === event.id && (
                                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                                {/* Publish option */}
                                                                {event.status !== 'PUBLISHED' && event.status !== 'CANCELED' && (
                                                                    <button
                                                                        onClick={() => { publishEvent(event.id); toggleDropdown(event.id); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                                                                        role="menuitem"
                                                                    >
                                                                        Publier
                                                                    </button>
                                                                )}

                                                                 {/* Restore (Publish again) option for Canceled events */}
                                                                 {event.status === 'CANCELED' && (
                                                                    <button
                                                                        onClick={() => { publishEvent(event.id); toggleDropdown(event.id); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                                                                        role="menuitem"
                                                                    >
                                                                        Restaurer
                                                                    </button>
                                                                )}
                                                                
                                                                {/* View Reservations option */}
                                                                <button
                                                                    onClick={() => {
                                                                        setViewReservationsEventId(event.id);
                                                                        fetchEventReservations(event.id);
                                                                        toggleDropdown(event.id);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
                                                                    role="menuitem"
                                                                >
                                                                    Voir Réservations
                                                                </button>

                                                                {/* Edit option - Disabled for PUBLISHED events */}
                                                                {event.status === 'PUBLISHED' ? (
                                                                     <span className="block w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                                                                        Modifier
                                                                     </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => router.push(`/admin/events/edit/${event.id}`)}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-100"
                                                                        role="menuitem"
                                                                    >
                                                                        Modifier
                                                                    </button>
                                                                )}

                                                                {/* Cancel option */}
                                                                {event.status !== 'CANCELED' && (
                                                                    <button
                                                                        onClick={() => { cancelEvent(event.id); toggleDropdown(event.id); }}
                                                                        className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-100"
                                                                        role="menuitem"
                                                                    >
                                                                        Annuler
                                                                    </button>
                                                                )}
                                                                
                                                                {/* Delete option */}
                                                                <button
                                                                    onClick={() => { deleteEvent(event.id); toggleDropdown(event.id); }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                                                                    role="menuitem"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    </>
                  )}
                </div>
            )}

            {/* VIEW: RESERVATIONS */}
            {activeTab === 'reservations' && (
                <div>
                     <h2 className="text-3xl font-bold text-gray-800 mb-8">Gestion des Réservations</h2>
                     
                     <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Événement</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                 {reservations.map((res) => (
                                     <tr key={res.id}>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <div className="text-sm font-medium text-gray-900">{res.event?.title}</div>
                                             <div className="text-sm text-gray-500">ID: {res.event?.id}</div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{res.user?.name}</div>
                                            <div className="text-sm text-gray-500">{res.user?.email}</div>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                             {new Date(res.created_at).toLocaleDateString()}
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                                                  res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                                  'bg-red-100 text-red-800'}`}>
                                                 {res.status}
                                             </span>
                                         </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             {res.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => updateReservationStatus(res.id, 'CONFIRMED')} className="text-green-600 hover:text-green-900 mr-4 font-bold">Confirmer</button>
                                                    <button onClick={() => updateReservationStatus(res.id, 'REJECTED')} className="text-red-600 hover:text-red-900 font-bold">Refuser</button>
                                                </>
                                             )}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                        </table>
                        {reservations.length === 0 && <div className="p-4 text-center text-gray-500">Aucune réservation pour le moment.</div>}
                     </div>
                </div>
            )}

            {/* VIEW: PROFILE */}
            {activeTab === 'profile' && (
                <div>
                     <h2 className="text-3xl font-bold text-gray-800 mb-8">Mon Profil</h2>
                     <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                        {user ? (
                           <form onSubmit={(e) => { e.preventDefault(); showModal('Info', 'Fonctionnalité en cours de développement', 'info'); }}>
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

