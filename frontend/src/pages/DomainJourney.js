import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, Database, Share2, Crown, 
  ChevronRight, Package, Ship, Building2, Truck,
  ArrowUp, Check
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function DomainJourney() {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/domains/journey`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJourneys(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch domain journeys');
      setLoading(false);
    }
  };

  const maturityLevels = [
    { level: 1, name: 'Data Consumer', icon: Users, color: 'slate', description: 'Consuming data from other domains' },
    { level: 2, name: 'Data Aware', icon: TrendingUp, color: 'blue', description: 'Understanding data needs and dependencies' },
    { level: 3, name: 'Data Producer', icon: Database, color: 'purple', description: 'Publishing initial data products' },
    { level: 4, name: 'Mesh Contributor', icon: Share2, color: 'emerald', description: 'Active participant in the mesh ecosystem' },
    { level: 5, name: 'Mesh Leader', icon: Crown, color: 'amber', description: 'Driving data mesh excellence' }
  ];

  const getDomainIcon = (domain) => {
    switch(domain) {
      case 'port': return Ship;
      case 'fleet': return Package;
      case 'epc': return Building2;
      case 'logistics': return Truck;
      default: return Database;
    }
  };

  const getDomainColor = (domain) => {
    switch(domain) {
      case 'port': return 'blue';
      case 'fleet': return 'purple';
      case 'epc': return 'green';
      case 'logistics': return 'orange';
      default: return 'slate';
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 1: return 'bg-slate-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-purple-500';
      case 4: return 'bg-emerald-500';
      case 5: return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8" data-testid="domain-journey-page">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-[50px] p-12 text-white relative overflow-hidden shadow-2xl border-b-8 border-indigo-400">
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
              Domain Ownership Principle
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-3 leading-none">Domain Maturity Journey</h1>
            <p className="text-indigo-200 font-medium text-lg max-w-2xl">
              Track each domain's progression from data consumer to data mesh leader. 
              Domain teams take responsibility for their data following bounded context principles.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Maturity Level Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="font-black uppercase tracking-tighter">Maturity Levels</CardTitle>
            <CardDescription>The five stages of domain data mesh maturity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {maturityLevels.map((level) => {
                const Icon = level.icon;
                return (
                  <div key={level.level} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
                    <div className={`w-10 h-10 rounded-lg ${getLevelColor(level.level)} flex items-center justify-center text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Level {level.level}: {level.name}</p>
                      <p className="text-xs text-slate-500">{level.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Domain Journey Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {journeys.map((journey) => {
            const DomainIcon = getDomainIcon(journey.domain_name);
            const domainColor = getDomainColor(journey.domain_name);
            const progress = (journey.current_level / 5) * 100;
            
            return (
              <Card key={journey.id} className={`border-t-4 border-t-${domainColor}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-${domainColor}-100 text-${domainColor}-600 flex items-center justify-center`}>
                        <DomainIcon className="h-7 w-7" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tight capitalize">
                          {journey.domain_name} Domain
                        </CardTitle>
                        <CardDescription>Started: {journey.journey_started}</CardDescription>
                      </div>
                    </div>
                    <Badge className={`${getLevelColor(journey.current_level)} text-white text-lg px-4 py-2`}>
                      Level {journey.current_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-bold text-slate-600">Maturity Progress</span>
                      <span className="font-bold text-slate-900">{journey.current_level}/5</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Level Description */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm font-medium text-slate-700">{journey.level_description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <ArrowUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-2xl font-black text-slate-900">{journey.data_products_published}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Products Published</p>
                    </div>
                    <div className="p-4 border rounded-xl text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <span className="text-2xl font-black text-slate-900">{journey.data_products_consumed}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Products Consumed</p>
                    </div>
                  </div>

                  {/* Journey Steps */}
                  <div className="flex items-center justify-between px-2">
                    {maturityLevels.map((level, idx) => {
                      const LevelIcon = level.icon;
                      const isComplete = journey.current_level >= level.level;
                      const isCurrent = journey.current_level === level.level;
                      
                      return (
                        <React.Fragment key={level.level}>
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isComplete 
                                ? `${getLevelColor(level.level)} text-white` 
                                : 'bg-slate-200 text-slate-400'
                            } ${isCurrent ? 'ring-4 ring-offset-2 ring-slate-300' : ''}`}>
                              {isComplete ? <Check className="h-5 w-5" /> : <LevelIcon className="h-5 w-5" />}
                            </div>
                            <span className={`text-xs mt-2 font-bold ${isComplete ? 'text-slate-700' : 'text-slate-400'}`}>
                              L{level.level}
                            </span>
                          </div>
                          {idx < maturityLevels.length - 1 && (
                            <div className={`flex-1 h-1 mx-1 rounded ${
                              journey.current_level > level.level ? getLevelColor(level.level) : 'bg-slate-200'
                            }`}></div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Mesh Principle Explanation */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">Domain Ownership Principle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              The <strong className="text-white">domain ownership principle</strong> mandates the domain teams to take 
              responsibility for their data. According to this principle, analytical data should be composed around 
              domains, similar to the team boundaries aligning with the system's bounded context.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Following the domain-driven distributed architecture, analytical and operational data ownership is moved 
              to the domain teams, away from the central data team. Each domain team becomes both a producer and 
              consumer of data products.
            </p>
            <div className="flex gap-4 mt-6">
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">Bounded Context</Badge>
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">Domain-Driven Design</Badge>
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">Decentralized Ownership</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default DomainJourney;
