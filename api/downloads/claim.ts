import { sql } from '../_lib/neon';
import { readSession } from '../_lib/session';

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const user = await readSession(request);
  if (!user) return response.status(401).json({ error: 'Authentication required' });

  try {
    const rows = await sql.query(
      `insert into app_records (collection, data)
       values ('user_download_limits', jsonb_build_object('email', lower($1), 'download_limit', -1, 'download_count', 1))
       on conflict (collection, lower(data->>'email')) where collection = 'user_download_limits'
       do update set
         data = app_records.data || jsonb_build_object(
           'download_count', coalesce(nullif(app_records.data->>'download_count', '')::integer, 0) + 1
         ),
         updated_at = now()
       where coalesce(nullif(app_records.data->>'download_limit', '')::integer, -1) = -1
          or coalesce(nullif(app_records.data->>'download_count', '')::integer, 0)
             < coalesce(nullif(app_records.data->>'download_limit', '')::integer, -1)
       returning data`,
      [user.email],
    );
    if (rows.length) {
      const data = rows[0].data;
      return response.status(200).json({
        allowed: true,
        downloadCount: Number(data.download_count ?? 0),
        downloadLimit: Number(data.download_limit ?? -1),
      });
    }

    const limits = await sql.query(
      `select data from app_records
       where collection = 'user_download_limits' and lower(data->>'email') = lower($1) limit 1`,
      [user.email],
    );
    const data = limits[0]?.data ?? {};
    return response.status(200).json({
      allowed: false,
      downloadCount: Number(data.download_count ?? 0),
      downloadLimit: Number(data.download_limit ?? 0),
    });
  } catch (error) {
    console.error('Unable to claim download:', error);
    return response.status(500).json({ error: 'Unable to verify the download limit' });
  }
}
