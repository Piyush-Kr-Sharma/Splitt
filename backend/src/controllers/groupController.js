import Group from "../models/Group.js";

export const createGroup = async (req, res) => {
  const { name, description, members } = req.body;
  const userId = req.user.id;

  const uniqueMembers = [...new Set([...members, userId])];

  const group = await Group.create({
    name,
    description,
    createdBy: userId,
    members: uniqueMembers.map((id) => ({
      userId: id,
      role: id === userId ? "admin" : "member",
      joinedAt: Date.now(),
    })),
  });

  res.json(group);
};

export const getUserGroups = async (req, res) => {
  const groups = await Group.find({ "members.userId": req.user.id });
  res.json(groups);
};
