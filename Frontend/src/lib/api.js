const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api').replace(/\/$/, '');

export async function api(path, options = {}) {
    const controller = new AbortController();
    const { timeoutMs = 15000, ...fetchOptions } = options;
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${base}${path}`, {
            ...fetchOptions, credentials: 'include', cache: 'no-store', signal: controller.signal,
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'MediBook', ...options.headers },
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.message || `Request failed (${response.status}).`);
            error.status = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.');
        if (error instanceof TypeError) throw new Error('Cannot connect to the server. Check that the backend is running.');
        throw error;
    } finally { clearTimeout(timer); }
}
