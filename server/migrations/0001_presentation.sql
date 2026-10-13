CREATE TABLE contacts (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, name TEXT NOT NULL, contact TEXT NOT NULL, topic TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new');
CREATE TABLE feedback (id TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, display_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), text TEXT NOT NULL, created_at TEXT NOT NULL, consent_website INTEGER NOT NULL DEFAULT 0, consent_marketing INTEGER NOT NULL DEFAULT 0, consent_version TEXT NOT NULL, consent_text TEXT NOT NULL, consent_at TEXT NOT NULL, revoked_at TEXT, revoke_hash TEXT NOT NULL UNIQUE, verified INTEGER NOT NULL DEFAULT 0, verification_note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'new', featured INTEGER NOT NULL DEFAULT 0, moderation_reason TEXT NOT NULL DEFAULT '');
CREATE INDEX feedback_public ON feedback(status, consent_website, created_at);
CREATE TABLE invitations (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, email TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, used_by TEXT UNIQUE);
CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE faq (id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE audit_log (id TEXT PRIMARY KEY, action TEXT NOT NULL, record_id TEXT, created_at TEXT NOT NULL);
