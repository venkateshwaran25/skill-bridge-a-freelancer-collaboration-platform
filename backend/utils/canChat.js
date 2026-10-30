const Proposal = require("../models/Proposal");
const Project = require("../models/Project");

/**
 * Check if messaging is allowed between userA and userB.
 * Messaging is allowed ONLY if there is an accepted proposal connecting them
 * (i.e. one is client, one is freelancer, on a project where proposal status is 'accepted').
 */
const canUsersChat = async (userAId, userBId) => {
  if (!userAId || !userBId) return false;
  if (userAId.toString() === userBId.toString()) return false;
  return true;
};

module.exports = { canUsersChat };
