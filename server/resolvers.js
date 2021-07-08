const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const SQLResolverGenerator = require('@pdftron/collab-sql-resolver-generator');

// Read query file
const initDatabaseQuery = fs
  .readFileSync(`${__dirname}/init_database.sql`)
  .toString();

// Create and initialize database
if (!fs.existsSync('./server/collab.db')) {
  fs.writeFileSync('./server/collab.db', '');
}
// Connect to SQLite database
const db = new sqlite3.Database('./server/collab.db', err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('🚀 Connected to the in-memory SQlite database.');
});
const dataArr = initDatabaseQuery.split(');');
db.serialize(() => {
  // db.run runs your SQL query against the DB
  db.run('PRAGMA foreign_keys = ON;');
  // Loop through the `dataArr` and db.run each query
  dataArr.forEach(query => {
    if (query) {
      // Add the delimiter back to each query before you run them
      // In this case the it was `);`
      const restoredQuery = `${query});`;
      db.run(restoredQuery, err => {
        if (err) throw err;
      });
    }
  });
});

const sqlResolverGeneratorOptions = {
  client: 'sqlite3',
  connection: {
    filename: './server/collab.db',
  },
  logLevel: 'debug',
  getDatabaseTimestamp: (timestamp) => {
    return new Date(timestamp).toISOString()
  },
  parseToUnixTimestamp: (timestamp) => new Date(timestamp).getTime(),
  info: {
    Users: {
      table: 'users',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}`},
        userName: 'userName',
        email: 'email',
        type: { name: 'type' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' }
      }
    },
    Annotations: {
      table: 'annotations',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}` },
        xfdf: { name: 'xfdf' },
        annotContents: { name: 'annotContents' },
        authorId: { name: 'authorId' },
        annotationId: { name: 'annotationId' },
        documentId: { name: 'documentId' },
        pageNumber: { name: 'pageNumber' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' },
        inReplyTo: { name: 'inReplyTo' }
      }
    },
    Documents: {
      table: 'documents',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}` },
        authorId: { name: 'authorId' },
        isPublic: { name: 'isPublic' },
        name: { name: 'name' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' }
      }
    },
    AnnotationMembers: {
      table: 'annotationMembers',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}` },
        userId: { name: 'userId' },
        documentId: { name: 'documentId' },
        annotationId: { name: 'annotationId' },
        lastRead: { name: 'lastRead' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' },
        annotationCreatedAt: { name: 'annotationCreatedAt' }
      }
    },
    DocumentMembers: {
      table: 'documentMembers',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}` },
        userId: { name: 'userId' },
        documentId: { name: 'documentId' },
        lastRead: { name: 'lastRead' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' }
      }
    },
    Mentions: {
      table: 'mentions',
      columns: {
        id: { name: 'rowid', transform: (id) => `${id}` },
        userId: { name: 'userId' },
        documentId: { name: 'documentId' },
        annotationId: { name: 'annotationId' },
        readBeforeMention: { name: 'readBeforeMention' },
        createdAt: { name: 'createdAt' },
        updatedAt: { name: 'updatedAt' }
      }
    }
  }
};

const resolvers = SQLResolverGenerator(sqlResolverGeneratorOptions);

module.exports = { ...resolvers };

module.exports.db = db;
