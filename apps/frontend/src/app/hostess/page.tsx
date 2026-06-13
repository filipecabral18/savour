"use client";

import { useState, useEffect } from "react";
import { useClerk, UserButton } from "@clerk/nextjs";
import { 
  Calendar, 
  Clock, 
  Users, 
  User, 
  Phone, 
  Check, 
  X, 
  Volume2, 
  Settings, 
  LogOut, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { 
  getReservations, 
  updateReservationStatus, 
  getWaitlist, 
  checkInWaitlist, 
  removeFromWaitlist,
  callNextInWaitlist 
} from "../../lib/api";

interface Reservation {
  id: string;
  establishmentId: string;
  date: string;
  guests: number;
  name: string;
  contact: string;
  status: string; // CONFIRMED, CHECKED_IN, CANCELLED, NO_SHOW
  createdAt: string;
}

interface WaitlistEntry {
  id: string;
  name: string;
  contact: string;
  guests: number;
  status: string; // WAITING, READY
  position: number;
  createdAt: string;
}

export default function HostessDashboard() {
  const { signOut } = useClerk();
  const todayStr = new Date().toISOString().split("T")[0];
  
  const [date, setDate] = useState(todayStr);
  const [activeTab, setActiveTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      if (activeTab === 'reservations') {
        const data = await getReservations("savour-bistro-id", date);
        setReservations(data);
      } else {
        const data = await getWaitlist("savour-bistro-id");
        setWaitlist(data);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    if (showLoading) setLoading(false);
  };

  // Poll for updates every 6 seconds to keep the hostess dashboard synced in real-time
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(true);
    }, 0);
    
    const interval = setInterval(() => {
      fetchData(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, activeTab]);

  const handleUpdateReservationStatus = async (reservationId: string, status: string) => {
    setActionLoading(reservationId);
    const response = await updateReservationStatus("savour-bistro-id", reservationId, status);
    if (response.error) {
      alert(`Erro ao atualizar status: ${response.error}`);
    } else {
      // Instant reload
      await fetchData(false);
    }
    setActionLoading(null);
  };

  const handleCallNext = async () => {
    setActionLoading('call-next');
    const response = await callNextInWaitlist("savour-bistro-id");
    if (response.error) {
      alert(`Erro ao chamar próximo: ${response.error}`);
    } else if (response.message) {
      alert(response.message); // e.g. Waitlist is empty
    } else {
      // Play a quick alert sound on the dashboard
      try {
        const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: new () => AudioContext }).webkitAudioContext)();
        const osc = context.createOscillator();
        osc.connect(context.destination);
        osc.frequency.setValueAtTime(440, context.currentTime);
        osc.start(context.currentTime);
        osc.stop(context.currentTime + 0.1);
      } catch {}
      
      await fetchData(false);
    }
    setActionLoading(null);
  };

  const handleCheckInWaitlist = async (entryId: string) => {
    setActionLoading(entryId);
    const response = await checkInWaitlist("savour-bistro-id", entryId);
    if (response.error) {
      alert(`Erro ao dar check-in: ${response.error}`);
    } else {
      await fetchData(false);
    }
    setActionLoading(null);
  };

  const handleRemoveFromWaitlist = async (entryId: string) => {
    setActionLoading(entryId);
    const response = await removeFromWaitlist("savour-bistro-id", entryId);
    if (response.error) {
      alert(`Erro ao remover da fila: ${response.error}`);
    } else {
      await fetchData(false);
    }
    setActionLoading(null);
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateString = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans">
      {/* Header B2B Style (Deep Green background) */}
      <header className="bg-secondary-500 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-serif text-2xl font-bold tracking-tight">Savour</span>
            <span className="h-5 w-px bg-white/30" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-white/90">
              Painel de Controle — Hostess
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {/* Restaurant Config (Placeholder) */}
            <button className="flex items-center gap-1.5 hover:text-primary-100 transition-colors font-medium opacity-80 hover:opacity-100 cursor-pointer">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
            <span className="h-4 w-px bg-white/20" />
            {/* Logout (Clerk) */}
            <button 
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex items-center gap-1.5 hover:text-danger-500 transition-colors font-medium opacity-80 hover:opacity-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <span className="h-4 w-px bg-white/20" />
            {/* Botão de Usuário Clerk */}
            <div className="flex items-center">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow flex flex-col gap-6">
        
        {/* Top Controls Bar */}
        <div className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-950">
              Savour Bistro
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Gestão de assentos, reservas presenciais e fila digital
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3 text-secondary-500" />
                Filtrar por data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 px-4 rounded-xl border border-neutral-300 bg-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all font-medium text-neutral-900"
              />
            </div>
            
            {/* Manual Refresh Button */}
            <button 
              onClick={() => fetchData(true)}
              disabled={loading}
              className="mt-5 h-10 w-10 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-600 rounded-xl transition-colors cursor-pointer"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs and Content Grid */}
        <div className="flex-grow flex flex-col gap-4">
          {/* Tabs header */}
          <div className="flex border-b border-neutral-300 gap-6">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer
                ${activeTab === 'reservations' 
                  ? 'text-neutral-950 font-bold' 
                  : 'text-neutral-500 hover:text-neutral-800'
                }
              `}
            >
              Reservas Confirmadas ({reservations.length})
              {activeTab === 'reservations' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`pb-3 font-semibold text-sm transition-all relative cursor-pointer
                ${activeTab === 'waitlist' 
                  ? 'text-neutral-950 font-bold' 
                  : 'text-neutral-500 hover:text-neutral-800'
                }
              `}
            >
              Fila de Espera ({waitlist.length})
              {activeTab === 'waitlist' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-neutral-300 rounded-2xl shadow-sm flex-grow">
              <span className="w-10 h-10 border-4 border-secondary-500/20 border-t-secondary-500 rounded-full animate-spin"></span>
              <span className="text-sm font-semibold text-neutral-600">Carregando painel...</span>
            </div>
          )}

          {/* TAB 1: RESERVATIONS LIST */}
          {!loading && activeTab === 'reservations' && (
            <div className="bg-white border border-neutral-300 rounded-2xl shadow-sm overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Grupo (Pax)</th>
                      <th className="px-6 py-4">Horário</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações Rápidas (Toque &gt;= 44px)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {reservations.length > 0 ? (
                      reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-neutral-50/50 transition-colors">
                          {/* Client Info */}
                          <td className="px-6 py-4">
                            <div className="font-semibold text-neutral-900">{res.name}</div>
                            <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 shrink-0" />
                              {res.contact}
                            </div>
                          </td>
                          {/* Guests count */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                              <Users className="w-4 h-4 text-neutral-400" />
                              {res.guests} {res.guests === 1 ? 'assento' : 'assentos'}
                            </div>
                          </td>
                          {/* Booking time */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                              <Clock className="w-4 h-4 text-neutral-400" />
                              {formatTime(res.date)}
                            </div>
                          </td>
                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            {res.status === 'CONFIRMED' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-neutral-100 border border-neutral-300 text-neutral-700 px-2.5 py-1 rounded-full uppercase">
                                Confirmada
                              </span>
                            )}
                            {res.status === 'CHECKED_IN' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-success-500/10 border border-success-500/20 text-success-500 px-2.5 py-1 rounded-full uppercase">
                                Concluído
                              </span>
                            )}
                            {res.status === 'NO_SHOW' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-danger-500/10 border border-danger-500/20 text-danger-500 px-2.5 py-1 rounded-full uppercase">
                                No-show
                              </span>
                            )}
                            {res.status === 'CANCELLED' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-danger-500/10 border border-danger-500/20 text-danger-500 px-2.5 py-1 rounded-full uppercase">
                                Cancelada
                              </span>
                            )}
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            {res.status === 'CONFIRMED' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleUpdateReservationStatus(res.id, 'CHECKED_IN')}
                                  disabled={actionLoading !== null}
                                  className="h-11 px-4 rounded-xl font-bold bg-success-500 hover:bg-success-600 active:bg-success-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  Check-in
                                </button>
                                <button
                                  onClick={() => handleUpdateReservationStatus(res.id, 'NO_SHOW')}
                                  disabled={actionLoading !== null}
                                  className="h-11 px-4 rounded-xl font-bold border border-danger-500 hover:bg-danger-500/5 active:bg-danger-500/10 text-danger-500 flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  No-show
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 font-medium italic">
                                Atendimento concluído
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-20 text-neutral-500 font-medium bg-neutral-50/50">
                          Nenhuma reserva encontrada para o dia {formatDateString(date)}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WAITLIST LIST */}
          {!loading && activeTab === 'waitlist' && (
            <div className="flex flex-col gap-4 flex-grow">
              {/* Call Next Banner */}
              <div className="bg-white border border-neutral-300 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    Chamar Próximo da Fila
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Notifique o primeiro cliente aguardando na fila virtual para comparecer à recepção.
                  </p>
                </div>
                
                <button
                  onClick={handleCallNext}
                  disabled={actionLoading !== null || waitlist.filter(x => x.status === 'WAITING').length === 0}
                  className="h-14 px-6 rounded-xl font-bold bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <Volume2 className="w-5 h-5" />
                  Chamar Próximo da Fila
                </button>
              </div>

              {/* Waitlist Table */}
              <div className="bg-white border border-neutral-300 rounded-2xl shadow-sm overflow-hidden flex-grow flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 w-24">Posição</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Grupo (Pax)</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações Rápidas (Toque &gt;= 44px)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {waitlist.length > 0 ? (
                        waitlist.map((entry) => (
                          <tr 
                            key={entry.id} 
                            className={`transition-colors
                              ${entry.status === 'READY' 
                                ? 'bg-success-500/5 hover:bg-success-500/10' 
                                : 'hover:bg-neutral-50/50'
                              }
                            `}
                          >
                            {/* Position */}
                            <td className="px-6 py-4 font-mono font-bold text-sm text-neutral-700">
                              {entry.status === 'READY' ? (
                                <span className="bg-success-500 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                  Pronto
                                </span>
                              ) : (
                                `# ${entry.position}`
                              )}
                            </td>
                            {/* Client Info */}
                            <td className="px-6 py-4">
                              <div className="font-semibold text-neutral-900">{entry.name}</div>
                              <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 shrink-0" />
                                {entry.contact}
                              </div>
                            </td>
                            {/* Guests count */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                                <Users className="w-4 h-4 text-neutral-400" />
                                {entry.guests} {entry.guests === 1 ? 'assento' : 'assentos'}
                              </div>
                            </td>
                            {/* Status Badge */}
                            <td className="px-6 py-4">
                              {entry.status === 'WAITING' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-warning-500/10 border border-warning-500/20 text-warning-500 px-2.5 py-1 rounded-full uppercase">
                                  Aguardando
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-success-500/25 border border-success-500/30 text-success-600 px-2.5 py-1 rounded-full uppercase tracking-wide">
                                  Mesa Liberada
                                </span>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Check-in button for called client */}
                                {entry.status === 'READY' ? (
                                  <button
                                    onClick={() => handleCheckInWaitlist(entry.id)}
                                    disabled={actionLoading !== null}
                                    className="h-11 px-4 rounded-xl font-bold bg-success-500 hover:bg-success-600 active:bg-success-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                                  >
                                    <Check className="w-4 h-4" />
                                    Check-in (Acomodar)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRemoveFromWaitlist(entry.id)}
                                    disabled={actionLoading !== null}
                                    className="h-11 px-4 rounded-xl font-bold border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                                  >
                                    Chamar / Pular
                                  </button>
                                )}
                                
                                {/* Cancel / Remove from Waitlist */}
                                <button
                                  onClick={() => handleRemoveFromWaitlist(entry.id)}
                                  disabled={actionLoading !== null}
                                  className="h-11 px-4 rounded-xl font-bold border border-danger-500 hover:bg-danger-500/5 active:bg-danger-500/10 text-danger-500 flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                                  title="Remover cliente da fila"
                                >
                                  <X className="w-4 h-4" />
                                  Remover
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-20 text-neutral-500 font-medium bg-neutral-50/50">
                            Nenhum cliente na fila de espera virtual no momento.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
