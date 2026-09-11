import { useEffect, useState } from "react";

import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../src/services/invitationService.js";

import Sidebar from "../components/Sidebar.jsx";
import InvitationCard from "../components/InvitationCard.jsx";

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  //Sidebar
  const items = [
    { label: "Overview", path: "/dashboard" },
    { label: "Workspaces", path: "/workspaces" },
    { label: "Invitations", path: "/invitations" },
    { label: "Teams", path: "/teams" },
  ];

  useEffect(() => {
    async function fetchInvitations() {
      try {
        const data = await getMyInvitations();
        setInvitations(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, []);

  async function handleAccept(id) {
    try {
      await acceptInvitation(id);

      setInvitations((prev) => prev.filter((invite) => invite._id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReject(id) {
    try {
      await rejectInvitation(id);

      setInvitations((prev) => prev.filter((invite) => invite._id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="min-h-screen w-full flex">
      <Sidebar items={items} />
        <div className="p-8">
          <h2 className="text-3xl font-semibold">Your invitations</h2>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p>Loading invitations...</p>
            ) : invitations.length === 0 ? (
              <p>No pending invitations.</p>
            ) : (
              invitations.map((invite) => (
                <InvitationCard invite={invite} onAccept={handleAccept} onReject={handleReject} />
              ))
            )}
          </div>
      </div>
    </section>
  );
}
