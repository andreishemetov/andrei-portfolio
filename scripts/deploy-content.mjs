const deployHook = process.env.VERCEL_DEPLOY_HOOK;

if (!deployHook) {
  console.error('VERCEL_DEPLOY_HOOK is missing');
  process.exit(1);
}

const response = await fetch(deployHook, {
  method: 'POST',
});

if (!response.ok) {
  console.error(`Deploy failed: ${response.status}`);
  process.exit(1);
}

console.log('Vercel deploy triggered successfully.');