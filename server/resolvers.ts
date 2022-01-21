import SQLResolverGenerator from "@pdftron/collab-sql-resolver-generator";

export default SQLResolverGenerator({
  client: "sqlite3",
  connection: {
    filename: "./server/collab.db",
  },
  getDatabaseTimestamp: (timestamp) => {
    return new Date(timestamp).toISOString();
  },
  parseToUnixTimestamp: (timestamp) => new Date(timestamp).getTime(),
  info: {
    Users: {
      table: "users",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        userName: "userName",
        email: "email",
        type: { name: "type" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
      },
    },
    Annotations: {
      table: "annotations",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        xfdf: { name: "xfdf" },
        annotContents: { name: "annotContents" },
        authorId: { name: "authorId" },
        annotationId: { name: "annotationId" },
        documentId: { name: "documentId" },
        pageNumber: { name: "pageNumber" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
        inReplyTo: { name: "inReplyTo" },
      },
    },
    Documents: {
      table: "documents",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        authorId: { name: "authorId" },
        isPublic: { name: "isPublic", transform: (v) => !!v },
        name: { name: "name" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
      },
    },
    AnnotationMembers: {
      table: "annotationMembers",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        userId: { name: "userId" },
        documentId: { name: "documentId" },
        annotationId: { name: "annotationId" },
        lastRead: { name: "lastRead" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
        annotationCreatedAt: { name: "annotationCreatedAt" },
      },
    },
    DocumentMembers: {
      table: "documentMembers",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        userId: { name: "userId" },
        documentId: { name: "documentId" },
        lastRead: { name: "lastRead" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
      },
    },
    Mentions: {
      table: "mentions",
      columns: {
        id: { name: "rowid", transform: (id) => `${id}` },
        userId: { name: "userId" },
        documentId: { name: "documentId" },
        annotationId: { name: "annotationId" },
        createdAt: { name: "createdAt" },
        updatedAt: { name: "updatedAt" },
      },
    },
  },
});
