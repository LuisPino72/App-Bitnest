"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/hooks';
import { UserCheck, Clock, UserX, Edit, Trash2, Calendar } from 'lucide-react';
import { Lead } from '@/types';

export function LeadsList() {
  const { getLeadsByStatus, updateLead, deleteLead } = useLeads();
  const [editingLead, setEditingLead] = useState<string | null>(null);

  const categories = [
    { 
      title: 'Interesados', 
      status: 'interested' as const, 
      icon: UserCheck, 
      color: 'text-success-600',
      bg: 'bg-success-50',
      border: 'border-success-200'
    },
    { 
      title: 'En Duda', 
      status: 'doubtful' as const, 
      icon: Clock, 
      color: 'text-warning-600',
      bg: 'bg-warning-50',
      border: 'border-warning-200'
    },
    { 
      title: 'Rechazados', 
      status: 'rejected' as const, 
      icon: UserX, 
      color: 'text-error-600',
      bg: 'bg-error-50',
      border: 'border-error-200'
    }
  ];

  const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
    updateLead(leadId, { status: newStatus });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {categories.map((category) => {
        const leads = getLeadsByStatus(category.status);

        return (
          <Card key={category.status} className={`${category.border} border-l-4`}>
            <CardHeader className={category.bg}>
              <CardTitle className={`flex items-center gap-2 ${category.color}`}>
                <category.icon className="h-5 w-5" />
                {category.title} ({leads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {leads.length > 0 ? (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingLead(editingLead === lead.id ? null : lead.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLead(lead.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        Contacto: {formatDate(lead.contactDate)}
                      </div>

                      {lead.notes && (
                        <p className="text-sm text-gray-600 mb-3">{lead.notes}</p>
                      )}

                      {editingLead === lead.id && (
                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-sm font-medium text-gray-700">Cambiar estado:</p>
                          <div className="flex gap-2 flex-wrap">
                            {categories.map((cat) => (
                              <Button
                                key={cat.status}
                                size="sm"
                                variant={lead.status === cat.status ? "default" : "outline"}
                                onClick={() => {
                                  handleStatusChange(lead.id, cat.status);
                                  setEditingLead(null);
                                }}
                                className="text-xs"
                              >
                                {cat.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <category.icon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay leads en esta categoría</p>
                  <p className="text-sm">Los leads aparecerán aquí cuando los agregues</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}