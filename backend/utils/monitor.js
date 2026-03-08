import axios from "axios";
import { WebsiteModel } from "../models/website.js";
import { HistoryModel } from "../models/history.js";
import { AlertModel } from "../models/alert.js";
import { sendSNSAlert, logToCloudWatch } from "./aws.js";

export const checkWebsites = async () => {
  const websites = await WebsiteModel.getAll();
  const now = new Date().toISOString();

  for (const site of websites) {
    // For demo purposes, we'll check every time the interval runs if it's close enough
    // In a real app, we'd strictly adhere to frequencyMs based on site.checkFrequency

    try {
      const startTime = Date.now();
      // We use a timeout to prevent hanging
      await axios.get(site.url, { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      let newStatus = "UP";
      if (responseTime > 1000) newStatus = "SLOW";

      await handleStatusChange(site, newStatus, responseTime, now);
    } catch (error) {
      await handleStatusChange(site, "DOWN", 0, now);
    }
  }
};

const handleStatusChange = async (site, newStatus, responseTime, timestamp) => {
  const oldStatus = site.status;

  // Update website
  await WebsiteModel.update(site.id, {
    status: newStatus,
    responseTime,
    lastChecked: timestamp,
  });

  await logToCloudWatch(
    "UptimeChecks",
    `Checked ${site.url} - Status: ${newStatus} - Response Time: ${responseTime}ms`,
  );

  if (oldStatus !== newStatus) {
    // Status changed
    const alertType =
      newStatus === "DOWN"
        ? "Website Down"
        : newStatus === "SLOW"
          ? "Website Slow"
          : "Website Back Online";

    await AlertModel.add({
      websiteId: site.id,
      url: site.url,
      type: alertType,
    });

    if (newStatus === "DOWN") {
      await HistoryModel.add({
        websiteId: site.id,
        url: site.url,
        downtimeStart: timestamp,
        downtimeEnd: null,
        totalDowntime: null,
      });

      await sendSNSAlert(
        site.alertEmail,
        `ALERT: ${site.url} is DOWN`,
        `Your website ${site.url} went down at ${timestamp}.`,
      );
    } else if (oldStatus === "DOWN" && newStatus === "UP") {
      await HistoryModel.updateEnd(site.id, timestamp);

      await sendSNSAlert(
        site.alertEmail,
        `RESOLVED: ${site.url} is Back UP`,
        `Your website ${site.url} is back online at ${timestamp}.`,
      );
    }
  }
};

export const startMonitoring = () => {
  // Run every 10 seconds for demo purposes (usually 1-5 mins)
  setInterval(checkWebsites, 10000);
  console.log("Monitoring script started");
};
