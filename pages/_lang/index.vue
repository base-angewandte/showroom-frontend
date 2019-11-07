<script>
export default {
  fetch({ redirect }) {
    // this is only forwarding to the main search
    redirect(301, '/discover');
  },
};
</script>
