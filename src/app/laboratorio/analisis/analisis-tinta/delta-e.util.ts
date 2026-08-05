const DEG = 180 / Math.PI;
const RAD = Math.PI / 180;

export function deltaE2000(l1: number, a1: number, b1: number, l2: number, a2: number, b2: number): number {
  const kL = 1;
  const kC = 1;
  const kH = 1;

  const c1 = Math.sqrt(a1 * a1 + b1 * b1);
  const c2 = Math.sqrt(a2 * a2 + b2 * b2);
  const cAvg = (c1 + c2) / 2;
  const cAvg7 = Math.pow(cAvg, 7);
  const G = 0.5 * (1 - Math.sqrt(cAvg7 / (cAvg7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const c1p = Math.sqrt(a1p * a1p + b1 * b1);
  const c2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * DEG;
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * DEG;
  if (h2p < 0) h2p += 360;

  const dLp = l2 - l1;
  const dCp = c2p - c1p;

  let dhp: number;
  if (c1p * c2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp * RAD) / 2);

  const LpAvg = (l1 + l2) / 2;
  const CpAvg = (c1p + c2p) / 2;

  let HpAvg: number;
  if (c1p * c2p === 0) {
    HpAvg = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    HpAvg = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    HpAvg = (h1p + h2p + 360) / 2;
  } else {
    HpAvg = (h1p + h2p - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos((HpAvg - 30) * RAD) +
    0.24 * Math.cos(2 * HpAvg * RAD) +
    0.32 * Math.cos((3 * HpAvg + 6) * RAD) -
    0.2 * Math.cos((4 * HpAvg - 63) * RAD);

  const SL = 1 + (0.015 * Math.pow(LpAvg - 50, 2)) / Math.sqrt(20 + Math.pow(LpAvg - 50, 2));
  const SC = 1 + 0.045 * CpAvg;
  const SH = 1 + 0.015 * CpAvg * T;

  const CpAvg7 = Math.pow(CpAvg, 7);
  const RT =
    -2 *
    Math.sqrt(CpAvg7 / (CpAvg7 + Math.pow(25, 7))) *
    Math.sin(60 * Math.exp(-Math.pow((HpAvg - 275) / 25, 2)) * RAD);

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
      Math.pow(dCp / (kC * SC), 2) +
      Math.pow(dHp / (kH * SH), 2) +
      RT * (dCp / (kC * SC)) * (dHp / (kH * SH)),
  );

  return dE;
}

export function deltaECMC(
  l1: number,
  a1: number,
  b1: number,
  l2: number,
  a2: number,
  b2: number,
  l: number = 2,
  c: number = 1,
): number {
  const dL = l1 - l2;
  const dA = a1 - a2;
  const dB = b1 - b2;
  const dC = Math.sqrt(a1 * a1 + b1 * b1) - Math.sqrt(a2 * a2 + b2 * b2);
  const dH = Math.sqrt(Math.max(0, dA * dA + dB * dB - dC * dC));

  const SC = 1 + 0.048 * Math.sqrt(Math.sqrt(a1 * a1 + b1 * b1));
  const SH = 1 + 0.014 * Math.sqrt(Math.sqrt(a1 * a1 + b1 * b1));

  return Math.sqrt(Math.pow(dL / l, 2) + Math.pow(dC / (c * SC), 2) + Math.pow(dH / SH, 2));
}
