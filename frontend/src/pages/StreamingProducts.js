import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Zap, Database, ArrowRight, CheckCircle2, 
  AlertTriangle, RefreshCw, Play, Pause, BarChart3,
  Ship, Truck, Wind, MapPin, Clock, Filter, Layers
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

// Pipeline Stage Component
function PipelineStage({ stage, isLast }) {
  const stageColors = {
    ingest: 'from-blue-500 to-blue-600',
    validate: 'from-amber-500 to-amber-600',
    enrich: 'from-purple-500 to-purple-600',
    persist: 'from-green-500 to-green-600',
    analytics: 'from-orange-500 to-orange-600',
    publish: 'from-cyan-500 to-cyan-600'
  };
  
  const colorClass = stageColors[stage.type] || 'from-slate-500 to-slate-600';
  
  return (
    <div className="flex items-center">
      <div className="relative">
        <div className={'w-24 h-24 rounded-2xl bg-gradient-to-br ' + colorClass + ' flex flex-col items-center justify-center text-white shadow-lg'}>
          <stage.icon className="h-8 w-8 mb-1" />
          <span className="text-xs font-bold text-center px-1">{stage.name}</span>
        </div>
        {stage.metrics && (
          <div className="absolute -bottom-2 -right-2 bg-white rounded-lg shadow px-2 py-1 text-xs font-bold">
            {stage.metrics}
          </div>
        )}
        {stage.status === 'running' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </div>
      {!isLast && (
        <div className="flex items-center mx-2">
          <div className="w-8 h-0.5 bg-slate-300"></div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="w-8 h-0.5 bg-slate-300"></div>
        </div>
      )}
    </div>
  );
}

// Real-time Event Card
function EventCard({ event }) {
  const eventColors = {
    vessel_update: 'border-l-blue-500 bg-blue-50',
    shipment_update: 'border-l-purple-500 bg-purple-50',
    site_update: 'border-l-green-500 bg-green-50',
    route_alert: 'border-l-orange-500 bg-orange-50'
  };
  
  const eventIcons = {
    vessel_update: Ship,
    shipment_update: Truck,
    site_update: Wind,
    route_alert: MapPin
  };
  
  const colorClass = eventColors[event.event_type] || 'border-l-slate-500 bg-slate-50';
  const Icon = eventIcons[event.event_type] || Activity;

  return (
    <div className={'p-3 border-l-4 rounded-lg ' + colorClass + ' animate-fadeIn'}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-slate-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">{event.title}</span>
            <span className="text-xs text-slate-500">{event.timestamp}</span>
          </div>
          <p className="text-xs text-slate-600 truncate">{event.description}</p>
        </div>
      </div>
    </div>
  );
}

// Streaming Topic Card
function StreamingTopicCard({ topic }) {
  const statusColor = topic.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500';
  
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{topic.name}</CardTitle>
              <CardDescription className="text-xs">{topic.domain} domain</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColor + ' text-white'}>{topic.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600">{topic.description}</p>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{topic.messages_per_sec}</p>
            <p className="text-xs text-slate-500">msgs/sec</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{topic.subscribers}</p>
            <p className="text-xs text-slate-500">subscribers</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-lg font-black text-slate-900">{topic.retention}</p>
            <p className="text-xs text-slate-500">retention</p>
          </div>
        </div>

        <div className="p-2 bg-slate-100 rounded-lg">
          <p className="text-xs text-slate-500 mb-1">Schema</p>
          <code className="text-xs font-mono text-slate-700">{topic.schema_ref}</code>
        </div>
      </CardContent>
    </Card>
  );
}

