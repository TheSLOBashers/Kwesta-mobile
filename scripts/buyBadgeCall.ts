import backend from "@/constants/backend";

const buyBadgeCall = async (
  token: string | null,
  badgeName: string,
  cost: number,
) => {
  if (!token) {
    throw new Error("No auth token");
  }

  const url = `${backend.replace(/\/+$/, "")}/users/me/badges/purchase`;

  // Fetfch the damn thing
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ badgeName, cost }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Badge purchase failed: ${response.status} ${body}`);
  }

  return response.json();
};

export default buyBadgeCall;
