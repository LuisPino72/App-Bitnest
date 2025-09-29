"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useLeads, useSearch, usePagination } from "@/hooks";
import { formatDate } from "@/lib/businessUtils";

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, getLeadsByStatus } =
    useLeads();
  const [activeTab, setActiveTab] = useState<
    "interested" | "doubtful" | "rejected"
  >("interested");
  const [showForm, setShowForm] = useState(false);

  const tabLeads = getLeadsByStatus(activeTab);
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(tabLeads);
  const { currentPage, totalPages, currentItems, nextPage, previousPage } =
    usePagination(filteredItems, 8);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "interested":
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case "doubtful":
        return <Clock className="h-4 w-4 text-warning-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-danger-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interested":
        return "border-success-200 bg-success-50";
      case "doubtful":
        return "border-warning-200 bg-warning-50";
      case "rejected":
        return "border-danger-200 bg-danger-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const handleDeleteLead = (leadId: string, leadName: string) => {
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar permanentemente a ${leadName}?`
      )
    ) {
      deleteLead(leadId);
    }
  };

  const tabs = [
    {
      id: "interested",
      label: "Interesados",
      count: getLeadsByStatus("interested").length,
    },
    {
      id: "doubtful",
      label: "En Duda",
      count: getLeadsByStatus("doubtful").length,
    },
    {
      id: "rejected",
      label: "Rechazados",
      count: getLeadsByStatus("rejected").length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu pipeline de leads y conversiones
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-primary-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-success-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Interesados</p>
              <p className="text-2xl font-bold">
                {getLeadsByStatus("interested").length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">En Duda</p>
              <p className="text-2xl font-bold">
                {getLeadsByStatus("doubtful").length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-danger-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold">
                {getLeadsByStatus("rejected").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  {
                    interested:
                      activeTab === "interested"
                        ? "border-success-500 text-success-600"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    doubtful:
                      activeTab === "doubtful"
                        ? "border-warning-500 text-warning-600"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    rejected:
                      activeTab === "rejected"
                        ? "border-danger-500 text-danger-600"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                  }[tab.id]
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((lead) => (
              <div
                key={lead.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getStatusColor(
                  lead.status
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getStatusIcon(lead.status)}
                    <h3 className="font-medium text-gray-900 ml-2">
                      {lead.name}
                    </h3>
                  </div>
                </div>
                {lead.phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Phone className="h-3 w-3 mr-2" />
                    {lead.phone}
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-3">
                  Contactado: {formatDate(lead.contactDate)}
                  {lead.lastContact && (
                    <div>Último: {formatDate(lead.lastContact)}</div>
                  )}
                </div>

                {lead.notes && (
                  <div className="flex items-start text-xs text-gray-600 mb-3">
                    <MessageSquare className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{lead.notes}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {lead.status === "interested" && (
                    <>
                      <button
                        onClick={() =>
                          updateLead(lead.id, { status: "doubtful" })
                        }
                        className="btn btn-warning btn-sm flex-1 text-xs"
                      >
                        Marcar Dudoso
                      </button>
                      <button
                        onClick={() =>
                          updateLead(lead.id, { status: "rejected" })
                        }
                        className="btn btn-danger btn-sm flex-1 text-xs"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {lead.status === "doubtful" && (
                    <>
                      <button
                        onClick={() =>
                          updateLead(lead.id, { status: "interested" })
                        }
                        className="btn btn-success btn-sm flex-1 text-xs"
                      >
                        Interesado
                      </button>
                      <button
                        onClick={() =>
                          updateLead(lead.id, { status: "rejected" })
                        }
                        className="btn btn-danger btn-sm flex-1 text-xs"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {lead.status === "rejected" && (
                    <>
                      <button
                        onClick={() =>
                          updateLead(lead.id, { status: "interested" })
                        }
                        className="btn btn-success btn-sm flex-1 text-xs"
                      >
                        Reactivar
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="btn btn-danger btn-sm flex-1 text-xs flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                No hay leads en esta categoría
              </p>
              <p className="text-gray-400 mt-1">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando nuevos leads"}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages} • {filteredItems.length}{" "}
                leads
              </div>
              <div className="flex gap-2">
                <button
                  onClick={previousPage}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <AddLeadForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function AddLeadForm({ onSuccess }: { onSuccess: () => void }) {
  const { addLead } = useLeads();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
    status: "interested" as "interested" | "doubtful" | "rejected",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    try {
      await addLead({
        ...formData,
        contactDate: new Date().toISOString().split("T")[0],
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding lead:", error);
      alert("Error al agregar el lead");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Agregar Nuevo Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                status: e.target.value as any,
              }))
            }
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="interested">Interesado</option>
            <option value="doubtful">En Duda</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notas</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="btn btn-primary flex-1">
            Agregar Lead
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
