import { useState, useEffect } from 'react';
import { Cloud, TrendingUp, Newspaper, MapPin, Loader2 } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  location: string;
}

export default function InfoWidgets() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Date & Time</h3>
          <Cloud className="w-5 h-5 text-blue-400" />
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white">{formatTime(date)}</p>
          <p className="text-sm text-slate-400">{formatDate(date)}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Quick Stats</h3>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <span className="text-green-400 font-semibold">Online</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">AI Model</span>
            <span className="text-white font-semibold">GPT-4o</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Voice</span>
            <span className="text-blue-400 font-semibold">Active</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">System Info</h3>
          <Newspaper className="w-5 h-5 text-purple-400" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Version</span>
            <span className="text-white font-semibold">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Build</span>
            <span className="text-white font-semibold">Stable</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Uptime</span>
            <span className="text-green-400 font-semibold">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
