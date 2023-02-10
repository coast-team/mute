module.exports = {
  "npm": {
    "publish": false
  },
  "git": {
    "tagAnnotation": "v${version}",
    "commitMessage": "chore(release): v${version}",
    "changelog": false
  },
  "github": {
    "release": true,
    "draft": true,
    "releaseName": "v${version}",
    "assets": ["dist/*.tar.xz", "dist/*.asc"]
  },
  "hooks": {
    "before:bump": "scripts/bump.sh ${version}",
    "after:bump": "npm run build && scripts/archive-sign.sh ${name} ${version}",
    "after:release": "echo Successfully released ${name} v${version} to ${repo.repository}."
  },
  "disable-metrics": true
}
