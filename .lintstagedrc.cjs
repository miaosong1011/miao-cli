module.exports = {
    '*.{md,json}': ['prettier --cache --write --no-error-on-unmatched-pattern'],
    '*.{css,scss}': ['prettier --cache --write --no-error-on-unmatched-pattern'],
    '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --cache --write --no-error-on-unmatched-pattern']
}
