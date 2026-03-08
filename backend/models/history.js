let history = [
  {
    id: "h1",
    websiteId: "4",
    url: "https://example-down.com",
    downtimeStart: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    downtimeEnd: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    totalDowntime: "30 mins",
  },
  {
    id: "h2",
    websiteId: "4",
    url: "https://example-down.com",
    downtimeStart: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    downtimeEnd: null,
    totalDowntime: null,
  },
];

export const HistoryModel = {
  getAll: async () => {
    return history;
  },
  getByWebsiteId: async (websiteId) => {
    return history.filter((h) => h.websiteId === websiteId);
  },
  add: async (record) => {
    const newRecord = {
      id: Math.random().toString(36).substr(2, 9),
      ...record,
    };
    history.unshift(newRecord);
    return newRecord;
  },
  updateEnd: async (websiteId, endTime) => {
    const active = history.find(
      (h) => h.websiteId === websiteId && !h.downtimeEnd,
    );
    if (active) {
      active.downtimeEnd = endTime;
      const start = new Date(active.downtimeStart).getTime();
      const end = new Date(endTime).getTime();
      active.totalDowntime = `${Math.round((end - start) / 60000)} mins`;
    }
  },
};
