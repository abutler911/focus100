module.exports = (app) => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Focus100 is running on port ${PORT}`);
  });
};
