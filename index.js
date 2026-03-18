const express = require('express');
const app = express();
app.use(express.json());

// Paste your API key here (the long JWT from create.roblox.com/credentials)
const API_KEY = '5JU1fLFRE0+Sf5s+qrHi+4ITwZZTxdcp5agH+9k7QrPDnir/ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWpWS1ZURm1URVpTUlRBclUyWTFjeXR4Y2tocEt6UkpWSGRhV2xSNFpHTndOV0ZuU0NzNWF6ZFJjbEJFYm1seUx5SXNJbTkzYm1WeVNXUWlPaUl4TURZM056YzVOakF3TVNJc0ltVjRjQ0k2TVRjM016ZzNNakE1T1N3aWFXRjBJam94Tnpjek9EWTRORGs1TENKdVltWWlPakUzTnpNNE5qZzBPVGw5Llp4azZJLW44a3A5ZXhtTHFhS1BpSFBLVWotd1VlUlJYbk5hUThIM1BXT0c2dThLUzVTdlFXdlBvZHRFa3dwTTRES0FSSkNiTk0zMTJ1X0JzZ2N2VFpZM2U5bURqR1ZTTHUwY1lSYXZHQUt1bXEwbVJySnRTTk9UdWRlQ21sTjk4SjN0VmR6MGJxVTZTb0xjR05VcUxDQ3pIX2ZnSWdIM3lvUGVwLV9PRE9pWEZGVUo2Y3R3NWxacDZIVzBnc0lSY0JJdXAyLWNRSWpsTEZ2OW12LXhNUnVRMGxVc29Cel96c2IwVzd0V3ZldXNnOHB2NXg5eFg1dVZuYlA2dVktY3g4TGFKNGR0bFhDOUMtTUVRVVlnYWlrdEtURU1GcWtPY2FuZGJEbGNPbjBTVnREc0xQcUc5UmwxMWxsOFUyUFpNLU1RMzNyc3NQLUxMU3lTRHkxLWwxZw==';
const BASE = 'https://apis.roblox.com/cloud/v2';

app.post('/rank', async (req, res) => {
  const { userId, rankId, groupId } = req.body;
  console.log('Received:', userId, rankId, groupId);
  if (!userId || !rankId || !groupId) return res.status(400).json({ error: 'Missing fields' });

  // JWT tokens use Bearer auth, regular API keys use x-api-key
  const isJWT = API_KEY.includes('.');
  const headers = isJWT
    ? { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }
    : { 'x-api-key': API_KEY, 'Content-Type': 'application/json' };

  try {
    // 1. Get roles
    const rolesRes = await fetch(`${BASE}/groups/${groupId}/roles?maxPageSize=50`, { headers });
    const rolesData = await rolesRes.json();
    console.log('Roles response status:', rolesRes.status);
    if (!rolesData.groupRoles) {
      console.log('Roles error:', JSON.stringify(rolesData));
      return res.status(500).json({ error: 'Failed to get roles', detail: rolesData });
    }

    const role = rolesData.groupRoles.find(r => Number(r.rank) === Number(rankId));
    if (!role) return res.status(404).json({ error: 'Role not found: ' + rankId });
    console.log('Found role:', role.displayName);

    // 2. Get membership
    const memberRes = await fetch(
      `${BASE}/groups/${groupId}/memberships?filter=user=="users/${userId}"&maxPageSize=1`,
      { headers }
    );
    const memberData = await memberRes.json();
    console.log('Member response status:', memberRes.status);
    if (!memberData.groupMemberships?.length) {
      console.log('Member error:', JSON.stringify(memberData));
      return res.status(404).json({ error: 'User not in group', detail: memberData });
    }

    const memberPath = memberData.groupMemberships[0].path;

    // 3. PATCH rank
    const patchRes = await fetch(`${BASE}/${memberPath}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: role.path })
    });
    const result = await patchRes.json();
    console.log('Patch status:', patchRes.status, JSON.stringify(result));

    if (patchRes.ok) {
      console.log('SUCCESS: Ranked', userId, '->', role.displayName);
      res.json({ success: true, role: role.displayName });
    } else {
      res.status(500).json({ error: 'Patch failed', detail: result });
    }

  } catch (e) {
    console.error('ERROR:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Ranking server running on port', PORT));
