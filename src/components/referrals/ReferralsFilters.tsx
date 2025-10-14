import React from "react";
import { Search } from "lucide-react";

interface ReferralsFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterGeneration: string;
  onGenerationChange: (generation: string) => void;
  filterStatus: string;
  onStatusChange: (status: string) => void;
}

export const ReferralsFilters = React.memo<ReferralsFiltersProps>(
  ({
    searchTerm,
    onSearchChange,
    filterGeneration,
    onGenerationChange,
    filterStatus,
    onStatusChange,
  }) => {
    return (
      <div className="rounded-2xl border bg-white shadow-lg max-w-5xl mx-auto mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o billetera"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3 flex-1 justify-end">
              <select
                value={filterGeneration}
                onChange={(e) => onGenerationChange(e.target.value)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="all">Todas las generaciones</option>
                <option value="1">Primera generación</option>
                <option value="2">Segunda generación</option>
                <option value="3">Tercera generación</option>
                <option value="4">Cuarta generación</option>
                <option value="5">Quinta generación</option>
                <option value="6">Sexta generación</option>
                <option value="7">Séptima generación</option>
                <option value="8">Octava generación</option>
                <option value="9">Novena generación</option>
                <option value="10">Décima generación</option>
                <option value="11">11va generación</option>
                <option value="12">12va generación</option>
                <option value="13">13va generación</option>
                <option value="14">14va generación</option>
                <option value="15">15va generación</option>
                <option value="16">16va generación</option>
                <option value="17">17va generación</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReferralsFilters.displayName = "ReferralsFilters";
