const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = 'PASTE_YOUR_OPEN_CLOUD_KEY_HERE';
const BASE = 'https://apis.roblox.com/cloud/v2';

app.post('/rank', async (req, res) => {
  const { userId, rankId, groupId } = req.body;
  console.log('Received:', userId, rankId, groupId);
  if (!userId || !rankId || !groupId) return res.status(400).json({ error: 'Missing fields' });

  const headers = { 'x-api-key': API_KEY, 'Content-Type': 'application/json' };

  try {
    const rolesRes = await fetch(`${BASE}/groups/${groupId}/roles?maxPageSize=50`, { headers });
    const rolesData = await rolesRes.json();
    const role = rolesData.groupRoles.find(r => Number(r.rank) === Number(rankId));
    if (!role) return res.status(404).json({ error: 'Role not found: ' + rankId });

    const memberRes = await fetch(`${BASE}/groups/${groupId}/memberships?filter=user=="users/${userId}"&maxPageSize=1`, { headers });
    const memberData = await memberRes.json();
    if (!memberData.groupMemberships?.length) return res.status(404).json({ error: 'User not in group' });

    const memberPath = memberData.groupMemberships[0].path;
    const patchRes = await fetch(`${BASE}/${memberPath}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: role.path })
    });

    const result = await patchRes.json();
    console.log('SUCCESS: Ranked', userId, '->', role.displayName);
    res.json({ success: true, role: role.displayName });
  } catch (e) {
    console.error('ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Ranking server running'));
