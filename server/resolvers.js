const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Read query file
const initDatabaseQuery = fs
  .readFileSync(`${__dirname}/init_database.sql`)
  .toString();

// Create and initialize database
if (!fs.existsSync('server/collab.db')) {
  fs.writeFileSync('server/collab.db', '');
}
// Connect to SQLite database
const db = new sqlite3.Database('./collab.db', err => {
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
        console.error(err);
        reject(err);
      }
      resolve(rows);
    });
  });
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
    annotation: async id => {
      const res = await getQueryResponse(
        `SELECT * FROM annotations WHERE id = ?`,
        [id]
      );
      return res[0] || null;
    },
    document: async id => {
      const res = await getQueryResponse(
        `SELECT * FROM documents WHERE id = ?`,
        [id]
      );
      return res[0] || null;
    },
    annotationMember: async (annotId, userId, memberId) => {
      if (memberId) {
        const resWithMemberId = await getQueryResponse(
          `SELECT * FROM annotationMembers WHERE id = ?`,
          [memberId]
        );
        return resWithMemberId[0] || null;
      }
      const res = await getQueryResponse(
        `SELECT * FROM annotationMembers WHERE userId = ? AND annotationId = ?`,
        [userId, annotId]
      );
      return res[0] || null;
    },
    documentMember: async memberId => {
      const res = await getQueryResponse(
        `SELECT * FROM documentMembers WHERE id = ?`,
        [memberId]
      );
      return res[0] || null;
    },
    annotations: async docId => {
      const res = await getQueryResponse(
        `SELECT * FROM annotations WHERE documentId = ?`,
        [docId]
      );
      return res;
    },
    userDocuments: async userId => {
      const res = await getQueryResponse(
        `SELECT * FROM documents WHERE id IN ( SELECT documentId AS id FROM documentMembers WHERE userId = ?)`,
        [userId]
      );
      return res;
    },
    annotationMembers: async annotId => {
      const res = await getQueryResponse(
        `SELECT * FROM annotationMembers WHERE annotationId = ?`,
        [annotId]
      );
      return res;
    },
    documentMembers: async docId => {
      const res = await getQueryResponse(
        `SELECT * FROM documentMembers WHERE documentId = ?`,
        [docId]
      );
      return res;
    },
  },
  Mutation: {
    addUser: async user => {
      const res = await getQueryResponse(
        `
          INSERT INTO users
          (id, type, email, userName, createdAt)
          VALUES
          (?, ?, ?, ?, ?)
        `,
        [user.id, user.type, user.email, user.userName, user.createdAt]
      );
      return res[0] || null;
    },
    addAnnotation: async user => {
      const res = await getQueryResponse(
        `
          INSERT INTO annotations
          (id, xfdf, authorId, documentId, pageNumber, createdAt, inReplyTo)
          VALUES
          (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.id,
          user.xfdf,
          user.authorId,
          user.documentId,
          user.pageNumber,
          user.createdAt,
          user.inReplyTo,
        ]
      );
      return res[0] || null;
    },
    editAnnotation: async (id, editAnnotInput) => {
      const editedAnnot = await getQueryResponse(
        `
          UPDATE annotations SET xfdf = ?, pageNumber = ?
          WHERE id = ?
        `,
        [editAnnotInput.xfdf, editAnnotInput.pageNumber, id]
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
          (id, createdAt, authorId, isPublic, name)
          VALUES
          (?, ?, ?, ?, ?)
        `,
        [doc.id, doc.createdAt, doc.authorId, doc.isPublic, doc.name]
      );
      return res[0] || null;
    },

    editDocument: async (id, editDocInput) => {
      const res = await getQueryResponse(
        `
          UPDATE documents
          SET name = ?, isPublic = ?
          WHERE id = ?
        `,
        [editDocInput.name, editDocInput.isPublic, id]
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
          (id, userId, documentId, lastRead)
          VALUES
          (?, ?, ?, ?)
        `,
        [member.id, member.userId, member.documentId, member.lastRead]
      );
      return res[0] || null;
    },
    editDocumentMember: async (id, editMemberInput) => {
      const editedMemer = await getQueryResponse(
        `
          UPDATE documentMembers
          SET lastRead = ?
          WHERE id = ?
        `,
        [editMemberInput.lastRead, id]
      );
      return editedMemer;
    },
    deleteDocumentMember: async id => {
      try {
        await getQueryResponse(
          `
            DELETE FROM document_members WHERE id = ?
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
          (id, documentId, lastRead, annotationId, permission, userId)
          VALUES
          (?, ?, ?, ?, ?, ?)
        `,
        [
          member.id,
          member.documentId,
          member.lastRead,
          member.annotationId,
          member.permission,
          member.userId,
        ]
      );
      return res[0] || null;
    },
    editAnnotationMember: async (id, editMemberInput) => {
      const editedMemer = await getQueryResponse(
        `
          UPDATE annotationMembers
          SET lastRead = ?, permission = ?
          WHERE id = ?
        `,
        [editMemberInput.lastRead, editMemberInput.permission, id]
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
