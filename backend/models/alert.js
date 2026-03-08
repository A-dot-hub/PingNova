let alerts = [
  {
    id: "a1",
    websiteId: "4",
    url: "https://example-down.com",
    type: "Website Down",
    timeSent: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: "Unread",
  },
  {
    id: "a2",
    websiteId: "3",
    url: "https://github.com",
    type: "Website Slow",
    timeSent: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "Unread",
  },
];

export const AlertModel = {
  getAll: async () => {
    return alerts;
  },
  add: async (alert) => {
    const newAlert = {
      id: Math.random().toString(36).substr(2, 9),
      ...alert,
      timeSent: new Date().toISOString(),
      status: "Unread",
    };
    alerts.unshift(newAlert);
    if (alerts.length > 100) alerts.pop();
    return newAlert;
  },
};
