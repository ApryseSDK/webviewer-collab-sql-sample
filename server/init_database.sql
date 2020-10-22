CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL PRIMARY KEY,
  userName TEXT,
  email TEXT,
  password TEXT,
  status TEXT,
  type TEXT,
  customData TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER
);
CREATE TABLE IF NOT EXISTS documents (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  authorId TEXT NOT NULL,
  isPublic INTEGER NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER,
  FOREIGN KEY (authorId) REFERENCES users (id)
);
CREATE TABLE IF NOT EXISTS annotations (
  id TEXT NOT NULL PRIMARY KEY,
  xfdf TEXT,
  authorId TEXT,
  documentId TEXT,
  pageNumber INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  inReplyTo TEXT,
  FOREIGN KEY (authorId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS annotationMembers (
  id TEXT NOT NULL PRIMARY KEY,
  userId TEXT,
  documentId TEXT NOT NULL,
  annotationId TEXT NOT NULL,
  lastRead INTEGER,
  permission TEXT,
  FOREIGN KEY (userId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
  FOREIGN KEY (annotationId) REFERENCES annotations (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS documentMembers (
  id TEXT NOT NULL PRIMARY KEY,
  userId TEXT,
  documentId TEXT NOT NULL,
  lastRead INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
  FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
);