import { useEffect, useState } from "react";

import {
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../src/services/invitationService.js";

export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <section className="min-h-screen w-full bg-red-200 p-8">
      <div>
        <h2 className="text-3xl font-semibold">Your invitations</h2>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p>Loading invitations...</p>
          ) : invitations.length === 0 ? (
            <p>No pending invitations.</p>
          ) : (
            invitations.map((invite) => (
              <div
                key={invite._id}
                className="bg-white rounded-md p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-medium">
                    {invite.workspaceId.name}
                  </h3>

                  <p>{invite.inviterId.name} invited you</p>

                  <p className="text-sm text-gray-500">
                    {invite.inviterId.email}
                  </p>

                  <p className="text-sm">Role: {invite.role}</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleReject(invite._id)}>
                    Reject
                  </button>

                  <button onClick={() => handleAccept(invite._id)}>
                    Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