// Consumer Subscription Card
function SubscriptionCard({ subscription }) {
  return (
    <Card className="border-l-4 border-l-cyan-500">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-bold text-slate-900">{subscription.name}</h4>
            <p className="text-xs text-slate-500">Topic: {subscription.topic}</p>
          </div>
          <Badge variant="outline">{subscription.ack_deadline}s ack</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-center p-2 bg-slate-50 rounded">
            <p className="text-sm font-bold">{subscription.unacked_messages}</p>
            <p className="text-xs text-slate-500">Unacked</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded">
            <p className="text-sm font-bold">{subscription.oldest_unacked}</p>
            <p className="text-xs text-slate-500">Oldest</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Consumer: {subscription.consumer}</p>
      </CardContent>
    </Card>
  );
}

function StreamingProducts() {
  const [events, setEvents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState('running');
  const [loading, setLoading] = useState(true);

  // Pipeline stages based on Google Cloud Data Mesh demo
  const pipelineStages = [
    { type: 'ingest', name: 'Ingest Events', icon: Database, metrics: '150/s', status: 'running' },
    { type: 'validate', name: 'Parse & Validate', icon: Filter, metrics: '99.2%', status: 'running' },
    { type: 'enrich', name: 'Enrich Data', icon: Layers, metrics: '+3 fields', status: 'running' },
    { type: 'persist', name: 'Persist to BQ', icon: Database, metrics: '147/s', status: 'running' },
    { type: 'analytics', name: 'Generate Stats', icon: BarChart3, metrics: '5min', status: 'running' },
    { type: 'publish', name: 'Publish Topic', icon: Zap, metrics: '50/s', status: 'running' }
  ];

  useEffect(function() {
    // Initialize with mock streaming data
    setTopics([
      {
        id: 't1',
        name: 'vessel-status-v1',
        domain: 'port',
        description: 'Real-time vessel arrival and departure events from all Oman ports',
        status: 'active',
        messages_per_sec: 45,
        subscribers: 3,
        retention: '7d',
        schema_ref: 'schemas/vessel-event-v1.avro'
      },
      {
        id: 't2',
        name: 'shipment-tracking-v1',
        domain: 'fleet',
        description: 'GPS tracking events for wind turbine component shipments',
        status: 'active',
        messages_per_sec: 120,
        subscribers: 5,
        retention: '3d',
        schema_ref: 'schemas/shipment-event-v1.avro'
      },
      {
        id: 't3',
        name: 'site-readiness-v1',
        domain: 'epc',
        description: 'Installation site status updates and capacity changes',
        status: 'active',
        messages_per_sec: 8,
        subscribers: 2,
        retention: '14d',
        schema_ref: 'schemas/site-event-v1.avro'
      },
      {
        id: 't4',
        name: 'logistics-alerts-v1',
        domain: 'logistics',
        description: 'Route alerts, permit updates, and weather warnings',
        status: 'active',
        messages_per_sec: 15,
        subscribers: 4,
        retention: '30d',
        schema_ref: 'schemas/alert-event-v1.avro'
      }
    ]);

    setSubscriptions([
      { id: 's1', name: 'control-tower-sub', topic: 'vessel-status-v1', consumer: 'Control Tower', ack_deadline: 30, unacked_messages: 12, oldest_unacked: '2s' },
      { id: 's2', name: 'fleet-ops-sub', topic: 'shipment-tracking-v1', consumer: 'Fleet Operations', ack_deadline: 60, unacked_messages: 45, oldest_unacked: '5s' },
      { id: 's3', name: 'analytics-sub', topic: 'vessel-status-v1', consumer: 'Analytics Engine', ack_deadline: 120, unacked_messages: 0, oldest_unacked: '-' }
    ]);

    setLoading(false);

    // Simulate real-time events
    const eventTypes = [
      { type: 'vessel_update', title: 'Vessel Status Change', descriptions: ['Wind Champion arrived at Berth B-Heavy-01', 'Green Transporter ETA updated to 14:00', 'Vestas Voyager unloading complete'] },
      { type: 'shipment_update', title: 'Shipment Update', descriptions: ['Turbine blades passed checkpoint A-47', 'Convoy ASYAD-002 departed Salalah', 'Tower section delivered to Site Alpha'] },
      { type: 'site_update', title: 'Site Status', descriptions: ['Block A ready for next delivery', 'Turbine T-08 installation started', 'Capacity updated: 8/25 turbines'] },
      { type: 'route_alert', title: 'Route Alert', descriptions: ['Weather advisory: Wind speed 45km/h', 'Bridge inspection complete - route clear', 'Permit ROP-2025-0847 approved'] }
    ];

    const generateEvent = function() {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const description = eventType.descriptions[Math.floor(Math.random() * eventType.descriptions.length)];
      const now = new Date();
      
      return {
        id: 'evt-' + Date.now(),
        event_type: eventType.type,
        title: eventType.title,
        description: description,
        timestamp: now.toLocaleTimeString()
      };
    };

    // Add initial events
    const initialEvents = [];
    for (let i = 0; i < 5; i++) {
      initialEvents.push(generateEvent());
    }
    setEvents(initialEvents);

    // Add new event every 3 seconds
    const interval = setInterval(function() {
      if (pipelineStatus === 'running') {
        setEvents(function(prev) {
          const newEvents = [generateEvent(), ...prev];
          return newEvents.slice(0, 20); // Keep last 20 events
        });
      }
    }, 3000);

    return function() { clearInterval(interval); };
  }, [pipelineStatus]);

  const togglePipeline = function() {
    setPipelineStatus(function(prev) {
      const newStatus = prev === 'running' ? 'paused' : 'running';
      toast.success('Pipeline ' + (newStatus === 'running' ? 'started' : 'paused'));
      return newStatus;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4 uppercase tracking-widest text-xs font-bold">
                  Real-time Data Products
                </Badge>
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Streaming Data Pipeline</h1>
                <p className="text-orange-100 font-medium text-lg max-w-2xl">
                  Event-driven data products powered by Pub/Sub streaming.
                  Consume real-time logistics events via subscriptions.
                </p>
              </div>
              <Button 
                size="lg"
                className={pipelineStatus === 'running' ? 'bg-white text-orange-600 hover:bg-orange-50' : 'bg-orange-700 text-white'}
                onClick={togglePipeline}
              >
                {pipelineStatus === 'running' ? (
                  <span className="flex items-center gap-2"><Pause className="h-5 w-5" /> Pause Pipeline</span>
                ) : (
                  <span className="flex items-center gap-2"><Play className="h-5 w-5" /> Start Pipeline</span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Pipeline Visualization */}
        <Card className="bg-slate-900 text-white overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  Product Data Pipeline
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Ingest → Validate → Enrich → Persist → Analyze → Publish
                </CardDescription>
              </div>
              <Badge className={pipelineStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}>
                {pipelineStatus === 'running' ? 'RUNNING' : 'PAUSED'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6 overflow-x-auto">
              {pipelineStages.map(function(stage, idx) {
                return (
                  <PipelineStage 
                    key={stage.type} 
                    stage={stage} 
                    isLast={idx === pipelineStages.length - 1}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Streaming Topics */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tight">Streaming Topics</h2>
            <div className="grid grid-cols-2 gap-4">
              {topics.map(function(topic) {
                return <StreamingTopicCard key={topic.id} topic={topic} />;
              })}
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight pt-4">Consumer Subscriptions</h2>
            <div className="grid grid-cols-3 gap-4">
              {subscriptions.map(function(sub) {
                return <SubscriptionCard key={sub.id} subscription={sub} />;
              })}
            </div>
          </div>

          {/* Real-time Events Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black uppercase tracking-tight">Live Events</h2>
              <Badge className={pipelineStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}>
                <Activity className="h-3 w-3 mr-1" />
                {pipelineStatus === 'running' ? 'LIVE' : 'PAUSED'}
              </Badge>
            </div>
            <Card className="h-[600px] overflow-hidden">
              <CardContent className="p-3 h-full overflow-y-auto space-y-2">
                {events.map(function(event) {
                  return <EventCard key={event.id} event={event} />;
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default StreamingProducts;
