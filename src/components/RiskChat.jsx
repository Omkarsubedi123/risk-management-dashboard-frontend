import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/RiskChat.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const RiskChat = ({ riskId, title = "Risk Discussion" }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  // EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const bottomRef = useRef(null);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  // Extract user id from JWT
  const getCurrentUserId = () => {
    const token = getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id ?? payload.id ?? null;
    } catch {
      return null;
    }
  };

  const myUserId = useMemo(() => getCurrentUserId(), []);

  const listUrl = `${backendUrl}/api/chat/risks/${riskId}/messages/`;
  const editUrl = (id) => `${backendUrl}/api/chat/messages/${id}/`;

  const fetchMessages = async () => {
    try {
      const token = getToken();
      const res = await axios.get(listUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to load chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [riskId]);

  useEffect(() => {
    const t = setInterval(fetchMessages, 5000);
    return () => clearInterval(t);
  }, [riskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isMine = (m) => {
    if (!myUserId) return false;
    return Number(m.sender) === Number(myUserId);
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setEditText(m.body || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (messageId) => {
    const trimmed = (editText || "").trim();
    if (!trimmed) {
      toast.info("Message cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      const token = getToken();

      const res = await axios.patch(
        editUrl(messageId),
        { body: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? res.data : m))
      );

      toast.success("Message updated.");
      cancelEdit();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Edit failed.");
    } finally {
      setSavingEdit(false);
    }
  };

  const send = async () => {
    const text = (body || "").trim();
    if (!text && files.length === 0) {
      toast.info("Write a message or attach an image.");
      return;
    }

    try {
      setSending(true);
      const token = getToken();

      const fd = new FormData();
      fd.append("body", text);
      files.forEach((f) => fd.append("files", f));

      const res = await axios.post(listUrl, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setBody("");
      setFiles([]);
      setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Send failed.");
    } finally {
      setSending(false);
    }
  };

  const fmt = (val) => {
    try {
      return new Date(val).toLocaleString();
    } catch {
      return val;
    }
  };

  return (
    <div className="rc-card">
      <div className="rc-head">
        <div>
          <div className="rc-title">{title}</div>
          <div className="rc-sub">Type @ to mention someone.</div>
        </div>
      </div>

      <div className="rc-body">
        {loading ? (
          <div>Loading chat…</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rc-msg">
              <div className="rc-msg-top">
                <div className="rc-sender">
                  {m.sender_name}
                  {m.edited_at && (
                    <span className="rc-edited">(edited)</span>
                  )}
                </div>

                <div className="rc-right">
                  <div className="rc-time">{fmt(m.created_at)}</div>

                  {isMine(m) && (
                    <button
                      className="btn btn-sm btn-outline-primary rc-editbtn"
                      onClick={() => startEdit(m)}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>

              {editingId === m.id ? (
                <div className="rc-editbox">
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={savingEdit}
                  />
                  <div className="rc-edit-actions">
                    <button
                      className="btn btn-light"
                      onClick={cancelEdit}
                      disabled={savingEdit}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => saveEdit(m.id)}
                      disabled={savingEdit}
                    >
                      {savingEdit ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rc-text">{m.body}</div>

                  {m.attachments?.length > 0 && (
                    <div className="rc-files">
                      {m.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rc-file"
                        >
                          📎 View Attachment
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="rc-compose">
        <textarea
          className="form-control"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
        />

        <div className="rc-row">
          <button
            className="btn btn-primary"
            onClick={send}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskChat;