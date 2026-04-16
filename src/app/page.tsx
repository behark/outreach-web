"use client";

import { useState, useEffect } from "react";
import { buildMessage } from "@/lib/templates";

export default function OutreachDesk() {
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("initial");
  const [language, setLanguage] = useState("sq");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("score");
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const selectedLead = leads.find(l => l.lead_key === selectedKey);
  const currentMessage = selectedLead ? buildMessage(selectedLead, stage, language) : "";

  async function loadLeads() {
    setLoading(true);
    const params = new URLSearchParams({ search, status: statusFilter, sort });
    try {
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setSummary(data.summary || {});
      if (data.leads?.length && !selectedKey) {
        setSelectedKey(data.leads[0].lead_key);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, [search, statusFilter, sort]);

  useEffect(() => {
    if (selectedLead) {
      setNote(selectedLead.last_note || "");
    }
  }, [selectedKey]);

  async function updateStatus(key: string, status: string, customNote?: string) {
    try {
      await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_key: key,
          status,
          note: customNote || note,
          template: stage,
          language
        })
      });
    } catch (e) {
      console.error("Error updating status for", key, e);
    }
  }

  async function handleAutoSend(key: string) {
    setSending(true);
    try {
      await updateStatus(key, "queued_for_sending");
      if (key === selectedKey) loadLeads();
    } catch (e) {
      alert("Error queueing message");
    } finally {
      setSending(false);
    }
  }

  async function handleBulkQueue() {
    if (checkedKeys.size === 0) return;
    setSending(true);
    const keys = Array.from(checkedKeys);
    for (const key of keys) {
      await updateStatus(key, "queued_for_sending", "Bulk queued via dashboard");
    }
    setCheckedKeys(new Set());
    loadLeads();
    setSending(false);
    alert(`Queued ${keys.length} leads for sending!`);
  }

  function toggleCheck(key: string) {
    const next = new Set(checkedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCheckedKeys(next);
  }

  function toggleAll() {
    if (checkedKeys.size === leads.length) {
      setCheckedKeys(new Set());
    } else {
      setCheckedKeys(new Set(leads.map(l => l.lead_key)));
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Message copied to clipboard!");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Outreach Desk</h1>
        <div className="sub">Cloud-synced lead manager / {summary.total || 0} leads</div>

        <div className="panel">
          <label>Search</label>
          <input 
            placeholder="Name, city, category" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />

          <div className="row">
            <div>
              <label>Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)}>
                <option value="initial">Initial</option>
                <option value="no_website">No Website</option>
                <option value="outdated_website">Outdated</option>
                <option value="booking">Booking</option>
                <option value="followup_1">Follow-up 1</option>
                <option value="followup_2">Follow-up 2</option>
                <option value="reply_positive">Reply Positive</option>
              </select>
            </div>
            <div>
              <label>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="sq">Albanian</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div>
              <label>Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="prepared">Prepared</option>
                <option value="sent_by_user">Sent</option>
                <option value="replied">Replied</option>
                <option value="queued_for_sending">Queued</option>
                <option value="closed_won">Won</option>
                <option value="closed_lost">Lost</option>
              </select>
            </div>
            <div>
              <label>Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="score">Score</option>
                <option value="reviews">Reviews</option>
                <option value="rating">Rating</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
          
          <button className="primary" onClick={loadLeads} style={{width: '100%', marginTop: '8px'}}>Refresh Data</button>
        </div>

        <div className="summary">
          <div className="panel"><div className="muted">Visible</div><h3>{summary.visible || 0}</h3></div>
          <div className="panel"><div className="muted">Won</div><h3>{summary.closed_won || 0}</h3></div>
          <div className="panel"><div className="muted">Queue</div><h3>{leads.filter(l => l.last_status === "queued_for_sending").length}</h3></div>
        </div>

        {leads.length > 0 && (
          <div className="actions" style={{marginBottom: '12px', justifyContent: 'space-between'}}>
            <button onClick={toggleAll}>{checkedKeys.size === leads.length ? 'Deselect All' : 'Select All'}</button>
            <button 
              className="secondary" 
              onClick={handleBulkQueue} 
              disabled={sending || checkedKeys.size === 0}
            >
              Queue {checkedKeys.size} Selected
            </button>
          </div>
        )}

        <div className="lead-list">
          {loading ? <div className="muted">Loading...</div> : leads.map(lead => (
            <div 
              key={lead.lead_key} 
              className={`lead ${selectedKey === lead.lead_key ? 'active' : ''}`}
            >
              <div className="lead-top">
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <input 
                    type="checkbox" 
                    checked={checkedKeys.has(lead.lead_key)}
                    onChange={() => toggleCheck(lead.lead_key)}
                    style={{width: 'auto', marginBottom: 0}}
                  />
                  <strong onClick={() => setSelectedKey(lead.lead_key)} style={{cursor: 'pointer'}}>{lead.name}</strong>
                </div>
                <span className="badge">S {lead.score}</span>
              </div>
              <div className="muted" onClick={() => setSelectedKey(lead.lead_key)} style={{cursor: 'pointer'}}>{lead.category} · {lead.city}</div>
              <div onClick={() => setSelectedKey(lead.lead_key)} style={{cursor: 'pointer'}}>
                <span className="badge">{lead.last_status || 'new'}</span>
                {lead.rating && <span className="badge">{lead.rating}★</span>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        {!selectedKey ? (
          <div className="empty">Select a lead to see details and outreach options.</div>
        ) : (
          <div className="detail-grid">
            <section>
              <div className="panel">
                <h2>{selectedLead?.name}</h2>
                <div className="muted">{selectedLead?.category} · {selectedLead?.city} · {selectedLead?.phone}</div>
                <div>
                  <span className="badge">Current Stage: {stage}</span>
                  <span className="badge">Status: {selectedLead?.last_status || 'none'}</span>
                </div>
              </div>

              <div className="panel">
                <h3>Draft Message</h3>
                <textarea 
                  value={currentMessage} 
                  readOnly 
                />
                <div className="actions">
                  <button onClick={() => copyToClipboard(currentMessage)}>Copy Draft</button>
                  <button className="whatsapp" onClick={() => handleAutoSend(selectedKey)} disabled={sending}>
                    {sending ? "Queuing..." : "Auto Send (Queue)"}
                  </button>
                </div>
              </div>
            </section>

            <aside>
              <div className="panel">
                <h3>Lead Status</h3>
                <div className="status-row">
                  <button onClick={() => updateStatus(selectedKey, "prepared")}>Prepared</button>
                  <button onClick={() => updateStatus(selectedKey, "sent_by_user")}>Sent</button>
                  <button onClick={() => updateStatus(selectedKey, "replied")}>Replied</button>
                  <button onClick={() => updateStatus(selectedKey, "closed_won")} className="primary">Won</button>
                  <button onClick={() => updateStatus(selectedKey, "closed_lost")} className="danger">Lost</button>
                </div>
                
                <label style={{marginTop: '16px'}}>Note</label>
                <textarea 
                  style={{minHeight: '100px'}} 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Notes about this lead..."
                />
                <button onClick={() => updateStatus(selectedKey, selectedLead?.last_status || "prepared")} style={{width: '100%'}}>Save Note</button>
              </div>

              <div className="panel">
                <h3>Contact Targets</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {selectedLead?.phone && (
                    <a className="inline-link" href={`https://wa.me/${selectedLead.phone}`} target="_blank">WhatsApp Direct</a>
                  )}
                  {selectedLead?.website && (
                    <a className="inline-link" href={selectedLead.website} target="_blank">Website</a>
                  )}
                  {selectedLead?.demo_url && (
                    <a className="inline-link" href={selectedLead.demo_url} target="_blank">View Demo</a>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
