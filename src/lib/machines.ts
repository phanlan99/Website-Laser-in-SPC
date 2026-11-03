/**
 * Bảng quy đổi cột mamay (số) → Mã máy hiển thị.
 * Khi có máy mới chỉ cần thêm 1 dòng, ví dụ: 4: "A-2974".
 * File này không chứa gì bí mật nên dùng được cả ở server lẫn trình duyệt.
 */
export const MACHINES: Record<number, string> = {
  1: "A-2971",
  2: "A-2972",
  3: "A-2973",
};

/** 1 → "A-2971"; số chưa khai báo → "Máy #n" */
export function machineName(id: number | null | undefined): string {
  if (id === null || id === undefined || Number.isNaN(id)) return "—";
  return MACHINES[id] ?? `Máy #${id}`;
}

export type MachineOption = { id: number; name: string };

/** Gộp máy đã khai báo + máy thực tế có trong database, sắp theo số */
export function machineOptions(dbIds: number[] = []): MachineOption[] {
  const ids = new Set<number>([...Object.keys(MACHINES).map(Number), ...dbIds]);
  return [...ids].sort((a, b) => a - b).map((id) => ({ id, name: machineName(id) }));
}