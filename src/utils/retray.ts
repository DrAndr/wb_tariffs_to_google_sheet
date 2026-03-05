export interface RetryOptions {
    retries?: number;
    delayMs?: number; // from [first delay time]
    maxDelayMs?: number; // to [max delay time]
    factor?: number;
}

export async function retry<T>(
    callback: () => Promise<T>,
    {
        retries = 5,
        delayMs = 1000,
        maxDelayMs = 10_000,
        factor = 1.5,
    }: RetryOptions,
): Promise<T> {
    let attempt = 0;

    while (true) {
        try {
            return await callback();
        } catch (error: any) {
            attempt++;

            if (attempt > retries) {
                throw error; // have no more attempts
            }

            // define delay time
            const expDelay = Math.min(
                delayMs * Math.pow(factor, attempt - 1),
                maxDelayMs,
            );
            const randomizer = expDelay * (0.2 + Math.random());
            const delay = Math.min(randomizer, maxDelayMs);

            // pause
            console.warn(
                `[Retry] attempt ${attempt}/${retries}, waiting ${Math.round(delay)}ms || Error: ${error.response.status} - ${error.response.data}`,
            );
            await new Promise((res) => setTimeout(res, delay));
        }
    }
}
