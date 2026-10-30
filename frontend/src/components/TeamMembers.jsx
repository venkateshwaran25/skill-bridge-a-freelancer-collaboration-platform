import React, { useState } from 'react';
import { Users, UserPlus, Shield, Star, Mail, Plus, X } from 'lucide-react';
import API from '../services/api';

const TeamMembers = ({ workplaceId, workplace, client, freelancer, user }) => {
  const [showAddMember, setShowAddMember] = useState(false);

  const clientInfo = client || workplace?.client || null;
  const freelancerInfo = freelancer || workplace?.freelancer || null;

  const membersList = workplace?.members || [
    ...(clientInfo ? [{ user: clientInfo, role: "client" }] : []),
    ...(freelancerInfo ? [{ user: freelancerInfo, role: "freelancer" }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#635BFF]" />
            <span>Workspace Team Members</span>
          </h2>
          <p className="text-xs text-slate-500">Collaborators assigned to this digital workplace.</p>
        </div>

        <button
          onClick={() => setShowAddMember(true)}
          className="btn-saas-primary text-xs py-2 px-3"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {showAddMember && (
        <AddMemberModal
          workplaceId={workplaceId || workplace?._id}
          onClose={() => setShowAddMember(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Client Card */}
        <div className="saas-card p-5 space-y-3 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-100">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
              Client / Sponsor
            </span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
              {clientInfo.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{clientInfo.name}</h3>
              <p className="text-xs text-slate-500">{clientInfo.title || "Project Owner"}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{clientInfo.email || "client@skillbridge.ai"}</span>
          </div>
        </div>

        {/* Freelancer Card */}
        <div className="saas-card p-5 space-y-3 bg-gradient-to-br from-purple-50/50 to-blue-50/50 border-purple-100">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#635BFF] text-[10px] font-extrabold uppercase tracking-wider">
              Lead Specialist
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{freelancerInfo.rating || 4.9}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#635BFF] text-white font-extrabold text-base flex items-center justify-center shadow-xs shrink-0">
              {freelancerInfo.name?.[0]?.toUpperCase() || "F"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{freelancerInfo.name}</h3>
              <p className="text-xs text-slate-500">{freelancerInfo.title || "Freelance Specialist"}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{freelancerInfo.email || "freelancer@skillbridge.ai"}</span>
          </div>
        </div>

        {/* Additional Team Members */}
        {membersList.map((m, idx) => {
          if (m.user?._id === clientInfo._id || m.user?._id === freelancerInfo._id) return null;
          return (
            <div key={idx} className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                  {m.role || "Member"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {m.user?.name?.[0]?.toUpperCase() || "M"}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{m.user?.name || "Team Member"}</h3>
                  <p className="text-[11px] text-slate-500">{m.user?.email}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AddMemberModal = ({ workplaceId, onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("contributor");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/api/workplaces/${workplaceId}/members`, { email, role });
      setMsg("Member added to workspace!");
      setTimeout(onClose, 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Member invitation failed.");
      setTimeout(onClose, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="saas-card max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">Add Member to Workspace</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 border-none bg-transparent">
            <X className="w-5 h-5" />
          </button>
        </div>

        {msg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">User Email / ID *</label>
            <input
              type="text"
              placeholder="e.g. member@skillbridge.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control-custom w-full text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Workspace Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control-custom w-full text-xs"
            >
              <option value="contributor">Contributor</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-saas-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-saas-primary text-xs py-1.5 px-4">
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMembers;
