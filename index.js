const express = require('express');
const app = express();
app.use(express.json());

const API_KEY = '5JU1fLFRE0+Sf5s+qrHi+4ITwZZTxdcp5agH+9k7QrPDnir/ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWpWS1ZURm1URVpTUlRBclUyWTFjeXR4Y2tocEt6UkpWSGRhV2xSNFpHTndOV0ZuU0NzNWF6ZFJjbEJFYm1seUx5SXNJbTkzYm1WeVNXUWlPaUl4TURZM056YzVOakF3TVNJc0ltVjRjQ0k2TVRjM016ZzNNakE1T1N3aWFXRjBJam94Tnpjek9EWTRORGs1TENKdVltWWlPakUzTnpNNE5qZzBPVGw5Llp4azZJLW44a3A5ZXhtTHFhS1BpSFBLVWotd1VlUlJYbk5hUThIM1BXT0c2dThLUzVTdlFXdlBvZHRFa3dwTTRES0FSSkNiTk0zMTJ1X0JzZ2N2VFpZM2U5bURqR1ZTTHUwY1lSYXZHQUt1bXEwbVJySnRTTk9UdWRlQ21sTjk4SjN0VmR6MGJxVTZTb0xjR05VcUxDQ3pIX2ZnSWdIM3lvUGVwLV9PRE9pWEZGVUo2Y3R3NWxacDZIVzBnc0lSY0JJdXAyLWNRSWpsTEZ2OW12LXhNUnVRMGxVc29Cel96c2IwVzd0V3ZldXNnOHB2NXg5eFg1dVZuYlA2dVktY3g4TGFKNGR0bFhDOUMtTUVRVVlnYWlrdEtURU1GcWtPY2FuZGJEbGNPbjBTVnREc0xQcUc5UmwxMWxsOFUyUFpNLU1RMzNyc3NQLUxMU3lTRHkxLWwxZw==';
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
