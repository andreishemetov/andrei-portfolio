import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  // Первичная проверка Notion webhook
  if (body.verification_token) {
    console.log(
      'Notion verification token:',
      body.verification_token
    );

    return new Response(
      JSON.stringify({
        ok: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const deployHook = import.meta.env.VERCEL_DEPLOY_HOOK;

  if (!deployHook) {
    console.error('VERCEL_DEPLOY_HOOK is missing');

    return new Response(
      JSON.stringify({
        error: 'Deploy hook is not configured',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  console.log('Notion event:', {
    type: body.type,
    entity: body.entity,
  });

  // Пока реагируем на любые события из нашей Notion connection.
  const deployResponse = await fetch(deployHook, {
    method: 'POST',
  });

  if (!deployResponse.ok) {
    console.error(
      'Vercel deploy hook failed:',
      deployResponse.status
    );

    return new Response(
      JSON.stringify({
        error: 'Deploy trigger failed',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};