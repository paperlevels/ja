import { describe, it, expect, afterEach } from "vitest";
import { POST as postLogline } from "@/pages/api/loglines";
import {
  invokeAPIRoute,
  uniqueTestContent,
  cleanupTestLogline,
} from "../helpers";

describe("POST /api/loglines", () => {
  let testId: string;

  afterEach(async () => {
    if (testId) {
      await cleanupTestLogline(testId);
      testId = "";
    }
  });

  it("正常投稿 - 140文字以内のログラインがDBに保存され、id（=content と同じ値）が返る", async () => {
    const content = uniqueTestContent("正常投稿");
    const formData = new FormData();
    formData.append("content", content);

    const response = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.logline.id).toBe(content);
    expect(json.logline.content).toBe(content);

    testId = content;
  });

  it("空文字投稿 - 400エラー、DBにレコードが増えない", async () => {
    const formData = new FormData();
    formData.append("content", "");

    const response = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("ログラインは1〜140文字で入力してください");
  });

  it("空白のみ投稿 - 400エラー、トリム後空文字として拒否される", async () => {
    const formData = new FormData();
    formData.append("content", "   ");

    const response = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("ログラインは1〜140文字で入力してください");
  });

  it("141文字投稿 - 400エラー、バリデーション拒否", async () => {
    const longContent = "a".repeat(141);
    const formData = new FormData();
    formData.append("content", longContent);

    const response = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("ログラインは1〜140文字で入力してください");
  });

  it.each(["/", "?", "&", "#", "%", "\\"])(
    "禁止文字 '%s' を含む投稿は400エラー",
    async (char) => {
      const content = uniqueTestContent(`禁止文字${char}`);
      const formData = new FormData();
      formData.append("content", content);

      const response = await invokeAPIRoute(postLogline, {
        method: "POST",
        body: formData,
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("URLに使用される文字（/ ? & # % \\ など）は使用できません");
    }
  );

  it("重複投稿 - 同じ内容が既に存在する場合、409エラーで拒否される", async () => {
    const content = uniqueTestContent("重複投稿");
    const formData = new FormData();
    formData.append("content", content);

    const firstResponse = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(firstResponse.status).toBe(200);
    testId = content;

    const secondResponse = await invokeAPIRoute(postLogline, {
      method: "POST",
      body: formData,
    });

    expect(secondResponse.status).toBe(409);
    const json = await secondResponse.json();
    expect(json.error).toBe("同じ内容は既に投稿されています");
  });
});
