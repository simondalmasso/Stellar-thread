PRAGMA foreign_keys = ON;
ALTER TABLE messages ADD COLUMN proposal_id TEXT REFERENCES transmission_proposals(id);
ALTER TABLE messages ADD COLUMN transmission_id TEXT REFERENCES transmission_proofs(id);
CREATE INDEX IF NOT EXISTS idx_messages_target_updated ON messages(target_id,updated_at_utc DESC);
CREATE INDEX IF NOT EXISTS idx_messages_proposal ON messages(proposal_id);
CREATE INDEX IF NOT EXISTS idx_messages_transmission ON messages(transmission_id);
CREATE INDEX IF NOT EXISTS idx_proposals_message ON transmission_proposals(message_id,created_at_utc DESC);
CREATE TABLE IF NOT EXISTS write_rate_limits (
  bucket TEXT PRIMARY KEY,
  window_start_utc TEXT NOT NULL,
  count INTEGER NOT NULL CHECK(count >= 0)
);
CREATE TRIGGER IF NOT EXISTS candidate_reviews_candidate_fk
BEFORE INSERT ON candidate_reviews
FOR EACH ROW
WHEN NOT EXISTS (SELECT 1 FROM candidates WHERE id = NEW.candidate_id)
BEGIN
  SELECT RAISE(ABORT, 'candidate does not exist');
END;
INSERT OR IGNORE INTO candidates(id,observation_id,state,candidate_json,created_at_utc)
VALUES('voyager-human-control',NULL,'CONFIRMED_TECHNOLOGICAL','{"truthClass":"RECORDED_AUTHENTIC","classification":"HUMAN_TECHNOLOGICAL_CONTROL","extraterrestrial":false}','2016-09-19T18:46:13.000Z');
