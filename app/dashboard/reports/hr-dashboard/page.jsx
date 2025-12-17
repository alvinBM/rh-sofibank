"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import { Card, CardBody, CardHeader, Select, SelectItem, Spinner } from "@nextui-org/react";
import { FiUsers, FiDollarSign, FiTrendingUp, FiTrendingDown, FiClock, FiAward } from "react-icons/fi";
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import {
  useGetHRDashboardMetrics, useGetHeadcountTrend, useGetGenderDistribution,
  useGetDepartmentDistribution, useGetMonthlySalaryCosts, useGetMonthlyAbsenteeism
} from "@/src/hooks/useReports";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function HRDashboardPage() {
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({ 
    department_id: "", 
    start_date: `${currentYear}-01-01`, 
    end_date: new Date().toISOString().split("T")[0] 
  });

  const { data: metrics, isLoading: metricsLoading } = useGetHRDashboardMetrics(filters);
  const { data: headcountTrend } = useGetHeadcountTrend(filters.start_date, filters.end_date);
  const { data: genderDist } = useGetGenderDistribution();
  const { data: deptDist } = useGetDepartmentDistribution();
  const { data: salaryCosts } = useGetMonthlySalaryCosts(currentYear);
  const { data: absenteeism } = useGetMonthlyAbsenteeism(currentYear);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CDF" }).format(value);
  };

  if (metricsLoading) return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;

  return (
    <PermissionGuard module="reports" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard RH Principal</h1>
            <p className="text-default-500 mt-1">Vue d'ensemble des indicateurs clés</p>
          </div>
          <Select label="Département" placeholder="Tous" className="w-64">
            <SelectItem key="" value="">Tous les départements</SelectItem>
          </Select>
        </div>

        {/* Indicateurs clés (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiUsers className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Effectif Total</p>
                  <p className="text-3xl font-bold">{metrics?.total_employees || 0}</p>
                  <p className="text-xs text-default-400">
                    M: {metrics?.employees_by_gender?.male || 0} | F: {metrics?.employees_by_gender?.female || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success-100 rounded-lg">
                  <FiDollarSign className="text-success text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Coûts Salariaux Mensuels</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics?.monthly_salary_cost || 0)}</p>
                  <p className="text-xs text-default-400">Annuel: {formatCurrency(metrics?.total_salary_cost || 0)}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FiTrendingUp className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Taux de Rotation</p>
                  <p className="text-3xl font-bold">{metrics?.turnover_rate?.toFixed(1) || 0}%</p>
                  <p className="text-xs text-success">Entrées: {metrics?.new_hires || 0} | Sorties: {metrics?.exits || 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiClock className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Taux d'Absentéisme</p>
                  <p className="text-3xl font-bold">{metrics?.absenteeism_rate?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <FiTrendingDown className="text-secondary text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Délai Moyen Recrutement</p>
                  <p className="text-3xl font-bold">{metrics?.average_recruitment_days || 0}</p>
                  <p className="text-xs text-default-400">jours</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiAward className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Score Moyen Évaluations</p>
                  <p className="text-3xl font-bold">{metrics?.average_evaluation_score?.toFixed(1) || 0}/100</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution effectif */}
          <Card>
            <CardHeader><h3 className="text-lg font-semibold">Évolution Effectif</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={headcountTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#0088FE" name="Effectif" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Répartition par genre */}
          <Card>
            <CardHeader><h3 className="text-lg font-semibold">Répartition par Genre</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderDist || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(genderDist || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Répartition par département */}
          <Card>
            <CardHeader><h3 className="text-lg font-semibold">Répartition par Département</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptDist || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" name="Employés" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Coûts salariaux mensuels */}
          <Card>
            <CardHeader><h3 className="text-lg font-semibold">Coûts Salariaux Mensuels</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salaryCosts || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="amount" stroke="#00C49F" fill="#00C49F" name="Coût" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Absentéisme mensuel */}
          <Card className="lg:col-span-2">
            <CardHeader><h3 className="text-lg font-semibold">Absentéisme Mensuel</h3></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={absenteeism || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" fill="#FF8042" name="Taux d'absentéisme" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
}
