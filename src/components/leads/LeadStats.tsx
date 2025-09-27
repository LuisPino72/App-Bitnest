"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/hooks';
import { UserCheck, UserX, Clock, Users } from 'lucide-react';

export function LeadStats() {
  const { getLeadsByStatus, leads } = useLeads();

  const interested = getLeadsByStatus('interested');
  const doubtful = getLeadsByStatus('doubtful');
  const rejected = getLeadsByStatus('rejected');

  const stats = [
    {
      title: 'Interesados',
      count: interested.length,
      icon: UserCheck,
      color: 'text-success-600',
      bg: 'bg-success-50'
    },
    {
      title: 'En Duda',
      count: doubtful.length,
      icon: Clock,
      color: 'text-warning-600',
      bg: 'bg-warning-50'
    },
    {
      title: 'Rechazados',
      count: rejected.length,
      icon: UserX,
      color: 'text-error-600',
      bg: 'bg-error-50'
    },
    {
      title: 'Total Leads',
      count: leads.length,
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 ${stat.bg} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}