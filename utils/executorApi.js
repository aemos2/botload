const API_BASE = "https://whatexpsare.online/api/status/exploits";

async function fetchAllExploits() {
    const res = await fetch(API_BASE, {
        headers: {
            Accept: "application/json",
            "User-Agent": "Octobot/1.0"
        }
    });

    if (!res.ok) {
        throw new Error(`Request failed with code ${res.status}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
        throw new Error("Unexpected response format");
    }

    return data;
}

function pickBestMatch(matches) {
    if (!matches.length) return null;
    if (matches.length === 1) return matches[0];

    // Prefer updated, then higher version string (localeCompare numeric)
    return matches.slice().sort((a, b) => {
        if (a.updateStatus !== b.updateStatus) {
            return a.updateStatus ? -1 : 1;
        }
        return String(b.version || "").localeCompare(
            String(a.version || ""),
            undefined,
            { numeric: true, sensitivity: "base" }
        );
    })[0];
}

async function fetchExecutorByName(name) {
    if (!name || typeof name !== "string") return null;

    const query = name.trim();
    if (!query) return null;

    try {
        const direct = await fetch(`${API_BASE}/${encodeURIComponent(query)}`, {
            headers: {
                Accept: "application/json",
                "User-Agent": "Octobot/1.0"
            }
        });

        if (direct.ok) {
            const data = await direct.json();
            if (data && data.title && !data.error) {
                return data;
            }
        }
    } catch {
        // fall through
    }

    const list = await fetchAllExploits();
    const lower = query.toLowerCase();

    const exact = list.filter(
        e => e.title && e.title.toLowerCase() === lower
    );
    if (exact.length) return pickBestMatch(exact);

    const partial = list.filter(
        e => e.title && e.title.toLowerCase().startsWith(lower)
    );
    return pickBestMatch(partial);
}

module.exports = {
    fetchAllExploits,
    fetchExecutorByName
};
