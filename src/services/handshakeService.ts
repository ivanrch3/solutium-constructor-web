export interface HandshakePayload {
  satellite_id: string;
  supabase_url: string;
  supabase_anon_key: string;
  session_token: string;
  do_endpoint?: string;
  do_access_key?: string;
  do_secret_key?: string;
  do_bucket?: string;
}

export const listenForHandshake = (
  onHandshake: (payload: HandshakePayload) => void
) => {
  const handler = (event: MessageEvent) => {
    const data = event.data;
    if (
      data &&
      data.satellite_id &&
      data.supabase_url &&
      data.supabase_anon_key &&
      data.session_token
    ) {
      onHandshake(data as HandshakePayload);
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
};
