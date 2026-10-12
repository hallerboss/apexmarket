export const TRACKING_STAGES = [
  { key: "order_received", label: "Order Received" },
  { key: "order_ready", label: "Order Ready" },
  { key: "order_packed", label: "Order Packed" },
  { key: "order_dispatched", label: "Order Dispatched" },
  { key: "at_airport", label: "At Airport" },
  { key: "arrived_destination", label: "Arrived at Destination Country" },
  { key: "on_the_way", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
];

export const stageIndex = (status) => {
  const i = TRACKING_STAGES.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
};

export const stageLabel = (status) => {
  const s = TRACKING_STAGES.find((x) => x.key === status);
  return s ? s.label : "Order Received";
};