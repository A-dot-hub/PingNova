// In-memory fallback
let websites = [
  {
    id: "1",
    url: "https://google.com",
    status: "UP",
    responseTime: 120,
    lastChecked: new Date().toISOString(),
    uptimePercentage: 99.99,
    healthScore: 98,
    checkFrequency: 1,
    alertEmail: "admin@pingnova.com",
  },
  {
    id: "2",
    url: "https://aws.amazon.com",
    status: "UP",
    responseTime: 85,
    lastChecked: new Date().toISOString(),
    uptimePercentage: 99.95,
    healthScore: 95,
    checkFrequency: 3,
    alertEmail: "admin@pingnova.com",
  },
  {
    id: "3",
    url: "https://github.com",
    status: "SLOW",
    responseTime: 850,
    lastChecked: new Date().toISOString(),
    uptimePercentage: 98.5,
    healthScore: 75,
    checkFrequency: 1,
    alertEmail: "admin@pingnova.com",
  },
  {
    id: "4",
    url: "https://example-down.com",
    status: "DOWN",
    responseTime: 0,
    lastChecked: new Date().toISOString(),
    uptimePercentage: 85.0,
    healthScore: 40,
    checkFrequency: 5,
    alertEmail: "admin@pingnova.com",
  },
];

export const WebsiteModel = {
  getAll: async () => {
    // If DB connected, fetch from DB. Else return memory
    return websites;
  },
  add: async (website) => {
    const newSite = {
      id: Math.random().toString(36).substr(2, 9),
      ...website,
      status: "UP",
      responseTime: 0,
      lastChecked: new Date().toISOString(),
      uptimePercentage: 100,
      healthScore: 100,
    };
    websites.push(newSite);
    return newSite;
  },
  remove: async (id) => {
    websites = websites.filter((w) => w.id !== id);
    return true;
  },
  update: async (id, data) => {
    const index = websites.findIndex((w) => w.id === id);
    if (index !== -1) {
      websites[index] = { ...websites[index], ...data };
      return websites[index];
    }
    return null;
  },
};
