const QUEUE_KEY = 'attendance_offline_queue';

export function addToQueue(payload) {
    const queue = getQueue();
    queue.push({
        ...payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getQueue() {
    try {
        const data = localStorage.getItem(QUEUE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function removeFromQueue(id) {
    const queue = getQueue().filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
    localStorage.removeItem(QUEUE_KEY);
}

export async function processQueue(api) {
    const queue = getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const item of queue) {
        try {
            await api.post('/attendance/mark', {
                sessionId: item.sessionId,
                location: item.location
            });
            removeFromQueue(item.id);
            synced++;
        } catch (err) {
            // If it's a network error, stop trying
            if (!err.response) {
                failed++;
                break;
            }
            // If server returned an error (e.g., session expired), remove from queue
            removeFromQueue(item.id);
            failed++;
        }
    }

    return { synced, failed };
}
