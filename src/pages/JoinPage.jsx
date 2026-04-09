import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext.jsx";
import { resolveInvite, deleteInvite } from "../firebase/inviteService";
import { addStudentToGroup } from "../firebase/groupService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * /join?code=<inviteCode>
 *
 * Resolves an invite code, links the signed-in student to the group,
 * and redirects to "/". If the user is not signed in they are redirected
 * to "/login" (or whichever auth route your app uses) with the original
 * URL preserved so they can return after authenticating.
 */
export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | joining | success | error
  const [message, setMessage] = useState("");

  const code = searchParams.get("code") || "";

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Preserve destination so auth flow can redirect back
      navigate(`/login?redirect=/join?code=${code}`, { replace: true });
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No invite code provided. Check your link and try again.");
      return;
    }

    async function join() {
      setStatus("joining");
      try {
        const invite = await resolveInvite(code);

        if (!invite) {
          setStatus("error");
          setMessage("This invite link is invalid or has already been used.");
          return;
        }

        // Link student to group
        await addStudentToGroup(user.uid, invite.groupId);

        // Set schoolId on the user profile if not already set
        await updateDoc(doc(db, "users", user.uid), {
          schoolId: invite.schoolId,
        });

        // Consume the invite (optional: remove to allow reuse)
        await deleteInvite(code);

        setStatus("success");
        setMessage("You have joined the group! Redirecting…");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } catch (err) {
        console.error("JoinPage error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try the link again or contact your teacher.");
      }
    }

    join();
  }, [user, loading, code, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Joining group…</h1>

        {status === "loading" && <p style={styles.muted}>Checking your session…</p>}

        {status === "joining" && (
          <p style={styles.muted}>Verifying invite code <strong>{code}</strong>…</p>
        )}

        {status === "success" && (
          <p style={{ ...styles.muted, color: "#6af7c4" }}>{message}</p>
        )}

        {status === "error" && (
          <>
            <p style={{ ...styles.muted, color: "#f76a6a" }}>{message}</p>
            <button style={styles.btn} onClick={() => navigate("/")}>
              Go to home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0f",
    fontFamily: "'DM Mono', monospace",
  },
  card: {
    background: "#111118",
    border: "1px solid #2a2a38",
    borderRadius: 16,
    padding: "40px 32px",
    maxWidth: 380,
    width: "100%",
    textAlign: "center",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 22,
    color: "#e8e8f0",
    marginBottom: 12,
  },
  muted: {
    color: "#6b6b80",
    fontSize: 14,
    lineHeight: 1.6,
  },
  btn: {
    marginTop: 20,
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: "#7c6af7",
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
