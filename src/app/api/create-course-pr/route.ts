import { NextRequest, NextResponse } from "next/server";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const token = process.env.GITHUB_TOKEN!;
const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";

const filePath = "src/assets/courses_weighted.json";

export async function POST(req: NextRequest) {
  try {
    const newCourse = await req.json();

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    };

    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${baseBranch}`,
      { headers }
    );

    if (!fileRes.ok) {
      const err = await fileRes.text();
      throw new Error("Cannot read file: " + err);
    }

    const fileData = await fileRes.json();
    const sha = fileData.sha;

    const content = Buffer.from(fileData.content, "base64").toString("utf-8");

    try {
      const parsed = JSON.parse(content);
      if (
        Array.isArray(parsed) &&
        parsed.some((c: any) => c.courseCode === newCourse.courseCode)
      ) {
        return NextResponse.json(
          { error: "Course đã tồn tại" },
          { status: 400 }
        );
      }
    } catch {
      throw new Error("File JSON không hợp lệ");
    }

    let updatedText = content.trim();

    const newItemText = JSON.stringify(newCourse, null, 2);

    if (updatedText.endsWith("]")) {
      updatedText =
        updatedText.slice(0, -1).trimEnd() +
        (updatedText.length > 2 ? ",\n" : "\n") +
        newItemText +
        "\n]";
    } else {
      throw new Error("File không phải JSON array");
    }

    const updatedContent = Buffer.from(updatedText).toString("base64");

    const branchName = `add-course-${Date.now()}`;

    const refRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
      { headers }
    );

    const refData = await refRes.json();

    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: refData.object.sha,
        }),
      }
    );

    const updateRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Add course ${newCourse.courseCode}`,
          content: updatedContent,
          sha,
          branch: branchName,
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      throw new Error("Commit failed: " + err);
    }

    const prRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: `Add course ${newCourse.courseCode}`,
          head: branchName,
          base: baseBranch,
          body: "Added via web form",
        }),
      }
    );

    const prData = await prRes.json();

    return NextResponse.json({
      url: prData.html_url,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Failed to create PR" },
      { status: 500 }
    );
  }
}
