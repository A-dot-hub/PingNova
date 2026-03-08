import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type WebsiteStatus = "UP" | "DOWN" | "SLOW";

export interface Website {
  id: string;
  url: string;
  status: WebsiteStatus;
  responseTime: number;
  lastChecked: string;
  uptimePercentage: number;
  healthScore: number;
  checkFrequency: number;
  alertEmail: string;
}

export interface Alert {
  id: string;
  websiteId: string;
  url: string;
  type: "Website Down" | "Website Slow" | "Website Back Online";
  timeSent: string;
  status: "Unread" | "Read";
}

export interface HistoryRecord {
  id: string;
  websiteId: string;
  url: string;
  downtimeStart: string;
  downtimeEnd: string | null;
  totalDowntime: string | null;
}

interface MonitorContextType {
  websites: Website[];
  alerts: Alert[];
  history: HistoryRecord[];
  addWebsite: (
    website: Omit<
      Website,
      | "id"
      | "status"
      | "responseTime"
      | "lastChecked"
      | "uptimePercentage"
      | "healthScore"
    >,
  ) => Promise<void>;
  removeWebsite: (id: string) => Promise<void>;
  markAlertRead: (id: string) => void;
}

const MonitorContext = createContext<MonitorContextType | undefined>(undefined);

export const MonitorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const fetchData = async () => {
    try {
      const [websitesRes, alertsRes, historyRes] = await Promise.all([
        fetch('/api/websites'),
        fetch('/api/alerts'),
        fetch('/api/history')
      ]);
      
      if (websitesRes.ok) {
        const data = await websitesRes.json();
        setWebsites(data);
      }
      
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data);
      }
      
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const addWebsite = async (
    websiteData: Omit<
      Website,
      | "id"
      | "status"
      | "responseTime"
      | "lastChecked"
      | "uptimePercentage"
      | "healthScore"
    >,
  ) => {
    try {
      const res = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData)
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add website', error);
    }
  };

  const removeWebsite = async (id: string) => {
    try {
      const res = await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to remove website', error);
    }
  };

  const markAlertRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Read" } : a)),
    );
  };

  return (
    <MonitorContext.Provider
      value={{
        websites,
        alerts,
        history,
        addWebsite,
        removeWebsite,
        markAlertRead,
      }}
    >
      {children}
    </MonitorContext.Provider>
  );
};

export const useMonitor = () => {
  const context = useContext(MonitorContext);
  if (!context) {
    throw new Error("useMonitor must be used within a MonitorProvider");
  }
  return context;
};
