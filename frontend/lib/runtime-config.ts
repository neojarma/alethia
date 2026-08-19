export function isDemoModeEnabled() {
  return (
    process.env.ENABLE_DEMO_MODE === "true" ||
    process.env.NODE_ENV !== "production"
  );
}
