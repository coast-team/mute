module.exports = {
  "npm": {
    "publish": false
  },
  "git": {
    "tagAnnotation": "v${version}",
    "commitMessage": "chore(release): ${version}",
    "changelog": false
  },
  "github": {
    "release": true,
    "draft": true,
    "releaseName": "v${version}",
    "assets": ["dist/*.tar.xz", "dist/*.asc"]
  },
  "gitlab": {
    "release": true,
    "draft": true,
    "releaseName": "v${version}",
    "assets": ["dist/*.tar.xz", "dist/*.asc"]
  },
  "hooks": {
    "before:bump": "scripts/bump.sh ${version}",
    "after:bump": "npm run build && scripts/archive-sign.sh ${name} ${version}",
    "after:release": "echo Successfully released ${name} ${version} to ${repo.repository}."
  },
  "disable-metrics": true
}
