const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

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
const getQueryResponse = (query, param) =>
  new Promise((resolve, reject) => {
    db.all(query, param, (err, rows) => {
      if (err) {
        console.error(`query: ${query}, param ${param}`);
        console.error(err);
        reject(err);
      }
      resolve(rows);
    });
  });

/**
 * A utility function to merge multiple WHERE clauses together
 */
const getWhereClause = clauses => {
  // remove empty clauses
  const filtered = clauses.filter(c => !!c);

  return filtered
    .reduce((acc, clause, index) => {
      const isLast = index === filtered.length - 1;
      return `${acc}${clause} ${isLast ? '' : 'AND '}`;
    }, 'WHERE ')
    .trim();
};

/**
 * A utility function to convert an array of items into an IN clause
 */
const valueIn = (value, options) =>
  `${value} IN (${options.reduce((acc, item, index) => {
    const isLast = index === options.length - 1;
    const suffix = isLast ? '' : ',';

    if (typeof item === 'string') {
      return `${acc}'${item}'${suffix}`;
    }

    return `${acc}${item}${suffix}`;
  }, '')})`;

/**
 * A utility that converts a filter object to a set of WHERE clauses
 */
const getFilterQuery = filters => [
  filters.createdBefore && `createdAt < ${filters.createdBefore}`,
  filters.createdAfter && `createdAt > ${filters.createdAfter}`,
  filters.updatedBefore && `updatedAt < ${filters.updatedBefore}`,
  filters.updatedAfter && `updatedAt > ${filters.updatedAfter}`,
];

const orderAndLimit = (query, filters) => {
  const { orderBy, orderDirection, limit } = filters;
  let newQuery = query;
  if (orderBy) {
    newQuery += ` ORDER BY ${orderBy} ${orderDirection}`;
  }

  if (limit) {
    newQuery += ` LIMIT ${limit}`;
  }

  return newQuery;
};

