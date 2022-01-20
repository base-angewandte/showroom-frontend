/* eslint-disable-next-line */
export const userInfo = {
  methods: {
    informUser({
      action,
      count,
      type,
      notificationType,
    }) {
      this.$notify({
        group: 'request-notifications',
        title: this.$tc(`notify.${notificationType}ActionTitle`,
          count,
          {
            action: this.$t(`notify.${action}`),
            // needed to have separate item type string (with 'N')
            // because of german cases
            type: this.$tc(`notify.${type}ItemN`, count),
          }),
        text: this.$tc(`notify.${notificationType}ActionSubtext`,
          count,
          {
            action: this.$t(`notify.${action}D`, { toTitleCase: false }),
            count,
            type: this.$tc(`notify.${type}Item`, count, { toTitleCase: false }),
          }),
        type: notificationType,
      });
    },
  },
};
