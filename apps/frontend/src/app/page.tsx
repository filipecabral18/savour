"use client";

import { useState, useEffect } from "react";
import { getBackendStatus } from "../lib/api";

interface StatusData {
  status: string;
  database: string;
  error?: string;
}

export default function Home() {
  const [backendData, setBackendData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    const data = await getBackendStatus();
    setBackendData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "OK" || status === "ONLINE") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-500/10 text-success-500">
          <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></span>
          ONLINE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger-500/10 text-danger-500">
        <span className="w-2 h-2 rounded-full bg-danger-500"></span>
        OFFLINE
      </span>
    );
  };

  const getDbBadge = (status: string) => {
    if (status === "Connected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-500/10 text-success-500">
          CONNECTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-danger-500/10 text-danger-500">
        DISCONNECTED
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-100 text-neutral-900 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-neutral-300 bg-neutral-0/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-primary-500 tracking-tight">
              Savour
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-500 text-white">
              MONOREPO
            </span>
          </div>
          <div className="text-sm font-medium text-neutral-700">
            Scaffold V1.0.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 flex flex-col justify-center gap-10">
        {/* Hero Section */}
        <div className="text-center md:text-left max-w-2xl">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 mb-4 leading-tight">
            Seja bem-vindo ao <span className="text-primary-500">Savour</span>
          </h1>
          <p className="text-lg text-neutral-700 leading-relaxed">
            A infraestrutura básica do monorepo está configurada e pronta.
            Verifique abaixo o status de integração dos microsserviços do scaffold.
          </p>
        </div>

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Frontend */}
          <div className="bg-neutral-0 rounded-2xl p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-48">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-secondary-500">Frontend</h3>
                {getStatusBadge("ONLINE")}
              </div>
              <p className="text-sm text-neutral-700">
                Next.js (App Router, TypeScript, TailwindCSS)
              </p>
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              Porta: 3000
            </div>
          </div>

          {/* Card 2: Backend */}
          <div className="bg-neutral-0 rounded-2xl p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-48">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-secondary-500">Backend</h3>
                {loading ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-300 text-neutral-700">
                    Verificando...
                  </span>
                ) : (
                  getStatusBadge(backendData?.status === "OK" ? "ONLINE" : "OFFLINE")
                )}
              </div>
              <p className="text-sm text-neutral-700">
                NestJS (TypeScript, Modular Architecture)
              </p>
            </div>
            <div className="text-xs text-neutral-500 font-mono flex justify-between">
              <span>Porta: 3001</span>
              {!loading && backendData?.error && (
                <span className="text-danger-500 font-sans font-semibold text-[10px] truncate max-w-[120px]">
                  Erro: {backendData.error}
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Database */}
          <div className="bg-neutral-0 rounded-2xl p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-48">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-secondary-500">Database</h3>
                {loading ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-300 text-neutral-700">
                    Verificando...
                  </span>
                ) : (
                  getDbBadge(backendData?.database || "Disconnected")
                )}
              </div>
              <p className="text-sm text-neutral-700">
                PostgreSQL via Prisma ORM (Driver Adapter)
              </p>
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              Status do Adapter
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-neutral-0 rounded-2xl p-6 border border-neutral-300 shadow-sm">
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-secondary-500">Ambiente de Desenvolvimento</h4>
            <p className="text-xs text-neutral-700 mt-1">
              Modificações no backend e frontend são atualizadas automaticamente.
            </p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-sm hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : null}
            Testar Conexão
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-300 bg-neutral-0 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-6">
          &copy; {new Date().getFullYear()} Savour Platform. Desenvolvido para evolução incremental assistida por IA.
        </div>
      </footer>
    </div>
  );
}