module.exports = {
  Query: {
    user: async id => {
      const res = await getQueryResponse(`SELECT * FROM users WHERE id = ?`, [
        id,
      ]);
      return res[0] || null;
    },
    userWithEmail: async email => {
      const res = await getQueryResponse(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );
      return res[0] || null;
    },

    annotations: async ({
      ids,
      documentId,
      pageNumbers,
      inReplyTo,
      filters = {},
    }) => {
      let query = 'SELECT * FROM annotations';

      query += ` ${getWhereClause([
        documentId && `documentId = '${documentId}'`,
        inReplyTo && `inReplyTo = '${inReplyTo}'`,
        ids && ids.length && valueIn('id', ids),
        pageNumbers && pageNumbers.length && valueIn('pageNumber', pageNumbers),
        ...getFilterQuery(filters),
      ])}`;

      query = orderAndLimit(query, filters);

      const res = await getQueryResponse(query, []);
      return res;
    },

    documents: async ({ ids, userId, filters = {} }) => {
      let query = 'SELECT * FROM documents';

      query += ` ${getWhereClause([
        userId &&
          `id in (SELECT documentId FROM documentMembers WHERE userId = '${userId}')`,
        ids && ids.length && valueIn('id', ids),
        ...getFilterQuery(filters),
      ])}`;

      query = orderAndLimit(query, filters);

      const res = await getQueryResponse(query, []);
      return res;
    },

    annotationMembers: async ({ ids, annotationId, userId, filters = {} }) => {
      let query = 'SELECT * FROM annotationMembers';

      query += ` ${getWhereClause([
        annotationId && `annotationId = '${annotationId}'`,
        userId && `userId = '${userId}'`,
        ids && ids.length && valueIn('id', ids),
        ...getFilterQuery(filters),
      ])}`;

      query = orderAndLimit(query, filters);

      const res = await getQueryResponse(query, []);
      return res;
    },
    documentMembers: async ({ ids, documentId, userId, filters = {} }) => {
      let query = 'SELECT * FROM documentMembers';

      query += ` ${getWhereClause([
        documentId && `documentId = '${documentId}'`,
        userId && `userId = '${userId}'`,
        ids && ids.length && valueIn('id', ids),
        ...getFilterQuery(filters),
      ])}`;

      query = orderAndLimit(query, filters);

      const res = await getQueryResponse(query, []);
      return res;
    },
    annotationCount: async ({ documentId, since }) => {
      const resp = await getQueryResponse(
        `SELECT COUNT(id) FROM annotations WHERE documentId = ? AND createdAt > ?`,
        [documentId, since]
      );

      return resp[0]['COUNT(id)'];
    },
    annotationMemberCount: async ({ userId, documentId, since }) => {
      const resp = await getQueryResponse(
        `SELECT COUNT(id) FROM annotationMembers WHERE documentId = ? AND userId = ? AND annotationCreatedAt > ?`,
        [documentId, userId, since]
      );

      return resp[0]['COUNT(id)'];
    },
  },
  Mutation: {
    addUser: async user => {
      const res = await getQueryResponse(
        `
          INSERT INTO users
          (id, type, email, userName, createdAt, updatedAt)
          VALUES
          (?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          user.type,
          user.email,
          user.userName,
          user.createdAt,
          user.updatedAt,
        ]
      );
      return res[0] || null;
    },
    addAnnotation: async user => {
      const res = await getQueryResponse(
        `
          INSERT INTO annotations
          (id, xfdf, authorId, documentId, pageNumber, createdAt, updatedAt, inReplyTo)
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          user.xfdf,
          user.authorId,
          user.documentId,
          user.pageNumber,
          user.createdAt,
          user.updatedAt,
          user.inReplyTo,
        ]
      );
      return res[0] || null;
    },
    editAnnotation: async (id, editAnnotInput) => {
      const editedAnnot = await getQueryResponse(
        `
          UPDATE annotations SET xfdf = ?, pageNumber = ?, updatedAt = ?
          WHERE id = ?
        `,
        [
          editAnnotInput.xfdf,
          editAnnotInput.pageNumber,
          editAnnotInput.updatedAt,
          id,
        ]
      );
      return editedAnnot;
    },
    deleteAnnotation: async id => {
      try {
        await getQueryResponse(`DELETE FROM annotations WHERE id = ?`, [id]);
        return { successful: true };
      } catch (error) {
        return { successful: false };
      }
    },
    addDocument: async doc => {
      const res = await getQueryResponse(
        `
          INSERT INTO documents
          (id, createdAt, updatedAt, authorId, isPublic, name)
          VALUES
          (?, ?, ?, ?, ?, ?)
        `,
        [
          doc.id,
          doc.createdAt,
          doc.updatedAt,
          doc.authorId,
          doc.isPublic,
          doc.name,
        ]
      );
      return res[0] || null;
    },

    editDocument: async (id, editDocInput) => {
      const res = await getQueryResponse(
        `
          UPDATE documents
          SET name = ?, isPublic = ?, updatedAt = ?
          WHERE id = ?
        `,
        [editDocInput.name, editDocInput.isPublic, editDocInput.updatedAt, id]
      );
      return res[0] || null;
    },
    deleteDocument: async id => {
      try {
        await getQueryResponse(
          `
            DELETE FROM documents WHERE id = ?
          `,
          [id]
        );
        return { successful: true };
      } catch (error) {
        return { successful: false };
      }
    },
    addDocumentMember: async member => {
      const res = await getQueryResponse(
        `
          INSERT INTO documentMembers
          (id, userId, documentId, lastRead, createdAt, updatedAt)
          VALUES
          (?, ?, ?, ?, ?, ?)
        `,
        [
          member.id,
          member.userId,
          member.documentId,
          member.lastRead,
          member.createdAt,
          member.updatedAt,
        ]
      );
      return res[0] || null;
    },
    editDocumentMember: async (id, editMemberInput) => {
      const editedMemer = await getQueryResponse(
        `
          UPDATE documentMembers
          SET lastRead = ?, updatedAt = ?
          WHERE id = ?
        `,
        [editMemberInput.lastRead, editMemberInput.updatedAt, id]
      );
      return editedMemer;
    },
    deleteDocumentMember: async id => {
      try {
        await getQueryResponse(
          `
            DELETE FROM documentMembers WHERE id = ?
          `,
          [id]
        );
        return { successful: true };
      } catch (error) {
        return { successful: false };
      }
    },
    addAnnotationMember: async member => {
      const res = await getQueryResponse(
        `
          INSERT INTO annotationMembers
          (id, documentId, lastRead, annotationId, userId, createdAt, updatedAt, annotationCreatedAt)
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          member.id,
          member.documentId,
          member.lastRead,
          member.annotationId,
          member.userId,
          member.createdAt,
          member.updatedAt,
          member.annotationCreatedAt,
        ]
      );
      return res[0] || null;
    },
    editAnnotationMember: async (id, editMemberInput) => {
      const editedMemer = await getQueryResponse(
        `
          UPDATE annotationMembers
          SET lastRead = ?, updatedAt = ?
          WHERE id = ?
        `,
        [editMemberInput.lastRead, editMemberInput.updatedAt, id]
      );
      return editedMemer;
    },
    deleteAnnotationMember: async id => {
      try {
        await getQueryResponse(`DELETE FROM annotationMembers WHERE id = ?`, [
          id,
        ]);
        return { successful: true };
      } catch (error) {
        return { successful: false };
      }
    },
  },
};
