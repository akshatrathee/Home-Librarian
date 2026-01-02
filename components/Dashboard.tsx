import React, { useMemo } from 'react';
import { AppState, ReadStatus } from '../types';
import { Icons } from './Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { books, users, locations, loans } = state;

  const totalValue = books.reduce((sum, b) => sum + (b.purchasePrice || 0), 0);
  const totalRead = users.reduce((sum, u) => sum + u.history.filter(h => h.status === ReadStatus.COMPLETED).length, 0);

  // Overdue Check
  const overdueLoans = loans.filter(l => {
      if (l.returnDate) return false;
      const days = (Date.now() - new Date(l.loanDate).getTime()) / (1000 * 3600 * 24);
      return days > 30;
  });

  // INR Formatter
  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);

  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      b.genres.forEach(g => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6
  }, [books]);

  const authorData = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => {
      counts[b.author] = (counts[b.author] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [books]);

  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];

  const StatCard = ({ title, value, sub, icon: Icon, alert }: any) => (
    <div className={`p-6 rounded-xl border shadow-sm flex items-center gap-4 ${alert ? 'bg-red-900/20 border-red-800' : 'bg-slate-800 border-slate-700'}`}>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-900 text-red-200' : 'bg-slate-700 text-indigo-400'}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className={`text-sm font-medium uppercase tracking-wider ${alert ? 'text-red-300' : 'text-slate-400'}`}>{title}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-red-100' : 'text-white'}`}>{value}</p>
        {sub && <p className={`text-xs mt-1 ${alert ? 'text-red-300' : 'text-slate-500'}`}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Library Overview</h1>
        <p className="text-slate-400">Your collection at a glance</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Books" 
          value={books.length} 
          sub={`${locations.length} Locations`} 
          icon={Icons.Book} 
        />
        <StatCard 
          title="Collection Value" 
          value={formatINR(totalValue)} 
          sub="Estimated Total" 
          icon={Icons.Rupee} 
        />
        <StatCard 
          title="Total Read" 
          value={totalRead} 
          sub="Across all family members" 
          icon={Icons.Check} 
        />
        {overdueLoans.length > 0 ? (
            <StatCard 
                title="Overdue Loans"
                value={overdueLoans.length}
                sub="Books late > 30 days"
                icon={Icons.Alert}
                alert={true}
            />
        ) : (
            <StatCard 
                title="Top Genre" 
                value={genreData[0]?.name || 'N/A'} 
                sub={`${genreData[0]?.value || 0} Books`} 
                icon={Icons.Tag} 
            />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        
        {/* Genre Distribution */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-6">Books by Genre</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
             {genreData.map((g, i) => (
               <div key={g.name} className="flex items-center gap-1 text-xs text-slate-300">
                 <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length]}}></span>
                 {g.name}
               </div>
             ))}
          </div>
        </div>

        {/* Top Authors */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-6">Top Authors</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authorData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: '#334155', opacity: 0.4}}
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};