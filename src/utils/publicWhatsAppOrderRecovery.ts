export type PublicOrderRecoveryResult<T> =
  | { kind: 'response'; response: T; retried: boolean }
  | { kind: 'ambiguous_network_failure'; retried: true };

const hasResponse = (error: unknown) => (
  typeof error === 'object'
  && error !== null
  && ('response' in error || 'status' in error)
);

// The public order service resolves every HTTP response. Rejections here therefore
// represent a transport failure where the server may still have handled the POST.
export const isResponseLessNetworkFailure = (error: unknown) => !hasResponse(error);

export const submitWithSingleNetworkRetry = async <T>(
  request: () => Promise<T>,
  onVerifying: () => void
): Promise<PublicOrderRecoveryResult<T>> => {
  try {
    return { kind: 'response', response: await request(), retried: false };
  } catch (error) {
    if (!isResponseLessNetworkFailure(error)) throw error;
  }

  onVerifying();

  try {
    return { kind: 'response', response: await request(), retried: true };
  } catch (error) {
    if (!isResponseLessNetworkFailure(error)) throw error;
    return { kind: 'ambiguous_network_failure', retried: true };
  }
};
