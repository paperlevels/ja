import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { POST as postShare } from "@/pages/api/share";
import {
  invokeAPIRoute,
  uniqueTestContent,
  createAdminClient,
  cleanupTestLogline,
} from "../helpers";

describe("POST /api/share", () => {
  let loglineId: string;

  beforeAll(async () => {
    const admin = createAdminClient();
    loglineId = uniqueTestContent("シェア用ログライン");
    await admin.schema("public").from("loglines").insert({
      id: loglineId,
      content: loglineId,
      share_count: 0,
    });
  });

  afterAll(async () => {
    await cleanupTestLogline(loglineId);
  });

  it("正常シェアカウント - share_count が+1される", async () => {
    const admin = createAdminClient();
    const { data: before } = await admin
      .schema("public")
      .from("loglines")
      .select("share_count")
      .eq("id", loglineId)
      .single();

    const beforeCount = before?.share_count ?? 0;

    const response = await invokeAPIRoute(postShare, {
      method: "POST",
      body: JSON.stringify({ id: loglineId }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);

    const { data: after } = await admin
      .schema("public")
      .from("loglines")
      .select("share_count")
      .eq("id", loglineId)
      .single();

    expect(after?.share_count).toBe(beforeCount + 1);
  });

  it("id 未指定 - 400エラー", async () => {
    const response = await invokeAPIRoute(postShare, {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("IDが必要です");
  });

  it("存在しないID - 500エラー", async () => {
    const response = await invokeAPIRoute(postShare, {
      method: "POST",
      body: JSON.stringify({ id: "nonexistent-share-id-12345" }),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("カウントに失敗しました");
  });
});
