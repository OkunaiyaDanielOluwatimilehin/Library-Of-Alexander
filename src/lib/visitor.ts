export function getVisitorFingerprint(): string {
  let fingerprint = localStorage.getItem("visitor_fingerprint");
  if (!fingerprint) {
    fingerprint = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem("visitor_fingerprint", fingerprint);
  }
  return fingerprint;
}
