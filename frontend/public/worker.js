addEventListener('message', async e => {
  if (e.data === "Start") {
    setTimeout(() => {
      postMessage("Finished");
    }, 5000);
  }
});
