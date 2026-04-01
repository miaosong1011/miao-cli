export default {
    extends: ['stylelint-config-standard'],
    overrides: [
        {
            files: ['*.scss', '**/*.scss'],
            extends: ['stylelint-config-standard-scss']
        },
        {
            rules: {
                'unit-allowed-list': ['px']
            },
            files: ['*.vue', '**/*.{vue}'],
            extends: ['stylelint-config-standard-scss', 'stylelint-config-standard-vue/scss']
        }
    ]
}
