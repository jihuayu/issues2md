const core = require('@actions/core');
const github = require('@actions/github');
const Handlebars = require('Handlebars');
const fs = require('fs');

const source = "# [{{{title}}}]({{{html_url}}})\n" +
    "\n" +
    "## 信息\n" +
    "- 提问者；[{{{user.login}}}]({{{user.html_url}}})\n" +
    "- 问题状态:{{{state}}}\n" +
    "- 评论数：{{{comments}}}\n" +
    "- 创建时间：{{{created_at}}}\n" +
    "- 更新时间：{{{updated_at}}}\n" +
    "- 关闭时间：{{{closed_at}}}\n" +
    "\n" +
    "{{{body}}}\n" +
    "\n" +
    "## 评论\n" +
    "\n" +
    "{{#each comments_data}}\n" +
    "\n" +
    "- 评论位置：{{{html_url}}}\n" +
    "- 评论者；[{{{user.login}}}]({{{user.html_url}}})\n" +
    "- 评论时间：{{{updated_at}}}\n" +
    "\n" +
    "{{{body}}}\n" +
    "\n" +
    "-------------------\n" +
    "    \n" +
    "{{/each}}\n"
var template = Handlebars.compile(source);

async function run() {
    try {
        let path = core.getInput('path');
        let repo = core.getInput('repo');
        let owner = core.getInput('owner');
        let token = core.getInput('token');
        if (path && repo && owner && token) {
            const octokit = new github.GitHub(token);
            let date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            console.log(`issues from date after ${date.toISOString()}`);
            let data = (await octokit.issues.listForRepo({
                owner: owner,
                repo: repo,
                per_page: 100,
                // since: date.toISOString()
            })).data;
            core.setOutput(data);
            for (let i in data) {
                let v = data[i];
                console.log(v)
                const c = (await octokit.issues.listComments({
                    owner: owner,
                    repo: repo,
                    per_page: 100,
                    issue_number: v.number,
                })).data;
                v.comments_data = c;
                let result = template(v);
                console.log(result);
                fs.writeFileSync(`${path}/${v.number}.md`, result);
            }
        } else {
            console.log(`fail`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
