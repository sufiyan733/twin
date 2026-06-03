import { connection } from "next/server";

export default async function LoginLayout({ children }) {
  await connection();
  return children;
}
