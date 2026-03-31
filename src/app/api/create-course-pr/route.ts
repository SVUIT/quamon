import { NextRequest, NextResponse } from "next/server";
import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
const filePath = "src/assets/courses_weighted.json";

const privateKey = fs.readFileSync(
  path.join(process.cwd(), "private-key.pem"),
  "utf8"
);

const app = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey,
  Octokit,
});

export async function POST(req: NextRequest) {
  try {
    const { user, ...newCourse } = await req.json();

    const installationId = Number(process.env.GITHUB_INSTALLATION_ID);
    if (!installationId) {
      throw new Error("Missing INSTALLATION_ID");
    }

    const installationOctokit = await app.getInstallationOctokit(
      installationId
    );

    const { data: fileData } =
      await installationOctokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: baseBranch,
      });

    if (!("content" in fileData)) {
      throw new Error("File không hợp lệ");
    }

    const sha = fileData.sha;
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");

    if (content.includes(`"courseCode": "${newCourse.courseCode}"`)) {
      return NextResponse.json(
        { error: "Course đã tồn tại" },
        { status: 400 }
      );
    }

    let newContentString = content.trim();

    newContentString = newContentString.slice(0, -1);

    if (!newContentString.endsWith("[")) {
      newContentString += ",";
    }

    newContentString += `\n  ${JSON.stringify(newCourse, null, 2)}\n]`;

    const updatedContent = Buffer.from(newContentString).toString("base64");

    const branchName = `add-course-${Date.now()}`;

    const { data: refData } =
      await installationOctokit.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });

    await installationOctokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });

    await installationOctokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `Add course ${newCourse.courseCode}`,
      content: updatedContent,
      sha,
      branch: branchName,
    });

    const { data: pr } =
      await installationOctokit.pulls.create({
        owner,
        repo,
        title: `[${newCourse.courseCode}] ${newCourse.courseNameVi} - by ${user?.name || "Unknown"}`,
        head: branchName,
        base: baseBranch,
        body: `
        ### Thêm môn học mới

        Người đóng góp: ${user?.name || "Unknown"}
        GitHub: [@${user?.username}](https://github.com/${user?.username})
        ---

        ### Thông tin môn học
        - Mã: ${newCourse.courseCode}
        - Tên: ${newCourse.courseNameVi}
        - Tín chỉ: ${newCourse.credits}

        ---

        Gửi từ web form
        `,
      });

    return NextResponse.json({
      url: pr.html_url,
    });

  } catch (err: any) {
    console.error("ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create PR" },
      { status: 500 }
    );
  }
}
