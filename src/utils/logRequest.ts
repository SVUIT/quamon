import { Client, TablesDB, ID } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);
  
const tablesDB = new TablesDB(client);

export async function logRequest(data: any) {
  try {
    await tablesDB.createRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_TABLE_ID!,
      rowId: ID.unique(),
      data: {
        path: data.path,
        method: data.method,
        ip: data.ip,
        status: Number(data.status),
        duration: Number(data.duration),
        userAgent: data.userAgent,
      }
    });
  } catch (error) {
    console.error("Log error:", error);
    return { success: false }
  }
}
