import backend from "@/constants/backend";
export default async function deleteEventCall(id: string, token: string) {
    await fetch(`${backend}events/${id}`, {
        method: "DELETE",
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });
}