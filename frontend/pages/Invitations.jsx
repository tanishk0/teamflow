import { useEffect, useState } from "react";

import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../src/services/invitationService.js";
import {
  getMyTeamInvites,
  acceptTeamInvite,
  rejectTeamInvite,
} from "../src/services/teamInvitationService.js";
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
        const [workspaceInvites, teamInvites] = await Promise.all([
          getMyInvitations(),
          getMyTeamInvites(),
        ]);
        setInvitations([
          ...workspaceInvites.map((invite) => ({
            ...invite,
            type: "workspace",
          })),
          ...teamInvites.map((invite) => ({
            ...invite,
            type: "team",
          })),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, []);

  async function handleAccept(invite) {
    try {
      if (invite.type === "team") {
        await acceptTeamInvite(invite._id);
      } else {
        await acceptInvitation(invite._id);
      }

      setInvitations((prev) => prev.filter((item) => item._id !== invite._id));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReject(invite) {
    try {
      if (invite.type === "team") {
        await rejectTeamInvite(invite._id);
      } else {
        await rejectInvitation(invite._id);
      }

      setInvitations((prev) => prev.filter((item) => item._id !== invite._id));
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
              <InvitationCard
                key={invite._id}
                type={invite.type}
                invite={invite}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
