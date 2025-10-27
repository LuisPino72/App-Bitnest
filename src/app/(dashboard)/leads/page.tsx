"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFirebaseLeads } from "@/hooks";
import {
  Plus,
  Search,
  UserPlus,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Users,
  DollarSign,
} from "lucide-react";

export default function LeadsPage() {
  const { leads, addLead, updateLead, deleteLead, getLeadsByStatus, loading } =
    useFirebaseLeads();
  const [activeTab, setActiveTab] = useState<
    "activeInvestor" | "interested" | "doubtful" | "rejected"
  >("interested");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estadísticas
  const stats = [
    {
      title: "Inversores Activos",
      count: getLeadsByStatus("activeInvestor").length,
      icon: CheckCircle,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },

    {
      title: "Interesados",
      count: getLeadsByStatus("interested").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "En Duda",
      count: getLeadsByStatus("doubtful").length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Rechazados",
      count: getLeadsByStatus("rejected").length,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Total contactados",
      count: leads.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  // Tabs de navegación
  const tabs = [
    {
      id: "activeInvestor" as const,
      label: "Inversores Activos",
      icon: CheckCircle,
      color: "text-blue-700",
    },
    {
      id: "interested" as const,
      label: "Interesados",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: "doubtful" as const,
      label: "En Duda",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      id: "rejected" as const,
      label: "Rechazados",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  // Filtrado y utilidades
  const currentLeads = getLeadsByStatus(activeTab);
  const filteredLeads = currentLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activeInvestor":
        return "border-l-blue-500 bg-blue-50";
      case "interested":
        return "border-l-green-500 bg-green-50";
      case "doubtful":
        return "border-l-yellow-500 bg-yellow-50";
      case "rejected":
        return "border-l-red-500 bg-red-50";
      default:
        return "border-l-gray-500 bg-gray-50";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
        <div className="mb-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
            Gestión de personas contactadas
          </h1>
          <p className="text-gray-500 text-base mt-2 animate-pulse">
            Cargando...
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 animate-pulse rounded-xl h-28 shadow-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in py-8 px-2 md:px-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700 tracking-tight drop-shadow-lg">
          Gestión de personas contactadas
        </h1>
        <p className="text-gray-500 text-base mt-2">
          Administra y sigue tu pipeline de contactos
        </p>
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowForm(true)}
            className="font-bold text-base"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva persona
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white shadow-lg p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-base font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Panel Principal */}
      <div className="rounded-2xl border bg-white shadow-lg max-w-6xl mx-auto mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-gray-100 rounded-lg p-1">
              {tabs.map((tab) => {
                const leadsCount = getLeadsByStatus(tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-base font-bold transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className={`h-5 w-5 ${tab.color}`} />
                    {tab.label}
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {leadsCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Búsqueda */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar persona..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredLeads.length > 0 ? (
            <div className="grid gap-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`border-l-4 rounded-xl p-4 transition-all hover:shadow-lg ${getStatusColor(
                    lead.status
                  )}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {lead.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                        {formatDate(lead.contactDate)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {lead.notes && (
                    <div className="flex items-start gap-2 mb-4">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-600 text-base">{lead.notes}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {tabs
                      .filter((tab) => tab.id !== lead.status)
                      .map((tab) => (
                        <Button
                          key={tab.id}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateLead(lead.id, { status: tab.id })
                          }
                          className="text-xs font-bold"
                        >
                          <tab.icon className={`h-4 w-4 mr-1 ${tab.color}`} />
                          Mover a {tab.label}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-bold">
                {searchTerm
                  ? "No se encontraron personas"
                  : "No hay personas en esta categoría"}
              </p>
              <p className="text-gray-400 mt-1">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza agregando nuevas personas"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-4 font-bold text-base"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar Primer Lead
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      {showForm && <AddLeadForm onSuccess={() => setShowForm(false)} />}
    </div>
  );
}

// Componente de Formulario Integrado
function AddLeadForm({ onSuccess }: { onSuccess: () => void }) {
  const { addLead } = useFirebaseLeads();
  const [formData, setFormData] = useState({
    name: "",
    status: "interested" as const,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    addLead({
      ...formData,
      contactDate: new Date().toISOString().split("T")[0],
    });

    setFormData({ name: "", status: "interested", notes: "" });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5" />
            Agregar Nueva persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del contacto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="activeInvestor">Inversor Activo</option>
                <option value="interested">Interesado</option>
                <option value="doubtful">En Duda</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales sobre el contacto..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Agregar Lead
              </Button>
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
