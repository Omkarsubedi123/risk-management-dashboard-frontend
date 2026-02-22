import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/RiskChat.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const RiskChat = ({ riskId, title = "Risk Discussion" }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // compose
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  // mentions
  const [participants, setParticipants] = useState([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState({ start: -1, end: -1 }); // where @query lives in text
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const getToken = () =>
    localStorage.getItem("access") || sessionStorage.getItem("access");

  const messagesUrl = `${backendUrl}/api/chat/risks/${riskId}/messages/`;
  const participantsUrl = `${backendUrl}/api/chat/risks/${riskId}/participants/`;
  const editUrl = (messageId) => `${backendUrl}/api/chat/messages/${messageId}/`;

  // current user (best-effort)
  const currentUserId = useMemo(() => {
    const raw = localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, []);

  const fetchMessages = async () => {
    try {
      const token = getToken();
      const res = await axios.get(messagesUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data || []);
    } catch (e) {
      console.error("Chat load failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to load chat.");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const token = getToken();
      const res = await axios.get(participantsUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(res.data || []);
    } catch (e) {
      // don’t block chat if participants endpoint fails
      console.warn("Participants load failed:", e?.response?.data || e);
    }
  };

  useEffect(() => {
    if (!riskId) return;
    setLoading(true);
    fetchMessages();
    fetchParticipants();
    // eslint-disable-next-line
  }, [riskId]);

  // polling (demo-safe)
  useEffect(() => {
    if (!riskId) return;
    const t = setInterval(() => fetchMessages(), 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [riskId]);

  // scroll to bottom on update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onPickFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
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

      const res = await axios.post(messagesUrl, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setBody("");
      setFiles([]);
      setMentionOpen(false);
      setMentionQuery("");
      setMentionPos({ start: -1, end: -1 });

      // optimistic append
      setMessages((prev) => [...prev, res.data]);
    } catch (e) {
      console.error("Send failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to send message.");
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

  // =========================
  // Mentions: detect @query
  // =========================
  const computeMentionState = (text, cursorPos) => {
    // find nearest '@' before cursor with no whitespace between @ and cursor
    const left = text.slice(0, cursorPos);
    const at = left.lastIndexOf("@");
    if (at === -1) return null;

    // must be start or preceded by space/newline
    const prevChar = at > 0 ? left[at - 1] : " ";
    const okBoundary = /\s/.test(prevChar);
    if (!okBoundary) return null;

    const afterAt = left.slice(at + 1);
    // stop if afterAt has whitespace -> not a live mention
    if (/\s/.test(afterAt)) return null;

    const query = afterAt; // may be empty
    return { query, start: at, end: cursorPos };
  };

  const filteredMentions = useMemo(() => {
    const q = (mentionQuery || "").toLowerCase();
    const list = participants || [];
    if (!mentionOpen) return [];
    if (!q) return list.slice(0, 8);

    return list
      .filter((p) => {
        const uname = (p.username || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const email = (p.email || "").toLowerCase();
        return uname.includes(q) || name.includes(q) || email.includes(q);
      })
      .slice(0, 8);
  }, [participants, mentionQuery, mentionOpen]);

  const insertMention = (username) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const text = body;
    const start = mentionPos.start;
    const end = mentionPos.end;

    if (start < 0 || end < 0) return;

    const before = text.slice(0, start);
    const after = text.slice(end);

    const insert = `@${username} `;
    const nextText = before + insert + after;

    setBody(nextText);
    setMentionOpen(false);
    setMentionQuery("");
    setMentionPos({ start: -1, end: -1 });
    setActiveMentionIndex(0);

    // set cursor after inserted mention
    requestAnimationFrame(() => {
      const pos = (before + insert).length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  const onBodyChange = (val) => {
    setBody(val);

    const ta = textareaRef.current;
    const cursorPos = ta ? ta.selectionStart : val.length;

    const m = computeMentionState(val, cursorPos);
    if (!m) {
      setMentionOpen(false);
      setMentionQuery("");
      setMentionPos({ start: -1, end: -1 });
      return;
    }

    setMentionOpen(true);
    setMentionQuery(m.query || "");
    setMentionPos({ start: m.start, end: m.end });
    setActiveMentionIndex(0);
  };

  const onTextareaKeyDown = (e) => {
    if (!mentionOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveMentionIndex((i) => Math.min(i + 1, filteredMentions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveMentionIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      // choose active suggestion only if mention dropdown open and has items
      if (filteredMentions.length > 0) {
        e.preventDefault();
        insertMention(filteredMentions[activeMentionIndex]?.username || "");
      }
    } else if (e.key === "Escape") {
      setMentionOpen(false);
    }
  };

  // close mention box when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      const ta = textareaRef.current;
      if (!ta) return;
      if (e.target === ta) return;
      // allow click on suggestion box itself
      if (e.target?.closest?.(".rc-mention")) return;
      setMentionOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // =========================
  // Edit message
  // =========================
  const startEdit = (m) => {
    setEditingId(m.id);
    setEditBody(m.body || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBody("");
  };

  const saveEdit = async (messageId) => {
    const text = (editBody || "").trim();
    // allow empty only if message has attachments (frontend can’t know easily),
    // so we just enforce non-empty here to avoid backend 400.
    if (!text) {
      toast.info("Edited message cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      const token = getToken();

      const res = await axios.patch(
        editUrl(messageId),
        { body: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data;
      setMessages((prev) => prev.map((x) => (x.id === messageId ? updated : x)));
      toast.success("Message updated.");
      cancelEdit();
    } catch (e) {
      console.error("Edit failed:", e?.response?.data || e);
      toast.error(e?.response?.data?.detail || "Failed to edit message.");
    } finally {
      setSavingEdit(false);
    }
  };

  const canEdit = (m) => {
    if (!m) return false;
    // best-effort: if you store user_id in storage OR backend returns sender id
    if (currentUserId && Number(m.sender) === Number(currentUserId)) return true;
    return false;
  };

  const renderTextWithMentions = (text = "") => {
    // highlight @something
    const parts = text.split(/(@[A-Za-z0-9_.-]+)/g);
    return parts.map((p, idx) => {
      if (p.startsWith("@") && p.length > 1) {
        return (
          <span key={idx} className="rc-mention-pill">
            {p}
          </span>
        );
      }
      return <span key={idx}>{p}</span>;
    });
  };

  return (
    <div className="rc-card">
      <div className="rc-head">
        <div>
          <div className="rc-title">{title}</div>
          <div className="rc-sub">Type @ to mention a team member. Attach images/files too.</div>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchMessages}>
          ↻ Refresh
        </button>
      </div>

      <div className="rc-body">
        {loading ? (
          <div className="text-muted">Loading chat…</div>
        ) : messages.length === 0 ? (
          <div className="rc-empty">No messages yet. Start the discussion.</div>
        ) : (
          messages.map((m) => {
            const editedFlag = m.is_edited || !!m.edited_at;
            const isEditing = editingId === m.id;

            return (
              <div key={m.id} className="rc-msg">
                <div className="rc-msg-top">
                  <div className="rc-sender">
                    {m.sender_name || "User"}
                    {m.sender_username ? (
                      <span className="rc-username"> @{m.sender_username}</span>
                    ) : null}
                  </div>

                  <div className="rc-time">
                    {fmt(m.created_at)}
                    {editedFlag ? <span className="rc-edited"> · edited</span> : null}
                  </div>
                </div>

                {/* BODY */}
                {!isEditing ? (
                  m.body ? <div className="rc-text">{renderTextWithMentions(m.body)}</div> : null
                ) : (
                  <div className="rc-edit">
                    <textarea
                      className="form-control rc-textarea"
                      rows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      disabled={savingEdit}
                    />
                    <div className="rc-edit-actions">
                      <button className="btn btn-light" onClick={cancelEdit} disabled={savingEdit}>
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
                )}

                {/* attachments */}
                {m.attachments?.length ? (
                  <div className="rc-files">
                    {m.attachments.map((a) => (
                      <a
                        key={a.id}
                        className="rc-file"
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📎 View Attachment
                      </a>
                    ))}
                  </div>
                ) : null}

                {/* edit button */}
                {!isEditing && canEdit(m) ? (
                  <div className="rc-actions">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(m)}>
                      ✏️ Edit
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* COMPOSE */}
      <div className="rc-compose">
        <div className="rc-compose-wrap">
          <textarea
            ref={textareaRef}
            className="form-control rc-textarea"
            rows={3}
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            onKeyDown={onTextareaKeyDown}
            placeholder="Write a message… (type @ to mention)"
            disabled={sending}
          />

          {/* mention dropdown */}
          {mentionOpen ? (
            <div className="rc-mention">
              {filteredMentions.length === 0 ? (
                <div className="rc-mention-empty">No matching users</div>
              ) : (
                filteredMentions.map((p, idx) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`rc-mention-item ${idx === activeMentionIndex ? "active" : ""}`}
                    onClick={() => insertMention(p.username)}
                  >
                    <div className="rc-mention-name">{p.name || p.username}</div>
                    <div className="rc-mention-meta">
                      @{p.username} {p.email ? `· ${p.email}` : ""}
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="rc-row">
          <div className="rc-left">
            <input
              className="form-control"
              type="file"
              accept="image/*"
              multiple
              onChange={onPickFiles}
              disabled={sending}
            />

            {files.length > 0 ? (
              <div className="rc-picked">
                {files.map((f, idx) => (
                  <span
                    key={idx}
                    className="rc-chip"
                    onClick={() => removeFile(idx)}
                    title="Remove"
                  >
                    {f.name} ✕
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <button className="btn btn-primary rc-send" onClick={send} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskChat;