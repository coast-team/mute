module.exports = {
  "npm": {
    "publish": false
  },
  "git": {
    "tagName": "v${version}",
    "tagAnnotation": "v${version}",
    "commitMessage": "chore(release): ${version}",
    "changelog": false,
    "requireBranch": "main"
  },
  "github": {
    "release": true,
    "draft": true,
    "releaseName": "v${version}",
    "assets": ["releases/*.tar.xz", "releases/*.asc"]
  },
  "gitlab": {
    "release": true,
    "draft": true,
    "releaseName": "v${version}",
    "assets": ["releases/*.tar.xz", "releases/*.asc"]
  },
  "hooks": {
    "before:bump": "scripts/bump.sh ${version}",
    "after:bump": "npm run build && scripts/archive-sign.sh ${name} ${version}",
    "after:release": "echo Successfully released ${name} ${version} to ${repo.repository}."
  },
  "disable-metrics": true
}
