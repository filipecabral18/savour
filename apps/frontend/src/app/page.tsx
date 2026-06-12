"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  User, 
  Phone, 
  ChevronLeft, 
  ArrowRight, 
  Sparkles,
  Volume2
} from "lucide-react";
import { 
  checkAvailability, 
  createReservation, 
  getAlternativeSlots, 
  addToWaitlist, 
  getWaitlistStatus, 
  removeFromWaitlist 
} from "../lib/api";
import CapacitySelector from "../components/CapacitySelector";
import TimeSlotCard from "../components/TimeSlotCard";

interface SearchResult {
  checked: boolean;
  available: boolean;
  maxCapacity?: number;
  reservedSeats?: number;
  remainingCapacity?: number;
  error?: string;
}

export default function Home() {
  // Get today's date in YYYY-MM-DD format as minimum select date
  const todayStr = new Date().toISOString().split("T")[0];

  // Steps: 'search' | 'results' | 'waitlist' | 'success'
  const [step, setStep] = useState<'search' | 'results' | 'waitlist' | 'success'>('search');
  
  // Search Form State
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult>({ checked: false, available: false });
  
  // Alternative Slots State
  const [alternativeSlots, setAlternativeSlots] = useState<Array<{ time: string; remainingCapacity: number }>>([]);
  
  // Confirmation State
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [reservationCode, setReservationCode] = useState("");

  // Waitlist State
  const [waitlistEntryId, setWaitlistEntryId] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("WAITING");
  const [waitlistPosition, setWaitlistPosition] = useState(0);
  const [waitlistEstimatedTime, setWaitlistEstimatedTime] = useState(0);

  const timeOptions = [
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"
  ];

  // Polling for Waitlist Status
  useEffect(() => {
    if (step !== 'waitlist' || !waitlistEntryId) return;

    const interval = setInterval(async () => {
      const response = await getWaitlistStatus("savour-bistro-id", waitlistEntryId);
      if (response && !response.error) {
        setWaitlistStatus(response.status);
        setWaitlistPosition(response.position);
        setWaitlistEstimatedTime(response.estimatedWaitTime);

        // If status becomes READY, stop polling and trigger alert
        if (response.status === 'READY') {
          clearInterval(interval);
          
          // Play a gentle check-in chime
          try {
            const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: new () => AudioContext }).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            
            // Chime notes: C5 -> E5 -> G5
            const now = context.currentTime;
            osc.type = "sine";
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
            osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            osc.start(now);
            osc.stop(now + 0.6);
          } catch {
            // AudioContext not supported/allowed
          }
        }
      }
    }, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [step, waitlistEntryId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dateTimeStr = `${date}T${time}:00`;
    const response = await checkAvailability("savour-bistro-id", dateTimeStr, guests);

    if (response.error) {
      setResult({
        checked: true,
        available: false,
        error: response.error
      });
      setAlternativeSlots([]);
    } else {
      setResult({
        checked: true,
        available: response.available,
        maxCapacity: response.maxCapacity,
        reservedSeats: response.reservedSeats,
        remainingCapacity: response.remainingCapacity
      });

      // Fetch alternative slots if requested time is full
      if (!response.available) {
        const slots = await getAlternativeSlots("savour-bistro-id", dateTimeStr, guests);
        setAlternativeSlots(slots);
      } else {
        setAlternativeSlots([]);
      }
    }
    
    setStep('results');
    setLoading(false);
  };

  const handleSelectAlternativeSlot = async (slotTime: string) => {
    setTime(slotTime);
    setLoading(true);
    
    const dateTimeStr = `${date}T${slotTime}:00`;
    const response = await checkAvailability("savour-bistro-id", dateTimeStr, guests);

    if (response.error) {
      setResult({
        checked: true,
        available: false,
        error: response.error
      });
    } else {
      setResult({
        checked: true,
        available: response.available,
        maxCapacity: response.maxCapacity,
        reservedSeats: response.reservedSeats,
        remainingCapacity: response.remainingCapacity
      });
      // Clear alternative slots since we found an available one and selected it
      setAlternativeSlots([]);
    }
    setLoading(false);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerContact.trim()) return;
    
    setLoadingConfirm(true);
    const dateTimeStr = `${date}T${time}:00`;
    const response = await createReservation(
      "savour-bistro-id",
      dateTimeStr,
      guests,
      customerName,
      customerContact
    );

    if (response.error) {
      alert(`Não foi possível confirmar a reserva: ${response.error}`);
    } else {
      setReservationCode(response.id.substring(0, 8).toUpperCase());
      setStep('success');
    }
    setLoadingConfirm(false);
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerContact.trim()) return;

    setLoadingConfirm(true);
    const response = await addToWaitlist(
      "savour-bistro-id",
      guests,
      customerName,
      customerContact
    );

    if (response.error) {
      alert(`Não foi possível entrar na fila: ${response.error}`);
    } else {
      setWaitlistEntryId(response.id);
      setWaitlistPosition(response.position);
      setWaitlistStatus(response.status);
      setStep('waitlist');
    }
    setLoadingConfirm(false);
  };

  const handleLeaveWaitlist = async () => {
    if (!waitlistEntryId) return;

    setLoadingConfirm(true);
    const response = await removeFromWaitlist("savour-bistro-id", waitlistEntryId);
    if (response.error) {
      alert(`Não foi possível sair da fila de espera: ${response.error}`);
    } else {
      setWaitlistEntryId("");
      setWaitlistPosition(0);
      setWaitlistStatus("WAITING");
      resetFlow();
    }
    setLoadingConfirm(false);
  };

  const resetFlow = () => {
    setResult({ checked: false, available: false });
    setCustomerName("");
    setCustomerContact("");
    setAlternativeSlots([]);
    setStep('search');
  };

  const formatDateString = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-100 text-neutral-900 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-neutral-300 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-primary-500 tracking-tight">
              Savour
            </span>
          </div>
          <div className="text-xs font-semibold text-neutral-500 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
            B2C Portal
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-md w-full mx-auto px-6 py-8 flex flex-col justify-start gap-6 relative">
        
        {/* STEP 1: SEARCH FORM (INT-001) */}
        {step === 'search' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="text-center sm:text-left">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 leading-tight">
                Encontre sua mesa no <span className="text-primary-500 font-bold">Savour Bistro</span>
              </h1>
              <p className="text-sm text-neutral-700 mt-2">
                Consulte em tempo real a disponibilidade de assentos para seu grupo.
              </p>
            </div>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-6 border border-neutral-300 shadow-sm flex flex-col gap-6">
              {/* Date Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5" htmlFor="date-picker">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  Data da Visita
                </label>
                <input
                  id="date-picker"
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Time Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5" htmlFor="time-picker">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  Horário Desejado
                </label>
                <select
                  id="time-picker"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-neutral-300 bg-neutral-100 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {timeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity Selector (Component) */}
              <CapacitySelector
                value={guests}
                onChange={(val) => setGuests(val)}
                min={1}
                max={10}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Consultando...
                  </>
                ) : (
                  <>
                    Buscar Disponibilidade
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: RESULTS AND CONFIRMATION/WAITLIST (INT-002) */}
        {step === 'results' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Back to search link */}
            <button 
              onClick={() => setStep('search')}
              className="self-start flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-primary-500 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar para a busca
            </button>

            {/* Search Summary Card */}
            <div className="bg-white border border-neutral-300 rounded-2xl p-4 shadow-sm flex items-center justify-between text-xs text-neutral-700">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-neutral-900">Resumo da busca</span>
                <div className="flex items-center gap-3 mt-1 text-neutral-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-secondary-300" />
                    {formatDateString(date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary-300" />
                    {time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-secondary-300" />
                    {guests} {guests === 1 ? 'pessoa' : 'pessoas'}
                  </span>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <span className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></span>
                <span className="text-sm font-medium text-neutral-700">Processando...</span>
              </div>
            )}

            {!loading && result.error && (
              <div className="bg-danger-500/10 border border-danger-500/20 rounded-2xl p-5 flex items-start gap-3 text-danger-500">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Erro de Conexão</h4>
                  <p className="text-xs opacity-90 mt-1">{result.error}</p>
                </div>
              </div>
            )}

            {/* Scenario A: AVAILABLE */}
            {!loading && !result.error && result.available && (
              <div className="flex flex-col gap-6 animate-slideUp">
                {/* Available Banner */}
                <div className="bg-success-500/10 border border-success-500/20 rounded-2xl p-5 flex items-start gap-3 text-success-500">
                  <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Mesa Disponível!</h4>
                    <p className="text-xs opacity-90 mt-1">
                      Excelente! Temos capacidade garantida para o seu grupo no horário solicitado.
                    </p>
                  </div>
                </div>

                {/* Confirmation Form */}
                <form onSubmit={handleConfirmReservation} className="bg-white rounded-2xl p-6 border border-neutral-300 shadow-sm flex flex-col gap-5">
                  <div className="border-b border-neutral-300 pb-3 mb-1">
                    <h3 className="font-serif text-lg font-bold text-neutral-900">
                      Detalhes do Cliente
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Precisamos de alguns dados básicos para identificar sua reserva na recepção.
                    </p>
                  </div>

                  {/* Customer Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5" htmlFor="name-input">
                      <User className="w-3.5 h-3.5 text-secondary-500" />
                      Nome Completo
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      placeholder="Ex: Felipe Cabral"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-neutral-100 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Customer Contact */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5" htmlFor="contact-input">
                      <Phone className="w-3.5 h-3.5 text-secondary-500" />
                      Telefone / WhatsApp
                    </label>
                    <input
                      id="contact-input"
                      type="tel"
                      placeholder="Ex: (11) 99999-9999"
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      required
                      className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-neutral-100 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loadingConfirm || !customerName.trim() || !customerContact.trim()}
                    className="w-full h-12 mt-2 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loadingConfirm ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Confirmando Reserva...
                      </>
                    ) : (
                      "Confirmar Reserva"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Scenario B: NOT AVAILABLE */}
            {!loading && !result.error && !result.available && (
              <div className="flex flex-col gap-6 animate-slideUp">
                {/* Unavailable Banner */}
                <div className="bg-warning-500/10 border border-warning-500/20 rounded-2xl p-5 flex items-start gap-3 text-warning-500">
                  <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Sem Disponibilidade</h4>
                    <p className="text-xs opacity-95 mt-1">
                      Infelizmente o horário das <strong>{time}</strong> está lotado para grupos de <strong>{guests} pessoas</strong>.
                    </p>
                  </div>
                </div>

                {/* Alternative Slots Section */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-300 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary-500" />
                      Horários Alternativos Disponíveis
                    </h3>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Selecione um horário com disponibilidade de mesas para a mesma data:
                    </p>
                  </div>

                  {alternativeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {alternativeSlots.map((slot) => (
                        <TimeSlotCard
                          key={slot.time}
                          time={slot.time}
                          remainingCapacity={slot.remainingCapacity}
                          onClick={() => handleSelectAlternativeSlot(slot.time)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-neutral-300 rounded-xl bg-neutral-100/50">
                      <p className="text-xs text-neutral-500">
                        Nenhum horário alternativo disponível para esta quantidade de convidados hoje.
                      </p>
                    </div>
                  )}
                </div>

                {/* Waitlist Call-To-Action (Real Waitlist integration) */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-300 shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-950">
                      Fila de Espera Virtual
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                      Você também pode entrar na nossa fila virtual remotamente. Avisaremos nesta tela e via SMS/WhatsApp quando sua mesa estiver pronta.
                    </p>
                  </div>
                  
                  {/* Inline Customer Details for Waitlist */}
                  <div className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5" htmlFor="waitlist-name">
                        <User className="w-3.5 h-3.5 text-secondary-500" />
                        Nome Completo
                      </label>
                      <input
                        id="waitlist-name"
                        type="text"
                        placeholder="Nome completo para a fila"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-neutral-100 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5" htmlFor="waitlist-contact">
                        <Phone className="w-3.5 h-3.5 text-secondary-500" />
                        Telefone / WhatsApp
                      </label>
                      <input
                        id="waitlist-contact"
                        type="tel"
                        placeholder="Ex: (11) 99999-9999"
                        value={customerContact}
                        onChange={(e) => setCustomerContact(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-neutral-300 bg-neutral-100 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinWaitlist}
                    disabled={loadingConfirm || !customerName.trim() || !customerContact.trim()}
                    className="w-full h-12 rounded-xl font-semibold border-2 border-primary-500 text-primary-500 bg-white hover:bg-primary-50 active:bg-primary-100 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingConfirm ? (
                      <>
                        <span className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></span>
                        Entrando na Fila...
                      </>
                    ) : (
                      "Entrar na Fila de Espera"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center gap-6 py-8 animate-fadeIn">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-success-500/10 border border-success-500/20 text-success-500 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            {/* Title & Description */}
            <div className="flex flex-col gap-2">
              <h1 className="font-serif text-3xl font-bold text-neutral-900">
                Reserva Garantida!
              </h1>
              <p className="text-sm text-neutral-600 px-4">
                Sua mesa no <strong className="text-neutral-950 font-semibold">Savour Bistro</strong> foi agendada e está confirmada no sistema.
              </p>
            </div>

            {/* Receipt Details */}
            <div className="w-full bg-white rounded-2xl border border-neutral-300 shadow-sm overflow-hidden text-left">
              {/* Receipt Header */}
              <div className="bg-secondary-500 text-white px-5 py-3 flex justify-between items-center text-xs">
                <span className="font-medium tracking-wide uppercase">Comprovante de Reserva</span>
                <span className="font-mono bg-white/20 px-2.5 py-0.5 rounded font-bold">
                  #{reservationCode}
                </span>
              </div>

              {/* Receipt Body */}
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Data</span>
                    <span className="text-sm font-semibold text-neutral-900 mt-0.5 block">{formatDateString(date)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Horário</span>
                    <span className="text-sm font-semibold text-neutral-900 mt-0.5 block">{time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Pessoas (Pax)</span>
                    <span className="text-sm font-semibold text-neutral-900 mt-0.5 block">{guests} assentos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Status</span>
                    <span className="text-xs font-semibold text-success-500 mt-1 block flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse"></span>
                      CONFIRMADA
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-neutral-500 block uppercase font-semibold">Titular</span>
                  <span className="text-sm font-semibold text-neutral-900 mt-0.5 block">{customerName}</span>
                  <span className="text-[11px] text-neutral-600 mt-0.5 block">{customerContact}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 px-4 mt-2 leading-relaxed">
              Enviamos um e-mail com as instruções. Apresente este comprovante no balcão da recepção ao chegar.
            </p>

            {/* Back Button */}
            <button
              onClick={resetFlow}
              className="w-full h-12 mt-4 rounded-xl font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm transition-all duration-150 cursor-pointer"
            >
              Fazer nova busca
            </button>
          </div>
        )}

        {/* STEP 4: WAITLIST TRACKING STATUS (INT-003) */}
        {step === 'waitlist' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Status Header */}
            <div className="text-center mt-2">
              <h1 className="font-serif text-2xl font-bold text-neutral-900">
                Sua Fila de Espera
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Acompanhe o status em tempo real do seu lugar no Savour Bistro.
              </p>
            </div>

            {/* Waitlist Card Component */}
            <div className="bg-white rounded-2xl border border-neutral-300 shadow-md p-6 flex flex-col items-center text-center gap-5 relative overflow-hidden">
              {/* Background Glow based on status */}
              <div className={`absolute top-0 inset-x-0 h-2 
                ${waitlistStatus === 'READY' ? 'bg-success-500' : 'bg-warning-500'}`} 
              />

              {/* Status Visual and Numbers */}
              {waitlistStatus === 'WAITING' ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-warning-500/10 border-4 border-warning-500/30 flex flex-col items-center justify-center mt-2 animate-pulse">
                    <span className="text-xs font-semibold text-warning-500 uppercase tracking-wider">Posição</span>
                    <span className="text-4xl font-extrabold text-neutral-900 mt-0.5 font-mono">
                      {waitlistPosition}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 w-full mt-1">
                    <span className="text-xs font-medium text-neutral-500">Tempo estimado de espera</span>
                    <span className="text-xl font-bold text-neutral-900 font-sans">
                      {waitlistEstimatedTime} min
                    </span>
                    <p className="text-[11px] text-neutral-600 px-4 mt-2 leading-relaxed bg-neutral-100 py-2.5 rounded-xl border border-neutral-200">
                      Estamos organizando as mesas. Você pode aguardar nas proximidades, avisaremos assim que liberar!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-success-500/10 border-4 border-success-500/30 flex items-center justify-center mt-2 ring-8 ring-success-500/10 animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-success-500" />
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-1">
                    <div className="flex items-center justify-center gap-1.5 text-success-500 font-bold text-lg">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span>Mesa Pronta!</span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 px-4 leading-relaxed mt-1">
                      Sua mesa está pronta para receber o grupo de <strong>{guests} pessoas</strong>.
                    </p>
                    <div className="text-xs font-medium text-success-600 bg-success-500/10 border border-success-500/20 py-3 rounded-xl px-4 mt-2 font-mono">
                      Dirija-se imediatamente à recepção e informe seu nome: <strong className="font-sans font-bold">{customerName}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Reservation / Queue Detail Card */}
            <div className="bg-white rounded-2xl border border-neutral-300 p-4 shadow-sm text-xs text-neutral-700 flex flex-col gap-2.5">
              <span className="font-bold text-neutral-900 text-xs">Dados da solicitação</span>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-1 text-neutral-600">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-medium">Restaurante</span>
                  <span className="font-semibold text-neutral-900">Savour Bistro</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-medium">Pessoas</span>
                  <span className="font-semibold text-neutral-900">{guests} assentos</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-medium">Fila Iniciada em</span>
                  <span className="font-semibold text-neutral-900">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase font-medium">Contato</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[140px] block">{customerContact}</span>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleLeaveWaitlist}
              disabled={loadingConfirm}
              className="w-full h-12 rounded-xl font-semibold bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loadingConfirm ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Saindo da fila...
                </>
              ) : (
                "Cancelar / Sair da Fila"
              )}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-300 bg-white py-6 text-center text-[10px] text-neutral-500">
        <div className="max-w-md mx-auto px-6">
          &copy; {new Date().getFullYear()} Savour Platform. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
